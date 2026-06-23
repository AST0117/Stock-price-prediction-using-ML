from flask import Blueprint, jsonify
import yfinance as yf
from pmdarima import auto_arima
from utils.validators import validate_ticker
import pandas as pd
predict_arima_bp = Blueprint("predict_arima", __name__)

def run_arima(ticker):
    try:
        data = yf.download(ticker, period="6mo", interval="1d", progress=False)
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)
        if data.empty or len(data) < 30:
            return {"error": "Not enough data for ARIMA"}

        closes = data["Close"].dropna()
        model = auto_arima(closes, seasonal=False, suppress_warnings=True)
        forecast = model.predict(n_periods=7)
        forecast = [round(float(v), 2) for v in forecast]
        return {"ticker": ticker, "model": "ARIMA", "forecast": forecast}
    except Exception as e:
        return {"error": f"ARIMA failed: {str(e)}"}

@predict_arima_bp.route("/api/predict/arima/<ticker>")
def predict_arima(ticker):
    ticker = ticker.upper()
    is_valid, error = validate_ticker(ticker)
    if not is_valid:
        return jsonify({"error": error}), 400

    result = run_arima(ticker)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)