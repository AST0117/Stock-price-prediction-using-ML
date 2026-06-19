import yfinance as yf
import re

def is_valid_ticker_format(ticker: str) -> bool:
    """Basic format check before hitting yfinance at all."""
    if not ticker or len(ticker) > 12:
        return False
    return bool(re.match(r'^[A-Za-z0-9.\-]+$', ticker))

def ticker_exists(ticker: str) -> bool:
    """Confirm yfinance actually has data for this ticker."""
    try:
        data = yf.download(ticker, period="5d", interval="1d", progress=False)
        return not data.empty
    except Exception:
        return False

def validate_ticker(ticker: str):
    """Returns (is_valid, error_message)."""
    if not is_valid_ticker_format(ticker):
        return False, "Invalid ticker format. Use letters, numbers, '.', '-' only."
    if not ticker_exists(ticker):
        return False, f"No data found for '{ticker}'. Check the symbol (e.g. AAPL, TCS.NS)."
    return True, None