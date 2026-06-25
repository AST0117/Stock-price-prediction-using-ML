from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from extensions import db
from models.watchlist import Watchlist

watchlist_bp = Blueprint("watchlist", __name__)

@watchlist_bp.route("/api/watchlist", methods=["GET"])
@jwt_required()
def get_watchlist():
    user_id = int(get_jwt_identity())
    items = Watchlist.query.filter_by(user_id=user_id).all()
    return jsonify([i.to_dict() for i in items])

@watchlist_bp.route("/api/watchlist", methods=["POST"])
@jwt_required()
def add_to_watchlist():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    ticker = data.get("ticker", "").strip().upper()

    if not ticker:
        return jsonify({"error": "Ticker is required"}), 400

    existing = Watchlist.query.filter_by(user_id=user_id, ticker=ticker).first()
    if existing:
        return jsonify({"error": "Already in watchlist"}), 409

    item = Watchlist(user_id=user_id, ticker=ticker)
    db.session.add(item)
    db.session.commit()
    return jsonify(item.to_dict()), 201

@watchlist_bp.route("/api/watchlist/<int:item_id>", methods=["DELETE"])
@jwt_required()
def remove_from_watchlist(item_id):
    user_id = int(get_jwt_identity())
    item = Watchlist.query.filter_by(id=item_id, user_id=user_id).first()
    if not item:
        return jsonify({"error": "Not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Removed"})