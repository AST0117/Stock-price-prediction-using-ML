from extensions import db
from datetime import datetime

class PredictionLog(db.Model):
    __tablename__ = "prediction_logs"

    id = db.Column(db.Integer, primary_key=True)
    ticker = db.Column(db.String(20), nullable=False)
    model_name = db.Column(db.String(50), nullable=False)
    predicted_value = db.Column(db.Float, nullable=False)
    target_date = db.Column(db.Date, nullable=False)  # the date this prediction was FOR
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    actual_value = db.Column(db.Float, nullable=True)  # filled in later
    checked = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "id": self.id, "ticker": self.ticker, "model_name": self.model_name,
            "predicted_value": self.predicted_value, "target_date": str(self.target_date),
            "actual_value": self.actual_value, "checked": self.checked,
            "error_pct": round(abs(self.actual_value - self.predicted_value) / self.actual_value * 100, 2)
                if self.actual_value else None
        }