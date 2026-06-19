import os
from flask import Blueprint, jsonify
import requests
from dotenv import load_dotenv
from utils.validators import validate_ticker

load_dotenv()
news_bp = Blueprint("news", __name__)
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

@news_bp.route("/api/news/<ticker>")
def get_news(ticker):
    ticker = ticker.upper()
    is_valid, error = validate_ticker(ticker)
    if not is_valid:
        return jsonify({"error": error}), 400

    url = f"https://newsapi.org/v2/everything?q={ticker}&language=en&sortBy=publishedAt&pageSize=15&apiKey={NEWS_API_KEY}"
    try:
        resp = requests.get(url, timeout=10)
        data = resp.json()
    except requests.exceptions.RequestException:
        return jsonify({"ticker": ticker, "articles": []})

    if resp.status_code != 200:
        return jsonify({"ticker": ticker, "articles": []})

    articles = [
        {
            "title": a.get("title"),
            "source": a.get("source", {}).get("name"),
            "url": a.get("url"),
            "published_at": a.get("publishedAt"),
            "description": a.get("description")
        }
        for a in data.get("articles", [])
    ]
    return jsonify({"ticker": ticker, "articles": articles})