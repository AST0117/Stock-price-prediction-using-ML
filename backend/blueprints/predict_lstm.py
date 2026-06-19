from flask import Blueprint, jsonify
import numpy as np
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from utils.validators import validate_ticker

predict_lstm_bp = Blueprint("predict_lstm", __name__)
LOOKBACK = 60

def run_lstm(ticker):
    try:
        data = yf.download(ticker, period="1y", interval="1d", progress=False)
        if data.empty or len(data) < LOOKBACK + 7:
            return {"error": "Not enough historical data for LSTM (needs 1+ year)"}

        closes = data["Close"].values.reshape(-1, 1)
        scaler = MinMaxScaler()
        scaled = scaler.fit_transform(closes)

        X, y = [], []
        for i in range(LOOKBACK, len(scaled)):
            X.append(scaled[i - LOOKBACK:i, 0])
            y.append(scaled[i, 0])
        X, y = np.array(X), np.array(y)
        X = X.reshape(X.shape[0], X.shape[1], 1)

        model = Sequential([
            LSTM(50, return_sequences=True, input_shape=(LOOKBACK, 1)),
            LSTM(50),
            Dense(1)
        ])
        model.compile(optimizer="adam", loss="mean_squared_error")
        model.fit(X, y, epochs=10, batch_size=32, verbose=0)

        last_window = scaled[-LOOKBACK:].reshape(1, LOOKBACK, 1)
        forecast_scaled = []
        current_window = last_window.copy()
        for _ in range(7):
            next_val = model.predict(current_window, verbose=0)[0, 0]
            forecast_scaled.append(next_val)
            current_window = np.append(current_window[:, 1:, :], [[[next_val]]], axis=1)

        forecast = scaler.inverse_transform(np.array(forecast_scaled).reshape(-1, 1)).flatten()
        forecast = [round(float(v), 2) for v in forecast]
        return {"ticker": ticker, "model": "LSTM", "forecast": forecast}
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