from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import tasks, dates

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Secure single-user reminder and note-taking backend API.",
    version="1.0.0",
)

# Explicitly configure CORS allowed origins for local dev and production Vercel frontend
configured_origins = [
    "http://localhost:5173",
    "https://YOUR_VERCEL_APP.vercel.app",
    *settings.CORS_ORIGINS,
]
allowed_origins = list(dict.fromkeys(configured_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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
