from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from db import get_db
from schemas import ClassDetailResponse, ClassResponse, CreateClassRequest, UpdateClassRequest
from services import class_service

router = APIRouter()


@router.get("/classes", response_model=list[ClassResponse])
def list_classes(db: Session = Depends(get_db)):
    return class_service.list_classes(db)


@router.get("/classes/{class_id}", response_model=ClassDetailResponse)
def get_class(class_id: UUID, db: Session = Depends(get_db)):
    return class_service.get_class_detail(db, class_id)


@router.post("/classes", response_model=ClassResponse)
def create_class(body: CreateClassRequest, db: Session = Depends(get_db)):
    created = class_service.create_class(db, body)
    return JSONResponse(
        status_code=200,
        content=ClassResponse.model_validate(created).model_dump(mode="json"),
    )


@router.put("/classes/{class_id}", response_model=ClassResponse)
def update_class(class_id: UUID, body: UpdateClassRequest, db: Session = Depends(get_db)):
    return class_service.update_class(db, class_id, body)


@router.delete("/classes/{class_id}", status_code=204)
def delete_class(class_id: UUID, db: Session = Depends(get_db)):
    class_service.delete_class(db, class_id)
