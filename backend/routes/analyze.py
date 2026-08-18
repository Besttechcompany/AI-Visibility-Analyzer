from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse

from pydantic import BaseModel

from sqlalchemy.orm import Session

from database import get_db

from models import (
    AnalysisHistory,
    User
)

from dependencies import get_current_user

from services.analyzer import WebsiteAnalyzer

import io
import json
from datetime import datetime


# =========================================================
# REPORTLAB
# =========================================================

from reportlab.lib import colors

from reportlab.lib.enums import TA_CENTER

from reportlab.lib.pagesizes import A4

from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle
)

from reportlab.lib.units import mm

from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)


# =========================================================
# ROUTER
# =========================================================

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
        # 1. RUN WEBSITE ANALYZER
        # -------------------------------------------------

        result = WebsiteAnalyzer.analyze(
            request.url
        )


        # -------------------------------------------------
        # 2. CONVERT RESULT TO JSON SAFE DATA
        # -------------------------------------------------

        history_data = jsonable_encoder(
            result
        )


        # -------------------------------------------------
        # 3. SAVE ANALYSIS
        # -------------------------------------------------

        history = AnalysisHistory(

            user_id=current_user.id,

            website_url=request.url,

            analysis_data=history_data

        )


        db.add(history)

        db.commit()

        db.refresh(history)


        print(
            "Analysis history saved successfully:",
            f"user={current_user.id},",
            f"url={request.url},",
            f"id={history.id}"
        )


        # -------------------------------------------------
        # 4. RETURN ANALYSIS RESULT
        # -------------------------------------------------

        return result


    except Exception as e:

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


# =========================================================
# GET ANALYSIS HISTORY
# =========================================================

@router.get("/analysis-history")
def get_analysis_history(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )

):

    try:

        history = (

            db.query(AnalysisHistory)

            .filter(
                AnalysisHistory.user_id
                == current_user.id
            )

            .order_by(
                AnalysisHistory.created_at.desc()
            )

            .all()

        )


        return {

            "success": True,

            "count": len(history),

            "history": [

                {

                    "id": item.id,

                    "website_url":
                        item.website_url,

                    "analysis_data":
                        item.analysis_data,

                    "created_at":
                        item.created_at

                }

                for item in history

            ]

        }


    except Exception as e:

        print(
            "HISTORY FETCH ERROR:",
            repr(e)
        )

        raise HTTPException(

            status_code=500,

            detail=(
                "Unable to load analysis history."
            )

        )


# =========================================================
# PDF HELPER
# =========================================================

def safe_text(value):

    if value is None:

        return ""

    if isinstance(value, bool):

        return "Yes" if value else "No"

    if isinstance(value, (dict, list)):

        try:

            return json.dumps(
                value,
                indent=2,
                ensure_ascii=False
            )

        except Exception:

            return str(value)

    return str(value)


# =========================================================
# ADD JSON DATA TO PDF
# =========================================================

def add_data_to_pdf(
    story,
    data,
    styles,
    level=0
):

    if level > 5:

        return


    if isinstance(data, dict):

        for key, value in data.items():

            title = str(key).replace(
                "_",
                " "
            ).title()


            story.append(
                Paragraph(
                    title,
                    styles[
                        "SectionTitle"
                    ]
                )
            )


            if isinstance(
                value,
                dict
            ):

                add_data_to_pdf(
                    story,
                    value,
                    styles,
                    level + 1
                )


            elif isinstance(
                value,
                list
            ):

                for index, item in enumerate(
                    value,
                    start=1
                ):

                    if isinstance(
                        item,
                        (dict, list)
                    ):

                        story.append(
                            Paragraph(
                                f"Item {index}",
                                styles[
                                    "SubTitle"
                                ]
                            )
                        )

                        add_data_to_pdf(
                            story,
                            item,
                            styles,
                            level + 1
                        )

                    else:

                        story.append(
                            Paragraph(
                                safe_text(item),
                                styles[
                                    "BodySmall"
                                ]
                            )
                        )


            else:

                story.append(
                    Paragraph(
                        safe_text(value),
                        styles[
                            "BodySmall"
                        ]
                    )
                )


            story.append(
                Spacer(
                    1,
                    4
                )
            )


    elif isinstance(data, list):

        for index, item in enumerate(
            data,
            start=1
        ):

            if isinstance(
                item,
                (dict, list)
            ):

                story.append(
                    Paragraph(
                        f"Item {index}",
                        styles[
                            "SubTitle"
                        ]
                    )
                )

                add_data_to_pdf(
                    story,
                    item,
                    styles,
                    level + 1
                )

            else:

                story.append(
                    Paragraph(
                        safe_text(item),
                        styles[
                            "BodySmall"
                        ]
                    )
                )


    else:

        story.append(
            Paragraph(
                safe_text(data),
                styles[
                    "BodySmall"
                ]
            )
        )


# =========================================================
# DOWNLOAD ANALYSIS PDF
# =========================================================

@router.get(
    "/analysis/{analysis_id}/pdf"
)
def download_analysis_pdf(

    analysis_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )

):

    # -----------------------------------------------------
    # FIND ANALYSIS
    # -----------------------------------------------------

    analysis = (

        db.query(AnalysisHistory)

        .filter(
            AnalysisHistory.id
            == analysis_id
        )

        .filter(
            AnalysisHistory.user_id
            == current_user.id
        )

        .first()

    )


    if not analysis:

        raise HTTPException(

            status_code=404,

            detail=(
                "Analysis report not found."
            )

        )


    # -----------------------------------------------------
    # PDF BUFFER
    # -----------------------------------------------------

    pdf_buffer = io.BytesIO()


    # -----------------------------------------------------
    # DOCUMENT
    # -----------------------------------------------------

    document = SimpleDocTemplate(

        pdf_buffer,

        pagesize=A4,

        rightMargin=18 * mm,

        leftMargin=18 * mm,

        topMargin=18 * mm,

        bottomMargin=18 * mm

    )


    # -----------------------------------------------------
    # STYLES
    # -----------------------------------------------------

    base_styles = getSampleStyleSheet()


    styles = {

        "Title":

            ParagraphStyle(

                "CustomTitle",

                parent=base_styles["Title"],

                fontSize=22,

                leading=27,

                alignment=TA_CENTER,

                spaceAfter=12

            ),


        "Subtitle":

            ParagraphStyle(

                "CustomSubtitle",

                parent=base_styles["Normal"],

                fontSize=10,

                leading=14,

                alignment=TA_CENTER,

                textColor=colors.grey,

                spaceAfter=20

            ),


        "SectionTitle":

            ParagraphStyle(

                "CustomSectionTitle",

                parent=base_styles["Heading2"],

                fontSize=14,

                leading=18,

                spaceBefore=10,

                spaceAfter=7

            ),


        "SubTitle":

            ParagraphStyle(

                "CustomSubTitle",

                parent=base_styles["Heading3"],

                fontSize=11,

                leading=14,

                spaceBefore=5,

                spaceAfter=4

            ),


        "BodySmall":

            ParagraphStyle(

                "CustomBody",

                parent=base_styles["BodyText"],

                fontSize=9,

                leading=13,

                spaceAfter=3

            )

    }


    # -----------------------------------------------------
    # STORY
    # -----------------------------------------------------

    story = []


    # -----------------------------------------------------
    # TITLE
    # -----------------------------------------------------

    story.append(

        Paragraph(

            "AI Visibility Analyzer",

            styles["Title"]

        )

    )


    story.append(

        Paragraph(

            "Website Analysis Report",

            styles["Subtitle"]

        )

    )


    # -----------------------------------------------------
    # BASIC INFORMATION
    # -----------------------------------------------------

    created_at = analysis.created_at


    if created_at:

        try:

            created_text = created_at.strftime(
                "%d %b %Y, %I:%M %p"
            )

        except Exception:

            created_text = str(
                created_at
            )

    else:

        created_text = "N/A"


    basic_data = [

        [
            Paragraph(
                "<b>Analysis ID</b>",
                styles["BodySmall"]
            ),

            Paragraph(
                str(analysis.id),
                styles["BodySmall"]
            )
        ],

        [
            Paragraph(
                "<b>Website</b>",
                styles["BodySmall"]
            ),

            Paragraph(
                safe_text(
                    analysis.website_url
                ),
                styles["BodySmall"]
            )
        ],

        [
            Paragraph(
                "<b>Generated</b>",
                styles["BodySmall"]
            ),

            Paragraph(
                created_text,
                styles["BodySmall"]
            )
        ]

    ]


    basic_table = Table(

        basic_data,

        colWidths=[
            35 * mm,
            125 * mm
        ]

    )


    basic_table.setStyle(

        TableStyle([

            (
                "BACKGROUND",
                (0, 0),
                (0, -1),
                colors.HexColor(
                    "#eef3ff"
                )
            ),

            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.HexColor(
                    "#d7deea"
                )
            ),

            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP"
            ),

            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                7
            ),

            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                7
            ),

            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                6
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                6
            )

        ])

    )


    story.append(
        basic_table
    )


    story.append(
        Spacer(1, 12)
    )


    # -----------------------------------------------------
    # ANALYSIS DATA
    # -----------------------------------------------------

    story.append(

        Paragraph(
            "Analysis Results",
            styles["SectionTitle"]
        )

    )


    analysis_data = (
        analysis.analysis_data
    )


    if analysis_data:

        add_data_to_pdf(

            story,

            analysis_data,

            styles

        )

    else:

        story.append(

            Paragraph(

                "No analysis data available.",

                styles["BodySmall"]

            )

        )


    # -----------------------------------------------------
    # FOOTER
    # -----------------------------------------------------

    story.append(
        Spacer(1, 15)
    )


    story.append(

        Paragraph(

            "Generated by AI Visibility Analyzer",

            styles["Subtitle"]

        )

    )


    # -----------------------------------------------------
    # BUILD PDF
    # -----------------------------------------------------

    document.build(
        story
    )


    # -----------------------------------------------------
    # RESET BUFFER
    # -----------------------------------------------------

    pdf_buffer.seek(0)


    # -----------------------------------------------------
    # FILE NAME
    # -----------------------------------------------------

    safe_id = str(
        analysis.id
    )


    filename = (
        f"AI_Visibility_Report_"
        f"{safe_id}.pdf"
    )


    # -----------------------------------------------------
    # RETURN PDF
    # -----------------------------------------------------

    return StreamingResponse(

        pdf_buffer,

        media_type="application/pdf",

        headers={

            "Content-Disposition":
                f'attachment; filename="{filename}"',

            "Cache-Control":
                "no-cache"

        }

    )