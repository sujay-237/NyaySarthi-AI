import httpx
import json
import re
import uuid
from typing import Optional, List, Dict, Any

from app.config import get_settings
from app.models.schemas import AnalysisResponse, HealthRating, SeverityCounts, Clause, ChatChunk

settings = get_settings()

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models"

LANGUAGE_INSTRUCTIONS = {
    "en": "Provide the entire response in English.",
    "hi": "Provide the entire response in Hindi.",
    "bn": "Provide the entire response in Bengali.",
    "mr": "Provide the entire response in Marathi.",
    "ta": "Provide the entire response in Tamil.",
    "ml": "Provide the entire response in Malayalam.",
}

ANALYSIS_PROMPT = """Analyze the following legal document(s). {lang_instruction}
Provide the output in four distinct sections using this exact markdown format:
### Contract Health
[Single-word rating: Good, Standard, or Caution]
[One-sentence justification]
### Next Steps
* [Action item 1]
* [Action item 2]
### Summary
[Paragraph summary]
### Key Clauses
**Clause Title** [Severity: High, Medium, or Low]
[Explanation]
(Repeat for 3-4 clauses)
"""

CHAT_PROMPT = """Based on the following legal document(s), answer the user's question. {lang_instruction}

DOCUMENT CONTEXT:
---
{context}
---

QUESTION: "{message}"
"""


def _build_gemini_payload(contents: List[Dict[str, Any]], model: str, stream: bool = False):
    return {
        "contents": [{"parts": contents}],
        "generationConfig": {"temperature": 0.3, "maxOutputTokens": 8192},
    }


async def analyze_document(text: str, files: List[Dict], language: str = "en", model: Optional[str] = None) -> AnalysisResponse:
    m = model or settings.DEFAULT_GEMINI_MODEL
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured")

    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    prompt = ANALYSIS_PROMPT.format(lang_instruction=lang_instruction)

    contents = [{"text": prompt}]
    if text:
        contents.append({"text": f"---PASTED TEXT---\n{text}"})
    for f in files:
        if f.get("mime_type", "").startswith("image/"):
            contents.append({"inline_data": {"mime_type": f["mime_type"], "data": f["data"]}})
        else:
            contents.append({"text": f"---FILE: {f.get('filename', 'unknown')}---\n{f.get('text', '')}"})

    payload = _build_gemini_payload(contents, m)
    url = f"{GEMINI_API_URL}/{m}:generateContent?key={api_key}"

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    candidate = data.get("candidates", [{}])[0]
    text_response = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")

    return _parse_analysis(text_response)


async def chat_stream(message: str, context: str, language: str = "en", model: Optional[str] = None):
    m = model or settings.DEFAULT_GEMINI_MODEL
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured")

    lang_instruction = LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["en"])
    prompt = CHAT_PROMPT.format(lang_instruction=lang_instruction, context=context, message=message)

    payload = _build_gemini_payload([{"text": prompt}], m)
    url = f"{GEMINI_API_URL}/{m}:generateContent?key={api_key}"

    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(url, json=payload)
        resp.raise_for_status()
        data = resp.json()

    candidate = data.get("candidates", [{}])[0]
    text_response = candidate.get("content", {}).get("parts", [{}])[0].get("text", "")
    yield ChatChunk(chunk=text_response, done=True)


def _parse_analysis(response_text: str) -> AnalysisResponse:
    sections = {}
    section_regex = r"###\s+(.*?)\s*\n"
    import re
    matches = list(re.finditer(section_regex, response_text, re.IGNORECASE))

    for i, match in enumerate(matches):
        section_name = match.group(1).strip()
        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(response_text)
        sections[section_name.lower().replace(" ", "_")] = response_text[start:end].strip()

    health_content = sections.get("contract_health", "")
    health_lines = [l.strip() for l in health_content.split("\n") if l.strip()]
    rating = health_lines[0] if health_lines else "Standard"
    justification = " ".join(health_lines[1:]) if len(health_lines) > 1 else "No justification provided."

    next_steps_content = sections.get("next_steps", "")
    steps = [re.sub(r"^[\*\-]\s*", "", l).strip() for l in next_steps_content.split("\n") if l.strip()]

    summary_content = sections.get("summary", "")

    clauses_content = sections.get("key_clauses", "")
    clauses = []
    severity_counts = {"high": 0, "medium": 0, "low": 0}

    clause_items = re.split(r"\n(?=\*\*.*?\*\*)", clauses_content)
    for item in clause_items:
        item = item.strip()
        if not item:
            continue
        title_match = re.search(r"\*\*(.*?)\*\*", item)
        severity_match = re.search(r"\[.*?Severity:\s*(High|Medium|Low).*?\]", item, re.IGNORECASE)
        title = title_match.group(1) if title_match else "Key Point"
        severity = (severity_match.group(1).capitalize() if severity_match else "Medium")
        explanation = re.sub(r"\*\*.*?\*\*(\s*\[.*?\])?", "", item).strip()

        clauses.append(Clause(title=title, severity=severity, explanation=explanation))
        severity_counts[severity.lower()] = severity_counts.get(severity.lower(), 0) + 1

    return AnalysisResponse(
        id=str(uuid.uuid4()),
        health=HealthRating(rating=rating, justification=justification),
        severity=SeverityCounts(
            high=severity_counts.get("high", 0),
            medium=severity_counts.get("medium", 0),
            low=severity_counts.get("low", 0)
        ),
        next_steps=steps,
        summary=summary_content or "No summary could be generated.",
        clauses=clauses,
        full_text=response_text
    )
