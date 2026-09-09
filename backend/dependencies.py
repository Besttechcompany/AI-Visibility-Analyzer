from fastapi import (
    Depends,
    HTTPException,
    status
)

from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session

from database import get_db

from models import User

from utils.jwt_handler import (
    decode_access_token
)

from firebase_service import (
    verify_firebase_token
)


# =========================================================
# EXISTING JWT AUTHENTICATION
# =========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="google/login"
)


def get_current_user(

    token: str = Depends(
        oauth2_scheme
    ),

    db: Session = Depends(
        get_db
    )

):

    payload = decode_access_token(
        token
    )

    email = payload.get(
        "email"
    )

    if not email:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail="Invalid Token"

        )

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if not user:

        raise HTTPException(

            status_code=404,

            detail="User not found"

        )

    return user


# =========================================================
# FIREBASE AUTHENTICATION
# =========================================================

firebase_scheme = OAuth2PasswordBearer(
    tokenUrl="firebase/auth"
)


def get_current_firebase_user(

    token: str = Depends(
        firebase_scheme
    ),

    db: Session = Depends(
        get_db
    )

):

    # -----------------------------------------------------
    # VERIFY FIREBASE ID TOKEN
    # -----------------------------------------------------

    try:

        decoded_token = verify_firebase_token(
            token
        )

    except Exception:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid or expired Firebase token"

        )


    # -----------------------------------------------------
    # GET FIREBASE UID
    # -----------------------------------------------------

    firebase_uid = decoded_token.get(
        "uid"
    )

    if not firebase_uid:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Firebase UID missing"

        )


    # -----------------------------------------------------
    # FIND USER IN POSTGRESQL
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.firebase_uid == firebase_uid
        )
        .first()
    )


    if not user:

        raise HTTPException(

            status_code=404,

            detail="Firebase user not found"

        )


    # -----------------------------------------------------
    # RETURN DATABASE USER
    # -----------------------------------------------------

    return user