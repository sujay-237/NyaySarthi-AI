from fastapi import APIRouter, File, UploadFile, Form
from fastapi.responses import JSONResponse
from typing import List, Optional
import uuid

from app.models.schemas import AnalysisRequest, AnalysisResponse
from app.services import gemini, groq, ollama, document

router = APIRouter()

PROVIDER_MAP = {
    "gemini": gemini,
    "groq": groq,
    "ollama": ollama,
}


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_legal_document(
    text: str = Form(""),
    provider: str = Form("gemini"),
    model: Optional[str] = Form(None),
    language: str = Form("en"),
    files: List[UploadFile] = File([])
):
    service = PROVIDER_MAP.get(provider)
    if not service:
        return JSONResponse(status_code=400, content={"detail": f"Unknown provider: {provider}"})

    file_data = []
    for uploaded_file in files:
        content = await uploaded_file.read()
        mime = uploaded_file.content_type or "application/octet-stream"
        extracted = await document.extract_text_from_file(content, uploaded_file.filename, mime)
        file_data.append(extracted)

    try:
        result = await service.analyze_document(text, file_data, language, model)
        return result
    except Exception as e:
        return JSONResponse(status_code=500, content={"detail": str(e)})
