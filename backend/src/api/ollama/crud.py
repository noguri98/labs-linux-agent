import json
import os

import httpx
from fastapi import HTTPException
from mcp import ClientSession
from mcp.client.sse import sse_client

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
MCP_SERVER_URL = "http://mcp-server:3001/sse"


async def get_mcp_tools():
    """Discover tools from all MCP servers."""
    all_tools = []
    servers = [MCP_SERVER_URL]

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
            return result.content


async def generate_response(model: str, prompt: str, stream: bool = False) -> str:
    """
    Main entry point for generating response with potential tool calls.
    """
    tools = await get_mcp_tools()

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

                        messages.append(message)
                        messages.append(
                            {
                                "role": "tool",
                                "content": json.dumps([vars(c) for c in tool_result])
                                if not isinstance(tool_result, str)
                                else tool_result,
                            }
                        )

                final_response = await client.post(
                    url, json={"model": model, "messages": messages, "stream": False}
                )
                final_data = final_response.json()
                return final_data.get("message", {}).get("content", "")

            return message.get("content", "")

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Ollama API error: {e.response.text}",
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
