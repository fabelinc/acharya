from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router


def create_app() -> FastAPI:
    # Initialize FastAPI app with safe defaults if settings are missing
    app = FastAPI(
        title=getattr(settings, "PROJECT_NAME", "Expl-AI-nly Teaching Assistant"),
        description="Expl-AI-nly Teaching Assistant Platform",
        version=getattr(settings, "VERSION", "0.1.0"),
        openapi_url=f"{getattr(settings, 'API_V1_STR', '/api/v1')}/openapi.json",
        docs_url=f"{getattr(settings, 'API_V1_STR', '/api/v1')}/docs"

    )

    # Set up CORS with safe defaults
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include API routes
    app.include_router(
        api_router,
        prefix=getattr(settings, "API_V1_STR", "/api/v1")
    )
    
    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=getattr(settings, "SERVER_HOST", "0.0.0.0"),
        port=int(getattr(settings, "SERVER_PORT", 8000)),
        reload=getattr(settings, "DEBUG", True)
    )