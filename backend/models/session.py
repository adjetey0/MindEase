from datetime import datetime
from . import db

class Session(db.Model):
    __tablename__ = "sessions"

    id          = db.Column(db.Integer, primary_key=True)
    session_id  = db.Column(db.Text, unique=True, nullable=False)
    language    = db.Column(db.Text, default="en")
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen   = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    messages    = db.relationship("Message", backref="session", lazy=True)
    mood_logs   = db.relationship("MoodLog", backref="session", lazy=True)

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "language":   self.language,
            "created_at": self.created_at.isoformat(),
            "last_seen":  self.last_seen.isoformat()
        }