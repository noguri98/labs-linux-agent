import os

import httpx
from fastapi import HTTPException

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")


async def generate_response(model: str, prompt: str, stream: bool = False) -> str:
    url = f"{OLLAMA_HOST}/api/generate"
    payload = {"model": model, "prompt": prompt, "stream": stream}

    async with httpx.AsyncClient(timeout=120.0) as client:
        try:
            response = await client.post(url, json=payload)
            response.raise_for_status()
            data = response.json()
            return data.get("response", "")
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Ollama API returned an error: {e.response.text}",
            )
        except httpx.RequestError as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to connect to Ollama server at {OLLAMA_HOST}: {str(e)}",
            )
