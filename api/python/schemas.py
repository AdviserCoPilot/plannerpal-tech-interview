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


class CreateClassRequest(CamelModel):
    name: str
    description: str | None = None
    capacity: int
    start_time: str = Field(alias="startTime")
    end_time: str = Field(alias="endTime")
    instructor_name: str | None = Field(default=None, alias="instructorName")
    location: str | None = None


class UpdateClassRequest(CamelModel):
    name: str | None = None
    description: str | None = None
    capacity: int | None = None
    start_time: str | None = Field(default=None, alias="startTime")
    end_time: str | None = Field(default=None, alias="endTime")
    instructor_name: str | None = Field(default=None, alias="instructorName")
    location: str | None = None


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
    instructor_name: str | None = None
    location: str | None = None


class RegisteredParent(BaseModel):
    id: UUID
    parentName: str
    email: str


class ClassDetailResponse(ClassResponse):
    registered_parents: list[RegisteredParent] = []


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
