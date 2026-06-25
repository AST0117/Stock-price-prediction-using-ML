from flask import Blueprint, jsonify
import yfinance as yf
import pandas as pd
from pmdarima import auto_arima
from sklearn.metrics import mean_squared_error
from math import sqrt
from utils.validators import validate_ticker

predict_arima_bp = Blueprint("predict_arima", __name__)

def run_arima(ticker):
    try:
        data = yf.download(ticker, period="6mo", interval="1d", progress=False)
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)
        if data.empty or len(data) < 40:
            return {"error": "Not enough data for ARIMA"}

        closes = data["Close"].dropna()

        # Backtest
        train = closes[:-7]
        actual_last7 = closes[-7:].values
        backtest_model = auto_arima(train, seasonal=False, suppress_warnings=True)
        backtest_pred = backtest_model.predict(n_periods=7)
        rmse = round(sqrt(mean_squared_error(actual_last7, backtest_pred)), 2)

        # Real forecast
        model = auto_arima(closes, seasonal=False, suppress_warnings=True)
        forecast = model.predict(n_periods=7)
        forecast = [round(float(v), 2) for v in forecast]

        return {"ticker": ticker, "model": "ARIMA", "forecast": forecast, "rmse": rmse}
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