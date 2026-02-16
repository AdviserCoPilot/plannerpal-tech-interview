from flask import Blueprint, jsonify

from db import query

parents_bp = Blueprint("parents", __name__)


@parents_bp.route("/parents")
def list_parents():
    try:
        rows = query("SELECT id, email, name FROM parents ORDER BY name")
        return jsonify([_serialize(r) for r in rows])
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to fetch parents"}), 500


def _serialize(row):
    result = dict(row)
    for key, value in result.items():
        if hasattr(value, "isoformat"):
            result[key] = value.isoformat()
    return result
