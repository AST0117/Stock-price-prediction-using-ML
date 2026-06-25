from flask import Blueprint, jsonify
import numpy as np
import pandas as pd
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error
from math import sqrt
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from utils.validators import validate_ticker

predict_lstm_bp = Blueprint("predict_lstm", __name__)
LOOKBACK = 60

def _train_and_predict(scaled, lookback, epochs=10):
    X, y = [], []
    for i in range(lookback, len(scaled)):
        X.append(scaled[i - lookback:i, 0])
        y.append(scaled[i, 0])
    X, y = np.array(X), np.array(y)
    X = X.reshape(X.shape[0], X.shape[1], 1)

    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(lookback, 1)),
        LSTM(50),
        Dense(1)
    ])
    model.compile(optimizer="adam", loss="mean_squared_error")
    model.fit(X, y, epochs=epochs, batch_size=32, verbose=0)
    return model

def run_lstm(ticker):
    try:
        data = yf.download(ticker, period="1y", interval="1d", progress=False)
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)
        if data.empty or len(data) < LOOKBACK + 14:
            return {"error": "Not enough historical data for LSTM (needs 1+ year)"}

        closes = data["Close"].values.reshape(-1, 1)
        scaler = MinMaxScaler()
        scaled_full = scaler.fit_transform(closes)

        # Backtest: train on all but last 7 days, predict those 7, compare
        scaled_train = scaled_full[:-7]
        model_bt = _train_and_predict(scaled_train, LOOKBACK, epochs=8)

        window = scaled_train[-LOOKBACK:].reshape(1, LOOKBACK, 1)
        bt_preds_scaled = []
        cur = window.copy()
        for _ in range(7):
            nxt = model_bt.predict(cur, verbose=0)[0, 0]
            bt_preds_scaled.append(nxt)
            cur = np.append(cur[:, 1:, :], [[[nxt]]], axis=1)
        bt_preds = scaler.inverse_transform(np.array(bt_preds_scaled).reshape(-1, 1)).flatten()
        actual_last7 = closes[-7:].flatten()
        rmse = round(sqrt(mean_squared_error(actual_last7, bt_preds)), 2)

        # Real forecast using full data
        model = _train_and_predict(scaled_full, LOOKBACK, epochs=10)
        last_window = scaled_full[-LOOKBACK:].reshape(1, LOOKBACK, 1)
        forecast_scaled = []
        current_window = last_window.copy()
        for _ in range(7):
            next_val = model.predict(current_window, verbose=0)[0, 0]
            forecast_scaled.append(next_val)
            current_window = np.append(current_window[:, 1:, :], [[[next_val]]], axis=1)

        forecast = scaler.inverse_transform(np.array(forecast_scaled).reshape(-1, 1)).flatten()
        forecast = [round(float(v), 2) for v in forecast]

        return {"ticker": ticker, "model": "LSTM", "forecast": forecast, "rmse": rmse}
    except Exception as e:
        return {"error": f"LSTM failed: {str(e)}"}

@predict_lstm_bp.route("/api/predict/lstm/<ticker>")
def predict_lstm(ticker):
    ticker = ticker.upper()
    is_valid, error = validate_ticker(ticker)
    if not is_valid:
        return jsonify({"error": error}), 400
    result = run_lstm(ticker)
    if "error" in result:
        return jsonify(result), 500
    return jsonify(result)