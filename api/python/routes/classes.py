from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from db import get_db
from models import Class, Registration

router = APIRouter()


def _serialize_class(cls: Class, registered_count: int) -> dict:
    return {
        "id": str(cls.id),
        "name": cls.name,
        "description": cls.description,
        "capacity": cls.capacity,
        "start_time": cls.start_time.isoformat() if cls.start_time else None,
        "end_time": cls.end_time.isoformat() if cls.end_time else None,
        "created_at": cls.created_at.isoformat() if cls.created_at else None,
        "registered_count": str(registered_count),
    }


def _class_with_count_query(db: Session):
    count_subq = (
        db.query(func.count(Registration.id))
        .filter(
            Registration.class_id == Class.id,
            Registration.status == "registered",
        )
        .correlate(Class)
        .scalar_subquery()
    )
    return db.query(Class, count_subq.label("registered_count"))


@router.get("/classes")
def list_classes(db: Session = Depends(get_db)):
    try:
        rows = (
            _class_with_count_query(db)
            .order_by(Class.start_time.asc())
            .all()
        )
        return [_serialize_class(cls, count) for cls, count in rows]
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to fetch classes")


@router.get("/classes/{class_id}")
def get_class(class_id: str, db: Session = Depends(get_db)):
    try:
        row = (
            _class_with_count_query(db)
            .filter(Class.id == class_id)
            .first()
        )
        if not row:
            raise HTTPException(status_code=404, detail="Class not found")
        cls, count = row
        return _serialize_class(cls, count)
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to fetch class")
