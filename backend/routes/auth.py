from fastapi import (
    APIRouter,
    Request,
    Depends,
    HTTPException,
    status
)

from fastapi.responses import RedirectResponse

from sqlalchemy.orm import Session

from pydantic import BaseModel

from auth.google_auth import oauth
from database import get_db
from models import User

from utils.jwt_handler import create_access_token

from dependencies import get_current_user

from utils.password_handler import (
    hash_password,
    verify_password
)

import os

from urllib.parse import urlencode


# =========================================================
# ROUTER
# =========================================================

router = APIRouter()


# =========================================================
# REQUEST MODELS
# =========================================================

class RegisterRequest(BaseModel):

    name: str
    email: str
    password: str


class LoginRequest(BaseModel):

    email: str
    password: str


# =========================================================
# ORDINARY REGISTER
# =========================================================

@router.post(
    "/register",
    tags=["Authentication"]
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # CLEAN INPUT
    # -----------------------------------------------------

    name = data.name.strip()

    email = data.email.strip().lower()

    password = data.password


    # -----------------------------------------------------
    # VALIDATE NAME
    # -----------------------------------------------------

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Name is required."
        )


    # -----------------------------------------------------
    # VALIDATE EMAIL
    # -----------------------------------------------------

    if not email or "@" not in email:

        raise HTTPException(
            status_code=400,
            detail="Please enter a valid email address."
        )


    # -----------------------------------------------------
    # VALIDATE PASSWORD
    # -----------------------------------------------------

    if len(password) < 8:

        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters."
        )


    # -----------------------------------------------------
    # CHECK EXISTING USER
    # -----------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if existing_user:

        # Existing Google account

        if existing_user.google_id:

            raise HTTPException(
                status_code=409,
                detail=(
                    "An account already exists with this email "
                    "using Google login. Please continue with Google."
                )
            )


        # Existing ordinary account

        raise HTTPException(
            status_code=409,
            detail=(
                "An account already exists with this email."
            )
        )


    # -----------------------------------------------------
    # HASH PASSWORD
    # -----------------------------------------------------

    password_hash = hash_password(password)


    # -----------------------------------------------------
    # CREATE USER
    # -----------------------------------------------------

    user = User(

        google_id=None,

        email=email,

        name=name,

        password_hash=password_hash,

        picture=None,

        is_active=True

    )


    db.add(user)


    try:

        db.commit()

        db.refresh(user)

    except Exception as e:

        db.rollback()

        print(
            "REGISTER DATABASE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to create account."
        )


    # -----------------------------------------------------
    # CREATE JWT
    # -----------------------------------------------------

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


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "message":
            "Registration successful.",

        "access_token":
            access_token,

        "token_type":
            "bearer",

        "user": {

            "id":
                user.id,

            "email":
                user.email,

            "name":
                user.name,

            "picture":
                user.picture

        }

    }


# =========================================================
# ORDINARY LOGIN
# =========================================================

@router.post(
    "/login",
    tags=["Authentication"]
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # CLEAN INPUT
    # -----------------------------------------------------

    email = data.email.strip().lower()

    password = data.password


    # -----------------------------------------------------
    # FIND USER
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    if not user:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )


    # -----------------------------------------------------
    # CHECK ACCOUNT STATUS
    # -----------------------------------------------------

    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive."
        )


    # -----------------------------------------------------
    # GOOGLE-ONLY ACCOUNT
    # -----------------------------------------------------

    if not user.password_hash:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                "This account uses Google login. "
                "Please continue with Google."
            )
        )


    # -----------------------------------------------------
    # VERIFY PASSWORD
    # -----------------------------------------------------

    if not verify_password(
        password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password."
        )


    # -----------------------------------------------------
    # CREATE JWT
    # -----------------------------------------------------

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


    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "message":
            "Login successful.",

        "access_token":
            access_token,

        "token_type":
            "bearer",

        "user": {

            "id":
                user.id,

            "email":
                user.email,

            "name":
                user.name,

            "picture":
                user.picture

        }

    }


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

    print("=" * 60)

    print(
        "GOOGLE LOGIN STARTED"
    )


    # -----------------------------------------------------
    # GET GOOGLE REDIRECT URI
    # -----------------------------------------------------

    redirect_uri = os.getenv(
        "GOOGLE_REDIRECT_URI"
    )


    print(
        "Google Redirect URI:"
    )

    print(
        redirect_uri
    )


    if not redirect_uri:

        raise HTTPException(
            status_code=500,
            detail=(
                "GOOGLE_REDIRECT_URI is not configured."
            )
        )


    # -----------------------------------------------------
    # START GOOGLE OAUTH
    # -----------------------------------------------------

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

    print("=" * 60)

    print(
        "GOOGLE CALLBACK STARTED"
    )

    print("=" * 60)


    try:

        # -------------------------------------------------
        # 1. EXCHANGE GOOGLE CODE FOR TOKEN
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

            raise HTTPException(
                status_code=400,
                detail=(
                    "Google user information not found."
                )
            )


        email = user_info.get(
            "email"
        )

        google_id = user_info.get(
            "sub"
        )

        name = user_info.get(
            "name"
        )

        picture = user_info.get(
            "picture"
        )


        # -------------------------------------------------
        # VALIDATE GOOGLE DATA
        # -------------------------------------------------

        if not email or not google_id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Incomplete Google user information."
                )
            )


        email = email.strip().lower()


        print(
            f"Google Email: {email}"
        )


        # -------------------------------------------------
        # 3. FIND USER BY EMAIL
        # -------------------------------------------------

        user = (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )


        # -------------------------------------------------
        # 4. CREATE NEW GOOGLE USER
        # -------------------------------------------------

        if not user:

            print(
                "Creating new Google user..."
            )


            user = User(

                google_id=google_id,

                email=email,

                name=(
                    name
                    or email.split("@")[0]
                ),

                password_hash=None,

                picture=picture,

                is_active=True

            )


            db.add(user)


            try:

                db.commit()

                db.refresh(user)

            except Exception as e:

                db.rollback()

                print(
                    "GOOGLE USER DATABASE ERROR:"
                )

                print(
                    repr(e)
                )

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Unable to create Google account."
                    )
                )


            print(
                f"New Google user created: {user.id}"
            )


        # -------------------------------------------------
        # EXISTING USER
        # -------------------------------------------------

        else:

            print(
                f"Existing user found: {user.id}"
            )


            # ---------------------------------------------
            # LINK GOOGLE TO EXISTING ORDINARY ACCOUNT
            # ---------------------------------------------

            if user.google_id is None:

                print(
                    "Linking Google account to existing user."
                )


                user.google_id = google_id


                if name:

                    user.name = name


                if picture:

                    user.picture = picture


                try:

                    db.commit()

                    db.refresh(user)

                except Exception as e:

                    db.rollback()

                    print(
                        "GOOGLE ACCOUNT LINK ERROR:"
                    )

                    print(
                        repr(e)
                    )

                    raise HTTPException(
                        status_code=500,
                        detail=(
                            "Unable to link Google account."
                        )
                    )


            # ---------------------------------------------
            # CHECK GOOGLE ID
            # ---------------------------------------------

            elif user.google_id != google_id:

                raise HTTPException(
                    status_code=409,
                    detail=(
                        "This email is already associated "
                        "with a different Google account."
                    )
                )


        # -------------------------------------------------
        # 5. CHECK ACTIVE STATUS
        # -------------------------------------------------

        if not user.is_active:

            raise HTTPException(
                status_code=403,
                detail=(
                    "Your account is inactive."
                )
            )


        # -------------------------------------------------
        # 6. CREATE APPLICATION JWT
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
                detail=(
                    "Unable to create access token."
                )
            )


        print(
            "JWT CREATED SUCCESSFULLY"
        )


        print(
            f"User ID: {user.id}"
        )


        print(
            f"Email: {user.email}"
        )


        # -------------------------------------------------
        # 7. FRONTEND URL
        # -------------------------------------------------

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "https://webanalyzer.besttechcompany.com"
        ).rstrip("/")


        # -------------------------------------------------
        # 8. DASHBOARD URL
        # -------------------------------------------------

        dashboard_url = (
            f"{frontend_url}/dashboard.html"
        )


        # -------------------------------------------------
        # 9. ADD JWT TO REDIRECT
        # -------------------------------------------------

        query_string = urlencode(
            {
                "token": access_token
            }
        )


        redirect_url = (
            f"{dashboard_url}?{query_string}"
        )


        print(
            "Redirecting to dashboard with JWT."
        )


        print(
            f"Redirect URL: "
            f"{dashboard_url}?token=[JWT]"
        )


        # -------------------------------------------------
        # 10. REDIRECT
        # -------------------------------------------------

        return RedirectResponse(
            url=redirect_url,
            status_code=302
        )


    except HTTPException:

        raise


    except Exception as e:

        print("=" * 60)

        print(
            "GOOGLE CALLBACK ERROR:"
        )

        print(
            repr(e)
        )

        print("=" * 60)


        raise HTTPException(
            status_code=500,
            detail="Google login failed."
        )


# =========================================================
# PROFILE
# =========================================================
#
# IMPORTANT:
#
# This endpoint is:
#
# https://ai-visibility-analyzer.onrender.com/profile
#
# It intentionally does NOT use:
#
#     current_user.mobile
#
# because the User model does not contain a mobile field.
#
# =========================================================

@router.get(
    "/profile",
    tags=["Profile"]
)
def get_profile(
    current_user: User = Depends(
        get_current_user
    )
):

    print(
        "PROFILE API REQUEST"
    )

    print(
        f"Authenticated User ID: "
        f"{current_user.id}"
    )


    # -----------------------------------------------------
    # PROFILE RESPONSE
    # -----------------------------------------------------

    return {

        "success":
            True,

        "authenticated":
            True,

        "message":
            "Profile loaded successfully.",

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