from flask import Flask
from flask_cors import CORS
from extensions import db, jwt, mail
from config import Config

from blueprints.auth import auth_bp
from blueprints.stock_data import stock_data_bp
from blueprints.predict_linear import predict_linear_bp
from blueprints.predict_arima import predict_arima_bp
from blueprints.predict_lstm import predict_lstm_bp
from blueprints.sentiment import sentiment_bp
from blueprints.recommend import recommend_bp
from blueprints.users import users_bp
from blueprints.profile import profile_bp
from blueprints.live_price import live_price_bp
from blueprints.news import news_bp
from blueprints.currency import currency_bp
from blueprints.tickers import tickers_bp
from blueprints.ticker_search import ticker_search_bp
from blueprints.accuracy import accuracy_bp
from blueprints.watchlist import watchlist_bp
from blueprints.admin_email import admin_email_bp
app = Flask(__name__)
app.config.from_object(Config)


CORS(
    app,
    resources={r"/api/*": {"origins": "*"}},
    supports_credentials=True
)

db.init_app(app)
jwt.init_app(app)
mail.init_app(app)

app.register_blueprint(auth_bp)
app.register_blueprint(stock_data_bp)
app.register_blueprint(predict_linear_bp)
app.register_blueprint(predict_arima_bp)
app.register_blueprint(predict_lstm_bp)
app.register_blueprint(sentiment_bp)
app.register_blueprint(recommend_bp)
app.register_blueprint(users_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(live_price_bp)
app.register_blueprint(news_bp)
app.register_blueprint(currency_bp)
app.register_blueprint(tickers_bp)
app.register_blueprint(ticker_search_bp)
app.register_blueprint(accuracy_bp)
app.register_blueprint(watchlist_bp)
app.register_blueprint(admin_email_bp)


with app.app_context():
    db.create_all()  # creates tables on first run

@app.route("/health")
def health():
    return {"status": "ok"}, 200

if __name__ == "__main__":
    app.run(debug=True, port=5000, threaded=True)