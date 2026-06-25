# 📈 Stock Market Predictor

A full-stack web application that forecasts stock prices for the next 7 days using a combination of **ARIMA**, **LSTM**, and **Linear Regression** models, enhanced with **news sentiment analysis**, to generate a final buy/hold/sell-style recommendation. Built with **Angular** (frontend) and **Flask** (backend), supporting both **NASDAQ** and **NSE** listed stocks.

---

## 🌟 Overview

This platform combines classical statistical forecasting (ARIMA), deep learning (LSTM), and simple trend analysis (Linear Regression) into a weighted ensemble forecast, then layers in real-time news sentiment to produce a holistic recommendation. The system also tracks its own prediction accuracy over time against actual market outcomes, providing full transparency rather than a black-box forecast.

The application supports two roles — **User** and **Admin** — with a complete authentication system, role-based dashboards, and a wide range of supporting tools (live prices, news, currency conversion, educational content, and more).

---

## ✨ Features

### For All Users
- 🔐 **Register & Login** — secure JWT-based authentication
- 📈 **Stock Price Prediction** — 7-day forecasts using ARIMA, LSTM, and Linear Regression, combined into a weighted ensemble forecast based on historical model accuracy (RMSE)
- 🔍 **Search by Ticker or Company Name** — autocomplete-powered search (e.g. type "Apple" → resolves to `AAPL`)
- 💹 **Live Stock Prices** — real-time (delayed ~15 min) price tracking with auto-refresh polling
- 📰 **Stock News** — latest headlines for any stock, with sentiment scoring
- 💱 **Currency Converter** — live exchange rate conversion between world currencies
- ⭐ **Watchlist** — save and track favorite stocks on your dashboard home page
- 🎓 **Education Center** — categorized learning content (market basics, algorithms, sentiment, risk) plus a glossary and live model accuracy tracker
- 📥 **Ticker Directory Download** — download the full NASDAQ ticker list (with company names) as CSV
- 👤 **Profile Management** — edit or delete your own account

### For Admins (in addition to all User features)
- 👥 **User Management** — full CRUD on all user accounts
- ✉️ **Manual Email Broadcasts** — trigger announcement emails to all registered users
- 📊 **Prediction Accuracy Monitoring** — trigger accuracy checks comparing past predictions to actual outcomes

---

## 🧠 Machine Learning Approach

| Model | Type | Strengths | Limitations |
|---|---|---|---|
| **ARIMA** | Statistical time-series | Good for short-term trend continuation | Can flatten to a "random walk" on volatile stocks |
| **LSTM** | Deep learning (RNN) | Captures non-linear, long-term patterns | Computationally expensive; needs 1+ year of data |
| **Linear Regression** | Trend-line extrapolation | Fast, interpretable, rarely fails | Can't capture reversals or cyclical behavior |
| **Ensemble** | Weighted average | Combines strengths, weighted by historical RMSE | Inherits limitations of underlying models |

Each prediction is **backtested** against the last 7 known days of real data to compute RMSE (Root Mean Squared Error), which determines:
1. Which model is flagged as "Best" for that specific stock
2. The weighting used in the ensemble forecast

All predictions are logged to a database and later checked against actual market closes via a scheduled/manual accuracy-check process, visible on the **Education** page as a live, evolving accuracy table.

### Sentiment Analysis
News headlines (via NewsAPI) for the requested ticker are scored using **VADER** sentiment analysis. The sentiment score is combined with the models' directional consensus to produce a final recommendation: **Likely to Rise**, **Likely to Fall**, or **Uncertain / Hold**.

---

## 🏗️ Tech Stack

**Frontend**
- Angular (standalone components, no NgModules)
- Chart.js — interactive forecast visualizations
- RxJS — reactive data flows, debounced search

**Backend**
- Flask (Python) — REST API
- Flask-SQLAlchemy — ORM / database layer
- Flask-JWT-Extended — authentication
- Flask-Mail — admin email broadcasts
- Flask-CORS — cross-origin support

**Machine Learning / Data**
- `statsmodels` / `pmdarima` — ARIMA forecasting
- `TensorFlow` / `Keras` — LSTM model
- `scikit-learn` — Linear Regression, RMSE calculation
- `yfinance` — historical & live market data (NASDAQ & NSE)
- `vaderSentiment` — sentiment scoring
- `NewsAPI` — news headline retrieval

**Database**
- SQLite (development) — easily swappable for MySQL/MariaDB via `DATABASE_URL`

---

---

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm
- Angular CLI (`npm install -g @angular/cli`)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:
```env
SECRET_KEY=your_generated_secret_key
JWT_SECRET_KEY=your_generated_jwt_secret_key
DATABASE_URL=sqlite:///stockapp.db
NEWS_API_KEY=your_newsapi_key
MAIL_USERNAME=your_mailtrap_username
MAIL_PASSWORD=your_mailtrap_password
```

> Generate secure keys with: `python -c "import secrets; print(secrets.token_hex(32))"`

Run the backend:
```bash
python app.py
```
The API will be available at `http://localhost:5000` (creates `stockapp.db` automatically on first run).

**Create an admin account** (one-time):
```bash
python
>>> from app import app, db
>>> from models.user import User
>>> with app.app_context():
...     admin = User(name="Admin", email="admin@app.com", role="admin")
...     admin.set_password("your_password")
...     db.session.add(admin)
...     db.session.commit()
```

### Frontend Setup

```bash
cd stock-predictor-frontend
npm install
```

Update `src/environments/environment.ts` with your backend URL:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000'
};
```

Run the frontend:
```bash
ng serve
```
Visit `http://localhost:4200`.

> **Note:** If running in GitHub Codespaces or another cloud dev environment, use the forwarded port URL for `apiUrl` instead of `localhost`, and ensure the backend port's visibility is set to **Public**.

---

## 🔑 Environment Variables Reference

| Variable | Description |
|---|---|
| `SECRET_KEY` | Flask session secret |
| `JWT_SECRET_KEY` | JWT signing secret |
| `DATABASE_URL` | Database connection string (defaults to SQLite) |
| `NEWS_API_KEY` | API key from [newsapi.org](https://newsapi.org) for news & sentiment |
| `MAIL_USERNAME` / `MAIL_PASSWORD` | SMTP credentials (e.g. from [Mailtrap](https://mailtrap.io)) for admin email broadcasts |

---

## 📡 API Reference (Selected Endpoints)

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/register` | POST | — | Register a new user |
| `/api/auth/login` | POST | — | Login, returns JWT |
| `/api/stock/<ticker>/history` | GET | — | Historical OHLCV data |
| `/api/stock/<ticker>/price` | GET | — | Live price snapshot |
| `/api/predict/linear/<ticker>` | GET | — | Linear Regression forecast |
| `/api/predict/arima/<ticker>` | GET | — | ARIMA forecast |
| `/api/predict/lstm/<ticker>` | GET | — | LSTM forecast |
| `/api/recommend/<ticker>` | GET | — | Combined forecast + sentiment + verdict |
| `/api/sentiment/<ticker>` | GET | — | News sentiment score |
| `/api/news/<ticker>` | GET | — | Recent news articles |
| `/api/tickers/search?q=` | GET | — | Ticker/company name autocomplete |
| `/api/tickers/download` | GET | — | Download NASDAQ ticker list (CSV) |
| `/api/currency/convert` | GET | — | Currency conversion |
| `/api/accuracy/summary` | GET | — | Aggregate model accuracy stats |
| `/api/profile` | GET/PUT/DELETE | ✅ User | View/edit/delete own profile |
| `/api/watchlist` | GET/POST | ✅ User | Manage personal watchlist |
| `/api/users` | GET/POST | ✅ Admin | Manage all users |
| `/api/users/<id>` | PUT/DELETE | ✅ Admin | Edit/delete a specific user |
| `/api/admin/send-email` | POST | ✅ Admin | Broadcast email to all users |
| `/api/accuracy/check` | POST | ✅ Admin | Run accuracy check against actual prices |

---

## ⚠️ Known Limitations

- **Live prices are delayed** (~15 minutes) since they rely on `yfinance`'s free data feed, not a true real-time market feed.
- **LSTM training happens per-request** rather than using pre-trained, cached models — this makes LSTM forecasts slower (15–45 seconds) but avoids the complexity of model persistence.
- **NewsAPI free tier** is rate-limited (~100 requests/day) and limited to the last month of articles — suitable for development/demo, not production-scale usage.
- **Email sending** depends on outbound SMTP access; this may be blocked on restricted corporate/institutional networks. The app fails gracefully (5-second timeout) rather than hanging in that case.
- **ARIMA can flatten to a "random walk"** on certain stocks where no statistically significant trend is detected — this is expected statistical behavior, not a bug.

---

## 🎓 Educational Disclaimer

This project was built for academic and educational purposes. It is **not financial advice**. Stock markets are inherently volatile and unpredictable; no model, however sophisticated, can guarantee future performance. Always conduct independent research and consult a qualified financial advisor before making investment decisions.

---

## 🚀 Future Enhancements

- Pre-trained, cached LSTM models per ticker (avoid retraining on every request)
- WebSocket-based true real-time price streaming
- Confidence intervals / shaded uncertainty bands on forecast charts
- Portfolio simulation (paper trading) feature
- PDF export of prediction reports
- NSE-specific news and ticker directory support
- Scheduled (cron-based) automatic accuracy checking instead of manual trigger

---

