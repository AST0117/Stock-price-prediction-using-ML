import os
from flask import Blueprint, request, jsonify
from flask_mail import Message
from extensions import mail
from utils.auth_decorators import admin_required
from models.user import User

admin_email_bp = Blueprint("admin_email", __name__)

@admin_email_bp.route("/api/admin/send-email", methods=["POST"])
@admin_required
def send_email():
    data = request.get_json()
    subject = data.get("subject", "").strip()
    body = data.get("body", "").strip()
    target = data.get("target", "all")  # "all" or specific email

    if not subject or not body:
        return jsonify({"error": "Subject and body are required"}), 400

    if target == "all":
        recipients = [u.email for u in User.query.all()]
    else:
        recipients = [target]

    if not recipients:
        return jsonify({"error": "No recipients found"}), 400

    try:
        msg = Message(subject=subject, recipients=recipients, body=body)
        mail.send(msg)
        return jsonify({"message": f"Email sent to {len(recipients)} recipient(s)"})
    except Exception as e:
        return jsonify({"error": f"Failed to send email: {str(e)}"}), 500