import json
import os
from datetime import datetime

import httpx
from fastapi import HTTPException
from mcp import ClientSession
from mcp.client.sse import sse_client

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
# 통합된 단일 구글 서비스 URL
MCP_GOOGLE_URL = "http://mcp-google-services:3002/sse"
MCP_FILESYSTEM_URL = "http://mcp-filesystem:3003/sse"
MCP_WEB_URL = "http://mcp-web:3001/sse"


async def get_mcp_tools():
    """Discover tools from unified MCP server."""
    all_tools = []
    servers = [MCP_GOOGLE_URL, MCP_FILESYSTEM_URL, MCP_WEB_URL]

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


async def generate_response(model: str, prompt: str, stream: bool = False) -> str:
    """
    Main entry point for generating response with iterative tool calls.
    """
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S %A")

    try:
        tools = await get_mcp_tools()
    except Exception as e:
        print(f"Tool discovery failed: {e}")
        tools = []

    ollama_tools = [{"type": t["type"], "function": t["function"]} for t in tools]

    system_msg = (
        f"Current date and time is {current_time} (Asia/Seoul, KST, UTC+9). "
        "User is in South Korea. All schedules and tasks should be handled in KST. "
        "You have access to Google Calendar, Google Tasks, Local Filesystem, and Web Search through unified tools. "
        "When calling calendar or tasks tools, ALWAYS use ISO 8601 strings with +09:00 offset. "
        "For filesystem tools, use relative paths from the base directory. "
        "Use Web Search when you need real-time information or answers to general questions. "
        "Always provide clear feedback to the user about what you have done."
    )

    messages = [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": prompt},
    ]

    async with httpx.AsyncClient(timeout=120.0) as client:
        for attempt in range(5):
            try:
                payload = {
                    "model": model,
                    "messages": messages,
                    "stream": False,
                    "tools": ollama_tools if ollama_tools else None,
                }

                response = await client.post(f"{OLLAMA_HOST}/api/chat", json=payload)
                response.raise_for_status()
                data = response.json()

                message = data.get("message", {})
                messages.append(message)

                tool_calls = message.get("tool_calls", [])
                if not tool_calls:
                    return message.get("content", "")

                for tool_call in tool_calls:
                    func_name = tool_call["function"]["name"]
                    args = tool_call["function"]["arguments"]

                    target_tool = next(
                        (t for t in tools if t["function"]["name"] == func_name), None
                    )

                    if target_tool:
                        tool_result = await call_mcp_tool(
                            target_tool["server_url"], func_name, args
                        )
                        messages.append(
                            {"role": "tool", "content": tool_result, "name": func_name}
                        )
                    else:
                        messages.append(
                            {
                                "role": "tool",
                                "content": f"Error: Tool {func_name} not found",
                                "name": func_name,
                            }
                        )

            except httpx.HTTPStatusError as e:
                raise HTTPException(
                    status_code=e.response.status_code, detail=e.response.text
                )
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))

        return "I tried to process your request but it took too many steps."
