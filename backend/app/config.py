from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # API Keys
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    
    # Ollama
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    # App
    APP_NAME: str = "NyaySarthi AI"
    DEBUG: bool = False
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    
    # Default model settings
    DEFAULT_PROVIDER: str = "gemini"
    DEFAULT_GEMINI_MODEL: str = "gemini-2.5-flash-preview-05-20"
    DEFAULT_GROQ_MODEL: str = "llama-3.3-70b-versatile"
    DEFAULT_OLLAMA_MODEL: str = "llama3"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    return Settings()
