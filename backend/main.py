from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware

from database import engine
from models import Base
from routes.auth import router as auth_router

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Visibility Analyzer API",
    version="1.0"
)

# Session middleware for Google OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key="AIVisibilityAnalyzer123456"
)

# Register routes
app.include_router(auth_router)

@app.get("/")
def home():
    return {
        "message": "AI Visibility Analyzer Backend Running Successfully"
    }