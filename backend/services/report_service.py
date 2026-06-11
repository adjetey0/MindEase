from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from models import MoodLog
from utils.helpers import format_datetime, emotion_to_emoji
from flask import current_app
from datetime import datetime
from collections import Counter
import os


def generate_pdf_report(session_id: str) -> str:
    """Generate a weekly mood summary PDF and return its file path."""

    output_dir = current_app.config.get("REPORT_OUTPUT_DIR", "/tmp")
    os.makedirs(output_dir, exist_ok=True)
    filename = f"MindEase_Report_{session_id[:8]}_{datetime.now().strftime('%Y%m%d')}.pdf"
    filepath = os.path.join(output_dir, filename)

    doc    = SimpleDocTemplate(filepath, pagesize=A4,
                               rightMargin=2*cm, leftMargin=2*cm,
                               topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story  = []

    # Title
    title_style = ParagraphStyle("Title", parent=styles["Title"],
                                 textColor=colors.HexColor("#2E74B5"), fontSize=22)
    story.append(Paragraph("MindEase — Mental Health Report", title_style))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph(f"Generated: {format_datetime(datetime.now())}", styles["Normal"]))
    story.append(Spacer(1, 0.5*cm))

    # Mood Summary Table
    logs  = MoodLog.query.filter_by(session_id=session_id).order_by(MoodLog.logged_at).all()
    total = Counter()
    for log in logs:
        total.update(log.get_emotion_counts())

    story.append(Paragraph("Emotion Summary", styles["Heading2"]))
    if total:
        table_data = [["Emotion", "Count", "Emoji"]]
        for emotion, count in sorted(total.items(), key=lambda x: -x[1]):
            table_data.append([emotion.capitalize(), str(count), emotion_to_emoji(emotion)])

        table = Table(table_data, colWidths=[5*cm, 3*cm, 3*cm])
        table.setStyle(TableStyle([
            ("BACKGROUND",     (0, 0), (-1, 0), colors.HexColor("#2E74B5")),
            ("TEXTCOLOR",      (0, 0), (-1, 0), colors.white),
            ("FONTNAME",       (0, 0), (-1, 0), "Helvetica-Bold"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#EFF6FF")]),
            ("GRID",           (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ("ALIGN",          (0, 0), (-1, -1), "CENTER"),
            ("VALIGN",         (0, 0), (-1, -1), "MIDDLE"),
        ]))
        story.append(table)
    else:
        story.append(Paragraph("No mood data recorded yet.", styles["Normal"]))

    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph(
        "This report is a summary of your emotional check-ins with MindEase. "
        "If you're struggling, please reach out to a mental health professional.",
        styles["Italic"]
    ))

    doc.build(story)
    return filepath