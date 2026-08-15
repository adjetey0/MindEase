from datetime import datetime
from . import db
import bcrypt


class User(db.Model):
    __tablename__ = "users"

    id              = db.Column(db.Integer, primary_key=True)
    email           = db.Column(db.Text, unique=True, nullable=False)
    password_hash   = db.Column(db.Text, nullable=True)  # null for OAuth users
    full_name       = db.Column(db.Text, nullable=True)
    avatar_url      = db.Column(db.Text, nullable=True)
    provider        = db.Column(db.Text, default="email")  # 'email', 'google', 'apple'
    provider_id     = db.Column(db.Text, nullable=True)    # Google/Apple user ID
    is_verified     = db.Column(db.Integer, default=0)     # email verified
    created_at      = db.Column(db.DateTime, default=datetime.utcnow)
    last_login      = db.Column(db.DateTime, nullable=True)

    def set_password(self, password: str):
        """Hash and store password."""
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

    def check_password(self, password: str) -> bool:
        """Verify password against hash."""
        if not self.password_hash:
            return False
        return bcrypt.checkpw(
            password.encode("utf-8"),
            self.password_hash.encode("utf-8")
        )

    def to_dict(self):
        return {
            "id":           self.id,
            "email":        self.email,
            "full_name":    self.full_name,
            "avatar_url":   self.avatar_url,
            "provider":     self.provider,
            "is_verified":  bool(self.is_verified),
            "created_at":   self.created_at.isoformat()
        }