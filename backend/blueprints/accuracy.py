from flask import Blueprint, jsonify
from extensions import db
from models.prediction_log import PredictionLog
from datetime import datetime
import yfinance as yf
import pandas as pd

accuracy_bp = Blueprint("accuracy", __name__)

@accuracy_bp.route("/api/accuracy/check", methods=["POST"])
def check_predictions():
    """Find predictions whose target_date has passed, fetch actual price, compare."""
    today = datetime.utcnow().date()
    pending = PredictionLog.query.filter(
        PredictionLog.target_date <= today, PredictionLog.checked == False
    ).all()

    updated = 0
    tickers_needed = list(set(p.ticker for p in pending))
    price_cache = {}

    for t in tickers_needed:
        try:
            data = yf.download(t, period="14d", interval="1d", progress=False)
            if isinstance(data.columns, pd.MultiIndex):
                data.columns = data.columns.get_level_values(0)
            for idx, row in data.iterrows():
                price_cache[(t, idx.date())] = float(row["Close"])
        except Exception:
            continue

    for p in pending:
        key = (p.ticker, p.target_date)
        if key in price_cache:
            p.actual_value = price_cache[key]
            p.checked = True
            updated += 1

    db.session.commit()
    return jsonify({"message": f"Checked {len(pending)} predictions, updated {updated}."})

@accuracy_bp.route("/api/accuracy/summary")
def accuracy_summary():
    logs = PredictionLog.query.filter(PredictionLog.checked == True).all()
    if not logs:
        return jsonify({"summary": [], "message": "No checked predictions yet."})

    summary = {}
    for log in logs:
        key = log.model_name
        if key not in summary:
            summary[key] = {"errors": [], "count": 0}
        error_pct = abs(log.actual_value - log.predicted_value) / log.actual_value * 100
        summary[key]["errors"].append(error_pct)
        summary[key]["count"] += 1

    result = []
    for model_name, data in summary.items():
        avg_error = round(sum(data["errors"]) / len(data["errors"]), 2)
        result.append({"model": model_name, "avg_error_pct": avg_error, "predictions_checked": data["count"]})

    result.sort(key=lambda x: x["avg_error_pct"])
    return jsonify({"summary": result})

@accuracy_bp.route("/api/accuracy/recent/<ticker>")
def recent_accuracy(ticker):
    logs = PredictionLog.query.filter_by(ticker=ticker.upper(), checked=True)\
        .order_by(PredictionLog.target_date.desc()).limit(20).all()
    return jsonify({"logs": [l.to_dict() for l in logs]})