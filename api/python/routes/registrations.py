from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from db import query, get_cursor

router = APIRouter()


class CreateRegistrationRequest(BaseModel):
    classId: str
    parentId: str


def _serialize(row):
    result = dict(row)
    for key, value in result.items():
        if hasattr(value, "isoformat"):
            result[key] = value.isoformat()
    return result


@router.get("/registrations")
def get_registrations(parentId: str):
    try:
        rows = query(
            """SELECT r.id, r.class_id, r.status, c.name as class_name
               FROM registrations r
               JOIN classes c ON c.id = r.class_id
               WHERE r.parent_id = %s AND r.status = 'registered'
               ORDER BY c.start_time""",
            (parentId,),
        )
        return {"registrations": [_serialize(r) for r in rows]}
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to fetch registrations")


@router.get("/registrations/all")
def get_all_registrations():
    try:
        rows = query(
            """SELECT r.id, r.class_id, c.name as class_name,
                      p.name as parent_name, p.email as parent_email,
                      r.created_at
               FROM registrations r
               JOIN classes c ON c.id = r.class_id
               JOIN parents p ON p.id = r.parent_id
               WHERE r.status = 'registered'
               ORDER BY c.start_time, p.name"""
        )
        return [_serialize(r) for r in rows]
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to fetch all registrations")


@router.post("/registrations", status_code=201)
def create_registration(body: CreateRegistrationRequest):
    conn, cur = get_cursor()
    try:
        class_id = body.classId
        parent_id = body.parentId

        cur.execute(
            "SELECT capacity FROM classes WHERE id = %s", (class_id,)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Class not found")
        capacity = int(row["capacity"])

        cur.execute(
            """SELECT COUNT(*) as count FROM registrations
               WHERE class_id = %s AND status = 'registered'""",
            (class_id,),
        )
        registered_count = int(cur.fetchone()["count"])

        if registered_count >= capacity:
            raise HTTPException(status_code=409, detail="Class is full")

        cur.execute(
            """INSERT INTO registrations (class_id, parent_id, status)
               VALUES (%s, %s, 'registered')
               ON CONFLICT (class_id, parent_id)
               DO UPDATE SET status = 'registered'""",
            (class_id, parent_id),
        )
        conn.commit()

        return {
            "status": "registered",
            "message": "Successfully registered for class",
        }
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Failed to register")
    finally:
        cur.close()
        conn.close()


@router.delete("/registrations/{reg_id}", status_code=204)
def cancel_registration(reg_id: str):
    conn, cur = get_cursor()
    try:
        cur.execute(
            "SELECT * FROM registrations WHERE id = %s AND status = 'registered'",
            (reg_id,),
        )
        reg = cur.fetchone()
        if not reg:
            raise HTTPException(status_code=404, detail="Registration not found")

        cur.execute(
            "UPDATE registrations SET status = 'cancelled' WHERE id = %s",
            (reg_id,),
        )
        conn.commit()
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Failed to cancel")
    finally:
        cur.close()
        conn.close()
