import json
import os

import httpx
from fastapi import HTTPException
from mcp import ClientSession
from mcp.client.sse import sse_client

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MCP_CALENDAR_URL = "http://mcp-google-calendar:3002/sse"


async def get_mcp_tools():
    """Discover tools from all MCP servers."""
    all_tools = []
    servers = [MCP_CALENDAR_URL]

    for url in servers:
        try:
            async with sse_client(url) as streams:
                async with ClientSession(streams[0], streams[1]) as session:
                    await session.initialize()
                    tools_result = await session.list_tools()
                    for tool in tools_result.tools:
                        tool_data = {
                            "type": "function",
                            "function": {
                                "name": tool.name,
                                "description": tool.description,
                                "parameters": tool.inputSchema,
                            },
                            "server_url": url,
                        }
                        all_tools.append(tool_data)
        except Exception as e:
            print(f"Error fetching tools from {url}: {e}")
    return all_tools


async def call_mcp_tool(server_url, tool_name, arguments):
    """Execute a tool call via MCP."""
    async with sse_client(server_url) as streams:
        async with ClientSession(streams[0], streams[1]) as session:
            await session.initialize()
            result = await session.call_tool(tool_name, arguments)
            # Format the content into a simple string for the LLM
            text_content = ""
            for item in result.content:
                if hasattr(item, "text"):
                    text_content += item.text
                elif isinstance(item, dict) and "text" in item:
                    text_content += item["text"]
            return text_content


async def generate_response(model: str, prompt: str, stream: bool = False) -> str:
    """
    Main entry point for generating response with potential tool calls.
    """
    try:
        tools = await get_mcp_tools()
    except Exception as e:
        print(f"Tool discovery failed: {e}")
        tools = []

    ollama_tools = [{"type": t["type"], "function": t["function"]} for t in tools]

    messages = [{"role": "user", "content": prompt}]

    url = f"{OLLAMA_HOST}/api/chat"
    payload = {
        "model": model,
        "messages": messages,
        "stream": False,
        "tools": ollama_tools if ollama_tools else None,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()

            message = data.get("message", {})
            tool_calls = message.get("tool_calls", [])

            if tool_calls:
                print(f"AI requested tool calls: {tool_calls}")
                messages.append(message)  # AI의 도구 호출 메시지 추가

                for tool_call in tool_calls:
                    func_name = tool_call["function"]["name"]
                    args = tool_call["function"]["arguments"]

                    target_tool = next(
                        (t for t in tools if t["function"]["name"] == func_name), None
                    )
                    if target_tool:
                        print(f"Executing tool {func_name} with args {args}")
                        tool_result = await call_mcp_tool(
                            target_tool["server_url"], func_name, args
                        )

                        messages.append(
                            {"role": "tool", "content": tool_result, "name": func_name}
                        )

                # 도구 결과와 함께 다시 호출
                final_response = await client.post(
                    url, json={"model": model, "messages": messages, "stream": False}
                )
                final_data = final_response.json()
                return final_data.get("message", {}).get("content", "")

            return message.get("content", "")

        except httpx.HTTPStatusError as e:
            print(f"Ollama HTTP Error: {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code, detail=e.response.text
            )
        except Exception as e:
            print(f"Unexpected error in generate_response: {e}")
            raise HTTPException(status_code=500, detail=str(e))
