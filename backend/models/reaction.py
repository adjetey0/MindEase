from datetime import datetime
from . import db

class Reaction(db.Model):
    __tablename__ = "reactions"

    id          = db.Column(db.Integer, primary_key=True)
    message_id  = db.Column(db.Integer, db.ForeignKey("messages.id"), nullable=False)
    reaction    = db.Column(db.Text, nullable=False)   # 'up' or 'down'
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id":         self.id,
            "message_id": self.message_id,
            "reaction":   self.reaction,
            "created_at": self.created_at.isoformat()
        }