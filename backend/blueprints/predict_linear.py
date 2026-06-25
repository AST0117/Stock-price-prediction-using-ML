from flask import Blueprint, jsonify
import yfinance as yf
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from math import sqrt
from utils.validators import validate_ticker

predict_linear_bp = Blueprint("predict_linear", __name__)

def run_linear(ticker):
    try:
        data = yf.download(ticker, period="6mo", interval="1d", progress=False)
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)
        if data.empty or len(data) < 20:
            return {"error": "Not enough data for Linear Regression"}

        closes = data["Close"].values.reshape(-1, 1)

        # Backtest: hold out last 7 days to compute RMSE
        train_closes = closes[:-7]
        actual_last7 = closes[-7:].flatten()

        X_train = np.arange(len(train_closes)).reshape(-1, 1)
        backtest_model = LinearRegression().fit(X_train, train_closes)
        X_test = np.arange(len(train_closes), len(train_closes) + 7).reshape(-1, 1)
        backtest_pred = backtest_model.predict(X_test).flatten()
        rmse = round(sqrt(mean_squared_error(actual_last7, backtest_pred)), 2)

        # Real forecast using full data
        X = np.arange(len(closes)).reshape(-1, 1)
        model = LinearRegression().fit(X, closes)
        future_X = np.arange(len(closes), len(closes) + 7).reshape(-1, 1)
        forecast = model.predict(future_X).flatten().round(2).tolist()

        return {"ticker": ticker, "model": "Linear Regression", "forecast": forecast, "rmse": rmse}
    except Exception as e:
        return {"error": f"Linear Regression failed: {str(e)}"}

@predict_linear_bp.route("/api/predict/linear/<ticker>")
def predict_linear(ticker):
    ticker = ticker.upper()
    is_valid, error = validate_ticker(ticker)
    if not is_valid:
        return jsonify({"error": error}), 400
    result = run_linear(ticker)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)