from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=getattr(settings, "PROJECT_NAME", "Aacharya Teaching Assistant"),
        description="Aacharya Teaching Assistant Platform",
        version=getattr(settings, "VERSION", "0.1.0"),
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs"
    )

    # Add root route
    @app.get("/", tags=["Health Check"])
    async def root():
        return {"status": "Aacharya backend is live 🚀"}

    # CORS settings (add production domain later)
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_origins=[
            "http://localhost:3000",           # local dev
            "https://acharya-chi.vercel.app",
            "https://www.fabelinc.com",
            "https://lucky-axolotl-158dbd.netlify.app" # ✅ add your deployed Netlify domain here
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Add API routes
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app


app = create_app()

# For local development only
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.SERVER_HOST,
        port=int(settings.SERVER_PORT),
        reload=settings.DEBUG
    )
