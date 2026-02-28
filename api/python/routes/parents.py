from fastapi import APIRouter, HTTPException

from db import query

router = APIRouter()


@router.get("/parents")
def list_parents():
    try:
        rows = query("SELECT id, email, name FROM parents ORDER BY name")
        return [_serialize(r) for r in rows]
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to fetch parents")


def _serialize(row):
    result = dict(row)
    for key, value in result.items():
        if hasattr(value, "isoformat"):
            result[key] = value.isoformat()
    return result
