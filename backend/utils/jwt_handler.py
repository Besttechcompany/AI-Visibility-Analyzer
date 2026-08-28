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

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60"
    )
)


# =========================================================
# CHECK CONFIGURATION
# =========================================================

if not SECRET_KEY:

    raise RuntimeError(
        "JWT_SECRET_KEY is not configured in environment variables."
    )


# =========================================================
# CREATE ACCESS TOKEN
# =========================================================

def create_access_token(data: dict):
    """
    Create JWT access token.
    """

    to_encode = data.copy()

    expire = (
        datetime.now(timezone.utc)
        +
        timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    to_encode.update({
        "exp": expire
    })

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return encoded_jwt


# =========================================================
# VERIFY TOKEN
# =========================================================

def verify_token(token: str):
    """
    Verify JWT token and return payload.
    """

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError as e:

        print(
            "JWT VERIFICATION ERROR:",
            repr(e)
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )


# =========================================================
# DECODE ACCESS TOKEN
# =========================================================

def decode_access_token(token: str):
    """
    Decode and verify access token.
    """

    return verify_token(token)