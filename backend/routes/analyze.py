from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder

from database import get_db
from models import AnalysisHistory, User
from dependencies import get_current_user
from services.analyzer import WebsiteAnalyzer
from plan_config import (
    normalize_plan,
    get_allowed_ai_platforms,
    has_feature,
)

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


# =========================================================
# PLAN / RESULT HELPERS
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


def get_user_plan(current_user: User) -> str:
    """Return the normalized server-side plan for the user."""
    return normalize_plan(getattr(current_user, "plan", "free"))


def apply_plan_result_filter(result: dict, plan: str) -> dict:
    """Apply server-side plan restrictions to an analysis result."""

    if plan != "free":
        return result

    filtered = dict(result)
    allowed_platforms = set(get_allowed_ai_platforms(plan))

    # -----------------------------------------------------
    # FREE AI PLATFORM ACCESS
    # -----------------------------------------------------

    for platform in AI_PLATFORM_KEYS:
        if platform not in allowed_platforms:
            filtered.pop(platform, None)

    # -----------------------------------------------------
    # PREMIUM REPORT SECTIONS
    # -----------------------------------------------------
    # Free provides basic AI visibility only. These sections
    # are available on Pro and Agency plans.

    for section_name in [
        "technical_seo",
        "eeat",
        "entities",
        "recommendations",
        "audit",
        "technology",
        "llms",
    ]:
        filtered.pop(section_name, None)

    # -----------------------------------------------------
    # FREE OVERALL SCORE
    # -----------------------------------------------------
    # The analyzer's original overall score may include all seven
    # platforms. Recalculate it using only Free-plan platforms.

    scores = []

    for platform in allowed_platforms:
        item = filtered.get(platform)

        if isinstance(item, dict):
            value = item.get("score")

            try:
                if value is not None:
                    scores.append(float(value))
            except (TypeError, ValueError):
                pass

    filtered["overall_ai_visibility"] = {
        "score": round(sum(scores) / len(scores)) if scores else 0
    }

    # Useful for the frontend to render the correct plan state.
    filtered["plan"] = plan
    filtered["available_ai_platforms"] = [
        platform
        for platform in AI_PLATFORM_KEYS
        if platform in allowed_platforms
    ]

    return filtered


def save_analysis_history(
    db: Session,
    current_user: User,
    website_url: str,
    analysis_data: dict,
):
    """Save an analysis record for plans that include history."""

    history = AnalysisHistory(
        user_id=current_user.id,
        website_url=website_url,
        analysis_data=analysis_data,
    )

    db.add(history)
    db.commit()
    db.refresh(history)

    return history


@router.post("/analyze")
def analyze(
    request: WebsiteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Run website analysis and save successful and failed attempts
    only when the user's plan includes analysis history.

    Free users:
        - Receive only the configured 1-2 AI platform scores.
        - Do not have analysis history saved.

    Pro / Agency users:
        - Receive the complete analyzer result.
        - Analysis history is saved.
    """

    plan = get_user_plan(current_user)
    history_enabled = has_feature(plan, "analysis_history")

    print(
        f"ANALYSIS REQUEST: user={current_user.id}, plan={plan}"
    )

    website_url = (request.url or "").strip()

    if not website_url:
        raise HTTPException(
            status_code=422,
            detail="Website URL is required.",
        )

    if not website_url.lower().startswith(("http://", "https://")):
        website_url = "https://" + website_url

    # -----------------------------------------------------
    # RUN ANALYZER
    # -----------------------------------------------------

    try:
        result = WebsiteAnalyzer.analyze(website_url)

    except HTTPException as e:
        db.rollback()

        failed_data = {
            "success": False,
            "status": "failed",
            "error": str(e.detail),
        }

        if history_enabled:
            try:
                history = save_analysis_history(
                    db,
                    current_user,
                    website_url,
                    failed_data,
                )

                print(
                    "FAILED ANALYSIS SAVED:",
                    f"user={current_user.id}",
                    f"url={website_url}",
                    f"id={history.id}",
                )

            except Exception as save_error:
                db.rollback()
                print(
                    "FAILED ANALYSIS HISTORY SAVE ERROR:",
                    repr(save_error),
                )
        else:
            print(
                "FAILED ANALYSIS NOT SAVED: history unavailable "
                f"for plan={plan}"
            )

        raise

    except Exception as e:
        db.rollback()

        print("WEBSITE ANALYSIS ERROR:", repr(e))

        failed_data = {
            "success": False,
            "status": "failed",
            "error": str(e),
        }

        if history_enabled:
            try:
                history = save_analysis_history(
                    db,
                    current_user,
                    website_url,
                    failed_data,
                )

                print(
                    "FAILED ANALYSIS SAVED:",
                    f"user={current_user.id}",
                    f"url={website_url}",
                    f"id={history.id}",
                )

            except Exception as save_error:
                db.rollback()
                print(
                    "FAILED ANALYSIS HISTORY SAVE ERROR:",
                    repr(save_error),
                )
        else:
            print(
                "FAILED ANALYSIS NOT SAVED: history unavailable "
                f"for plan={plan}"
            )

        raise HTTPException(
            status_code=502,
            detail=f"Website analysis failed: {str(e)}",
        )

    # -----------------------------------------------------
    # ENCODE ANALYZER RESULT
    # -----------------------------------------------------

    try:
        encoded_result = jsonable_encoder(result)

    except Exception as e:
        db.rollback()
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

    # -----------------------------------------------------
    # ANALYZER EXPLICITLY REPORTED FAILURE
    # -----------------------------------------------------

    if encoded_result.get("success") is False:
        detail = (
            encoded_result.get("detail")
            or encoded_result.get("message")
            or encoded_result.get("error")
            or "Website analysis failed."
        )

        failed_data = dict(encoded_result)
        failed_data["success"] = False
        failed_data["status"] = "failed"
        failed_data["error"] = str(detail)

        if history_enabled:
            try:
                history = save_analysis_history(
                    db,
                    current_user,
                    website_url,
                    failed_data,
                )

                print(
                    "FAILED ANALYSIS SAVED:",
                    f"user={current_user.id}",
                    f"url={website_url}",
                    f"id={history.id}",
                )

            except Exception as save_error:
                db.rollback()
                print(
                    "FAILED ANALYSIS HISTORY SAVE ERROR:",
                    repr(save_error),
                )
        else:
            print(
                "FAILED ANALYSIS NOT SAVED: history unavailable "
                f"for plan={plan}"
            )

        raise HTTPException(
            status_code=502,
            detail=str(detail),
        )

    # -----------------------------------------------------
    # SUCCESSFUL ANALYSIS
    # -----------------------------------------------------

    encoded_result["success"] = True
    encoded_result["status"] = "completed"

    # -----------------------------------------------------
    # APPLY SERVER-SIDE PLAN FILTER
    # -----------------------------------------------------

    encoded_result = apply_plan_result_filter(
        encoded_result,
        plan,
    )

    # -----------------------------------------------------
    # SAVE HISTORY ONLY FOR ELIGIBLE PLANS
    # -----------------------------------------------------

    if history_enabled:
        try:
            history = save_analysis_history(
                db,
                current_user,
                website_url,
                encoded_result,
            )

            print(
                "COMPLETED ANALYSIS SAVED:",
                f"user={current_user.id}",
                f"url={website_url}",
                f"id={history.id}",
            )

        except Exception as e:
            db.rollback()

            print(
                "ANALYSIS HISTORY SAVE ERROR:",
                repr(e),
            )

            raise HTTPException(
                status_code=500,
                detail="Analysis completed but could not be saved to history.",
            )
    else:
        print(
            "COMPLETED ANALYSIS NOT SAVED: history unavailable "
            f"for plan={plan}"
        )

    return encoded_result


@router.get("/analysis-history")
def get_analysis_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Return analysis history with an explicit status.

    Existing records created before the status field was introduced
    are treated as completed unless their stored analysis_data explicitly
    says success=false or status=failed.

    Free users do not have analysis history.
    """

    plan = get_user_plan(current_user)

    if not has_feature(plan, "analysis_history"):
        return {
            "success": True,
            "count": 0,
            "history": [],
            "history_available": False,
            "plan": plan,
            "message": "Analysis history is available on Pro and Agency plans.",
        }

    try:
        history = (
            db.query(AnalysisHistory)
            .filter(AnalysisHistory.user_id == current_user.id)
            .order_by(AnalysisHistory.created_at.desc())
            .all()
        )

        records = []

        for item in history:
            analysis_data = (
                item.analysis_data
                if isinstance(item.analysis_data, dict)
                else {}
            )

            if (
                analysis_data.get("success") is False
                or analysis_data.get("status") == "failed"
            ):
                status = "failed"
            elif analysis_data.get("status") == "processing":
                status = "processing"
            elif analysis_data.get("status") == "pending":
                status = "pending"
            else:
                status = "completed"

            records.append(
                {
                    "id": item.id,
                    "website_url": item.website_url,
                    "analysis_data": analysis_data,
                    "created_at": item.created_at,
                    "status": status,
                    "pdf_available": status == "completed",
                }
            )

        return {
            "success": True,
            "count": len(records),
            "history": records,
            "history_available": True,
            "plan": plan,
        }

    except Exception as e:
        print("HISTORY FETCH ERROR:", repr(e))

        raise HTTPException(
            status_code=500,
            detail="Unable to load analysis history.",
        )


def safe(value, default="-"):
    if value is None or value == "":
        return default
    if isinstance(value, bool):
        return "Yes" if value else "No"
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
    plan = get_user_plan(current_user)

    if not has_feature(plan, "pdf_download"):
        raise HTTPException(
            status_code=403,
            detail="PDF download is available on Pro and Agency plans.",
        )

    analysis = (
        db.query(AnalysisHistory)
        .filter(
            AnalysisHistory.id == analysis_id,
            AnalysisHistory.user_id == current_user.id,
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis report not found.",
        )

    # =====================================================
    # PDF ONLY FOR COMPLETED ANALYSES
    # =====================================================

    analysis_data = (
        analysis.analysis_data
        if isinstance(
            analysis.analysis_data,
            dict
        )
        else {}
    )

    if (
        analysis_data.get("success") is False
        or
        analysis_data.get("status") == "failed"
    ):
        raise HTTPException(
            status_code=409,
            detail=(
                "PDF is unavailable because "
                "this website analysis failed."
            )
        )

    data = analysis.analysis_data or {}
    st = styles()
    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18*mm,
        leftMargin=18*mm,
        topMargin=21*mm,
        bottomMargin=19*mm,
        title="AI Visibility Analysis Report",
        author="AI Visibility Analyzer",
    )

    story = []

    created = analysis.created_at
    try:
        date_text = created.strftime("%d %B %Y, %I:%M %p")
    except Exception:
        date_text = str(created or "N/A")

    # -----------------------------------------------------
    # COVER
    # -----------------------------------------------------

    story.append(Spacer(1, 28*mm))
    story.append(Paragraph("AI VISIBILITY ANALYZER", ParagraphStyle(
        "Brand", parent=st["subtitle"], fontName="Helvetica-Bold",
        fontSize=10, textColor=BLUE
    )))
    story.append(Spacer(1, 3*mm))
    story.append(Paragraph(
        "AI Visibility<br/>Analysis Report", st["title"]
    ))
    story.append(Spacer(1, 4*mm))
    story.append(Paragraph(
        "Professional website visibility, AI platform, E-E-A-T and technical analysis",
        st["subtitle"]
    ))
    story.append(Spacer(1, 16*mm))

    cover = [
        [Paragraph("<b>Website</b>", st["cell"]),
         Paragraph(safe(analysis.website_url), st["cell"])],
        [Paragraph("<b>Analysis ID</b>", st["cell"]),
         Paragraph(str(analysis.id), st["cell"])],
        [Paragraph("<b>Generated</b>", st["cell"]),
         Paragraph(escape(date_text), st["cell"])],
        [Paragraph("<b>Status</b>", st["cell"]),
         Paragraph("Completed", st["cell"])],
    ]
    ct = Table(cover, colWidths=[42*mm, 123*mm], hAlign="CENTER")
    ct.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (0,-1), LIGHT_BLUE),
        ("BOX", (0,0), (-1,-1), 0.8, BORDER),
        ("INNERGRID", (0,0), (-1,-1), 0.45, BORDER),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
        ("LEFTPADDING", (0,0), (-1,-1), 9),
        ("RIGHTPADDING", (0,0), (-1,-1), 9),
        ("TOPPADDING", (0,0), (-1,-1), 8),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(ct)
    story.append(Spacer(1, 18*mm))
    story.append(Paragraph(
        "Prepared by AI Visibility Analyzer", ParagraphStyle(
            "Prepared", parent=st["small"], alignment=TA_CENTER
        )
    ))
    story.append(PageBreak())

    # -----------------------------------------------------
    # EXECUTIVE SUMMARY
    # -----------------------------------------------------

    story += section("Executive Summary", st)
    story.append(Paragraph(
        "This report presents a structured analysis of the submitted website "
        "across AI visibility, E-E-A-T signals, technical SEO indicators and "
        "other website-level signals captured by the analyzer.",
        st["body"]
    ))

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
        if isinstance(item, dict) and score(item.get("score")) is not None:
            scores.append(score(item.get("score")))

    if isinstance(data.get("eeat"), dict):
        if score(data["eeat"].get("score")) is not None:
            scores.append(score(data["eeat"].get("score")))

    overall = round(sum(scores)/len(scores)) if scores else None

    story.append(Spacer(1, 6*mm))
    overall_text = str(overall) if overall is not None else "—"
    overall_colour = score_colour(overall)

    oc = Table([[
        Paragraph(
            f"<b>OVERALL VISIBILITY SCORE</b><br/><font size='28'>{overall_text}</font>"
            f"<br/><font size='9'>{escape(score_label(overall))}</font>",
            ParagraphStyle(
                "Overall", parent=st["body"], alignment=TA_CENTER,
                textColor=WHITE, leading=20
            )
        )
    ]], colWidths=[70*mm], rowHeights=[40*mm], hAlign="CENTER")
    oc.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,-1), overall_colour),
        ("BOX", (0,0), (-1,-1), 0.8, overall_colour),
        ("VALIGN", (0,0), (-1,-1), "MIDDLE"),
    ]))
    story.append(oc)
    story.append(Spacer(1, 8*mm))

    # -----------------------------------------------------
    # AI PLATFORM TABLE
    # -----------------------------------------------------

    story += section("AI Platform Visibility", st)

    rows = [[
        Paragraph("<b>AI Platform</b>", st["cell"]),
        Paragraph("<b>Score</b>", st["cell"]),
        Paragraph("<b>Assessment</b>", st["cell"]),
    ]]

    for name, key in platforms:
        item = data.get(key)
        if not isinstance(item, dict):
            continue
        n = score(item.get("score"))
        rows.append([
            Paragraph(escape(name), st["cellbold"]),
            Paragraph(
                safe(item.get("score")),
                ParagraphStyle(
                    "PlatformScore", parent=st["cell"],
                    alignment=TA_CENTER, fontName="Helvetica-Bold",
                    textColor=score_colour(n)
                )
            ),
            Paragraph(escape(score_label(n)), st["cell"]),
        ])

    if len(rows) > 1:
        story.append(table(rows, [70*mm, 30*mm, 60*mm]))
    else:
        story.append(Paragraph(
            "No AI platform score data is available.", st["body"]
        ))

    story.append(PageBreak())

    # -----------------------------------------------------
    # E-E-A-T
    # -----------------------------------------------------

    story += section("E-E-A-T Analysis", st)
    eeat = data.get("eeat", {})

    if isinstance(eeat, dict):
        story.append(Paragraph(
            f"E-E-A-T score: <b>{safe(eeat.get('score'), 'Not available')}</b>",
            st["body"]
        ))
        eeat_rows = [[
            Paragraph("<b>Signal</b>", st["cell"]),
            Paragraph("<b>Status</b>", st["cell"]),
        ]]
        for label, key in [
            ("Author", "author"),
            ("About", "about"),
            ("Contact", "contact"),
            ("Privacy Policy", "privacy"),
            ("Terms & Conditions", "terms"),
        ]:
            value = bool(eeat.get(key))
            eeat_rows.append([
                Paragraph(label, st["cellbold"]),
                Paragraph(
                    "✓ Present" if value else "✗ Missing",
                    ParagraphStyle(
                        "EeatStatus", parent=st["cell"],
                        textColor=GREEN if value else RED,
                        fontName="Helvetica-Bold"
                    )
                )
            ])
        story.append(table(eeat_rows, [85*mm, 75*mm]))

        recs = eeat.get("recommendations") or []
        if recs:
            story.append(Spacer(1, 6*mm))
            story.append(Paragraph("Recommendations", st["sub"]))
            for r in recs:
                story.append(Paragraph(
                    f"• {safe(r)}", st["body"]
                ))

    # -----------------------------------------------------
    # TECHNICAL SEO + AUDIT
    # -----------------------------------------------------

    story += section("Technical SEO", st)
    technical = data.get("technical_seo", {})

    if isinstance(technical, dict):
        story.append(metric_rows([
            ("HTTPS", "Yes" if technical.get("https") else "No"),
            ("HTTP Status Code", technical.get("status_code")),
            ("Response Time", f"{technical.get('response_time_ms', '-')} ms"),
            ("Page Size", f"{technical.get('page_size_kb', '-')} KB"),
            ("Redirected", "Yes" if technical.get("redirected") else "No"),
            ("Robots.txt", "Yes" if technical.get("robots_txt") else "No"),
            ("Sitemap", "Yes" if technical.get("sitemap") else "No"),
            ("Final URL", technical.get("final_url")),
        ], st))

    audit = data.get("audit", {})
    if isinstance(audit, dict):
        story.append(Spacer(1, 7*mm))
        story.append(Paragraph("On-Page Audit", st["sub"]))
        story.append(metric_rows([
            ("Meta Description", "Yes" if audit.get("meta_description") else "No"),
            ("Canonical", "Yes" if audit.get("canonical") else "No"),
            ("Robots", "Yes" if audit.get("robots") else "No"),
            ("H1 Count", audit.get("h1_count")),
            ("Total Images", audit.get("images")),
            ("Images Without Alt", audit.get("images_without_alt")),
            ("Total Links", audit.get("total_links")),
        ], st))

    story.append(PageBreak())

    # -----------------------------------------------------
    # AI SIGNALS
    # -----------------------------------------------------

    story += section("AI Content Signals", st)

    signal_rows = [[
        Paragraph("<b>Platform</b>", st["cell"]),
        Paragraph("<b>Score</b>", st["cell"]),
        Paragraph("<b>Author</b>", st["cell"]),
        Paragraph("<b>Schema</b>", st["cell"]),
        Paragraph("<b>Recommendations</b>", st["cell"]),
    ]]

    for name, key in platforms:
        item = data.get(key)
        if not isinstance(item, dict):
            continue
        recs = item.get("recommendations") or []
        rec_text = "; ".join(str(x) for x in recs[:3]) if recs else "None"
        signal_rows.append([
            Paragraph(escape(name), st["cellbold"]),
            Paragraph(safe(item.get("score")), st["cell"]),
            Paragraph("Yes" if item.get("author") else "No", st["cell"]),
            Paragraph("Yes" if item.get("schema") else "No", st["cell"]),
            Paragraph(escape(rec_text), st["cell"]),
        ])

    if len(signal_rows) > 1:
        story.append(table(
            signal_rows,
            [34*mm, 20*mm, 20*mm, 20*mm, 66*mm]
        ))

    # -----------------------------------------------------
    # ENTITIES
    # -----------------------------------------------------

    entities = data.get("entities")
    if isinstance(entities, dict):
        story += section("Entity & Topic Signals", st)
        story.append(metric_rows([
            ("Entity Count", entities.get("count")),
            ("Organizations", ", ".join(map(str, (entities.get("organizations") or [])[:15])) or "-"),
            ("Services", ", ".join(map(str, (entities.get("services") or [])[:15])) or "-"),
            ("Topics", ", ".join(map(str, (entities.get("topics") or [])[:15])) or "-"),
        ], st))

        top = entities.get("top_entities") or []
        if top:
            story.append(Spacer(1, 6*mm))
            story.append(Paragraph("Top Detected Entities", st["sub"]))
            story.append(Paragraph(
                escape(", ".join(map(str, top[:50]))),
                st["small"]
            ))

    # -----------------------------------------------------
    # LLMs.TXT
    # -----------------------------------------------------

    llms = data.get("llms")
    if isinstance(llms, dict):
        story += section("LLMs.txt", st)
        story.append(metric_rows([
            ("Exists", "Yes" if llms.get("exists") else "No"),
            ("URL", llms.get("url")),
            ("Size", f"{llms.get('size', '-')} bytes"),
            ("Preview", llms.get("preview")),
        ], st))

    # -----------------------------------------------------
    # PRIORITY RECOMMENDATIONS
    # -----------------------------------------------------

    story += section("Priority Recommendations", st)

    recommendations = []
    if isinstance(eeat, dict):
        recommendations += eeat.get("recommendations") or []

    for _, key in platforms:
        item = data.get(key)
        if isinstance(item, dict):
            recommendations += item.get("recommendations") or []

    unique = []
    for r in recommendations:
        text = str(r).strip()
        if text and text not in unique:
            unique.append(text)

    if unique:
        for i, r in enumerate(unique, 1):
            story.append(Paragraph(
                f"<b>{i}.</b> {escape(r)}", st["body"]
            ))
    else:
        story.append(Paragraph(
            "No specific recommendations were returned by the analyzer.",
            st["body"]
        ))

    story.append(Spacer(1, 6*mm))
    story.append(Paragraph(
        "Report notes", st["sub"]
    ))
    story.append(Paragraph(
        "This report reflects the analysis data stored for the selected "
        "analysis record. Scores and findings should be interpreted in "
        "the context of the analyzed website and the time of analysis.",
        st["body"]
    ))
    story.append(Paragraph(
        f"Analysis #{analysis.id} • Generated {escape(date_text)}",
        st["small"]
    ))

    try:
        doc.build(
            story,
            onFirstPage=footer,
            onLaterPages=footer,
        )
    except Exception as e:
        print("PDF GENERATION ERROR:", repr(e))
        raise HTTPException(
            status_code=500,
            detail="Unable to generate PDF report.",
        )

    pdf_data = buffer.getvalue()
    buffer.close()

    filename = f"AI-Visibility-Analysis-{analysis.id}.pdf"

    return Response(
        content=pdf_data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        },
    )