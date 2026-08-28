from fastapi import (
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    OAuth2PasswordBearer
)

from sqlalchemy.orm import Session

from database import get_db

from models import User

from utils.jwt_handler import (
    decode_access_token
)


# =========================================================
# OAUTH2 TOKEN SCHEME
# =========================================================
#
# The frontend receives the JWT from /login.
#
# Google login is a separate authentication flow.
# Therefore tokenUrl should point to the normal login
# endpoint for Swagger/OpenAPI documentation.
#

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/login"
)


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user(

    token: str = Depends(
        oauth2_scheme
    ),

    db: Session = Depends(
        get_db
    )

):

    # =====================================================
    # VALIDATE / DECODE TOKEN
    # =====================================================

    try:

        payload = decode_access_token(
            token
        )

    except Exception as exc:

        print(
            "TOKEN DECODE ERROR:",
            repr(exc)
        )

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail="Invalid or expired token.",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }

        )


    # =====================================================
    # CHECK PAYLOAD
    # =====================================================

    if not payload:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail="Invalid or expired token.",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }

        )


    # =====================================================
    # GET EMAIL FROM TOKEN
    # =====================================================

    email = payload.get(
        "email"
    )


    if not email:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail="Invalid token: email missing.",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }

        )


    # =====================================================
    # FIND USER
    # =====================================================

    try:

        user = (
            db.query(User)
            .filter(
                User.email == email
            )
            .first()
        )

    except Exception as exc:

        print(
            "CURRENT USER DATABASE ERROR:",
            repr(exc)
        )

        raise HTTPException(

            status_code=
                status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail="Unable to verify user account."

        )


    # =====================================================
    # USER NOT FOUND
    # =====================================================

    if not user:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail="User account not found.",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }

        )


    # =====================================================
    # CHECK ACCOUNT STATUS
    # =====================================================

    if not user.is_active:

        raise HTTPException(

            status_code=
                status.HTTP_403_FORBIDDEN,

            detail="User account is inactive."

        )


    # =====================================================
    # RETURN USER
    # =====================================================

    return user