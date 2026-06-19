from flask import Blueprint, send_file, jsonify
import pandas as pd
import io
import requests

tickers_bp = Blueprint("tickers", __name__)

@tickers_bp.route("/api/tickers/download")
def download_tickers():
    try:
        # NASDAQ-listed tickers (free public source)
        nasdaq_url = "https://raw.githubusercontent.com/rreichel3/US-Stock-Symbols/main/nasdaq/nasdaq_tickers.txt"
        resp = requests.get(nasdaq_url, timeout=10)
        nasdaq_tickers = resp.text.strip().split("\n") if resp.status_code == 200 else []

        df = pd.DataFrame({"Ticker": nasdaq_tickers, "Exchange": "NASDAQ"})

        buf = io.BytesIO()
        df.to_csv(buf, index=False)
        buf.seek(0)

        return send_file(
            buf, mimetype="text/csv",
            as_attachment=True, download_name="nasdaq_tickers.csv"
        )
    except Exception as e:
        return jsonify({"error": f"Failed to generate ticker list: {str(e)}"}), 500