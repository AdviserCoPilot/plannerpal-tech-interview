from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from schemas import ClassResponse
from services import class_service

router = APIRouter()


@router.get("/classes", response_model=list[ClassResponse])
def list_classes(db: Session = Depends(get_db)):
    return class_service.list_classes(db)


@router.get("/classes/{class_id}", response_model=ClassResponse)
def get_class(class_id: UUID, db: Session = Depends(get_db)):
    return class_service.get_class(db, class_id)
