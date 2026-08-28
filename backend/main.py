import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from database import engine
from models import Base
from routes.auth import router as auth_router
from routes.analyze import router as analyze_router


# =========================================================
# DATABASE TABLE CREATION
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APPLICATION
# =========================================================

app = FastAPI(
    title="AI Visibility Analyzer API",
    version="1.0"
)


# =========================================================
# SESSION SECRET
# =========================================================

SESSION_SECRET_KEY = os.getenv("SESSION_SECRET_KEY")

if not SESSION_SECRET_KEY:
    raise RuntimeError(
        "SESSION_SECRET_KEY is not configured."
    )


app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "https://webanalyzer.besttechcompany.com"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(auth_router)

app.include_router(analyze_router)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message":
        "AI Visibility Analyzer Backend Running Successfully"
    }