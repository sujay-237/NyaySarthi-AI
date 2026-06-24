from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.config import get_settings
from app.routers import analyze, chat, providers, history

settings = get_settings()

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-powered legal document analysis with multi-LLM support",
    version="2.0.0"
)

# CORS
origins = [o.strip() for o in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routers
app.include_router(analyze.router, prefix="/api", tags=["analysis"])
app.include_router(chat.router, prefix="/api", tags=["chat"])
app.include_router(providers.router, prefix="/api", tags=["providers"])
app.include_router(history.router, prefix="/api", tags=["history"])

# Static files (frontend build) - mount only assets to avoid intercepting API routes
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
assets_dir = os.path.join(frontend_dist, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "2.0.0"}

# SPA fallback
@app.get("/{full_path:path}")
async def catch_all(request: Request, full_path: str):
    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path) and not full_path.startswith("api"):
        return FileResponse(index_path)
    return {"detail": "Not found"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
