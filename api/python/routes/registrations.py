from flask import Blueprint, jsonify, request

from db import get_pool

registrations_bp = Blueprint("registrations", __name__)


def _serialize(row):
    result = dict(row)
    for key, value in result.items():
        if hasattr(value, "isoformat"):
            result[key] = value.isoformat()
    return result


@registrations_bp.route("/registrations")
def get_registrations():
    try:
        parent_id = request.args.get("parentId")
        if not parent_id:
            return jsonify({"error": "parentId required"}), 400

        conn = get_pool()
        try:
            from psycopg2.extras import RealDictCursor

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT r.id, r.class_id, r.status, c.name as class_name
                       FROM registrations r
                       JOIN classes c ON c.id = r.class_id
                       WHERE r.parent_id = %s AND r.status = 'registered'
                       ORDER BY c.start_time""",
                    (parent_id,),
                )
                rows = cur.fetchall()
            return jsonify({"registrations": [_serialize(r) for r in rows]})
        finally:
            conn.close()
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to fetch registrations"}), 500


@registrations_bp.route("/registrations/all")
def get_all_registrations():
    try:
        conn = get_pool()
        try:
            from psycopg2.extras import RealDictCursor

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    """SELECT r.id, r.class_id, c.name as class_name,
                              p.name as parent_name, p.email as parent_email,
                              r.created_at
                       FROM registrations r
                       JOIN classes c ON c.id = r.class_id
                       JOIN parents p ON p.id = r.parent_id
                       WHERE r.status = 'registered'
                       ORDER BY c.start_time, p.name"""
                )
                rows = cur.fetchall()
            return jsonify([_serialize(r) for r in rows])
        finally:
            conn.close()
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to fetch all registrations"}), 500


@registrations_bp.route("/registrations", methods=["POST"])
def create_registration():
    conn = get_pool()
    try:
        from psycopg2.extras import RealDictCursor

        data = request.get_json()
        class_id = data.get("classId")
        parent_id = data.get("parentId")

        if not class_id or not parent_id:
            return jsonify({"error": "classId and parentId required"}), 400

        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                "SELECT capacity FROM classes WHERE id = %s", (class_id,)
            )
            row = cur.fetchone()
            if not row:
                return jsonify({"error": "Class not found"}), 404
            capacity = int(row["capacity"])

            cur.execute(
                """SELECT COUNT(*) as count FROM registrations
                   WHERE class_id = %s AND status = 'registered'""",
                (class_id,),
            )
            registered_count = int(cur.fetchone()["count"])

            if registered_count >= capacity:
                return jsonify({"error": "Class is full"}), 409

            cur.execute(
                """INSERT INTO registrations (class_id, parent_id, status)
                   VALUES (%s, %s, 'registered')
                   ON CONFLICT (class_id, parent_id)
                   DO UPDATE SET status = 'registered'""",
                (class_id, parent_id),
            )
            conn.commit()

        return (
            jsonify(
                {
                    "status": "registered",
                    "message": "Successfully registered for class",
                }
            ),
            201,
        )
    except Exception as e:
        conn.rollback()
        print(e)
        return jsonify({"error": "Failed to register"}), 500
    finally:
        conn.close()


@registrations_bp.route("/registrations/<reg_id>", methods=["DELETE"])
def cancel_registration(reg_id):
    try:
        conn = get_pool()
        try:
            from psycopg2.extras import RealDictCursor

            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT * FROM registrations WHERE id = %s AND status = 'registered'",
                    (reg_id,),
                )
                reg = cur.fetchone()
                if not reg:
                    return jsonify({"error": "Registration not found"}), 404

                cur.execute(
                    "UPDATE registrations SET status = 'cancelled' WHERE id = %s",
                    (reg_id,),
                )
                conn.commit()

            return jsonify({"message": "Registration cancelled"})
        finally:
            conn.close()
    except Exception as e:
        print(e)
        return jsonify({"error": "Failed to cancel"}), 500
