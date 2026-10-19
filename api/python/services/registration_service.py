from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from exceptions import ConflictError, NotFoundError
from models import Class, Parent, Registration

STATUS_REGISTERED = "registered"


def find_by_parent(db: Session, parent_id: UUID) -> list[dict]:
    rows = (
        db.query(
            Registration.id,
            Registration.class_id,
            Registration.status,
            Class.name.label("class_name"),
        )
        .join(Class, Class.id == Registration.class_id)
        .filter(
            Registration.parent_id == parent_id,
            Registration.status == STATUS_REGISTERED,
        )
        .order_by(Class.start_time)
        .all()
    )
    return [
        {
            "id": r.id,
            "class_id": r.class_id,
            "status": r.status,
            "class_name": r.class_name,
        }
        for r in rows
    ]


def find_all(db: Session) -> list[dict]:
    rows = (
        db.query(
            Registration.id,
            Registration.class_id,
            Class.name.label("class_name"),
            Parent.name.label("parent_name"),
            Parent.email.label("parent_email"),
            Registration.created_at,
        )
        .join(Class, Class.id == Registration.class_id)
        .join(Parent, Parent.id == Registration.parent_id)
        .filter(Registration.status == STATUS_REGISTERED)
        .order_by(Class.start_time, Parent.name)
        .all()
    )
    return [
        {
            "id": r.id,
            "class_id": r.class_id,
            "class_name": r.class_name,
            "parent_name": r.parent_name,
            "parent_email": r.parent_email,
            "created_at": r.created_at,
        }
        for r in rows
    ]


def register(db: Session, class_id: UUID, parent_id: UUID) -> dict:
    try:
        cls = db.query(Class).filter(Class.id == class_id).with_for_update().first()
        if not cls:
            raise NotFoundError("Class not found")

        parent = db.query(Parent).filter(Parent.id == parent_id).first()
        if not parent:
            raise NotFoundError("Parent not found")

        registered_count = (
            db.query(func.count(Registration.id))
            .filter(
                Registration.class_id == class_id,
                Registration.status == STATUS_REGISTERED,
            )
            .scalar()
        )
        if registered_count > cls.capacity:
            raise ConflictError("Class is full")

        existing = (
            db.query(Registration)
            .filter(
                Registration.class_id == class_id,
                Registration.parent_id == parent_id,
            )
            .first()
        )
        if existing:
            existing.status = STATUS_REGISTERED
        else:
            db.add(Registration(
                class_id=class_id,
                parent_id=parent_id,
                status=STATUS_REGISTERED,
            ))

        db.commit()
        return {"status": STATUS_REGISTERED, "message": "Successfully registered for class"}
    except Exception:
        db.rollback()
        raise


def cancel(db: Session, reg_id: UUID) -> None:
    try:
        reg = (
            db.query(Registration)
            .filter(
                Registration.id == reg_id,
                Registration.status == STATUS_REGISTERED,
            )
            .first()
        )
        if not reg:
            raise NotFoundError("Registration not found")

        reg.status = "cancelled"
        db.commit()
    except Exception:
        db.rollback()
        raise
