from flask import Blueprint, jsonify
from datetime import datetime, timedelta
from extensions import db
from models.prediction_log import PredictionLog
from blueprints.predict_linear import run_linear
from blueprints.predict_arima import run_arima
from blueprints.predict_lstm import run_lstm
from blueprints.sentiment import run_sentiment
from utils.validators import validate_ticker

recommend_bp = Blueprint("recommend", __name__)


def compute_ensemble(models):
    """Weighted average forecast, weight = 1/RMSE (lower error = more weight)."""
    valid = [m for m in models if "forecast" in m and m.get("rmse", 0) > 0]
    if not valid:
        return None

    weights = [1 / m["rmse"] for m in valid]
    total_weight = sum(weights)

    ensemble_forecast = []
    for day in range(7):
        weighted_sum = sum(m["forecast"][day] * w for m, w in zip(valid, weights))
        ensemble_forecast.append(round(weighted_sum / total_weight, 2))

    return ensemble_forecast


def log_predictions(ticker, lin, arima, lstm):
    """Store each day's forecast so accuracy can be checked later."""
    try:
        today = datetime.utcnow().date()
        for model_data, name in [(lin, "Linear Regression"), (arima, "ARIMA"), (lstm, "LSTM")]:
            if "forecast" in model_data:
                for i, val in enumerate(model_data["forecast"]):
                    target_date = today + timedelta(days=i + 1)
                    log = PredictionLog(
                        ticker=ticker,
                        model_name=name,
                        predicted_value=val,
                        target_date=target_date
                    )
                    db.session.add(log)
        db.session.commit()
    except Exception:
        db.session.rollback()  # don't fail the whole request if logging fails


@recommend_bp.route("/api/recommend/<ticker>")
def recommend(ticker):
    ticker = ticker.upper()
    is_valid, error = validate_ticker(ticker)
    if not is_valid:
        return jsonify({"error": error}), 400

    lin = run_linear(ticker)
    arima = run_arima(ticker)
    lstm = run_lstm(ticker)
    sent = run_sentiment(ticker)

    successful_models = [m for m in [lin, arima, lstm] if "forecast" in m]
    if not successful_models:
        return jsonify({"error": "All prediction models failed for this ticker."}), 500

    ensemble_forecast = compute_ensemble(successful_models)

    def trend(forecast):
        return 1 if forecast[-1] > forecast[0] else -1

    votes = sum(trend(m["forecast"]) for m in successful_models)
    sentiment_score = sent.get("sentiment_score", 0)
    final_score = votes + (sentiment_score * 2)

    if final_score > 1:
        verdict = "Likely to Rise"
    elif final_score < -1:
        verdict = "Likely to Fall"
    else:
        verdict = "Uncertain / Hold"

    best_model = min(successful_models, key=lambda m: m.get("rmse", 999))

    log_predictions(ticker, lin, arima, lstm)

    return jsonify({
        "ticker": ticker,
        "linear": lin,
        "arima": arima,
        "lstm": lstm,
        "sentiment": sent,
        "verdict": verdict,
        "models_used": len(successful_models),
        "ensemble_forecast": ensemble_forecast,
        "best_model": best_model.get("model") if "model" in best_model else None
    })