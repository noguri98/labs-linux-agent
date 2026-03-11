from fastapi import APIRouter, HTTPException

from api.ollama.crud import generate_response
from api.ollama.model import OllamaRequest, OllamaResponse

router = APIRouter()

# Whitelisted local models
ALLOWED_MODELS = {"gemini-3-flash-preview"}


@router.post("/ollama", response_model=OllamaResponse)
async def handle_ollama_request(request: OllamaRequest):
    model_name = request.model.strip()
    if model_name not in ALLOWED_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{model_name}' is not available locally. Use one of: {', '.join(sorted(ALLOWED_MODELS))}",
        )
    result = await generate_response(
        model=model_name,
        prompt=request.prompt,
        stream=request.stream,
    )
    return OllamaResponse(response=result)


from api.ollama.crud import generate_response
from api.ollama.model import OllamaRequest, OllamaResponse

router = APIRouter()

# Whitelisted local models (add more if you create wrappers)
ALLOWED_MODELS = {
    "gemini-3-flash-preview",
}


@router.post("/ollama", response_model=OllamaResponse)
async def handle_ollama_request(request: OllamaRequest):
    model_name = request.model.strip()
    if model_name not in ALLOWED_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Model '{model_name}' is not available locally. Use one of: {', '.join(sorted(ALLOWED_MODELS))}",
        )
    result = await generate_response(
        model=model_name,
        prompt=request.prompt,
        stream=request.stream,
    )
    return OllamaResponse(response=result)
