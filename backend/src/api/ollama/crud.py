import json
import os
import re
from datetime import datetime

import httpx
from fastapi import HTTPException
from mcp import ClientSession
from mcp.client.sse import sse_client

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MCP_GOOGLE_URL = "http://mcp-google-services:3002/sse"
MCP_FILESYSTEM_URL = "http://mcp-filesystem:3003/sse"
MCP_WEB_URL = "http://mcp-web:3001/sse"
MCP_GITHUB_URL = "http://mcp-github:3004/sse"


async def get_mcp_tools():
    all_tools = []
    servers = [MCP_GOOGLE_URL, MCP_FILESYSTEM_URL, MCP_WEB_URL, MCP_GITHUB_URL]
    for url in servers:
        try:
            async with sse_client(url) as streams:
                async with ClientSession(streams[0], streams[1]) as session:
                    await session.initialize()
                    tools_result = await session.list_tools()
                    for tool in tools_result.tools:
                        all_tools.append(
                            {
                                "type": "function",
                                "function": {
                                    "name": tool.name,
                                    "description": tool.description,
                                    "parameters": tool.inputSchema,
                                },
                                "server_url": url,
                            }
                        )
        except Exception as e:
            print(f"Error fetching tools from {url}: {e}")
    return all_tools


async def call_mcp_tool(server_url, tool_name, arguments):
    try:
        async with sse_client(server_url) as streams:
            async with ClientSession(streams[0], streams[1]) as session:
                await session.initialize()
                result = await session.call_tool(tool_name, arguments)
                text_content = ""
                for item in result.content:
                    if hasattr(item, "text"):
                        text_content += item.text
                    elif isinstance(item, dict) and "text" in item:
                        text_content += item["text"]
                return text_content
    except Exception as e:
        return f"Error calling tool {tool_name}: {str(e)}"


def get_system_message(current_time: str) -> str:
    return (
        f"Current date and time is {current_time} (Asia/Seoul, KST, UTC+9). "
        "User is in South Korea. All schedules and tasks should be handled in KST. "
        "You have access to Google Calendar, Google Tasks, Local Filesystem, Web Search, and GitHub through unified tools. "
        "When calling calendar or tasks tools, ALWAYS use ISO 8601 strings with +09:00 offset. "
        "CRITICAL: When presenting Google Calendar events or schedules, ALWAYS start the section with '### Events'. "
        "CRITICAL: When presenting Google Tasks or to-do items, ALWAYS start the section with '### To-do List'. "
        "For filesystem tools, use relative paths from the base directory. "
        "Use Web Search for real-time information and GitHub for repository or issue management. "
        "Always provide clear feedback to the user about what you have done."
    )


async def generate_response(model: str, prompt: str, stream: bool = False) -> dict:
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S %A")
    all_executed_tools = []
    final_thinking = ""
    try:
        tools = await get_mcp_tools()
    except Exception:
        tools = []
    ollama_tools = [{"type": t["type"], "function": t["function"]} for t in tools]
    messages = [
        {"role": "system", "content": get_system_message(current_time)},
        {"role": "user", "content": prompt},
    ]
    async with httpx.AsyncClient(timeout=120.0) as client:
        for _ in range(5):
            payload = {
                "model": model,
                "messages": messages,
                "stream": False,
                "tools": ollama_tools,
            }
            resp = await client.post(f"{OLLAMA_HOST}/api/chat", json=payload)
            data = resp.json()
            msg = data.get("message", {})
            if "reasoning" in msg:
                final_thinking += msg["reasoning"] + "\n"
            content = msg.get("content", "")
            if "<think>" in content:
                match = re.search(r"<think>(.*?)</think>", content, re.DOTALL)
                if match:
                    final_thinking += match.group(1).strip() + "\n"
                    msg["content"] = re.sub(
                        r"<think>.*?</think>", "", content, flags=re.DOTALL
                    ).strip()
            messages.append(msg)
            if not msg.get("tool_calls"):
                return {
                    "response": msg.get("content", ""),
                    "thinking": final_thinking.strip(),
                    "tools": all_executed_tools,
                }
            for tc in msg["tool_calls"]:
                fn = tc["function"]["name"]
                args = tc["function"]["arguments"]
                t = next((x for x in tools if x["function"]["name"] == fn), None)
                res = (
                    await call_mcp_tool(t["server_url"], fn, args)
                    if t
                    else f"Error: {fn} not found"
                )
                all_executed_tools.append(
                    {"name": fn, "arguments": args, "result": res}
                )
                messages.append({"role": "tool", "content": res, "name": fn})
    return {
        "response": "Steps exceeded",
        "thinking": final_thinking.strip(),
        "tools": all_executed_tools,
    }


async def generate_response_stream(model: str, prompt: str):
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S %A")
    try:
        tools = await get_mcp_tools()
    except Exception:
        tools = []
    ollama_tools = [{"type": t["type"], "function": t["function"]} for t in tools]
    messages = [
        {"role": "system", "content": get_system_message(current_time)},
        {"role": "user", "content": prompt},
    ]

    async with httpx.AsyncClient(timeout=120.0) as client:
        for _ in range(5):
            payload = {
                "model": model,
                "messages": messages,
                "stream": True,
                "tools": ollama_tools if ollama_tools else None,
            }
            async with client.stream(
                "POST", f"{OLLAMA_HOST}/api/chat", json=payload
            ) as response:
                full_message = {"role": "assistant", "content": ""}
                in_think_tag = False
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        data = json.loads(line)
                    except:
                        continue
                    msg_chunk = data.get("message", {})

                    if "reasoning" in msg_chunk and msg_chunk["reasoning"]:
                        yield f"data: {json.dumps({'type': 'thinking', 'content': msg_chunk['reasoning']})}\n\n"

                    content_chunk = msg_chunk.get("content", "")
                    if content_chunk:
                        if "<think>" in content_chunk:
                            in_think_tag = True
                            content_chunk = content_chunk.replace("<think>", "")
                        if "</think>" in content_chunk:
                            in_think_tag = False
                            parts = content_chunk.split("</think>")
                            if parts[0]:
                                yield f"data: {json.dumps({'type': 'thinking', 'content': parts[0]})}\n\n"
                            if len(parts) > 1 and parts[1]:
                                full_message["content"] += parts[1]
                                yield f"data: {json.dumps({'type': 'content', 'content': parts[1]})}\n\n"
                        else:
                            if in_think_tag:
                                yield f"data: {json.dumps({'type': 'thinking', 'content': content_chunk})}\n\n"
                            else:
                                full_message["content"] += content_chunk
                                yield f"data: {json.dumps({'type': 'content', 'content': content_chunk})}\n\n"

                    if "tool_calls" in msg_chunk:
                        full_message.setdefault("tool_calls", []).extend(
                            msg_chunk["tool_calls"]
                        )

                messages.append(full_message)
                if not full_message.get("tool_calls"):
                    break

                for tool_call in full_message["tool_calls"]:
                    func_name = tool_call["function"]["name"]
                    args = tool_call["function"]["arguments"]
                    target_tool = next(
                        (t for t in tools if t["function"]["name"] == func_name), None
                    )
                    if target_tool:
                        tool_result = await call_mcp_tool(
                            target_tool["server_url"], func_name, args
                        )
                        yield f"data: {json.dumps({'type': 'tool', 'name': func_name, 'arguments': args, 'result': tool_result})}\n\n"
                        messages.append(
                            {"role": "tool", "content": tool_result, "name": func_name}
                        )
                    else:
                        messages.append(
                            {
                                "role": "tool",
                                "content": "Tool not found",
                                "name": func_name,
                            }
                        )
    yield "data: [DONE]\n\n"
