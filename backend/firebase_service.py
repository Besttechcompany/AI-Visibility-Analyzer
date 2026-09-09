import os

import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth


# =========================================================
# FIREBASE ADMIN INITIALIZATION
# =========================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

SERVICE_ACCOUNT_PATH = os.path.join(
    BASE_DIR,
    "serviceAccountKey.json"
)


if not firebase_admin._apps:

    cred = credentials.Certificate(
        SERVICE_ACCOUNT_PATH
    )

    firebase_admin.initialize_app(
        cred
    )


# =========================================================
# VERIFY FIREBASE ID TOKEN
# =========================================================

def verify_firebase_token(id_token: str):

    decoded_token = auth.verify_id_token(
        id_token
    )

    return decoded_token