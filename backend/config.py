import os
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()
class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-this")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-jwt-secret-change-this")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)

    # Use SQLite for now (zero setup); swap to MySQL/MariaDB string later
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///stockapp.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    MAIL_SERVER = "smtp.gmail.com"
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")  # use a Gmail App Password, not your real password
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_USERNAME")