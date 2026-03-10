from fastapi import APIRouter

from api.ollama.model import UserRequest

router = APIRouter(tags=["ollama"])


@router.post("/api/ollama")
async def handle_request(user_request: UserRequest):
    # TODO: Connect to ollama model 'gemini-3-flash-preview'
    return {"status": "success", "received_request": user_request.request}
