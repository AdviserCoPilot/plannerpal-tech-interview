from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from db import get_db
from schemas import (
    AdminRegistration,
    CancelResult,
    RegisterRequest,
    RegistrationResult,
    RegistrationSummary,
)
from services import registration_service

router = APIRouter()


@router.get("/registrations")
def get_registrations(
    parentId: UUID = Query(...),
    db: Session = Depends(get_db),
) -> dict[str, list[RegistrationSummary]]:
    registrations = registration_service.find_by_parent(db, parentId)
    return {"registrations": [RegistrationSummary.model_validate(r) for r in registrations]}


@router.get("/registrations/all", response_model=list[AdminRegistration])
def get_all_registrations(db: Session = Depends(get_db)):
    return registration_service.find_all(db)


@router.post("/registrations", status_code=201, response_model=RegistrationResult)
def create_registration(body: RegisterRequest, db: Session = Depends(get_db)):
    return registration_service.register(db, body.class_id, body.parent_id)


@router.delete("/registrations/{reg_id}", response_model=CancelResult)
def cancel_registration(reg_id: UUID, db: Session = Depends(get_db)):
    registration_service.cancel(db, reg_id)
    return {"message": "Registration cancelled"}
