from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from db import get_db
from models import Parent

router = APIRouter()


def _serialize(parent: Parent) -> dict:
    return {
        "id": str(parent.id),
        "email": parent.email,
        "name": parent.name,
    }


@router.get("/parents")
def list_parents(db: Session = Depends(get_db)):
    try:
        parents = db.query(Parent).order_by(Parent.name).all()
        return [_serialize(p) for p in parents]
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to fetch parents")
