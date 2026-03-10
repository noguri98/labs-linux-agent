from fastapi import APIRouter

router = APIRouter(tags=["root"])


@router.get("/")
async def hello():
    return {"message": "hello"}
