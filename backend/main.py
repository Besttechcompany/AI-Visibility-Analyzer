import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from database import engine
from models import Base
from routes.auth import router as auth_router
from routes.analyze import router as analyze_router


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="AI Visibility Analyzer API",
    version="1.0"
)


app.add_middleware(
    SessionMiddleware,
    secret_key="AIVisibilityAnalyzer123456"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://webanalyzer.besttechcompany.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(analyze_router)


@app.get("/")
def home():
    return {
        "message": "AI Visibility Analyzer Backend Running Successfully"
    }