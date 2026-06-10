from datetime import datetime
from . import db
import json

class MoodLog(db.Model):
    __tablename__ = "mood_logs"

    id               = db.Column(db.Integer, primary_key=True)
    session_id       = db.Column(db.Text, db.ForeignKey("sessions.session_id"), nullable=False)
    dominant_emotion = db.Column(db.Text, nullable=False)
    emotion_counts   = db.Column(db.Text, nullable=False)
    message_count    = db.Column(db.Integer, default=0)
    logged_at        = db.Column(db.DateTime, default=datetime.utcnow)

    def get_emotion_counts(self):
        return json.loads(self.emotion_counts)

    def to_dict(self):
        return {
            "id":               self.id,
            "session_id":       self.session_id,
            "dominant_emotion": self.dominant_emotion,
            "emotion_counts":   self.get_emotion_counts(),
            "message_count":    self.message_count,
            "logged_at":        self.logged_at.isoformat()
        }