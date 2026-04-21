from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


def to_camel(snake: str) -> str:
    parts = snake.split("_")
    return parts[0] + "".join(p.title() for p in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class RegisterRequest(CamelModel):
    class_id: UUID = Field(alias="classId")
    parent_id: UUID = Field(alias="parentId")


class ClassResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    capacity: int
    start_time: datetime
    end_time: datetime
    created_at: datetime
    registered_count: int


class RegistrationSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    class_id: UUID
    status: str
    class_name: str


class AdminRegistration(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    class_id: UUID
    class_name: str
    parent_name: str
    parent_email: str
    created_at: datetime


class ParentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    name: str


class RegistrationResult(BaseModel):
    status: str
    message: str


class CancelResult(BaseModel):
    message: str
