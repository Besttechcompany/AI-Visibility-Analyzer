# =========================================================
# AI VISIBILITY ANALYZER
# SUBSCRIPTION ROUTES
# =========================================================

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)

from sqlalchemy.orm import Session

from database import get_db
from models import User
from dependencies import get_current_user

from plan_config import (
    normalize_plan,
    get_plan_config,
    get_allowed_ai_platforms,
    get_max_ai_platforms,
    get_max_websites,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/subscription",
    tags=["Subscription"],
)


# =========================================================
# SUBSCRIPTION STATUS
# =========================================================

@router.get("/status")
def get_subscription_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return the current authenticated user's subscription
    and feature information.

    IMPORTANT:
    The database is authoritative for the user's plan.

    The frontend must never be trusted to decide whether
    a user is Free, Pro, or Agency.
    """

    # =====================================================
    # 1. AUTHENTICATION SAFETY CHECK
    # =====================================================

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User authentication required.",
        )


    # =====================================================
    # 2. NORMALIZE PLAN
    # =====================================================

    raw_plan = getattr(
        current_user,
        "plan",
        "free",
    )

    plan = normalize_plan(
        raw_plan
    )


    # =====================================================
    # 3. GET PLAN CONFIGURATION
    # =====================================================

    config = get_plan_config(
        plan
    )


    # =====================================================
    # 4. GET ALLOWED AI PLATFORMS
    # =====================================================

    allowed_ai_platforms = get_allowed_ai_platforms(
        plan
    )


    # =====================================================
    # 5. GET PLAN LIMITS
    # =====================================================

    max_ai_platforms = get_max_ai_platforms(
        plan
    )

    max_websites = get_max_websites(
        plan
    )


    # =====================================================
    # 6. GET SUBSCRIPTION STATUS
    # =====================================================

    subscription_status = (
        getattr(
            current_user,
            "subscription_status",
            None,
        )
        or "active"
    )


    # =====================================================
    # 7. RETURN COMPLETE SUBSCRIPTION INFORMATION
    # =====================================================

    return {

        "success": True,


        # =================================================
        # USER
        # =================================================

        "user": {

            "id": current_user.id,

            "email": current_user.email,

            "name": current_user.name,

        },


        # =================================================
        # SUBSCRIPTION
        # =================================================

        "subscription": {

            "plan": plan,

            "plan_name": config.get(
                "name",
                "Free",
            ),

            "status": subscription_status,

            "paypal_subscription_id": (
                getattr(
                    current_user,
                    "paypal_subscription_id",
                    None,
                )
            ),

            "current_period_end": (
                getattr(
                    current_user,
                    "current_period_end",
                    None,
                )
            ),

            "billing": config.get(
                "billing",
            ),

            "currency": config.get(
                "currency",
                "USD",
            ),

            # Explicitly expose platforms here
            # for the frontend.

            "allowed_ai_platforms":
                allowed_ai_platforms,

        },


        # =================================================
        # TOP-LEVEL PLAN
        # =================================================

        "plan": plan,

        "plan_name": config.get(
            "name",
            "Free",
        ),


        # =================================================
        # TOP-LEVEL AI PLATFORMS
        # =================================================

        "allowed_ai_platforms":
            allowed_ai_platforms,


        # =================================================
        # FEATURES
        # =================================================

        "features": {

            # -------------------------------------------------
            # AI VISIBILITY
            # -------------------------------------------------

            "ai_score": config.get(
                "ai_score",
                True,
            ),

            "ai_platforms":
                allowed_ai_platforms,

            "allowed_ai_platforms":
                allowed_ai_platforms,

            "max_ai_platforms":
                max_ai_platforms,


            # -------------------------------------------------
            # WEBSITE LIMITS
            # -------------------------------------------------

            "max_websites":
                max_websites,

            "multiple_websites":
                config.get(
                    "multiple_websites",
                    False,
                ),


            # -------------------------------------------------
            # PRO FEATURES
            # -------------------------------------------------

            "technical_seo":
                config.get(
                    "technical_seo",
                    False,
                ),

            "eeat_analysis":
                config.get(
                    "eeat_analysis",
                    False,
                ),

            "entity_analysis":
                config.get(
                    "entity_analysis",
                    False,
                ),

            "actionable_recommendations":
                config.get(
                    "actionable_recommendations",
                    False,
                ),

            "pdf_download":
                config.get(
                    "pdf_download",
                    False,
                ),

            "analysis_history":
                config.get(
                    "analysis_history",
                    False,
                ),

            "multiple_audits":
                config.get(
                    "multiple_audits",
                    False,
                ),


            # -------------------------------------------------
            # AGENCY / BUSINESS FEATURES
            # -------------------------------------------------

            "scheduled_reaudit":
                config.get(
                    "scheduled_reaudit",
                    False,
                ),

            "tracking":
                config.get(
                    "tracking",
                    False,
                ),

            "competitor_comparison":
                config.get(
                    "competitor_comparison",
                    False,
                ),

            "white_label_reports":
                config.get(
                    "white_label_reports",
                    False,
                ),

            "api_access":
                config.get(
                    "api_access",
                    False,
                ),
        },
    }