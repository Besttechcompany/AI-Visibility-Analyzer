from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from auth.google_auth import oauth
from database import get_db
from models import User
from utils.jwt_handler import create_access_token
from dependencies import get_current_user

import os

router = APIRouter()


# -----------------------------------------------------
# Google Login
# -----------------------------------------------------
@router.get("/google/login", tags=["Authentication"])
async def google_login(request: Request):

    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


# -----------------------------------------------------
# Google Callback
# -----------------------------------------------------
@router.get("/google/callback", tags=["Authentication"])
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):

    # Exchange authorization code for access token
    token = await oauth.google.authorize_access_token(request)

    # Get Google user information
    user_info = token.get("userinfo")

    if not user_info:
        return {
            "error": "Google user information not found"
        }

    # Check if user already exists
    user = db.query(User).filter(
        User.email == user_info["email"]
    ).first()

    # Create new user if not exists
    if not user:

        user = User(
            google_id=user_info["sub"],
            email=user_info["email"],
            name=user_info["name"],
            picture=user_info.get("picture"),
            is_active=True
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    # Create JWT Token
    access_token = create_access_token(
        {
            "user_id": user.id,
            "email": user.email
        }
    )

    # Redirect to Vercel Dashboard
    return RedirectResponse(
        url=f"https://ai-visibility-analyzer-coral.vercel.app/dashboard.html?token={access_token}",
        status_code=302
    )


# -----------------------------------------------------
# Protected Profile Endpoint
# -----------------------------------------------------
@router.get("/profile", tags=["Authentication"])
def get_profile(
    current_user: User = Depends(get_current_user)
):

    return {
        "message": "Token Verified Successfully",
        "user": {
            "id": current_user.id,
            "google_id": current_user.google_id,
            "email": current_user.email,
            "name": current_user.name,
            "picture": current_user.picture,
            "is_active": current_user.is_active,
            "created_at": current_user.created_at
        }
    }