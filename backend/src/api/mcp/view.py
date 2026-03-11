from fastapi import APIRouter, HTTPException

from api.ollama.crud import get_mcp_tools

router = APIRouter(prefix="/mcp", tags=["mcp"])


@router.get("/status")
async def get_mcp_status():
    """
    Check the status of the MCP server and return available tools.
    """
    try:
        tools = await get_mcp_tools()
        return {
            "status": "connected" if tools else "connected_no_tools",
            "server_url": "http://mcp-server:3001/sse",
            "tools": tools,
            "tool_count": len(tools),
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "server_url": "http://mcp-server:3001/sse",
        }
