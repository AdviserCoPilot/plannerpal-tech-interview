from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from schemas import ParentResponse
from services import parent_service

router = APIRouter()


@router.get("/parents", response_model=list[ParentResponse])
def list_parents(db: Session = Depends(get_db)):
    return parent_service.list_parents(db)
