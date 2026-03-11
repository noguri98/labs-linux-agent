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


class OllamaResponse(BaseModel):
    response: str = Field(..., description="The generated response from Ollama")


class OllamaRequest(BaseModel):
    model: str = Field(
        default="gemini-3-flash-preview",
        description="The Ollama model to use for inference",
    )
    prompt: str = Field(..., description="The user's input prompt")
    stream: bool = Field(
        default=False, description="Whether to stream the response back"
    )


class OllamaResponse(BaseModel):
    response: str = Field(..., description="The generated response from Ollama")
