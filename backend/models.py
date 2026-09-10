from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    Text
)

from sqlalchemy.dialects.postgresql import JSONB

from sqlalchemy.sql import func

from database import Base


# =========================================================
# USER
# =========================================================

class User(Base):

    __tablename__ = "users"

    # -----------------------------------------------------
    # PRIMARY KEY
    # -----------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # -----------------------------------------------------
    # GOOGLE AUTHENTICATION
    # -----------------------------------------------------
    # NULL for normal email/password users.
    # Contains Google's unique user ID for Google users.

    google_id = Column(
        String,
        unique=True,
        nullable=True
    )

    # -----------------------------------------------------
    # FIREBASE AUTHENTICATION
    # -----------------------------------------------------
    # Firebase UID for users authenticated through Firebase.
    # Used for Firebase Google and Email/Password login.

    firebase_uid = Column(
        String,
        unique=True,
        nullable=True,
        index=True
    )

    # -----------------------------------------------------
    # EMAIL
    # -----------------------------------------------------
    # Required for both normal and Google users.

    email = Column(
        String,
        unique=True,
        nullable=False,
        index=True
    )

    # -----------------------------------------------------
    # NAME
    # -----------------------------------------------------

    name = Column(
        String,
        nullable=False
    )

    # -----------------------------------------------------
    # MOBILE NUMBER
    # -----------------------------------------------------
    # Optional for all users.

    mobile = Column(
        String,
        nullable=True
    )

    # -----------------------------------------------------
    # PASSWORD
    # -----------------------------------------------------
    # NULL for Firebase/Google-only users.
    # Contains the hashed password for normal users.
    #
    # NEVER store the actual password here.

    password_hash = Column(
        String,
        nullable=True
    )

    # -----------------------------------------------------
    # PROFILE PICTURE
    # -----------------------------------------------------
    # Mainly populated from Google/Firebase, but optional.

    picture = Column(
        String,
        nullable=True
    )

    # -----------------------------------------------------
    # ACCOUNT STATUS
    # -----------------------------------------------------

    is_active = Column(
        Boolean,
        default=True,
        nullable=False
    )

    # =====================================================
    # SUBSCRIPTION / PLAN
    # =====================================================

    # -----------------------------------------------------
    # PLAN
    # -----------------------------------------------------
    # Possible values:
    #
    # free
    # pro
    # agency
    #
    # The backend will be authoritative for this value.
    # Users must NOT be allowed to change this directly
    # from the frontend.

    plan = Column(
        String(20),
        default="free",
        nullable=False
    )

    # -----------------------------------------------------
    # SUBSCRIPTION STATUS
    # -----------------------------------------------------
    # Examples:
    #
    # active
    # cancelled
    # suspended
    # expired
    #
    # For Free users, the default is "active".

    subscription_status = Column(
        String(30),
        default="active",
        nullable=False
    )

    # -----------------------------------------------------
    # PAYPAL SUBSCRIPTION ID
    # -----------------------------------------------------
    # Stores the PayPal subscription ID for paid users.
    #
    # NULL for Free users.

    paypal_subscription_id = Column(
        String(255),
        unique=True,
        nullable=True
    )

    # -----------------------------------------------------
    # CURRENT BILLING PERIOD END
    # -----------------------------------------------------
    # Stores the date/time when the current paid
    # subscription period ends.
    #
    # NULL for Free users.

    current_period_end = Column(
        DateTime(timezone=True),
        nullable=True
    )

    # -----------------------------------------------------
    # ACCOUNT CREATION DATE
    # -----------------------------------------------------

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )


# =========================================================
# ANALYSIS HISTORY
# =========================================================

class AnalysisHistory(Base):

    __tablename__ = "analysis_history"

    # -----------------------------------------------------
    # PRIMARY KEY
    # -----------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # -----------------------------------------------------
    # USER ID
    # -----------------------------------------------------
    # Connects every analysis to the logged-in user.

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True
    )

    # -----------------------------------------------------
    # WEBSITE ANALYZED
    # -----------------------------------------------------

    website_url = Column(
        Text,
        nullable=False
    )

    # -----------------------------------------------------
    # ANALYSIS RESULT
    # -----------------------------------------------------
    # PostgreSQL JSONB stores the complete analysis result.

    analysis_data = Column(
        JSONB,
        nullable=False
    )

    # -----------------------------------------------------
    # ANALYSIS DATE
    # -----------------------------------------------------

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )