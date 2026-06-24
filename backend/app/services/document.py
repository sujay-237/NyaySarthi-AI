import base64
from io import BytesIO
from typing import Dict, Any
from pypdf import PdfReader


async def extract_text_from_file(file_data: bytes, filename: str, mime_type: str) -> Dict[str, Any]:
    result = {
        "filename": filename,
        "mime_type": mime_type,
        "text": "",
        "data": ""
    }

    if mime_type == "text/plain":
        result["text"] = file_data.decode("utf-8", errors="ignore")
    elif mime_type == "application/pdf":
        try:
            reader = PdfReader(BytesIO(file_data))
            text_parts = []
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            result["text"] = "\n".join(text_parts)
        except Exception:
            result["text"] = "[Could not extract text from PDF]"
    elif mime_type.startswith("image/"):
        result["data"] = base64.b64encode(file_data).decode("utf-8")

    return result
