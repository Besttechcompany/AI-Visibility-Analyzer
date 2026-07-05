from fastapi import FastAPI
from database import engine
from models import Base
from starlette.middleware.sessions import SessionMiddleware
from routes.auth import router as auth_router

Base.metadata.create_all(bind=engine)
app = FastAPI(
    title="AI Visibility Analyzer API",
    version="1.0"
)

app.add_middleware(
    SessionMiddleware,
    secret_key="AIVisibilityAnalyzer123456"
)

app.include_router(auth_router)

@app.get("/")
def home():
    return {
        "message": "AI Visibility Analyzer Backend Running Successfully"
    }