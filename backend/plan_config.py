# =========================================================
# AI VISIBILITY ANALYZER
# PLAN CONFIGURATION
# =========================================================
#
# Central source of truth for subscription plans.
#
# Plans:
#   free
#   pro
#   agency
#
# IMPORTANT:
# The backend is authoritative for plan access.
# Frontend restrictions are for UI/UX only.
# =========================================================


# =========================================================
# AI PLATFORM KEYS
# =========================================================

AI_PLATFORM_KEYS = [
    "chatgpt",
    "gemini",
    "claude",
    "perplexity",
    "grok",
    "google_ai_mode",
    "deepseek",
]


# =========================================================
# PLAN CONFIGURATION
# =========================================================

PLAN_CONFIG = {

    # =====================================================
    # FREE PLAN
    # =====================================================

    "free": {

        "name": "Free",

        # -------------------------------------------------
        # AI PLATFORM ACCESS
        # -------------------------------------------------

        "allowed_ai_platforms": [
            "chatgpt",
            "gemini",
        ],

        # -------------------------------------------------
        # FEATURES
        # -------------------------------------------------

        "features": {

            "technical_seo": False,

            "eeat_analysis": False,

            "entity_analysis": False,

            "actionable_recommendations": False,

            "pdf_download": False,

            "analysis_history": False,

            "scheduled_reaudit": False,

            "tracking": False,

            "competitor_comparison": False,

            "white_label_reports": False,

            "api_access": False,
        },
    },


    # =====================================================
    # PRO PLAN
    # =====================================================

    "pro": {

        "name": "Pro",

        # -------------------------------------------------
        # ALL 7 AI PLATFORMS
        # -------------------------------------------------

        "allowed_ai_platforms": [
            "chatgpt",
            "gemini",
            "claude",
            "perplexity",
            "grok",
            "google_ai_mode",
            "deepseek",
        ],

        # -------------------------------------------------
        # FEATURES
        # -------------------------------------------------

        "features": {

            "technical_seo": True,

            "eeat_analysis": True,

            "entity_analysis": True,

            "actionable_recommendations": True,

            "pdf_download": True,

            "analysis_history": True,

            # -------------------------------------------------
            # AGENCY-ONLY FEATURES
            # -------------------------------------------------

            "scheduled_reaudit": False,

            "tracking": False,

            "competitor_comparison": False,

            "white_label_reports": False,

            "api_access": False,
        },
    },


    # =====================================================
    # AGENCY / BUSINESS PLAN
    # =====================================================

    "agency": {

        "name": "Agency / Business",

        # -------------------------------------------------
        # ALL 7 AI PLATFORMS
        # -------------------------------------------------

        "allowed_ai_platforms": [
            "chatgpt",
            "gemini",
            "claude",
            "perplexity",
            "grok",
            "google_ai_mode",
            "deepseek",
        ],

        # -------------------------------------------------
        # FEATURES
        # -------------------------------------------------

        "features": {

            "technical_seo": True,

            "eeat_analysis": True,

            "entity_analysis": True,

            "actionable_recommendations": True,

            "pdf_download": True,

            "analysis_history": True,

            "scheduled_reaudit": True,

            "tracking": True,

            "competitor_comparison": True,

            "white_label_reports": True,

            "api_access": True,
        },
    },
}


# =========================================================
# NORMALIZE PLAN
# =========================================================

def normalize_plan(plan):
    """
    Convert different plan names into the three
    canonical backend plan names.

    Canonical values:

        free
        pro
        agency

    Unknown or invalid values become free.
    """

    value = str(
        plan or "free"
    ).strip().lower()


    # -----------------------------------------------------
    # PRO
    # -----------------------------------------------------

    if value in (
        "pro",
        "professional",
    ):
        return "pro"


    # -----------------------------------------------------
    # AGENCY / BUSINESS
    # -----------------------------------------------------

    if value in (
        "agency",
        "business",
        "agency_business",
    ):
        return "agency"


    # -----------------------------------------------------
    # DEFAULT
    # -----------------------------------------------------

    return "free"


# =========================================================
# GET PLAN CONFIG
# =========================================================

def get_plan_config(plan):
    """
    Return the complete configuration for a plan.
    """

    normalized = normalize_plan(plan)

    return PLAN_CONFIG[
        normalized
    ]


# =========================================================
# GET PLAN NAME
# =========================================================

def get_plan_name(plan):
    """
    Return the human-readable plan name.
    """

    normalized = normalize_plan(plan)

    return PLAN_CONFIG[
        normalized
    ]["name"]


# =========================================================
# GET ALLOWED AI PLATFORMS
# =========================================================

def get_allowed_ai_platforms(plan):
    """
    Return the AI platforms available for the plan.
    """

    normalized = normalize_plan(plan)

    return list(
        PLAN_CONFIG[
            normalized
        ]["allowed_ai_platforms"]
    )


# =========================================================
# GET FEATURES
# =========================================================

def get_features(plan):
    """
    Return a copy of the feature configuration.
    """

    normalized = normalize_plan(plan)

    return dict(
        PLAN_CONFIG[
            normalized
        ]["features"]
    )


# =========================================================
# CHECK FEATURE ACCESS
# =========================================================

def has_feature(
    plan,
    feature_name,
):
    """
    Check whether a plan has access to a feature.

    Example:

        has_feature("free", "pdf_download")
        -> False

        has_feature("pro", "pdf_download")
        -> True
    """

    normalized = normalize_plan(plan)

    features = PLAN_CONFIG[
        normalized
    ]["features"]


    return (
        features.get(
            feature_name,
            False
        )
        is True
    )


# =========================================================
# CHECK AI PLATFORM ACCESS
# =========================================================

def is_ai_platform_allowed(
    plan,
    platform,
):
    """
    Check whether a specific AI platform is available
    for the selected plan.
    """

    normalized = normalize_plan(plan)

    platform_key = str(
        platform or ""
    ).strip().lower()


    return (
        platform_key
        in PLAN_CONFIG[
            normalized
        ]["allowed_ai_platforms"]
    )


# =========================================================
# GET COMPLETE PLAN SUMMARY
# =========================================================

def get_plan_summary(plan):
    """
    Return a complete frontend-friendly plan summary.
    """

    normalized = normalize_plan(plan)

    config = PLAN_CONFIG[
        normalized
    ]


    return {

        "plan": normalized,

        "name": config[
            "name"
        ],

        "allowed_ai_platforms": list(
            config[
                "allowed_ai_platforms"
            ]
        ),

        "features": dict(
            config[
                "features"
            ]
        ),
    }


# =========================================================
# GET ALL PLAN NAMES
# =========================================================

def get_available_plans():
    """
    Return all supported canonical plan keys.
    """

    return list(
        PLAN_CONFIG.keys()
    )

# =========================================================
# GET MAXIMUM AI PLATFORMS
# =========================================================

def get_max_ai_platforms(plan):
    """
    Return the maximum number of AI platforms available
    for the selected plan.
    """

    normalized = normalize_plan(plan)

    return len(
        PLAN_CONFIG[
            normalized
        ]["allowed_ai_platforms"]
    )


# =========================================================
# GET MAXIMUM WEBSITES
# =========================================================

def get_max_websites(plan):
    """
    Return the maximum number of websites available
    for the selected plan.

    Product rules:
        Free   = 1 website
        Pro    = 1 website
        Agency = unlimited
    """

    normalized = normalize_plan(plan)


    if normalized == "agency":

        return -1


    return 1