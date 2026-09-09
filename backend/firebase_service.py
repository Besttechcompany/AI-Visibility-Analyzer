import os
import json

import firebase_admin
from firebase_admin import credentials, auth


def _initialize_firebase():
    """
    Initialize Firebase Admin SDK using the service-account JSON
    stored in the FIREBASE_SERVICE_ACCOUNT_JSON environment variable.
    """

    if firebase_admin._apps:
        return firebase_admin.get_app()

    service_account_json = os.getenv(
        "FIREBASE_SERVICE_ACCOUNT_JSON"
    )

    if not service_account_json:
        raise RuntimeError(
            "FIREBASE_SERVICE_ACCOUNT_JSON is not configured."
        )

    try:
        service_account_info = json.loads(
            service_account_json
        )
    except json.JSONDecodeError as e:
        raise RuntimeError(
            "FIREBASE_SERVICE_ACCOUNT_JSON contains invalid JSON."
        ) from e

    try:
        cred = credentials.Certificate(
            service_account_info
        )
    except Exception as e:
        raise RuntimeError(
            "Unable to create Firebase credentials."
        ) from e

    return firebase_admin.initialize_app(
        cred
    )


def verify_firebase_token(id_token: str):
    """
    Verify a Firebase ID token and return the decoded claims.
    """

    _initialize_firebase()

    return auth.verify_id_token(
        id_token
    )