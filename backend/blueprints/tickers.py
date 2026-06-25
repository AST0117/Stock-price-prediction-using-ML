from flask import Blueprint, send_file, jsonify
import pandas as pd
import io
import requests

tickers_bp = Blueprint("tickers", __name__)

@tickers_bp.route("/api/tickers/download")
def download_tickers():
    try:
        # NASDAQ's official symbol directory — includes company names
        nasdaq_url = "https://www.nasdaqtrader.com/dynamic/SymDir/nasdaqlisted.txt"
        resp = requests.get(nasdaq_url, timeout=15)
        resp.raise_for_status()

        lines = resp.text.strip().split("\n")
        # First line is header, last line is a footer ("File Creation Time...")
        data_lines = lines[1:-1]

        rows = []
        for line in data_lines:
            parts = line.split("|")
            if len(parts) >= 2:
                symbol = parts[0].strip()
                name = parts[1].strip()
                rows.append({"Ticker": symbol, "Company Name": name, "Exchange": "NASDAQ"})

        df = pd.DataFrame(rows)

        buf = io.BytesIO()
        df.to_csv(buf, index=False)
        buf.seek(0)

        return send_file(
            buf, mimetype="text/csv",
            as_attachment=True, download_name="nasdaq_tickers_with_names.csv"
        )
    except Exception as e:
        return jsonify({"error": f"Failed to generate ticker list: {str(e)}"}), 500