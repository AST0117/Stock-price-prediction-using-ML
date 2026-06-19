import os
from flask import Blueprint, jsonify
import requests
from dotenv import load_dotenv
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

load_dotenv()
sentiment_bp = Blueprint("sentiment", __name__)
analyzer = SentimentIntensityAnalyzer()
NEWS_API_KEY = os.getenv("NEWS_API_KEY")

def run_sentiment(ticker):
    url = f"https://newsapi.org/v2/everything?q={ticker}&language=en&sortBy=publishedAt&pageSize=20&apiKey={NEWS_API_KEY}"
    try:
        resp = requests.get(url, timeout=10)
        data = resp.json()
    except requests.exceptions.RequestException:
        return {"ticker": ticker, "sentiment_score": 0, "label": "Neutral", "count": 0}

    if resp.status_code != 200:
        return {"ticker": ticker, "sentiment_score": 0, "label": "Neutral", "count": 0}

    articles = data.get("articles", [])
    if not articles:
        return {"ticker": ticker, "sentiment_score": 0, "label": "Neutral", "count": 0}

    scores = []
    for a in articles:
        text = f"{a.get('title','')} {a.get('description','')}"
        scores.append(analyzer.polarity_scores(text)["compound"])

    avg = sum(scores) / len(scores)
    label = "Positive" if avg > 0.05 else "Negative" if avg < -0.05 else "Neutral"

    return {"ticker": ticker, "sentiment_score": round(avg, 3), "label": label, "count": len(scores)}

@sentiment_bp.route("/api/sentiment/<ticker>")
def get_sentiment(ticker):
    return jsonify(run_sentiment(ticker.upper()))