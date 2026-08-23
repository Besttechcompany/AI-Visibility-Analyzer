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

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
    KeepTogether,
)

router = APIRouter()

# =========================================================
# BRAND / REPORT COLORS
# =========================================================

NAVY = colors.HexColor("#0F172A")
BLUE = colors.HexColor("#2563EB")
LIGHT_BLUE = colors.HexColor("#EFF6FF")
PALE_BLUE = colors.HexColor("#F8FAFC")
BORDER = colors.HexColor("#D8E1EC")
TEXT = colors.HexColor("#1E293B")
MUTED = colors.HexColor("#64748B")
GREEN = colors.HexColor("#15803D")
AMBER = colors.HexColor("#B45309")
RED = colors.HexColor("#B91C1C")
WHITE = colors.white


class WebsiteRequest(BaseModel):
    url: str


# =========================================================
# ANALYSIS
# =========================================================

@router.post("/analyze")
def analyze(
    request: WebsiteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        result = WebsiteAnalyzer.analyze(request.url)

        history = AnalysisHistory(
            user_id=current_user.id,
            website_url=request.url,
            analysis_data=jsonable_encoder(result),
        )

        db.add(history)
        db.commit()
        db.refresh(history)

        return result

    except Exception as exc:
        db.rollback()
        print("ANALYSIS HISTORY SAVE ERROR:", repr(exc))
        raise HTTPException(
            status_code=500,
            detail="Analysis completed but could not be saved to history.",
        )


# =========================================================
# ANALYSIS HISTORY
# =========================================================

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
                    "id": item.id,
                    "website_url": item.website_url,
                    "analysis_data": item.analysis_data,
                    "created_at": item.created_at,
                }
                for item in history
            ],
        }

    except Exception as exc:
        print("HISTORY FETCH ERROR:", repr(exc))
        raise HTTPException(
            status_code=500,
            detail="Unable to load analysis history.",
        )


# =========================================================
# SAFE HELPERS
# =========================================================

def safe(value, default="-"):
    if value is None or value == "":
        return default
    if isinstance(value, bool):
        return "Yes" if value else "No"
    return escape(str(value))


def number(value):
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def score_colour(value):
    value = number(value)

    if value is None:
        return MUTED
    if value >= 80:
        return GREEN
    if value >= 60:
        return BLUE
    if value >= 40:
        return AMBER
    return RED


def score_label(value):
    value = number(value)

    if value is None:
        return "Not available"
    if value >= 80:
        return "Strong"
    if value >= 60:
        return "Good"
    if value >= 40:
        return "Needs Improvement"
    return "Low"


# =========================================================
# REPORT STYLES
# =========================================================

def report_styles():
    base = getSampleStyleSheet()

    return {
        "cover_brand": ParagraphStyle(
            "CoverBrand",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=12,
            textColor=BLUE,
            alignment=TA_CENTER,
            spaceAfter=4,
        ),

        "cover_title": ParagraphStyle(
            "CoverTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=26,
            leading=32,
            textColor=NAVY,
            alignment=TA_CENTER,
        ),

        "cover_subtitle": ParagraphStyle(
            "CoverSubtitle",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=10,
            leading=15,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),

        "section": ParagraphStyle(
            "Section",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=17,
            leading=21,
            textColor=NAVY,
            spaceBefore=2,
            spaceAfter=8,
            keepWithNext=True,
        ),

        "subsection": ParagraphStyle(
            "Subsection",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=BLUE,
            spaceBefore=5,
            spaceAfter=5,
            keepWithNext=True,
        ),

        "body": ParagraphStyle(
            "Body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.8,
            leading=13,
            textColor=TEXT,
            spaceAfter=4,
        ),

        "small": ParagraphStyle(
            "Small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7.2,
            leading=9.5,
            textColor=MUTED,
        ),

        "cell": ParagraphStyle(
            "Cell",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7.5,
            leading=9.5,
            textColor=TEXT,
        ),

        "cell_bold": ParagraphStyle(
            "CellBold",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=7.5,
            leading=9.5,
            textColor=NAVY,
        ),

        "score": ParagraphStyle(
            "Score",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=12,
            alignment=TA_CENTER,
        ),
    }


# =========================================================
# TABLE HELPERS
# =========================================================

def styled_table(rows, widths, header=True, repeat_header=True):
    table = Table(
        rows,
        colWidths=widths,
        repeatRows=1 if header and repeat_header else 0,
        hAlign="CENTER",
    )

    commands = [
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]

    if header:
        commands.extend([
            ("BACKGROUND", (0, 0), (-1, 0), NAVY),
            ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ])

        for row in range(1, len(rows)):
            if row % 2 == 0:
                commands.append(
                    ("BACKGROUND", (0, row), (-1, row), PALE_BLUE)
                )

    table.setStyle(TableStyle(commands))
    return table


def metric_table(items, st):
    rows = [
        [
            Paragraph("Metric", st["cell_bold"]),
            Paragraph("Result", st["cell_bold"]),
        ]
    ]

    for label, value in items:
        rows.append([
            Paragraph(escape(str(label)), st["cell_bold"]),
            Paragraph(safe(value), st["cell"]),
        ])

    return styled_table(rows, [55 * mm, 115 * mm])


def section_title(title, st):
    return [
        Spacer(1, 2 * mm),
        Paragraph(escape(title), st["section"]),
    ]


# =========================================================
# PAGE HEADER / FOOTER
# =========================================================

def draw_page_frame(canvas, doc):
    canvas.saveState()

    width, height = A4

    # Top brand line
    canvas.setStrokeColor(BLUE)
    canvas.setLineWidth(1.4)
    canvas.line(18 * mm, height - 14 * mm, width - 18 * mm, height - 14 * mm)

    canvas.setFillColor(NAVY)
    canvas.setFont("Helvetica-Bold", 8)
    canvas.drawString(
        18 * mm,
        height - 10 * mm,
        "AI VISIBILITY ANALYZER",
    )

    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawRightString(
        width - 18 * mm,
        height - 10 * mm,
        "AI Visibility Analysis Report",
    )

    # Bottom line
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.5)
    canvas.line(18 * mm, 13 * mm, width - 18 * mm, 13 * mm)

    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7)
    canvas.drawString(
        18 * mm,
        8 * mm,
        "Prepared by AI Visibility Analyzer",
    )
    canvas.drawRightString(
        width - 18 * mm,
        8 * mm,
        f"Page {doc.page}",
    )

    canvas.restoreState()


# =========================================================
# PDF REPORT
# =========================================================

@router.get("/analysis/{analysis_id}/pdf")
def download_analysis_pdf(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
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

    data = analysis.analysis_data or {}
    st = report_styles()
    buffer = BytesIO()

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

    created = analysis.created_at

    try:
        date_text = created.strftime("%d %B %Y, %I:%M %p")
    except Exception:
        date_text = str(created or "N/A")

    # =====================================================
    # COVER PAGE
    # =====================================================

    story.append(Spacer(1, 24 * mm))
    story.append(Paragraph("AI VISIBILITY ANALYZER", st["cover_brand"]))
    story.append(Spacer(1, 4 * mm))

    story.append(
        Paragraph(
            "AI Visibility<br/>Analysis Report",
            st["cover_title"],
        )
    )

    story.append(Spacer(1, 6 * mm))

    story.append(
        Paragraph(
            "Professional website visibility, AI platform, "
            "E-E-A-T and technical analysis",
            st["cover_subtitle"],
        )
    )

    story.append(Spacer(1, 18 * mm))

    # Cover information card
    cover_rows = [
        [
            Paragraph("WEBSITE", st["cell_bold"]),
            Paragraph(safe(analysis.website_url), st["cell"]),
        ],
        [
            Paragraph("ANALYSIS ID", st["cell_bold"]),
            Paragraph(str(analysis.id), st["cell"]),
        ],
        [
            Paragraph("GENERATED", st["cell_bold"]),
            Paragraph(escape(date_text), st["cell"]),
        ],
        [
            Paragraph("STATUS", st["cell_bold"]),
            Paragraph("Completed", st["cell"]),
        ],
    ]

    cover_table = Table(
        cover_rows,
        colWidths=[42 * mm, 123 * mm],
        hAlign="CENTER",
    )

    cover_table.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
            ("BACKGROUND", (1, 0), (1, -1), WHITE),
            ("BOX", (0, 0), (-1, -1), 0.8, BORDER),
            ("INNERGRID", (0, 0), (-1, -1), 0.45, BORDER),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ])
    )

    story.append(cover_table)
    story.append(Spacer(1, 20 * mm))

    story.append(
        Paragraph(
            "Confidential analysis report",
            ParagraphStyle(
                "Confidential",
                parent=st["small"],
                alignment=TA_CENTER,
                textColor=MUTED,
            ),
        )
    )

    story.append(PageBreak())

    # =====================================================
    # EXECUTIVE SUMMARY
    # =====================================================

    story += section_title("Executive Summary", st)

    story.append(
        Paragraph(
            "This report presents a structured analysis of the submitted "
            "website across AI visibility, E-E-A-T signals, technical SEO "
            "indicators and website-level content signals captured by the "
            "AI Visibility Analyzer.",
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
            value = number(item.get("score"))
            if value is not None:
                scores.append(value)

    eeat = data.get("eeat")
    if isinstance(eeat, dict):
        value = number(eeat.get("score"))
        if value is not None:
            scores.append(value)

    overall = round(sum(scores) / len(scores)) if scores else None

    story.append(Spacer(1, 5 * mm))

    overall_text = str(overall) if overall is not None else "—"
    overall_color = score_colour(overall)

    score_card = Table(
        [[
            Paragraph(
                "OVERALL VISIBILITY SCORE<br/>"
                f"<font size='30'>{overall_text}</font><br/>"
                f"<font size='9'>{escape(score_label(overall))}</font>",
                ParagraphStyle(
                    "OverallScore",
                    parent=st["body"],
                    alignment=TA_CENTER,
                    textColor=WHITE,
                    leading=20,
                ),
            )
        ]],
        colWidths=[72 * mm],
        rowHeights=[42 * mm],
        hAlign="CENTER",
    )

    score_card.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), overall_color),
            ("BOX", (0, 0), (-1, -1), 0.8, overall_color),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )

    story.append(score_card)
    story.append(Spacer(1, 7 * mm))

    # =====================================================
    # AI PLATFORM VISIBILITY
    # =====================================================

    story += section_title("AI Platform Visibility", st)

    platform_rows = [[
        Paragraph("AI Platform", st["cell"]),
        Paragraph("Score", st["cell"]),
        Paragraph("Assessment", st["cell"]),
    ]]

    for name, key in platforms:
        item = data.get(key)

        if not isinstance(item, dict):
            continue

        current_score = number(item.get("score"))

        platform_rows.append([
            Paragraph(escape(name), st["cell_bold"]),
            Paragraph(
                safe(item.get("score")),
                ParagraphStyle(
                    "PlatformScore",
                    parent=st["cell"],
                    alignment=TA_CENTER,
                    fontName="Helvetica-Bold",
                    textColor=score_colour(current_score),
                ),
            ),
            Paragraph(
                escape(score_label(current_score)),
                st["cell"],
            ),
        ])

    if len(platform_rows) > 1:
        story.append(
            styled_table(
                platform_rows,
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

    # =====================================================
    # E-E-A-T
    # =====================================================

    story += section_title("E-E-A-T Analysis", st)

    if isinstance(eeat, dict):
        story.append(
            Paragraph(
                f"E-E-A-T score: "
                f"<b>{safe(eeat.get('score'), 'Not available')}</b>",
                st["body"],
            )
        )

        eeat_rows = [[
            Paragraph("Signal", st["cell"]),
            Paragraph("Status", st["cell"]),
        ]]

        for label, key in [
            ("Author", "author"),
            ("About", "about"),
            ("Contact", "contact"),
            ("Privacy Policy", "privacy"),
            ("Terms & Conditions", "terms"),
        ]:
            present = bool(eeat.get(key))

            eeat_rows.append([
                Paragraph(label, st["cell_bold"]),
                Paragraph(
                    "✓ Present" if present else "✗ Missing",
                    ParagraphStyle(
                        f"Eeat_{key}",
                        parent=st["cell"],
                        fontName="Helvetica-Bold",
                        textColor=GREEN if present else RED,
                    ),
                ),
            ])

        story.append(
            styled_table(
                eeat_rows,
                [85 * mm, 75 * mm],
            )
        )

        recommendations = eeat.get("recommendations") or []

        if recommendations:
            story.append(Spacer(1, 5 * mm))
            story.append(
                Paragraph(
                    "Recommendations",
                    st["subsection"],
                )
            )

            for recommendation in recommendations:
                story.append(
                    Paragraph(
                        f"• {safe(recommendation)}",
                        st["body"],
                    )
                )

    # =====================================================
    # TECHNICAL SEO
    # =====================================================

    story += section_title("Technical SEO", st)

    technical = data.get("technical_seo", {})

    if isinstance(technical, dict):
        story.append(
            metric_table(
                [
                    ("HTTPS", "Yes" if technical.get("https") else "No"),
                    ("HTTP Status Code", technical.get("status_code")),
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
                        "Yes" if technical.get("redirected") else "No",
                    ),
                    (
                        "Robots.txt",
                        "Yes" if technical.get("robots_txt") else "No",
                    ),
                    (
                        "Sitemap",
                        "Yes" if technical.get("sitemap") else "No",
                    ),
                    ("Final URL", technical.get("final_url")),
                ],
                st,
            )
        )

    audit = data.get("audit", {})

    if isinstance(audit, dict):
        story.append(Spacer(1, 6 * mm))
        story.append(
            Paragraph(
                "On-Page Audit",
                st["subsection"],
            )
        )

        story.append(
            metric_table(
                [
                    (
                        "Meta Description",
                        "Yes" if audit.get("meta_description") else "No",
                    ),
                    (
                        "Canonical",
                        "Yes" if audit.get("canonical") else "No",
                    ),
                    (
                        "Robots",
                        "Yes" if audit.get("robots") else "No",
                    ),
                    ("H1 Count", audit.get("h1_count")),
                    ("Total Images", audit.get("images")),
                    (
                        "Images Without Alt",
                        audit.get("images_without_alt"),
                    ),
                    ("Total Links", audit.get("total_links")),
                ],
                st,
            )
        )

    story.append(PageBreak())

    # =====================================================
    # AI CONTENT SIGNALS
    # =====================================================

    story += section_title("AI Content Signals", st)

    signal_rows = [[
        Paragraph("Platform", st["cell"]),
        Paragraph("Score", st["cell"]),
        Paragraph("Author", st["cell"]),
        Paragraph("Schema", st["cell"]),
        Paragraph("Recommendations", st["cell"]),
    ]]

    for name, key in platforms:
        item = data.get(key)

        if not isinstance(item, dict):
            continue

        recommendations = item.get("recommendations") or []
        recommendation_text = (
            "; ".join(str(x) for x in recommendations[:3])
            if recommendations
            else "None"
        )

        signal_rows.append([
            Paragraph(escape(name), st["cell_bold"]),
            Paragraph(safe(item.get("score")), st["cell"]),
            Paragraph(
                "Yes" if item.get("author") else "No",
                st["cell"],
            ),
            Paragraph(
                "Yes" if item.get("schema") else "No",
                st["cell"],
            ),
            Paragraph(
                escape(recommendation_text),
                st["cell"],
            ),
        ])

    if len(signal_rows) > 1:
        story.append(
            styled_table(
                signal_rows,
                [34 * mm, 20 * mm, 20 * mm, 20 * mm, 66 * mm],
            )
        )

    # =====================================================
    # ENTITY SIGNALS
    # =====================================================

    entities = data.get("entities")

    if isinstance(entities, dict):
        story += section_title("Entity & Topic Signals", st)

        story.append(
            metric_table(
                [
                    ("Entity Count", entities.get("count")),
                    (
                        "Organizations",
                        ", ".join(
                            map(
                                str,
                                (entities.get("organizations") or [])[:15],
                            )
                        ) or "-",
                    ),
                    (
                        "Services",
                        ", ".join(
                            map(
                                str,
                                (entities.get("services") or [])[:15],
                            )
                        ) or "-",
                    ),
                    (
                        "Topics",
                        ", ".join(
                            map(
                                str,
                                (entities.get("topics") or [])[:15],
                            )
                        ) or "-",
                    ),
                ],
                st,
            )
        )

        top_entities = entities.get("top_entities") or []

        if top_entities:
            story.append(Spacer(1, 5 * mm))
            story.append(
                Paragraph(
                    "Top Detected Entities",
                    st["subsection"],
                )
            )
            story.append(
                Paragraph(
                    escape(", ".join(map(str, top_entities[:50]))),
                    st["small"],
                )
            )

    # =====================================================
    # LLMS.TXT
    # =====================================================

    llms = data.get("llms")

    if isinstance(llms, dict):
        story += section_title("LLMs.txt", st)

        story.append(
            metric_table(
                [
                    (
                        "Exists",
                        "Yes" if llms.get("exists") else "No",
                    ),
                    ("URL", llms.get("url")),
                    ("Size", f"{llms.get('size', '-')} bytes"),
                    ("Preview", llms.get("preview")),
                ],
                st,
            )
        )

    # =====================================================
    # PRIORITY RECOMMENDATIONS
    # =====================================================

    story += section_title("Priority Recommendations", st)

    recommendations = []

    if isinstance(eeat, dict):
        recommendations.extend(
            eeat.get("recommendations") or []
        )

    for _, key in platforms:
        item = data.get(key)

        if isinstance(item, dict):
            recommendations.extend(
                item.get("recommendations") or []
            )

    unique_recommendations = []

    for recommendation in recommendations:
        text = str(recommendation).strip()

        if text and text not in unique_recommendations:
            unique_recommendations.append(text)

    if unique_recommendations:
        for index, recommendation in enumerate(
            unique_recommendations,
            1,
        ):
            story.append(
                Paragraph(
                    f"<b>{index}.</b> {escape(recommendation)}",
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

    # =====================================================
    # REPORT NOTES
    # =====================================================

    story.append(Spacer(1, 5 * mm))
    story.append(
        Paragraph(
            "Report Notes",
            st["subsection"],
        )
    )

    story.append(
        Paragraph(
            "This report reflects the analysis data stored for the "
            "selected analysis record. Scores and findings should be "
            "interpreted in the context of the analyzed website and "
            "the time of analysis.",
            st["body"],
        )
    )

    story.append(
        Paragraph(
            f"Analysis #{analysis.id} • Generated {escape(date_text)}",
            st["small"],
        )
    )

    # =====================================================
    # BUILD PDF
    # =====================================================

    try:
        doc.build(
            story,
            onFirstPage=draw_page_frame,
            onLaterPages=draw_page_frame,
        )

    except Exception as exc:
        print("PDF GENERATION ERROR:", repr(exc))
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
            "Content-Disposition": (
                f'attachment; filename="{filename}"'
            )
        },
    )