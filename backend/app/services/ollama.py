import httpx
import json
from typing import Optional, List, Dict, Any

from app.config import get_settings
from app.models.schemas import AnalysisResponse, ChatChunk
from app.services.gemini import _parse_analysis, ANALYSIS_PROMPT, CHAT_PROMPT, LANGUAGE_INSTRUCTIONS

settings = get_settings()


async def _check_ollama_status(base_url: str) -> str | None:
    """Returns None if OK, otherwise returns an error message."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{base_url}/api/tags")
            if resp.status_code != 200:
                return f"Ollama returned status {resp.status_code}. Is it running?"
            data = resp.json()
            models = [m["name"] for m in data.get("models", [])]
            if not models:
                return "No Ollama models found. Run: ollama pull <model>"
            return None
    except httpx.ConnectError:
        return "Cannot connect to Ollama. Is it running? (ollama serve)"
    except Exception as e:
        return f"Ollama check failed: {str(e)}"


async def analyze_document(text: str, files: List[Dict], language: str = "en", model: Optional[str] = None) -> AnalysisResponse:
    m = model or settings.DEFAULT_OLLAMA_MODEL
    base_url = settings.OLLAMA_BASE_URL.rstrip("/")

    err = await _check_ollama_status(base_url)
    if err:
        raise ValueError(err)

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
        "prompt": "\n\n".join(content_parts),
        "stream": False,
        "options": {"temperature": 0.3},
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(f"{base_url}/api/generate", json=payload)
        if resp.status_code == 404:
            raise ValueError(f"Ollama model '{m}' not found. Run: ollama pull {m}")
        resp.raise_for_status()
        data = resp.json()

    text_response = data.get("response", "")
    return _parse_analysis(text_response)


async def chat_stream(message: str, context: str, language: str = "en", model: Optional[str] = None):
    m = model or settings.DEFAULT_OLLAMA_MODEL
    base_url = settings.OLLAMA_BASE_URL.rstrip("/")

    err = await _check_ollama_status(base_url)
    if err:
        yield ChatChunk(chunk=f"Error: {err}", done=True)
        return

    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    prompt = CHAT_PROMPT.format(lang_instruction=lang_instruction, context=context, message=message)

    payload = {
        "model": m,
        "prompt": prompt,
        "stream": True,
        "options": {"temperature": 0.3},
    }

    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", f"{base_url}/api/generate", json=payload) as resp:
            if resp.status_code == 404:
                yield ChatChunk(chunk=f"Error: Ollama model '{m}' not found. Run: ollama pull {m}", done=True)
                return
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line:
                    continue
                try:
                    data = json.loads(line)
                    chunk = data.get("response", "")
                    if chunk:
                        yield ChatChunk(chunk=chunk, done=False)
                    if data.get("done", False):
                        yield ChatChunk(chunk="", done=True)
                        break
                except json.JSONDecodeError:
                    continue
            yield ChatChunk(chunk="", done=True)
