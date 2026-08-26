from fastapi import (
    APIRouter,
    Request,
    Depends,
    HTTPException,
    status,
    UploadFile,
    File
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
import uuid
import shutil

from pathlib import Path

from urllib.parse import urlencode


# =========================================================
# ROUTER
# =========================================================

router = APIRouter()


# =========================================================
# PROFILE UPLOAD DIRECTORY
# =========================================================

UPLOAD_DIR = Path("uploads")

PROFILE_UPLOAD_DIR = (
    UPLOAD_DIR / "profile"
)

PROFILE_UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# ALLOWED IMAGE TYPES
# =========================================================

ALLOWED_IMAGE_TYPES = {

    "image/jpeg": ".jpg",

    "image/png": ".png",

    "image/webp": ".webp",

    "image/gif": ".gif"
}


# =========================================================
# MAX PROFILE IMAGE SIZE
# 5 MB
# =========================================================

MAX_PROFILE_IMAGE_SIZE = (
    5 * 1024 * 1024
)


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

    if (
        not email
        or "@" not in email
    ):

        raise HTTPException(
            status_code=400,
            detail="Please enter a valid email address."
        )

    return email


# =========================================================
# DELETE OLD LOCAL PROFILE IMAGE
# =========================================================

def delete_local_profile_image(
    picture_url
):

    if not picture_url:

        return

    try:

        # -------------------------------------------------
        # Only delete files belonging to our local
        # /uploads/profile/ directory.
        # -------------------------------------------------

        if "/uploads/profile/" not in picture_url:

            return

        filename = (
            picture_url
            .split("/uploads/profile/")[-1]
            .split("?")[0]
        )

        if not filename:

            return

        file_path = (
            PROFILE_UPLOAD_DIR /
            Path(filename).name
        )

        if file_path.exists():

            file_path.unlink()

            print(
                "Deleted old profile image:",
                str(file_path)
            )

    except Exception as e:

        print(
            "Unable to delete old profile image:",
            repr(e)
        )


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

    name = data.name.strip()

    email = clean_email(
        data.email
    )

    password = data.password

    mobile = clean_mobile(
        data.mobile
    )

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
            detail=(
                "Password must be at least 8 characters."
            )
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

        if existing_user.google_id:

            raise HTTPException(
                status_code=409,
                detail=(
                    "An account already exists with this "
                    "email using Google login. "
                    "Please continue with Google."
                )
            )

        raise HTTPException(
            status_code=409,
            detail=(
                "An account already exists with this email."
            )
        )

    # -----------------------------------------------------
    # HASH PASSWORD
    # -----------------------------------------------------

    password_hash = hash_password(
        password
    )

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

    email = clean_email(
        data.email
    )

    password = data.password

    # -----------------------------------------------------
    # FIND USER BY CURRENT EMAIL
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
    # ACCOUNT STATUS
    # -----------------------------------------------------

    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is inactive."
        )

    # -----------------------------------------------------
    # GOOGLE ONLY ACCOUNT
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
    # JWT
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
        # EXCHANGE CODE FOR TOKEN
        # -------------------------------------------------

        token = await oauth.google.authorize_access_token(
            request
        )

        print(
            "Google authorization successful."
        )

        # -------------------------------------------------
        # GOOGLE USER INFO
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

        google_picture = user_info.get(
            "picture"
        )

        # -------------------------------------------------
        # VALIDATE
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
        # IMPORTANT
        #
        # FIND GOOGLE USER BY google_id FIRST
        # =================================================

        user = (
            db.query(User)
            .filter(
                User.google_id == google_id
            )
            .first()
        )

        # =================================================
        # EXISTING GOOGLE USER
        # =================================================

        if user:

            print(
                f"Existing Google user found by "
                f"google_id: {user.id}"
            )

            # -------------------------------------------------
            # DO NOT CHANGE APPLICATION EMAIL
            # -------------------------------------------------

            # -------------------------------------------------
            # DO NOT OVERWRITE CUSTOM PROFILE IMAGE
            #
            # If the user uploaded their own picture,
            # preserve it.
            # -------------------------------------------------

            if (
                not user.picture
                and google_picture
            ):

                user.picture = (
                    google_picture
                )

            if (
                not user.name
                and name
            ):

                user.name = name

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

            # =================================================
            # GOOGLE ID NOT FOUND
            #
            # Check email next.
            # =================================================

            print(
                "Google ID not found. Checking email..."
            )

            user = (
                db.query(User)
                .filter(
                    User.email == email
                )
                .first()
            )

            # -------------------------------------------------
            # EXISTING USER BY EMAIL
            # -------------------------------------------------

            if user:

                print(
                    f"Existing user found by email: "
                    f"{user.id}"
                )

                # -------------------------------------------------
                # EMAIL ALREADY BELONGS TO ANOTHER GOOGLE ACCOUNT
                # -------------------------------------------------

                if user.google_id is not None:

                    if (
                        user.google_id != google_id
                    ):

                        raise HTTPException(
                            status_code=409,
                            detail=(
                                "This email is already "
                                "associated with a different "
                                "Google account."
                            )
                        )

                # -------------------------------------------------
                # ORDINARY ACCOUNT
                #
                # LINK GOOGLE
                # -------------------------------------------------

                else:

                    print(
                        "Linking Google account to "
                        "existing ordinary account."
                    )

                    user.google_id = google_id

                    if (
                        not user.name
                        and name
                    ):

                        user.name = name

                    if (
                        not user.picture
                        and google_picture
                    ):

                        user.picture = (
                            google_picture
                        )

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
            # COMPLETELY NEW GOOGLE USER
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

                    picture=google_picture,

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
        # ACTIVE CHECK
        # -------------------------------------------------

        if not user.is_active:

            raise HTTPException(
                status_code=403,
                detail=(
                    "Your account is inactive."
                )
            )

        # -------------------------------------------------
        # CREATE JWT
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
        # FRONTEND
        # -------------------------------------------------

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "https://webanalyzer.besttechcompany.com"
        ).rstrip("/")

        dashboard_url = (
            f"{frontend_url}/dashboard.html"
        )

        query_string = urlencode(
            {
                "token": access_token
            }
        )

        redirect_url = (
            f"{dashboard_url}?{query_string}"
        )

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

    if (
        data.name is None
        and data.email is None
        and data.mobile is None
        and data.picture is None
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "No profile changes were submitted."
            )
        )

    # -----------------------------------------------------
    # NAME
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
    # EMAIL
    # -----------------------------------------------------

    if data.email is not None:

        email = clean_email(
            data.email
        )

        if (
            email != current_user.email
        ):

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
    # MOBILE
    # -----------------------------------------------------

    if data.mobile is not None:

        current_user.mobile = (
            clean_mobile(
                data.mobile
            )
        )

    # -----------------------------------------------------
    # PICTURE URL
    # -----------------------------------------------------

    if data.picture is not None:

        picture = data.picture.strip()

        if not picture:

            current_user.picture = None

        else:

            current_user.picture = picture

    # -----------------------------------------------------
    # SAVE
    # -----------------------------------------------------

    try:

        db.commit()

        db.refresh(
            current_user
        )

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

    print(
        "PROFILE UPDATE REQUEST"
    )

    print(
        f"Authenticated User ID: "
        f"{current_user.id}"
    )

    current_user = apply_profile_update(
        data,
        current_user,
        db
    )

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

    current_user = apply_profile_update(
        data,
        current_user,
        db
    )

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
# UPLOAD PROFILE PHOTO
# =========================================================

@router.post(
    "/profile/photo",
    tags=["Profile"]
)
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    print("=" * 60)

    print(
        "PROFILE PHOTO UPLOAD REQUEST"
    )

    print(
        f"User ID: {current_user.id}"
    )

    print(
        f"Filename: {file.filename}"
    )

    print(
        f"Content Type: {file.content_type}"
    )

    print("=" * 60)

    # =====================================================
    # VALIDATE CONTENT TYPE
    # =====================================================

    if (
        file.content_type
        not in ALLOWED_IMAGE_TYPES
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid image type. "
                "Only JPG, PNG, WEBP and GIF are allowed."
            )
        )

    # =====================================================
    # VALIDATE FILENAME
    # =====================================================

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file was selected."
        )

    # =====================================================
    # GENERATE SAFE UNIQUE FILENAME
    # =====================================================

    extension = (
        ALLOWED_IMAGE_TYPES[
            file.content_type
        ]
    )

    filename = (
        f"user_{current_user.id}_"
        f"{uuid.uuid4().hex}"
        f"{extension}"
    )

    file_path = (
        PROFILE_UPLOAD_DIR /
        filename
    )

    # =====================================================
    # WRITE FILE IN CHUNKS
    # =====================================================

    total_size = 0

    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            while True:

                chunk = await file.read(
                    1024 * 1024
                )

                if not chunk:

                    break

                total_size += len(
                    chunk
                )

                # -----------------------------------------
                # 5 MB LIMIT
                # -----------------------------------------

                if (
                    total_size
                    > MAX_PROFILE_IMAGE_SIZE
                ):

                    buffer.close()

                    if file_path.exists():

                        file_path.unlink()

                    raise HTTPException(
                        status_code=413,
                        detail=(
                            "Profile image must be "
                            "5 MB or smaller."
                        )
                    )

                buffer.write(
                    chunk
                )

    except HTTPException:

        raise

    except Exception as e:

        print(
            "PROFILE IMAGE WRITE ERROR:",
            repr(e)
        )

        if file_path.exists():

            try:

                file_path.unlink()

            except Exception:
                pass

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to save profile image."
            )
        )

    finally:

        await file.close()

    # =====================================================
    # CREATE PUBLIC URL
    # =====================================================

    # -----------------------------------------------------
    # Render backend URL
    # -----------------------------------------------------

    backend_url = os.getenv(
        "BACKEND_URL",
        "https://ai-visibility-analyzer.onrender.com"
    ).rstrip("/")

    picture_url = (
        f"{backend_url}"
        f"/uploads/profile/"
        f"{filename}"
    )

    # =====================================================
    # DELETE OLD LOCAL PROFILE IMAGE
    # =====================================================

    old_picture = (
        current_user.picture
    )

    if old_picture:

        delete_local_profile_image(
            old_picture
        )

    # =====================================================
    # SAVE NEW URL
    # =====================================================

    current_user.picture = (
        picture_url
    )

    try:

        db.commit()

        db.refresh(
            current_user
        )

    except Exception as e:

        db.rollback()

        # Remove newly uploaded file if DB update fails.

        if file_path.exists():

            try:

                file_path.unlink()

            except Exception:
                pass

        print(
            "PROFILE PHOTO DATABASE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Image uploaded but could not "
                "update your profile."
            )
        )

    # =====================================================
    # RESPONSE
    # =====================================================

    print(
        "PROFILE PHOTO UPLOAD SUCCESS"
    )

    print(
        "Picture URL:",
        picture_url
    )

    return {

        "success":
            True,

        "message":
            "Profile picture uploaded successfully.",

        "picture":
            picture_url,

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
# DELETE PROFILE PHOTO
# =========================================================

@router.delete(
    "/profile/photo",
    tags=["Profile"]
)
def delete_profile_photo(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db)
):

    print(
        "PROFILE PHOTO DELETE REQUEST"
    )

    print(
        f"User ID: {current_user.id}"
    )

    old_picture = (
        current_user.picture
    )

    # -----------------------------------------------------
    # DELETE LOCAL FILE
    # -----------------------------------------------------

    if old_picture:

        delete_local_profile_image(
            old_picture
        )

    # -----------------------------------------------------
    # CLEAR DATABASE FIELD
    # -----------------------------------------------------

    current_user.picture = None

    try:

        db.commit()

        db.refresh(
            current_user
        )

    except Exception as e:

        db.rollback()

        print(
            "PROFILE PHOTO DELETE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to remove profile picture."
            )
        )

    return {

        "success":
            True,

        "message":
            "Profile picture removed successfully.",

        "picture":
            None,

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