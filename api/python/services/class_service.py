from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from exceptions import ApiError, NotFoundError
from models import Class, Parent, Registration
from schemas import CreateClassRequest, UpdateClassRequest


class BadRequestError(ApiError):
    status_code = 400


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
        "instructor_name": cls.instructor_name,
        "location": cls.location,
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


def get_class_detail(db: Session, class_id: UUID) -> dict:
    base = get_class(db, class_id)

    registrations = (
        db.query(Registration)
        .filter(
            Registration.class_id == class_id,
            Registration.status == "registered",
        )
        .all()
    )
    registered_parents = []
    for reg in registrations:
        parent = db.query(Parent).filter(Parent.id == reg.parent_id).first()
        if parent:
            registered_parents.append({
                "id": parent.id,
                "parentName": parent.name,
                "email": parent.email,
            })

    base["registered_parents"] = registered_parents
    return base


def create_class(db: Session, body: CreateClassRequest) -> dict:
    cls = Class(
        name=body.name,
        description=body.description,
        capacity=body.capacity,
        start_time=body.start_time,
        end_time=body.end_time,
        instructor_name=body.instructor_name,
        location=body.location,
    )
    db.add(cls)
    db.commit()
    db.refresh(cls)
    return _to_dict(cls, 0)


def update_class(db: Session, class_id: UUID, body: UpdateClassRequest) -> dict:
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise BadRequestError("Class not found")

    for field in ("name", "description", "capacity", "instructor_name", "location"):
        value = getattr(body, field)
        if value is not None:
            setattr(cls, field, value)
    if body.start_time is not None:
        cls.start_time = body.start_time
    if body.end_time is not None:
        cls.end_time = body.end_time

    db.commit()
    db.refresh(cls)

    count = (
        db.query(func.count(Registration.id))
        .filter(
            Registration.class_id == class_id,
            Registration.status == "registered",
        )
        .scalar()
    ) or 0
    return _to_dict(cls, count)


def delete_class(db: Session, class_id: UUID) -> None:
    cls = db.query(Class).filter(Class.id == class_id).first()
    if not cls:
        raise NotFoundError("Class not found")
    db.delete(cls)
    db.commit()
