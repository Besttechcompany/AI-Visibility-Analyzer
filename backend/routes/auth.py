from fastapi import (
    APIRouter,
    Request,
    Depends,
    HTTPException
)

from fastapi.responses import RedirectResponse

from sqlalchemy.orm import Session

from auth.google_auth import oauth
from database import get_db
from models import User

from utils.jwt_handler import create_access_token

from dependencies import get_current_user

import os
from urllib.parse import quote


router = APIRouter()


# =========================================================
# FRONTEND URL
# =========================================================

FRONTEND_URL = (
    "https://ai-visibility-analyzer-coral.vercel.app"
)


# =========================================================
# GOOGLE LOGIN
# =========================================================

@router.get(
    "/google/login",
    tags=["Authentication"]
)
async def google_login(
    request: Request
):

    redirect_uri = os.getenv(
        "GOOGLE_REDIRECT_URI"
    )


    if not redirect_uri:

        raise HTTPException(
            status_code=500,
            detail=(
                "GOOGLE_REDIRECT_URI "
                "environment variable is not configured."
            )
        )


    print(
        "======================================"
    )

    print(
        "GOOGLE LOGIN STARTED"
    )

    print(
        "Google Redirect URI:",
        redirect_uri
    )

    print(
        "======================================"
    )


    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


# =========================================================
# GOOGLE CALLBACK
# =========================================================

@router.get(
    "/google/callback",
    tags=["Authentication"]
)
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):

    try:

        print(
            "======================================"
        )

        print(
            "GOOGLE CALLBACK STARTED"
        )

        print(
            "======================================"
        )


        # -------------------------------------------------
        # 1. EXCHANGE GOOGLE AUTHORIZATION CODE
        # -------------------------------------------------

        token = await oauth.google.authorize_access_token(
            request
        )


        print(
            "Google authorization successful."
        )


        # -------------------------------------------------
        # 2. GET GOOGLE USER INFORMATION
        # -------------------------------------------------

        user_info = token.get(
            "userinfo"
        )


        if not user_info:

            print(
                "ERROR: Google userinfo missing."
            )

            raise HTTPException(
                status_code=400,
                detail=(
                    "Google user information "
                    "was not returned."
                )
            )


        google_id = user_info.get(
            "sub"
        )

        email = user_info.get(
            "email"
        )

        name = user_info.get(
            "name"
        )

        picture = user_info.get(
            "picture"
        )


        if not google_id or not email:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Google account information "
                    "is incomplete."
                )
            )


        print(
            "Google Email:",
            email
        )


        # -------------------------------------------------
        # 3. FIND USER IN NEON
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

            print(
                "Creating new user in Neon..."
            )


            user = User(

                google_id=google_id,

                email=email,

                name=(
                    name
                    or email.split("@")[0]
                ),

                picture=picture,

                is_active=True

            )


            db.add(user)

            db.commit()

            db.refresh(user)


            print(
                "New user created:",
                user.id
            )


        else:

            print(
                "Existing user found:",
                user.id
            )


        # -------------------------------------------------
        # 5. CHECK USER STATUS
        # -------------------------------------------------

        if not user.is_active:

            raise HTTPException(
                status_code=403,
                detail="User account is inactive."
            )


        # -------------------------------------------------
        # 6. CREATE JWT
        # -------------------------------------------------

        access_token = create_access_token(

            {
                "user_id": user.id,
                "email": user.email
            }

        )


        print(
            "JWT CREATED SUCCESSFULLY"
        )

        print(
            "User ID:",
            user.id
        )

        print(
            "Email:",
            user.email
        )


        # -------------------------------------------------
        # 7. CREATE DASHBOARD REDIRECT URL
        # -------------------------------------------------

        dashboard_url = (
            f"{FRONTEND_URL}"
            f"/dashboard.html"
            f"?token={quote(access_token)}"
        )


        print(
            "Redirecting to:"
        )

        print(
            FRONTEND_URL + "/dashboard.html"
        )


        # -------------------------------------------------
        # 8. REDIRECT TO DASHBOARD
        # -------------------------------------------------

        return RedirectResponse(
            url=dashboard_url,
            status_code=302
        )


    except HTTPException:

        raise


    except Exception as e:

        db.rollback()


        print(
            "======================================"
        )

        print(
            "GOOGLE CALLBACK ERROR"
        )

        print(
            repr(e)
        )

        print(
            "======================================"
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Google authentication failed."
            )
        )


# =========================================================
# PROFILE
# =========================================================

@router.get(
    "/profile",
    tags=["Authentication"]
)
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