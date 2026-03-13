from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from api.ollama.crud import generate_response, generate_response_stream
from api.ollama.model import OllamaRequest, OllamaResponse

router = APIRouter()

# Whitelisted local models
ALLOWED_MODELS = {"gemini-3-flash-preview"}


@router.post("/ollama")
async def handle_ollama_request(request: OllamaRequest):
    """
    Handles inference requests for allowed Ollama models.
    """
    model_name = request.model.strip()

    if model_name not in ALLOWED_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{model_name}' is not allowed. Available: {', '.join(ALLOWED_MODELS)}",
        )

    if request.stream:
        return StreamingResponse(
            generate_response_stream(model=model_name, prompt=request.prompt),
            media_type="text/event-stream",
        )
    else:
        try:
            result = await generate_response(
                model=model_name,
                prompt=request.prompt,
                stream=False,
            )
            return OllamaResponse(**result)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
