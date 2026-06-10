from datetime import datetime
from . import db

class Message(db.Model):
    __tablename__ = "messages"

    id              = db.Column(db.Integer, primary_key=True)
    session_id      = db.Column(db.Text, db.ForeignKey("sessions.session_id"), nullable=False)
    sender          = db.Column(db.Text, nullable=False)   # 'user' or 'bot'
    content         = db.Column(db.Text, nullable=False)
    emotion         = db.Column(db.Text, nullable=True)
    emotion_score   = db.Column(db.Float, nullable=True)
    is_crisis       = db.Column(db.Integer, default=0)
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)

    reaction        = db.relationship("Reaction", backref="message", uselist=False, lazy=True)

    def to_dict(self):
        return {
            "id":            self.id,
            "session_id":    self.session_id,
            "sender":        self.sender,
            "content":       self.content,
            "emotion":       self.emotion,
            "emotion_score": self.emotion_score,
            "is_crisis":     bool(self.is_crisis),
            "created_at":    self.created_at.isoformat()
        }