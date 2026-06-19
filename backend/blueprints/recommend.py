from flask import Blueprint, jsonify
from blueprints.predict_linear import run_linear
from blueprints.predict_arima import run_arima
from blueprints.predict_lstm import run_lstm
from blueprints.sentiment import run_sentiment
from utils.validators import validate_ticker

recommend_bp = Blueprint("recommend", __name__)

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

    return jsonify({
        "ticker": ticker,
        "linear": lin, "arima": arima, "lstm": lstm, "sentiment": sent,
        "verdict": verdict,
        "models_used": len(successful_models)
    })