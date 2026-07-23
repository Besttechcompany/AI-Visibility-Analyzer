import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from database import engine
from models import Base
from routes.auth import router as auth_router
from routes.analyze import router as analyze_router

# ---------------------------------------
# Create Database Tables
# ---------------------------------------

Base.metadata.create_all(bind=engine)

# ---------------------------------------
# FastAPI App
# ---------------------------------------

app = FastAPI(
    title="AI Visibility Analyzer API",
    version="1.0"
)

# ---------------------------------------
# Session Middleware
# ---------------------------------------

app.add_middleware(
    SessionMiddleware,
    secret_key="AIVisibilityAnalyzer123456"
)

# ---------------------------------------
# CORS Middleware
# ---------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-visibility-analyzer-coral.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------
# Register Routes
# ---------------------------------------

app.include_router(auth_router)
app.include_router(analyze_router)

# ---------------------------------------
# Screenshot Directory
# ---------------------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")

os.makedirs(
    SCREENSHOTS_DIR,
    exist_ok=True
)

print("=" * 60)
print("Serving screenshots from:")
print(SCREENSHOTS_DIR)
print("=" * 60)

# ---------------------------------------
# Serve Screenshot Images
# ---------------------------------------

app.mount(
    "/screenshots",
    StaticFiles(directory=SCREENSHOTS_DIR),
    name="screenshots"
)

# ---------------------------------------
# Home
# ---------------------------------------

@app.get("/")
def home():
    return {
        "message": "AI Visibility Analyzer Backend Running Successfully"
    }