from flask import Blueprint, jsonify, request
import requests

currency_bp = Blueprint("currency", __name__)

@currency_bp.route("/api/currency/convert")
def convert_currency():
    amount = request.args.get("amount", type=float)
    from_cur = request.args.get("from", "USD").upper()
    to_cur = request.args.get("to", "INR").upper()

    if amount is None:
        return jsonify({"error": "Amount is required"}), 400

    try:
        url = f"https://api.frankfurter.app/latest?amount={amount}&from={from_cur}&to={to_cur}"
        resp = requests.get(url, timeout=10)
        data = resp.json()
        if "rates" not in data or to_cur not in data["rates"]:
            return jsonify({"error": "Conversion failed — check currency codes"}), 400

        return jsonify({
            "amount": amount, "from": from_cur, "to": to_cur,
            "result": round(data["rates"][to_cur], 2),
            "rate": round(data["rates"][to_cur] / amount, 4)
        })
    except Exception as e:
        return jsonify({"error": f"Conversion failed: {str(e)}"}), 500

@currency_bp.route("/api/currency/list")
def list_currencies():
    try:
        resp = requests.get("https://api.frankfurter.app/currencies", timeout=10)
        return jsonify(resp.json())
    except Exception:
        return jsonify({"USD": "US Dollar", "INR": "Indian Rupee", "EUR": "Euro"})