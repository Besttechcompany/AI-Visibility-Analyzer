import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware

from routes.auth import router as auth_router
from routes.analyze import router as analyze_router


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

SESSION_SECRET_KEY = os.getenv(
    "SESSION_SECRET_KEY"
)


if not SESSION_SECRET_KEY:

    raise RuntimeError(
        "SESSION_SECRET_KEY is not configured."
    )


# =========================================================
# SESSION MIDDLEWARE
# =========================================================

app.add_middleware(

    SessionMiddleware,

    secret_key=
        SESSION_SECRET_KEY

)


# =========================================================
# CORS
# =========================================================
#
# Production frontend:
#
# https://webanalyzer.besttechcompany.com
#
# Local development origins are included so that
# frontend testing does not fail because of CORS.
#

ALLOWED_ORIGINS = [

    "https://webanalyzer.besttechcompany.com",

    "http://localhost:3000",

    "http://localhost:5173",

    "http://127.0.0.1:3000",

    "http://127.0.0.1:5173",

]


app.add_middleware(

    CORSMiddleware,

    allow_origins=
        ALLOWED_ORIGINS,

    allow_credentials=
        True,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ],

)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(
    auth_router
)


app.include_router(
    analyze_router
)


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {

        "message":
            "AI Visibility Analyzer Backend Running Successfully"

    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health_check():

    return {

        "status":
            "healthy",

        "service":
            "AI Visibility Analyzer API"

    }