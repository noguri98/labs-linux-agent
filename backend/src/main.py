"""
uvicorn server를 실행하는 기본 구조
"""

import os

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.ollama.view import router as ollama_router
from api.root.view import router as root_router

app = FastAPI()

# Configure CORS
allowed_origins_str = os.getenv("ALLOWED_ORIGINS", "*")
origins = (
    [origin.strip() for origin in allowed_origins_str.split(",")]
    if allowed_origins_str
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(root_router)
app.include_router(ollama_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
