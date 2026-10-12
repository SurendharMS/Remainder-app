from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import tasks, dates

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Secure single-user reminder and note-taking backend API.",
    version="1.0.0",
)

# CORS: settings.CORS_ORIGINS already includes localhost defaults + any
# origins from the CORS_ORIGINS env var (e.g. your Vercel frontend URL).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register sub-routers
app.include_router(tasks.router)
app.include_router(dates.router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "authorized_user": settings.ALLOWED_GITHUB_USER}
