from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from auth.google_auth import oauth
from database import get_db
from models import User
from utils.jwt_handler import create_access_token
from dependencies import get_current_user

import os
from urllib.parse import urlencode


router = APIRouter()


# =========================================================
# GOOGLE LOGIN
# =========================================================

@router.get("/google/login", tags=["Authentication"])
async def google_login(request: Request):

    print("=" * 60)
    print("GOOGLE LOGIN STARTED")

    redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")

    print("Google Redirect URI:")
    print(redirect_uri)

    if not redirect_uri:
        raise HTTPException(
            status_code=500,
            detail="GOOGLE_REDIRECT_URI is not configured."
        )

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


# =========================================================
# GOOGLE CALLBACK
# =========================================================

@router.get("/google/callback", tags=["Authentication"])
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):

    print("=" * 60)
    print("GOOGLE CALLBACK STARTED")

    try:

        # -------------------------------------------------
        # 1. EXCHANGE GOOGLE CODE FOR TOKEN
        # -------------------------------------------------

        token = await oauth.google.authorize_access_token(
            request
        )

        print("Google authorization successful.")


        # -------------------------------------------------
        # 2. GET GOOGLE USER INFORMATION
        # -------------------------------------------------

        user_info = token.get("userinfo")

        if not user_info:

            print(
                "ERROR: Google user information not found."
            )

            raise HTTPException(
                status_code=400,
                detail="Google user information not found."
            )


        email = user_info.get("email")

        google_id = user_info.get("sub")

        name = user_info.get("name")

        picture = user_info.get("picture")


        if not email or not google_id:

            raise HTTPException(
                status_code=400,
                detail="Incomplete Google user information."
            )


        print(
            f"Google Email: {email}"
        )


        # -------------------------------------------------
        # 3. FIND EXISTING USER
        # -------------------------------------------------

        user = (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )


        # -------------------------------------------------
        # 4. CREATE USER IF NOT EXISTS
        # -------------------------------------------------

        if not user:

            print("Creating new user...")

            user = User(

                google_id=google_id,

                email=email,

                name=name or email.split("@")[0],

                picture=picture,

                is_active=True

            )

            db.add(user)

            db.commit()

            db.refresh(user)

            print(
                f"New user created: {user.id}"
            )

        else:

            print(
                f"Existing user found: {user.id}"
            )


        # -------------------------------------------------
        # 5. CREATE OUR APPLICATION JWT
        # -------------------------------------------------

        access_token = create_access_token(

            {
                "user_id": user.id,
                "email": user.email
            }

        )


        if not access_token:

            raise HTTPException(
                status_code=500,
                detail="Unable to create access token."
            )


        print("JWT CREATED SUCCESSFULLY")

        print(
            f"User ID: {user.id}"
        )

        print(
            f"Email: {user.email}"
        )


        # -------------------------------------------------
        # 6. BUILD FRONTEND REDIRECT URL
        # -------------------------------------------------

        frontend_url = (
            "https://ai-visibility-analyzer-coral.vercel.app"
        )

        dashboard_url = (
            f"{frontend_url}/dashboard.html"
        )


        # IMPORTANT:
        # Send the JWT to the frontend.
        #
        # We use urlencode() so the token is safely
        # placed inside the URL.

        query_string = urlencode(
            {
                "token": access_token
            }
        )


        redirect_url = (
            f"{dashboard_url}?{query_string}"
        )


        # DO NOT PRINT THE ACTUAL TOKEN.
        # Just confirm that the token is attached.

        print(
            "Redirecting to dashboard with JWT token."
        )

        print(
            f"Redirect URL: {dashboard_url}?token=[JWT]"
        )


        # -------------------------------------------------
        # 7. REDIRECT TO VERCEL DASHBOARD
        # -------------------------------------------------

        return RedirectResponse(

            url=redirect_url,

            status_code=302

        )


    except HTTPException:

        raise


    except Exception as e:

        print(
            "=" * 60
        )

        print(
            "GOOGLE CALLBACK ERROR:"
        )

        print(
            repr(e)
        )

        print(
            "=" * 60
        )

        raise HTTPException(

            status_code=500,

            detail="Google login failed."

        )


# =========================================================
# PROFILE
# =========================================================

@router.get("/profile", tags=["Authentication"])
def get_profile(
    current_user: User = Depends(
        get_current_user
    )
):

    return {

        "message":
            "Token Verified Successfully",

        "user": {

            "id":
                current_user.id,

            "google_id":
                current_user.google_id,

            "email":
                current_user.email,

            "name":
                current_user.name,

            "picture":
                current_user.picture,

            "is_active":
                current_user.is_active,

            "created_at":
                current_user.created_at

        }

    }