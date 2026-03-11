"""
uvicorn server를 실행하는 기본 구조
"""

import uvicorn
from fastapi import FastAPI

from api.ollama.view import router as ollama_router
from api.root.view import router as root_router

app = FastAPI()

app.include_router(root_router)
app.include_router(ollama_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
