import httpx
import json
from typing import Optional, List, Dict, Any

from app.config import get_settings
from app.models.schemas import AnalysisResponse, ChatChunk
from app.services.gemini import _parse_analysis, ANALYSIS_PROMPT, CHAT_PROMPT, LANGUAGE_INSTRUCTIONS

settings = get_settings()

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


async def analyze_document(text: str, files: List[Dict], language: str = "en", model: Optional[str] = None) -> AnalysisResponse:
    m = model or settings.DEFAULT_GROQ_MODEL
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY not configured")

    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    prompt = ANALYSIS_PROMPT.format(lang_instruction=lang_instruction)

    content_parts = [prompt]
    if text:
        content_parts.append(f"---PASTED TEXT---\n{text}")
    for f in files:
        if not f.get("mime_type", "").startswith("image/"):
            content_parts.append(f"---FILE: {f.get('filename', 'unknown')}---\n{f.get('text', '')}")

    payload = {
        "model": m,
        "messages": [{"role": "user", "content": "\n\n".join(content_parts)}],
        "temperature": 0.3,
        "max_tokens": 8192,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(
            GROQ_API_URL,
            json=payload,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        )
        resp.raise_for_status()
        data = resp.json()

    text_response = data["choices"][0]["message"]["content"]
    return _parse_analysis(text_response)


async def chat_stream(message: str, context: str, language: str = "en", model: Optional[str] = None):
    m = model or settings.DEFAULT_GROQ_MODEL
    api_key = settings.GROQ_API_KEY
    if not api_key:
        raise ValueError("GROQ_API_KEY not configured")

    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    prompt = CHAT_PROMPT.format(lang_instruction=lang_instruction, context=context, message=message)

    payload = {
        "model": m,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.3,
        "max_tokens": 4096,
        "stream": True,
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream(
            "POST", GROQ_API_URL,
            json=payload,
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        ) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if line.startswith("data: "):
                    chunk = line[6:]
                    if chunk == "[DONE]":
                        yield ChatChunk(chunk="", done=True)
                        break
                    try:
                        data = json.loads(chunk)
                        delta = data["choices"][0]["delta"].get("content", "")
                        if delta:
                            yield ChatChunk(chunk=delta, done=False)
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue
            yield ChatChunk(chunk="", done=True)
