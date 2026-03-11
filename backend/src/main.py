import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.ollama.view import router as ollama_router
from api.root.view import router as root_router

def create_app() -> FastAPI:
    app = FastAPI(title="Labs AI Agent Backend")

    # Configure CORS
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
    # allow_credentials must be False if using "*" origin
    allow_all = "*" in allowed_origins

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=not allow_all,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routes
    app.include_router(root_router)
    app.include_router(ollama_router)
    
    return app

app = create_app()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
