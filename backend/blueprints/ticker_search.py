from flask import Blueprint, jsonify, request
import requests

ticker_search_bp = Blueprint("ticker_search", __name__)

@ticker_search_bp.route("/api/tickers/search")
def search_tickers():
    query = request.args.get("q", "").strip()
    if not query or len(query) < 2:
        return jsonify({"results": []})

    try:
        url = "https://query2.finance.yahoo.com/v1/finance/search"
        params = {"q": query, "quotesCount": 8, "newsCount": 0}
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        data = resp.json()

        results = []
        for item in data.get("quotes", []):
            symbol = item.get("symbol")
            name = item.get("longname") or item.get("shortname")
            exchange = item.get("exchange")
            if symbol and name:
                results.append({"symbol": symbol, "name": name, "exchange": exchange})

        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"results": [], "error": str(e)})