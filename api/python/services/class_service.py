from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from exceptions import NotFoundError
from models import Class, Registration


def _with_count(db: Session):
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


def _to_dict(cls: Class, count: int) -> dict:
    return {
        "id": cls.id,
        "name": cls.name,
        "description": cls.description,
        "capacity": cls.capacity,
        "start_time": cls.start_time,
        "end_time": cls.end_time,
        "created_at": cls.created_at,
        "registered_count": count,
    }


def list_classes(db: Session) -> list[dict]:
    rows = _with_count(db).order_by(Class.start_time.asc()).all()
    return [_to_dict(cls, count) for cls, count in rows]


def get_class(db: Session, class_id: UUID) -> dict:
    row = _with_count(db).filter(Class.id == class_id).first()
    if not row:
        raise NotFoundError("Class not found")
    cls, count = row
    return _to_dict(cls, count)
