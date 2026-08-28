from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from database import get_db
from models import AnalysisHistory, User
from dependencies import get_current_user
from services.analyzer import WebsiteAnalyzer

from io import BytesIO
from xml.sax.saxutils import escape

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)

router = APIRouter()

NAVY = colors.HexColor("#0F172A")
BLUE = colors.HexColor("#2563EB")
LIGHT_BLUE = colors.HexColor("#EFF6FF")
BORDER = colors.HexColor("#D9E2F0")
TEXT = colors.HexColor("#1E293B")
MUTED = colors.HexColor("#64748B")
GREEN = colors.HexColor("#15803D")
AMBER = colors.HexColor("#B45309")
RED = colors.HexColor("#B91C1C")
WHITE = colors.white


class WebsiteRequest(BaseModel):
    url: str


@router.post("/analyze")
def analyze(
    request: WebsiteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Run a website analysis and save the completed result to history.

    Important:
    - Analyzer errors are reported as analyzer errors.
    - Database/history errors are reported separately.
    - A failed analysis is never written to history.
    """

    website_url = (request.url or "").strip()

    if not website_url:
        raise HTTPException(
            status_code=422,
            detail="Website URL is required.",
        )

    # WebsiteAnalyzer generally expects a complete URL.
    if not website_url.lower().startswith(("http://", "https://")):
        website_url = "https://" + website_url

    # -----------------------------------------------------
    # RUN ANALYZER
    # -----------------------------------------------------
    try:
        result = WebsiteAnalyzer.analyze(website_url)

    except HTTPException:
        raise

    except Exception as e:
        print("WEBSITE ANALYSIS ERROR:", repr(e))
        raise HTTPException(
            status_code=502,
            detail=f"Website analysis failed: {str(e)}",
        )

    # -----------------------------------------------------
    # BASIC RESULT VALIDATION
    # -----------------------------------------------------
    if result is None:
        raise HTTPException(
            status_code=502,
            detail="The analysis service returned no result.",
        )

    try:
        encoded_result = jsonable_encoder(result)
    except Exception as e:
        print("ANALYSIS RESULT ENCODING ERROR:", repr(e))
        raise HTTPException(
            status_code=502,
            detail="The analysis service returned an invalid result.",
        )

    if not isinstance(encoded_result, dict):
        raise HTTPException(
            status_code=502,
            detail="The analysis service returned an invalid report format.",
        )

    # Do not save explicit failure responses.
    if encoded_result.get("success") is False:
        detail = (
            encoded_result.get("detail")
            or encoded_result.get("message")
            or encoded_result.get("error")
            or "Website analysis failed."
        )
        raise HTTPException(
            status_code=502,
            detail=str(detail),
        )

    # -----------------------------------------------------
    # SAVE HISTORY
    # -----------------------------------------------------
    try:
        history = AnalysisHistory(
            user_id=current_user.id,
            website_url=website_url,
            analysis_data=encoded_result,
        )

        db.add(history)
        db.commit()
        db.refresh(history)

    except Exception as e:
        db.rollback()
        print("ANALYSIS HISTORY SAVE ERROR:", repr(e))

        # Analysis itself succeeded, but persistence failed.
        raise HTTPException(
            status_code=500,
            detail="Analysis completed but could not be saved to history.",
        )

    return encoded_result


@router.get("/analysis-history")
def get_analysis_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        history = (
            db.query(AnalysisHistory)
            .filter(AnalysisHistory.user_id == current_user.id)
            .order_by(AnalysisHistory.created_at.desc())
            .all()
        )
        return {
            "success": True,
            "count": len(history),
            "history": [
                {
                    "id": x.id,
                    "website_url": x.website_url,
                    "analysis_data": x.analysis_data,
                    "created_at": (
                        x.created_at.isoformat()
                        if x.created_at is not None
                        else None
                    ),
                }
                for x in history
            ],
        }
    except Exception as e:
        print("HISTORY FETCH ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Unable to load analysis history.",
        )


def safe(value, default="-"):
    """
    Convert arbitrary analyzer values into ReportLab-safe text.
    """
    if value is None or value == "":
        return default

    if isinstance(value, bool):
        return "Yes" if value else "No"

    if isinstance(value, (list, tuple, set)):
        value = ", ".join(str(item) for item in value)

    elif isinstance(value, dict):
        parts = []
        for key, item in value.items():
            parts.append(f"{key}: {item}")
        value = "; ".join(parts)

    return escape(str(value))


def score(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def score_colour(value):
    n = score(value)
    if n is None:
        return MUTED
    if n >= 80:
        return GREEN
    if n >= 60:
        return BLUE
    if n >= 40:
        return AMBER
    return RED


def score_label(value):
    n = score(value)
    if n is None:
        return "Not available"
    if n >= 80:
        return "Strong"
    if n >= 60:
        return "Good"
    if n >= 40:
        return "Needs Improvement"
    return "Low"


def styles():
    s = getSampleStyleSheet()
    return {
        "title": ParagraphStyle(
            "ReportTitle", parent=s["Title"], fontName="Helvetica-Bold",
            fontSize=25, leading=31, textColor=NAVY, alignment=TA_CENTER
        ),
        "subtitle": ParagraphStyle(
            "ReportSubtitle", parent=s["BodyText"], fontName="Helvetica",
            fontSize=10.5, leading=16, textColor=MUTED, alignment=TA_CENTER
        ),
        "section": ParagraphStyle(
            "Section", parent=s["Heading1"], fontName="Helvetica-Bold",
            fontSize=17, leading=21, textColor=NAVY, spaceBefore=5, spaceAfter=9
        ),
        "sub": ParagraphStyle(
            "Sub", parent=s["Heading2"], fontName="Helvetica-Bold",
            fontSize=11, leading=14, textColor=BLUE, spaceBefore=5, spaceAfter=5
        ),
        "body": ParagraphStyle(
            "Body", parent=s["BodyText"], fontName="Helvetica",
            fontSize=8.8, leading=13, textColor=TEXT, spaceAfter=4
        ),
        "small": ParagraphStyle(
            "Small", parent=s["BodyText"], fontName="Helvetica",
            fontSize=7.5, leading=10, textColor=MUTED
        ),
        "cell": ParagraphStyle(
            "Cell", parent=s["BodyText"], fontName="Helvetica",
            fontSize=7.8, leading=10, textColor=TEXT
        ),
        "cellbold": ParagraphStyle(
            "CellBold", parent=s["BodyText"], fontName="Helvetica-Bold",
            fontSize=7.8, leading=10, textColor=NAVY
        ),
    }


def table(data, widths, header=True):
    t = Table(data, colWidths=widths, repeatRows=1 if header else 0)
    commands = [
        ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]
    if header:
        commands += [
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ]
        for r in range(1, len(data)):
            if r % 2 == 0:
                commands.append(
                    ("BACKGROUND", (0, r), (-1, r), colors.HexColor("#F8FAFC"))
                )
    t.setStyle(TableStyle(commands))
    return t


def footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setStrokeColor(BLUE)
    canvas.setLineWidth(1.6)
    canvas.line(18*mm, h-14*mm, w-18*mm, h-14*mm)

    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(NAVY)
    canvas.drawString(18*mm, h-10*mm, "AI VISIBILITY ANALYZER")

    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(
        w-18*mm, h-10*mm, "AI Visibility Analysis Report"
    )

    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(18*mm, 13*mm, w-18*mm, 13*mm)

    canvas.setFont("Helvetica", 7)
    canvas.drawString(
        18*mm, 8*mm, "Powered by Best Tech Company"
    )
    canvas.drawRightString(
        w-18*mm, 8*mm, f"Page {doc.page}"
    )
    canvas.restoreState()


def section(title, st):
    return [Spacer(1, 3*mm), Paragraph(escape(title), st["section"])]


def metric_rows(items, st):
    rows = [
        [Paragraph("<b>Metric</b>", st["cell"]),
         Paragraph("<b>Result</b>", st["cell"])]
    ]
    for k, v in items:
        rows.append([
            Paragraph(escape(str(k)), st["cellbold"]),
            Paragraph(safe(v), st["cell"]),
        ])
    return table(rows, [55*mm, 115*mm])


@router.get("/analysis/{analysis_id}/pdf")
def download_analysis_pdf(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generate a PDF for one analysis belonging to the authenticated user.
    """

    # -----------------------------------------------------
    # FETCH ONLY THE USER'S OWN ANALYSIS
    # -----------------------------------------------------
    try:
        analysis = (
            db.query(AnalysisHistory)
            .filter(
                AnalysisHistory.id == analysis_id,
                AnalysisHistory.user_id == current_user.id,
            )
            .first()
        )

    except Exception as e:
        print("ANALYSIS LOOKUP ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Unable to load the analysis report.",
        )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis report not found.",
        )

    data = analysis.analysis_data or {}

    if not isinstance(data, dict):
        raise HTTPException(
            status_code=500,
            detail="The stored analysis report has an invalid format.",
        )

    st = styles()
    buffer = BytesIO()

    # -----------------------------------------------------
    # DATE
    # -----------------------------------------------------
    created = analysis.created_at

    try:
        date_text = created.strftime("%d %B %Y, %I:%M %p")
    except Exception:
        date_text = str(created or "N/A")

    # -----------------------------------------------------
    # PDF DOCUMENT
    # -----------------------------------------------------
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=21 * mm,
        bottomMargin=19 * mm,
        title="AI Visibility Analysis Report",
        author="AI Visibility Analyzer",
        subject="Website AI Visibility Analysis",
    )

    story = []

    # -----------------------------------------------------
    # COVER
    # -----------------------------------------------------
    story.append(Spacer(1, 28 * mm))

    story.append(
        Paragraph(
            "AI VISIBILITY ANALYZER",
            ParagraphStyle(
                "Brand",
                parent=st["subtitle"],
                fontName="Helvetica-Bold",
                fontSize=10,
                textColor=BLUE,
            ),
        )
    )

    story.append(Spacer(1, 3 * mm))

    story.append(
        Paragraph(
            "AI Visibility<br/>Analysis Report",
            st["title"],
        )
    )

    story.append(Spacer(1, 4 * mm))

    story.append(
        Paragraph(
            "Professional website visibility, AI platform, E-E-A-T and technical analysis",
            st["subtitle"],
        )
    )

    story.append(Spacer(1, 16 * mm))

    cover = [
        [
            Paragraph("<b>Website</b>", st["cell"]),
            Paragraph(safe(analysis.website_url), st["cell"]),
        ],
        [
            Paragraph("<b>Analysis ID</b>", st["cell"]),
            Paragraph(safe(analysis.id), st["cell"]),
        ],
        [
            Paragraph("<b>Generated</b>", st["cell"]),
            Paragraph(safe(date_text), st["cell"]),
        ],
        [
            Paragraph("<b>Status</b>", st["cell"]),
            Paragraph("Completed", st["cell"]),
        ],
    ]

    ct = Table(
        cover,
        colWidths=[42 * mm, 123 * mm],
        hAlign="CENTER",
    )

    ct.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
                ("BOX", (0, 0), (-1, -1), 0.8, BORDER),
                ("INNERGRID", (0, 0), (-1, -1), 0.45, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 9),
                ("RIGHTPADDING", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ]
        )
    )

    story.append(ct)
    story.append(Spacer(1, 18 * mm))

    story.append(
        Paragraph(
            "Prepared by AI Visibility Analyzer",
            ParagraphStyle(
                "Prepared",
                parent=st["small"],
                alignment=TA_CENTER,
            ),
        )
    )

    story.append(PageBreak())

    # -----------------------------------------------------
    # EXECUTIVE SUMMARY
    # -----------------------------------------------------
    story += section("Executive Summary", st)

    story.append(
        Paragraph(
            "This report presents a structured analysis of the submitted website "
            "across AI visibility, E-E-A-T signals, technical SEO indicators and "
            "other website-level signals captured by the analyzer.",
            st["body"],
        )
    )

    platforms = [
        ("ChatGPT", "chatgpt"),
        ("Gemini", "gemini"),
        ("Claude", "claude"),
        ("Perplexity", "perplexity"),
        ("Grok", "grok"),
        ("Google AI Mode", "google_ai_mode"),
        ("DeepSeek", "deepseek"),
    ]

    scores = []

    for _, key in platforms:
        item = data.get(key)

        if isinstance(item, dict):
            n = score(item.get("score"))
            if n is not None:
                scores.append(n)

    eeat = data.get("eeat", {})

    if isinstance(eeat, dict):
        eeat_score = score(eeat.get("score"))

        if eeat_score is not None:
            scores.append(eeat_score)

    overall = (
        round(sum(scores) / len(scores))
        if scores
        else None
    )

    story.append(Spacer(1, 6 * mm))

    overall_text = (
        str(overall)
        if overall is not None
        else "—"
    )

    overall_colour = score_colour(overall)

    oc = Table(
        [
            [
                Paragraph(
                    f"<b>OVERALL VISIBILITY SCORE</b><br/>"
                    f"<font size='28'>{escape(overall_text)}</font>"
                    f"<br/><font size='9'>{escape(score_label(overall))}</font>",
                    ParagraphStyle(
                        "Overall",
                        parent=st["body"],
                        alignment=TA_CENTER,
                        textColor=WHITE,
                        leading=20,
                    ),
                )
            ]
        ],
        colWidths=[70 * mm],
        rowHeights=[40 * mm],
        hAlign="CENTER",
    )

    oc.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), overall_colour),
                ("BOX", (0, 0), (-1, -1), 0.8, overall_colour),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )

    story.append(oc)
    story.append(Spacer(1, 8 * mm))

    # -----------------------------------------------------
    # AI PLATFORM TABLE
    # -----------------------------------------------------
    story += section("AI Platform Visibility", st)

    rows = [
        [
            Paragraph("<b>AI Platform</b>", st["cell"]),
            Paragraph("<b>Score</b>", st["cell"]),
            Paragraph("<b>Assessment</b>", st["cell"]),
        ]
    ]

    for name, key in platforms:
        item = data.get(key)

        if not isinstance(item, dict):
            continue

        n = score(item.get("score"))

        rows.append(
            [
                Paragraph(escape(name), st["cellbold"]),
                Paragraph(
                    safe(item.get("score")),
                    ParagraphStyle(
                        "PlatformScore",
                        parent=st["cell"],
                        alignment=TA_CENTER,
                        fontName="Helvetica-Bold",
                        textColor=score_colour(n),
                    ),
                ),
                Paragraph(
                    escape(score_label(n)),
                    st["cell"],
                ),
            ]
        )

    if len(rows) > 1:
        story.append(
            table(
                rows,
                [70 * mm, 30 * mm, 60 * mm],
            )
        )
    else:
        story.append(
            Paragraph(
                "No AI platform score data is available.",
                st["body"],
            )
        )

    story.append(PageBreak())

    # -----------------------------------------------------
    # E-E-A-T
    # -----------------------------------------------------
    story += section("E-E-A-T Analysis", st)

    if isinstance(eeat, dict):

        story.append(
            Paragraph(
                f"E-E-A-T score: <b>{safe(eeat.get('score'), 'Not available')}</b>",
                st["body"],
            )
        )

        eeat_rows = [
            [
                Paragraph("<b>Signal</b>", st["cell"]),
                Paragraph("<b>Status</b>", st["cell"]),
            ]
        ]

        for label, key in [
            ("Author", "author"),
            ("About", "about"),
            ("Contact", "contact"),
            ("Privacy Policy", "privacy"),
            ("Terms & Conditions", "terms"),
        ]:

            value = bool(eeat.get(key))

            eeat_rows.append(
                [
                    Paragraph(escape(label), st["cellbold"]),
                    Paragraph(
                        "✓ Present" if value else "✗ Missing",
                        ParagraphStyle(
                            "EeatStatus",
                            parent=st["cell"],
                            textColor=GREEN if value else RED,
                            fontName="Helvetica-Bold",
                        ),
                    ),
                ]
            )

        story.append(
            table(
                eeat_rows,
                [85 * mm, 75 * mm],
            )
        )

        recs = eeat.get("recommendations") or []

        if isinstance(recs, list) and recs:

            story.append(Spacer(1, 6 * mm))
            story.append(Paragraph("Recommendations", st["sub"]))

            for recommendation in recs:

                story.append(
                    Paragraph(
                        f"• {safe(recommendation)}",
                        st["body"],
                    )
                )

    # -----------------------------------------------------
    # TECHNICAL SEO
    # -----------------------------------------------------
    story += section("Technical SEO", st)

    technical = data.get("technical_seo", {})

    if isinstance(technical, dict):

        story.append(
            metric_rows(
                [
                    (
                        "HTTPS",
                        "Yes"
                        if technical.get("https")
                        else "No",
                    ),
                    (
                        "HTTP Status Code",
                        technical.get("status_code"),
                    ),
                    (
                        "Response Time",
                        f"{technical.get('response_time_ms', '-')} ms",
                    ),
                    (
                        "Page Size",
                        f"{technical.get('page_size_kb', '-')} KB",
                    ),
                    (
                        "Redirected",
                        "Yes"
                        if technical.get("redirected")
                        else "No",
                    ),
                    (
                        "Robots.txt",
                        "Yes"
                        if technical.get("robots_txt")
                        else "No",
                    ),
                    (
                        "Sitemap",
                        "Yes"
                        if technical.get("sitemap")
                        else "No",
                    ),
                    (
                        "Structured Data",
                        "Yes"
                        if technical.get("structured_data")
                        else "No",
                    ),
                    (
                        "JSON-LD Count",
                        technical.get("json_ld_count"),
                    ),
                    (
                        "Final URL",
                        technical.get("final_url"),
                    ),
                ],
                st,
            )
        )

    # -----------------------------------------------------
    # ON-PAGE AUDIT
    # -----------------------------------------------------
    audit = data.get("audit", {})

    if isinstance(audit, dict):

        story.append(Spacer(1, 7 * mm))
        story.append(Paragraph("On-Page Audit", st["sub"]))

        story.append(
            metric_rows(
                [
                    (
                        "Meta Description",
                        "Yes"
                        if audit.get("meta_description")
                        else "No",
                    ),
                    (
                        "Canonical",
                        "Yes"
                        if audit.get("canonical")
                        else "No",
                    ),
                    (
                        "Robots",
                        "Yes"
                        if audit.get("robots")
                        else "No",
                    ),
                    (
                        "H1 Count",
                        audit.get("h1_count"),
                    ),
                    (
                        "H2 Count",
                        audit.get("h2_count"),
                    ),
                    (
                        "Total Images",
                        audit.get("images"),
                    ),
                    (
                        "Images Without Alt",
                        audit.get("images_without_alt"),
                    ),
                    (
                        "Total Links",
                        audit.get("total_links"),
                    ),
                ],
                st,
            )
        )

    story.append(PageBreak())

    # -----------------------------------------------------
    # AI CONTENT SIGNALS
    # -----------------------------------------------------
    story += section("AI Content Signals", st)

    signal_rows = [
        [
            Paragraph("<b>Platform</b>", st["cell"]),
            Paragraph("<b>Score</b>", st["cell"]),
            Paragraph("<b>Author</b>", st["cell"]),
            Paragraph("<b>Schema</b>", st["cell"]),
            Paragraph("<b>Recommendations</b>", st["cell"]),
        ]
    ]

    for name, key in platforms:

        item = data.get(key)

        if not isinstance(item, dict):
            continue

        recs = item.get("recommendations") or []

        if isinstance(recs, list):
            rec_text = "; ".join(
                str(x) for x in recs[:3]
            )
        else:
            rec_text = str(recs)

        signal_rows.append(
            [
                Paragraph(escape(name), st["cellbold"]),
                Paragraph(
                    safe(item.get("score")),
                    st["cell"],
                ),
                Paragraph(
                    "Yes" if item.get("author") else "No",
                    st["cell"],
                ),
                Paragraph(
                    "Yes" if item.get("schema") else "No",
                    st["cell"],
                ),
                Paragraph(
                    escape(rec_text),
                    st["cell"],
                ),
            ]
        )

    if len(signal_rows) > 1:

        story.append(
            table(
                signal_rows,
                [34 * mm, 20 * mm, 20 * mm, 20 * mm, 66 * mm],
            )
        )

    else:

        story.append(
            Paragraph(
                "No AI content signal data is available.",
                st["body"],
            )
        )

    # -----------------------------------------------------
    # ENTITIES
    # -----------------------------------------------------
    entities = data.get("entities")

    if isinstance(entities, dict):

        story += section(
            "Entity & Topic Signals",
            st,
        )

        organizations = entities.get("organizations") or []
        services = entities.get("services") or []
        topics = entities.get("topics") or []

        story.append(
            metric_rows(
                [
                    (
                        "Entity Count",
                        entities.get("count"),
                    ),
                    (
                        "Organizations",
                        ", ".join(
                            map(str, organizations[:15])
                        )
                        if isinstance(organizations, list)
                        else organizations,
                    ),
                    (
                        "Services",
                        ", ".join(
                            map(str, services[:15])
                        )
                        if isinstance(services, list)
                        else services,
                    ),
                    (
                        "Topics",
                        ", ".join(
                            map(str, topics[:15])
                        )
                        if isinstance(topics, list)
                        else topics,
                    ),
                ],
                st,
            )
        )

        top = entities.get("top_entities") or []

        if isinstance(top, list) and top:

            story.append(Spacer(1, 6 * mm))
            story.append(
                Paragraph(
                    "Top Detected Entities",
                    st["sub"],
                )
            )

            story.append(
                Paragraph(
                    safe(top[:50]),
                    st["small"],
                )
            )

    # -----------------------------------------------------
    # LLMs.TXT
    # -----------------------------------------------------
    llms = data.get("llms")

    if isinstance(llms, dict):

        story += section(
            "LLMs.txt",
            st,
        )

        story.append(
            metric_rows(
                [
                    (
                        "Exists",
                        "Yes"
                        if llms.get("exists")
                        else "No",
                    ),
                    (
                        "URL",
                        llms.get("url"),
                    ),
                    (
                        "Size",
                        f"{llms.get('size', '-')} bytes",
                    ),
                    (
                        "Preview",
                        llms.get("preview"),
                    ),
                ],
                st,
            )
        )

    # -----------------------------------------------------
    # PRIORITY RECOMMENDATIONS
    # -----------------------------------------------------
    story += section(
        "Priority Recommendations",
        st,
    )

    recommendations = []

    if isinstance(eeat, dict):

        eeat_recommendations = (
            eeat.get("recommendations")
            or []
        )

        if isinstance(
            eeat_recommendations,
            list,
        ):
            recommendations.extend(
                eeat_recommendations
            )

    for _, key in platforms:

        item = data.get(key)

        if not isinstance(item, dict):
            continue

        platform_recommendations = (
            item.get("recommendations")
            or []
        )

        if isinstance(
            platform_recommendations,
            list,
        ):
            recommendations.extend(
                platform_recommendations
            )

    unique = []
    seen = set()

    for recommendation in recommendations:

        recommendation_text = (
            str(recommendation)
            .strip()
        )

        normalized = recommendation_text.lower()

        if (
            recommendation_text
            and normalized not in seen
        ):

            seen.add(normalized)
            unique.append(
                recommendation_text
            )

    if unique:

        for number, recommendation in enumerate(
            unique,
            1,
        ):

            story.append(
                Paragraph(
                    f"<b>{number}.</b> "
                    f"{escape(recommendation)}",
                    st["body"],
                )
            )

    else:

        story.append(
            Paragraph(
                "No specific recommendations were returned by the analyzer.",
                st["body"],
            )
        )

    # -----------------------------------------------------
    # REPORT NOTES
    # -----------------------------------------------------
    story.append(Spacer(1, 6 * mm))

    story.append(
        Paragraph(
            "Report Notes",
            st["sub"],
        )
    )

    story.append(
        Paragraph(
            "This report reflects the analysis data stored for the selected "
            "analysis record. Scores and findings should be interpreted in "
            "the context of the analyzed website and the time of analysis.",
            st["body"],
        )
    )

    story.append(
        Paragraph(
            f"Analysis #{safe(analysis.id)} • "
            f"Generated {safe(date_text)}",
            st["small"],
        )
    )

    # -----------------------------------------------------
    # BUILD PDF
    # -----------------------------------------------------
    try:

        doc.build(
            story,
            onFirstPage=footer,
            onLaterPages=footer,
        )

    except Exception as e:

        print(
            "PDF GENERATION ERROR:",
            repr(e),
        )

        buffer.close()

        raise HTTPException(
            status_code=500,
            detail="Unable to generate PDF report.",
        )

    # -----------------------------------------------------
    # RETURN PDF
    # -----------------------------------------------------
    pdf_data = buffer.getvalue()
    buffer.close()

    if not pdf_data:

        raise HTTPException(
            status_code=500,
            detail="PDF generation returned an empty file.",
        )

    filename = (
        f"AI-Visibility-Analysis-{analysis.id}.pdf"
    )

    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            ),
            "Content-Length": str(len(pdf_data)),
            "Cache-Control": "no-store",
        },
    )
