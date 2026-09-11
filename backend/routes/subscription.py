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
    Return the authenticated user's subscription,
    plan limits and feature access.

    The database is authoritative for the user's plan.
    """

    # =====================================================
    # 1. AUTHENTICATION
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
    # 4. IMPORTANT FIX
    #
    # Features are stored inside:
    #
    # config["features"]
    #
    # NOT directly inside config.
    # =====================================================

    features_config = config.get(
        "features",
        {}
    )

    # =====================================================
    # 5. AI PLATFORM ACCESS
    # =====================================================

    allowed_ai_platforms = (
        get_allowed_ai_platforms(
            plan
        )
    )

    # =====================================================
    # 6. PLAN LIMITS
    # =====================================================

    max_ai_platforms = (
        get_max_ai_platforms(
            plan
        )
    )

    max_websites = (
        get_max_websites(
            plan
        )
    )

    # =====================================================
    # 7. SUBSCRIPTION STATUS
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
    # 8. RETURN RESPONSE
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

            "allowed_ai_platforms":
                allowed_ai_platforms,

        },

        # =================================================
        # TOP LEVEL PLAN
        # =================================================

        "plan": plan,

        "plan_name": config.get(
            "name",
            "Free",
        ),

        # =================================================
        # TOP LEVEL AI PLATFORMS
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

            "ai_score": features_config.get(
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
                features_config.get(
                    "multiple_websites",
                    False,
                ),

            # -------------------------------------------------
            # PRO FEATURES
            # -------------------------------------------------

            "technical_seo":
                features_config.get(
                    "technical_seo",
                    False,
                ),

            "eeat_analysis":
                features_config.get(
                    "eeat_analysis",
                    False,
                ),

            "entity_analysis":
                features_config.get(
                    "entity_analysis",
                    False,
                ),

            "actionable_recommendations":
                features_config.get(
                    "actionable_recommendations",
                    False,
                ),

            "pdf_download":
                features_config.get(
                    "pdf_download",
                    False,
                ),

            "analysis_history":
                features_config.get(
                    "analysis_history",
                    False,
                ),

            "multiple_audits":
                features_config.get(
                    "multiple_audits",
                    False,
                ),

            # -------------------------------------------------
            # AGENCY / BUSINESS FEATURES
            # -------------------------------------------------

            "scheduled_reaudit":
                features_config.get(
                    "scheduled_reaudit",
                    False,
                ),

            "tracking":
                features_config.get(
                    "tracking",
                    False,
                ),

            "competitor_comparison":
                features_config.get(
                    "competitor_comparison",
                    False,
                ),

            "white_label_reports":
                features_config.get(
                    "white_label_reports",
                    False,
                ),

            "api_access":
                features_config.get(
                    "api_access",
                    False,
                ),
        },
    }