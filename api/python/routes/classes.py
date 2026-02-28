from fastapi import APIRouter, HTTPException

from db import query

router = APIRouter()


@router.get("/classes")
def list_classes():
    try:
        rows = query("""
            SELECT c.*,
                (SELECT COUNT(*) FROM registrations r
                 WHERE r.class_id = c.id AND r.status = 'registered') as registered_count
            FROM classes c
            ORDER BY c.start_time ASC
        """)
        return _serialize_rows(rows)
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to fetch classes")


@router.get("/classes/{class_id}")
def get_class(class_id: str):
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
            raise HTTPException(status_code=404, detail="Class not found")
        return _serialize_row(rows[0])
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to fetch class")


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
