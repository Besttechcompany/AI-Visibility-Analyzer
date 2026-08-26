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
    mobile: str | None = None


class LoginRequest(BaseModel):

    email: str
    password: str


class ProfileUpdateRequest(BaseModel):

    name: str | None = None
    email: str | None = None
    mobile: str | None = None
    picture: str | None = None


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def clean_mobile(mobile):

    if mobile is None:
        return None

    mobile = mobile.strip()

    if not mobile:
        return None

    if len(mobile) > 30:
        raise HTTPException(
            status_code=400,
            detail="Mobile number is too long."
        )

    return mobile


def clean_email(email):

    if email is None:
        return None

    email = email.strip().lower()

    if not email or "@" not in email:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid email address."
        )

    return email


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
    email = clean_email(data.email)
    password = data.password
    mobile = clean_mobile(data.mobile)

    # -----------------------------------------------------
    # VALIDATE NAME
    # -----------------------------------------------------

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Name is required."
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
        .filter(User.email == email)
        .first()
    )

    if existing_user:

        if existing_user.google_id:

            raise HTTPException(
                status_code=409,
                detail=(
                    "An account already exists with this email "
                    "using Google login. Please continue with Google."
                )
            )

        raise HTTPException(
            status_code=409,
            detail="An account already exists with this email."
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
        mobile=mobile,
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

            "mobile":
                user.mobile,

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

    email = clean_email(data.email)
    password = data.password

    # -----------------------------------------------------
    # FIND USER BY CURRENT EMAIL
    #
    # This allows users to login using their edited email.
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(User.email == email)
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

            "mobile":
                user.mobile,

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

    print("=" * 60)

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
    print("GOOGLE CALLBACK STARTED")
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
        # 3. VALIDATE GOOGLE DATA
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

        print(
            f"Google ID: {google_id}"
        )

        # =================================================
        # IMPORTANT GOOGLE ACCOUNT LOGIC
        # =================================================
        #
        # ALWAYS FIND GOOGLE USERS BY google_id FIRST.
        #
        # This is critical because the user may have changed
        # their application profile email.
        #
        # Example:
        #
        # Google email:
        # old@gmail.com
        #
        # Application email:
        # new@email.com
        #
        # google_id remains the permanent Google identity.
        #
        # =================================================

        # -------------------------------------------------
        # 4. FIND EXISTING USER BY GOOGLE ID
        # -------------------------------------------------

        user = (
            db.query(User)
            .filter(User.google_id == google_id)
            .first()
        )

        if user:

            print(
                f"Existing Google user found by google_id: "
                f"{user.id}"
            )

            # -------------------------------------------------
            # DO NOT overwrite user.email here.
            #
            # The user may have intentionally changed their
            # application email from the Profile page.
            # -------------------------------------------------

            # We can optionally refresh Google's name/picture.
            # We DO NOT change the application email.

            if name and not user.name:
                user.name = name

            if picture and not user.picture:
                user.picture = picture

            try:

                db.commit()
                db.refresh(user)

            except Exception as e:

                db.rollback()

                print(
                    "GOOGLE USER REFRESH ERROR:",
                    repr(e)
                )

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Unable to update Google account."
                    )
                )

        else:

            # -------------------------------------------------
            # 5. GOOGLE ID NOT FOUND
            #
            # Now check whether the Google email already
            # belongs to an existing application account.
            # -------------------------------------------------

            print(
                "Google ID not found. Checking email..."
            )

            user = (
                db.query(User)
                .filter(User.email == email)
                .first()
            )

            # -------------------------------------------------
            # EXISTING USER FOUND BY EMAIL
            # -------------------------------------------------

            if user:

                print(
                    f"Existing user found by email: "
                    f"{user.id}"
                )

                # -------------------------------------------------
                # EXISTING GOOGLE ACCOUNT WITH DIFFERENT GOOGLE ID
                # -------------------------------------------------

                if user.google_id is not None:

                    if user.google_id != google_id:

                        raise HTTPException(
                            status_code=409,
                            detail=(
                                "This email is already associated "
                                "with a different Google account."
                            )
                        )

                # -------------------------------------------------
                # EXISTING ORDINARY ACCOUNT
                #
                # Link Google to this existing account.
                # -------------------------------------------------

                else:

                    print(
                        "Linking Google account to existing "
                        "ordinary account."
                    )

                    user.google_id = google_id

                    # Do not replace an edited application name
                    # unnecessarily.

                    if not user.name and name:

                        user.name = name

                    if not user.picture and picture:

                        user.picture = picture

                    try:

                        db.commit()
                        db.refresh(user)

                    except Exception as e:

                        db.rollback()

                        print(
                            "GOOGLE ACCOUNT LINK ERROR:",
                            repr(e)
                        )

                        raise HTTPException(
                            status_code=500,
                            detail=(
                                "Unable to link Google account."
                            )
                        )

            # -------------------------------------------------
            # 6. COMPLETELY NEW GOOGLE USER
            # -------------------------------------------------

            else:

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

                    mobile=None,

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
        # 7. CHECK ACTIVE STATUS
        # -------------------------------------------------

        if not user.is_active:

            raise HTTPException(
                status_code=403,
                detail=(
                    "Your account is inactive."
                )
            )

        # -------------------------------------------------
        # 8. CREATE APPLICATION JWT
        #
        # IMPORTANT:
        # JWT identifies the application user by user_id.
        #
        # The email is informational/current profile email.
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
            f"Application Email: {user.email}"
        )

        print(
            f"Google ID: {user.google_id}"
        )

        # -------------------------------------------------
        # 9. FRONTEND URL
        # -------------------------------------------------

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "https://webanalyzer.besttechcompany.com"
        ).rstrip("/")

        # -------------------------------------------------
        # 10. DASHBOARD URL
        # -------------------------------------------------

        dashboard_url = (
            f"{frontend_url}/dashboard.html"
        )

        # -------------------------------------------------
        # 11. ADD JWT TO REDIRECT
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
            "Redirect URL:",
            f"{dashboard_url}?token=[JWT]"
        )

        # -------------------------------------------------
        # 12. REDIRECT
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
# GET PROFILE
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

            "mobile":
                current_user.mobile,

            "picture":
                current_user.picture,

            "is_active":
                current_user.is_active,

            "created_at":
                current_user.created_at
        }
    }


# =========================================================
# PROFILE UPDATE HELPER
# =========================================================

def apply_profile_update(
    data: ProfileUpdateRequest,
    current_user: User,
    db: Session
):

    # -----------------------------------------------------
    # CHECK WHETHER SOMETHING WAS SENT
    # -----------------------------------------------------

    if (
        data.name is None
        and data.email is None
        and data.mobile is None
        and data.picture is None
    ):

        raise HTTPException(
            status_code=400,
            detail="No profile changes were submitted."
        )

    # -----------------------------------------------------
    # UPDATE NAME
    # -----------------------------------------------------

    if data.name is not None:

        name = data.name.strip()

        if not name:

            raise HTTPException(
                status_code=400,
                detail="Name cannot be empty."
            )

        current_user.name = name

    # -----------------------------------------------------
    # UPDATE EMAIL
    #
    # This is the user's APPLICATION email.
    #
    # For Google users:
    # - email can change
    # - google_id NEVER changes
    #
    # This is intentional.
    # -----------------------------------------------------

    if data.email is not None:

        email = clean_email(
            data.email
        )

        if email != current_user.email:

            existing_user = (
                db.query(User)
                .filter(
                    User.email == email,
                    User.id != current_user.id
                )
                .first()
            )

            if existing_user:

                raise HTTPException(
                    status_code=409,
                    detail=(
                        "This email address is already "
                        "registered with another account."
                    )
                )

            current_user.email = email

    # -----------------------------------------------------
    # UPDATE MOBILE
    # -----------------------------------------------------

    if data.mobile is not None:

        current_user.mobile = clean_mobile(
            data.mobile
        )

    # -----------------------------------------------------
    # UPDATE PROFILE PICTURE
    # -----------------------------------------------------

    if data.picture is not None:

        picture = data.picture.strip()

        if not picture:

            current_user.picture = None

        else:

            current_user.picture = picture

    # -----------------------------------------------------
    # SAVE CHANGES
    # -----------------------------------------------------

    try:

        db.commit()
        db.refresh(current_user)

    except Exception as e:

        db.rollback()

        print(
            "PROFILE UPDATE DATABASE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to update profile."
        )

    print(
        "PROFILE UPDATED SUCCESSFULLY"
    )

    return current_user


# =========================================================
# UPDATE PROFILE - PUT
# =========================================================

@router.put(
    "/profile",
    tags=["Profile"]
)
def update_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    print("=" * 60)

    print(
        "PROFILE UPDATE REQUEST"
    )

    print(
        f"Authenticated User ID: "
        f"{current_user.id}"
    )

    # -----------------------------------------------------
    # APPLY UPDATE
    # -----------------------------------------------------

    current_user = apply_profile_update(
        data,
        current_user,
        db
    )

    print("=" * 60)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "success":
            True,

        "message":
            "Profile updated successfully.",

        "user": {

            "id":
                current_user.id,

            "google_id":
                current_user.google_id,

            "email":
                current_user.email,

            "name":
                current_user.name,

            "mobile":
                current_user.mobile,

            "picture":
                current_user.picture,

            "is_active":
                current_user.is_active,

            "created_at":
                current_user.created_at
        }
    }


# =========================================================
# PATCH PROFILE
# =========================================================

@router.patch(
    "/profile",
    tags=["Profile"]
)
def patch_profile(
    data: ProfileUpdateRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    print("=" * 60)

    print(
        "PATCH PROFILE UPDATE REQUEST"
    )

    print(
        f"Authenticated User ID: "
        f"{current_user.id}"
    )

    # -----------------------------------------------------
    # APPLY SAME UPDATE LOGIC
    # -----------------------------------------------------

    current_user = apply_profile_update(
        data,
        current_user,
        db
    )

    print("=" * 60)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {

        "success":
            True,

        "message":
            "Profile updated successfully.",

        "user": {

            "id":
                current_user.id,

            "google_id":
                current_user.google_id,

            "email":
                current_user.email,

            "name":
                current_user.name,

            "mobile":
                current_user.mobile,

            "picture":
                current_user.picture,

            "is_active":
                current_user.is_active,

            "created_at":
                current_user.created_at
        }
    }