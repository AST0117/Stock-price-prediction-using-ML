from flask import Blueprint, jsonify
import yfinance as yf
from utils.validators import validate_ticker
import pandas as pd
live_price_bp = Blueprint("live_price", __name__)

@live_price_bp.route("/api/stock/<ticker>/price")
def get_live_price(ticker):
    ticker = ticker.upper()
    is_valid, error = validate_ticker(ticker)
    if not is_valid:
        return jsonify({"error": error}), 400

    try:
        stock = yf.Ticker(ticker)
        info = stock.fast_info  # lighter weight than .info

        price = info.get("lastPrice")
        prev_close = info.get("previousClose")
        change = None
        change_pct = None
        if price is not None and prev_close:
            change = round(price - prev_close, 2)
            change_pct = round((change / prev_close) * 100, 2)

        return jsonify({
            "ticker": ticker,
            "price": round(float(price), 2) if price else None,
            "previous_close": round(float(prev_close), 2) if prev_close else None,
            "change": change,
            "change_pct": change_pct,
            "currency": info.get("currency", "USD"),
            "day_high": round(float(info.get("dayHigh")), 2) if info.get("dayHigh") else None,
            "day_low": round(float(info.get("dayLow")), 2) if info.get("dayLow") else None,
            "volume": int(info.get("lastVolume")) if info.get("lastVolume") else None
        })
    except Exception as e:
        return jsonify({"error": f"Failed to fetch live price: {str(e)}"}), 500