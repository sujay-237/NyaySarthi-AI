from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from typing import Optional

from app.models.schemas import ChatMessage
from app.services import gemini, groq, ollama

router = APIRouter()

PROVIDER_MAP = {
    "gemini": gemini,
    "groq": groq,
    "ollama": ollama,
}


async def _stream_chat(provider: str, message: str, context: str, language: str, model: Optional[str]):
    service = PROVIDER_MAP.get(provider)
    if not service:
        yield f'data: {"{\"chunk\": \"Unknown provider\", \"done\": true}"}\n\n'
        return

    try:
        async for chunk in service.chat_stream(message, context, language, model):
            import json
            yield f"data: {json.dumps(chunk.model_dump())}\n\n"
    except Exception as e:
        import json
        yield f"data: {json.dumps({'chunk': f'Error: {str(e)}', 'done': True})}\n\n"


@router.post("/chat")
async def chat_with_document(
    message: str = "",
    context: str = "",
    provider: str = "gemini",
    model: Optional[str] = None,
    language: str = "en"
):
    return StreamingResponse(
        _stream_chat(provider, message, context, language, model),
        media_type="text/event-stream"
    )
