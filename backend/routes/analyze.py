from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from pydantic import BaseModel

from sqlalchemy.orm import Session

from fastapi.encoders import jsonable_encoder

from database import get_db

from models import (
    AnalysisHistory,
    User
)

from dependencies import get_current_user

from services.analyzer import WebsiteAnalyzer


router = APIRouter()


# =========================================================
# REQUEST MODEL
# =========================================================

class WebsiteRequest(BaseModel):

    url: str


# =========================================================
# ANALYZE WEBSITE
# =========================================================

@router.post("/analyze")
def analyze(

    request: WebsiteRequest,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )

):

    try:

        # -------------------------------------------------
        # 1. RUN YOUR EXISTING ANALYZER
        # -------------------------------------------------

        result = WebsiteAnalyzer.analyze(
            request.url
        )


        # -------------------------------------------------
        # 2. CONVERT RESULT TO JSON-SAFE DATA
        # -------------------------------------------------

        history_data = jsonable_encoder(
            result
        )


        # -------------------------------------------------
        # 3. SAVE ANALYSIS TO NEON
        # -------------------------------------------------

        history = AnalysisHistory(

            user_id=current_user.id,

            website_url=request.url,

            analysis_data=history_data

        )


        db.add(history)

        db.commit()

        db.refresh(history)


        # -------------------------------------------------
        # 4. RETURN ORIGINAL RESULT TO FRONTEND
        # -------------------------------------------------

        return result


    except Exception as e:

        # -------------------------------------------------
        # ROLLBACK DATABASE TRANSACTION
        # -------------------------------------------------

        db.rollback()

        print(
            "ANALYSIS HISTORY SAVE ERROR:",
            repr(e)
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Analysis completed but could not "
                "be saved to history."
            )

        )