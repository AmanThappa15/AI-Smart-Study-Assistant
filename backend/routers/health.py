from fastapi import APIRouter, HTTPException, status
from core.config import settings, get_gemini_client
from schemas.health import HealthResponse, RootResponse, TestGeminiResponse

router = APIRouter(tags=["Health & System"])

@router.get("/", response_model=RootResponse)
def home():
    return {
        "message": "AI Study Assistant Backend is Working!"
    }

@router.get("/health", response_model=HealthResponse)
def health_check():
    return {
        "status": "Backend is healthy"
    }

@router.get("/test-gemini", response_model=TestGeminiResponse)
def test_gemini():
    try:
        client = get_gemini_client()
        response = client.models.generate_content(
            model=settings.DEFAULT_GEMINI_MODEL,
            contents="Explain what a database in one sentence"
        )
        return {
            "response": response.text
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gemini connection failed: {str(e)}"
        )
