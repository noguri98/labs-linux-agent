from typing import Any, List, Optional

from pydantic import BaseModel, Field, validator


class OllamaRequest(BaseModel):
    model: str = Field(
        default="gemini-3-flash-preview",
        description="The Ollama model to use for inference",
    )
    prompt: str = Field(..., description="The user's input prompt")
    stream: bool = Field(
        default=False, description="Whether to stream the response back"
    )

    @validator("model")
    def strip_cloud_suffix(cls, v: str) -> str:
        """Remove optional ':cloud' suffix so local Ollama can handle the request.
        If a user explicitly wants the cloud model, they must configure OLLAMA_HOST accordingly.
        """
        return v.replace(":cloud", "")


class ToolExecution(BaseModel):
    name: str
    arguments: Any
    result: Optional[str] = None


class OllamaResponse(BaseModel):
    response: str = Field(..., description="The generated response from Ollama")
    thinking: Optional[str] = Field(
        None, description="The model's thinking/reasoning process"
    )
    tools: Optional[List[ToolExecution]] = Field(
        default_factory=list, description="List of tools executed during the request"
    )
