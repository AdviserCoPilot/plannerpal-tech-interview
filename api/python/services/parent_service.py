from sqlalchemy.orm import Session

from models import Parent


def list_parents(db: Session) -> list[Parent]:
    return db.query(Parent).order_by(Parent.name).all()
