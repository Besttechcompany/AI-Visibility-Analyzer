from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from dotenv import load_dotenv
import os


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# JWT CONFIGURATION
# =========================================================

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

ALGORITHM = os.getenv(
    "JWT_ALGORITHM",
    "HS256"
)

try:

    ACCESS_TOKEN_EXPIRE_MINUTES = int(
        os.getenv(
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            "60"
        )
    )

except ValueError:

    ACCESS_TOKEN_EXPIRE_MINUTES = 60


# =========================================================
# CHECK CONFIGURATION
# =========================================================

if not SECRET_KEY:

    raise RuntimeError(
        "JWT_SECRET_KEY is not configured in environment variables."
    )


if not SECRET_KEY.strip():

    raise RuntimeError(
        "JWT_SECRET_KEY cannot be empty."
    )


# =========================================================
# CREATE ACCESS TOKEN
# =========================================================

def create_access_token(
    data: dict
):
    """
    Create a signed JWT access token.
    """

    if not isinstance(
        data,
        dict
    ):

        raise ValueError(
            "JWT token data must be a dictionary."
        )


    to_encode = data.copy()


    # -----------------------------------------------------
    # EXPIRATION
    # -----------------------------------------------------

    expire = (
        datetime.now(
            timezone.utc
        )
        +
        timedelta(
            minutes=
                ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )


    to_encode.update({

        "exp":
            expire

    })


    # -----------------------------------------------------
    # CREATE JWT
    # -----------------------------------------------------

    encoded_jwt = jwt.encode(

        to_encode,

        SECRET_KEY,

        algorithm=
            ALGORITHM

    )


    return encoded_jwt


# =========================================================
# VERIFY TOKEN
# =========================================================

def verify_token(
    token: str
):
    """
    Verify JWT signature, algorithm and expiration.

    Returns the decoded payload when valid.
    Raises HTTP 401 when invalid or expired.
    """

    if not token:

        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Authentication token is missing.",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }

        )


    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[
                ALGORITHM
            ]

        )


        if not payload:

            raise HTTPException(

                status_code=
                    status.HTTP_401_UNAUTHORIZED,

                detail=
                    "Invalid authentication token.",

                headers={
                    "WWW-Authenticate":
                        "Bearer"
                }

            )


        return payload


    except HTTPException:

        raise


    except JWTError as e:

        print(
            "JWT VERIFICATION ERROR:",
            repr(e)
        )


        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Invalid or expired token.",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }

        )


    except Exception as e:

        print(
            "JWT UNEXPECTED ERROR:",
            repr(e)
        )


        raise HTTPException(

            status_code=
                status.HTTP_401_UNAUTHORIZED,

            detail=
                "Unable to verify authentication token.",

            headers={
                "WWW-Authenticate":
                    "Bearer"
            }

        )


# =========================================================
# DECODE ACCESS TOKEN
# =========================================================

def decode_access_token(
    token: str
):
    """
    Decode and verify the access token.

    This function is used by dependencies.py
    to identify the logged-in user.
    """

    return verify_token(
        token
    )