import os

from flask import Flask
from flask_cors import CORS

from db import get_pool
from routes.classes import classes_bp
from routes.parents import parents_bp
from routes.registrations import registrations_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(classes_bp)
app.register_blueprint(parents_bp)
app.register_blueprint(registrations_bp)


@app.route("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 4000))
    app.run(host="0.0.0.0", port=port, debug=True)
