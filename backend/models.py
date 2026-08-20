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
    # PASSWORD
    # -----------------------------------------------------
    # NULL for Google-only users.
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
    # Mainly populated from Google, but optional.

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