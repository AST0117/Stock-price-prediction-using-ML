from flask import Blueprint, jsonify
import yfinance as yf
from utils.validators import validate_ticker
import pandas as pd

stock_data_bp = Blueprint("stock_data", __name__)

@stock_data_bp.route("/api/stock/<ticker>/history")
def get_history(ticker):
    ticker = ticker.upper()
    is_valid, error = validate_ticker(ticker)
    if not is_valid:
        return jsonify({"error": error}), 400

    try:
        data = yf.download(ticker, period="6mo", interval="1d", progress=False)
        if data.empty:
            return jsonify({"error": f"No historical data available for {ticker}"}), 404

        # Flatten MultiIndex columns if present (newer yfinance versions)
        if isinstance(data.columns, pd.MultiIndex):
            data.columns = data.columns.get_level_values(0)

        result = [
            {
                "date": str(idx.date()),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"])
            }
            for idx, row in data.iterrows()
        ]
        return jsonify({"ticker": ticker, "history": result})
    except Exception as e:
        return jsonify({"error": f"Failed to fetch data: {str(e)}"}), 500