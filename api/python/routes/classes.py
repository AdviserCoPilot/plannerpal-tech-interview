from flask import Blueprint, jsonify

from db import query

classes_bp = Blueprint("classes", __name__)


@classes_bp.route("/classes")
def list_classes():
    try:
        rows = query("""
            SELECT c.*,
                (SELECT COUNT(*) FROM registrations r
                 WHERE r.class_id = c.id AND r.status = 'registered') as registered_count
            FROM classes c
            ORDER BY c.start_time ASC
        """)
        return jsonify(_serialize_rows(rows))
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to fetch classes"}), 500


@classes_bp.route("/classes/<class_id>")
def get_class(class_id):
    try:
        rows = query(
            """
            SELECT c.*,
                (SELECT COUNT(*) FROM registrations r
                 WHERE r.class_id = c.id AND r.status = 'registered') as registered_count
            FROM classes c
            WHERE c.id = %s
            """,
            (class_id,),
        )
        if not rows:
            return jsonify({"error": "Class not found"}), 404
        return jsonify(_serialize_row(rows[0]))
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to fetch class"}), 500


def _serialize_row(row):
    """Convert a RealDictRow to a JSON-safe dict."""
    result = dict(row)
    for key, value in result.items():
        if hasattr(value, "isoformat"):
            result[key] = value.isoformat()
        elif isinstance(value, int):
            if key == "registered_count":
                result[key] = str(value)
    return result


def _serialize_rows(rows):
    return [_serialize_row(r) for r in rows]
