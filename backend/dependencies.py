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
# OAUTH2 SCHEME
# =========================================================

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="google/login"
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

    # -----------------------------------------------------
    # 1. CHECK TOKEN
    # -----------------------------------------------------

    if not token:

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token missing",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )


    # -----------------------------------------------------
    # 2. DECODE TOKEN
    # -----------------------------------------------------

    try:

        payload = decode_access_token(
            token
        )

    except HTTPException:

        raise

    except Exception as e:

        print(
            "TOKEN DECODE ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )


    # -----------------------------------------------------
    # 3. GET EMAIL FROM TOKEN
    # -----------------------------------------------------

    email = payload.get(
        "email"
    )


    if not email:

        print(
            "JWT PAYLOAD DOES NOT CONTAIN EMAIL"
        )

        print(
            "JWT PAYLOAD:",
            payload
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Token: email missing",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )


    # -----------------------------------------------------
    # 4. FIND USER IN NEON
    # -----------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )


    # -----------------------------------------------------
    # 5. USER NOT FOUND
    # -----------------------------------------------------

    if not user:

        print(
            "USER NOT FOUND:"
        )

        print(
            "Email:",
            email
        )

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )


    # -----------------------------------------------------
    # 6. CHECK USER ACTIVE
    # -----------------------------------------------------

    if not user.is_active:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )


    # -----------------------------------------------------
    # 7. SUCCESS
    # -----------------------------------------------------

    print(
        "CURRENT USER VERIFIED:"
    )

    print(
        "User ID:",
        user.id
    )

    print(
        "Email:",
        user.email
    )


    return user