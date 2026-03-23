from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from db import get_db
from models import Class, Parent, Registration

router = APIRouter()


class CreateRegistrationRequest(BaseModel):
    classId: str
    parentId: str


def _serialize(row: dict) -> dict:
    result = dict(row)
    for key, value in result.items():
        if hasattr(value, "isoformat"):
            result[key] = value.isoformat()
    return result


@router.get("/registrations")
def get_registrations(parentId: str, db: Session = Depends(get_db)):
    try:
        rows = (
            db.query(
                Registration.id,
                Registration.class_id,
                Registration.status,
                Class.name.label("class_name"),
            )
            .join(Class, Class.id == Registration.class_id)
            .filter(
                Registration.parent_id == parentId,
                Registration.status == "registered",
            )
            .order_by(Class.start_time)
            .all()
        )
        return {
            "registrations": [
                _serialize(
                    {
                        "id": str(r.id),
                        "class_id": str(r.class_id),
                        "status": r.status,
                        "class_name": r.class_name,
                    }
                )
                for r in rows
            ]
        }
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to fetch registrations")


@router.get("/registrations/all")
def get_all_registrations(db: Session = Depends(get_db)):
    try:
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
            .filter(Registration.status == "registered")
            .order_by(Class.start_time, Parent.name)
            .all()
        )
        return [
            _serialize(
                {
                    "id": str(r.id),
                    "class_id": str(r.class_id),
                    "class_name": r.class_name,
                    "parent_name": r.parent_name,
                    "parent_email": r.parent_email,
                    "created_at": r.created_at,
                }
            )
            for r in rows
        ]
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to fetch all registrations")


@router.post("/registrations", status_code=201)
def create_registration(body: CreateRegistrationRequest, db: Session = Depends(get_db)):
    try:
        class_id = body.classId
        parent_id = body.parentId

        cls = db.query(Class).filter(Class.id == class_id).with_for_update().first()
        if not cls:
            raise HTTPException(status_code=404, detail="Class not found")

        parent = db.query(Parent).filter(Parent.id == parent_id).first()
        if not parent:
            raise HTTPException(status_code=404, detail="Parent not found")

        registered_count = (
            db.query(func.count(Registration.id))
            .filter(
                Registration.class_id == class_id,
                Registration.status == "registered",
            )
            .scalar()
        )

        if registered_count >= cls.capacity:
            raise HTTPException(status_code=409, detail="Class is full")

        # Check for existing registration (upsert behavior)
        existing = (
            db.query(Registration)
            .filter(
                Registration.class_id == class_id,
                Registration.parent_id == parent_id,
            )
            .first()
        )
        if existing:
            existing.status = "registered"
        else:
            reg = Registration(
                class_id=class_id,
                parent_id=parent_id,
                status="registered",
            )
            db.add(reg)

        db.commit()

        return {
            "status": "registered",
            "message": "Successfully registered for class",
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Failed to register")


@router.delete("/registrations/{reg_id}", status_code=204)
def cancel_registration(reg_id: str, db: Session = Depends(get_db)):
    try:
        reg = (
            db.query(Registration)
            .filter(
                Registration.id == reg_id,
                Registration.status == "registered",
            )
            .first()
        )
        if not reg:
            raise HTTPException(status_code=404, detail="Registration not found")

        reg.status = "cancelled"
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="Failed to cancel")
