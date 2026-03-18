from datetime import datetime, timezone
from unittest.mock import patch
from uuid import uuid4

from fastapi.testclient import TestClient

from app import app
from exceptions import NotFoundError
from services.class_service import BadRequestError


def _sample_dict(**overrides):
    base = {
        "id": uuid4(),
        "name": "Piano",
        "description": "Learn piano",
        "capacity": 10,
        "start_time": datetime(2025, 4, 1, 10, tzinfo=timezone.utc),
        "end_time": datetime(2025, 4, 1, 11, tzinfo=timezone.utc),
        "created_at": datetime(2025, 1, 1, tzinfo=timezone.utc),
        "registered_count": 3,
        "instructor_name": "John",
        "location": "Room 1",
    }
    base.update(overrides)
    return base


def test_list_classes_returns_list():
    with patch("routes.classes.class_service.list_classes", return_value=[_sample_dict()]):
        client = TestClient(app)
        res = client.get("/classes")
    assert res.status_code == 200
    assert res.json()[0]["name"] == "Piano"


def test_get_class_not_found():
    with patch(
        "routes.classes.class_service.get_class_detail",
        side_effect=NotFoundError("Class not found"),
    ):
        client = TestClient(app)
        res = client.get(f"/classes/{uuid4()}")
    assert res.status_code == 404
    assert res.json()["error"] == "Class not found"


def test_get_class_returns_registered_parents():
    detail = _sample_dict()
    detail["registered_parents"] = [
        {"id": uuid4(), "parentName": "Jane Doe", "email": "jane@example.com"}
    ]
    with patch("routes.classes.class_service.get_class_detail", return_value=detail):
        client = TestClient(app)
        res = client.get(f"/classes/{uuid4()}")
    assert res.status_code == 200
    body = res.json()
    assert body["registered_parents"][0]["parentName"] == "Jane Doe"


def test_create_class_returns_200_with_body():
    with patch("routes.classes.class_service.create_class", return_value=_sample_dict(name="Yoga")):
        client = TestClient(app)
        res = client.post("/classes", json={
            "name": "Yoga",
            "capacity": 20,
            "startTime": "2025-05-01T09:00:00Z",
            "endTime": "2025-05-01T10:00:00Z",
        })
    assert res.status_code == 200
    assert res.json()["name"] == "Yoga"


def test_update_class_not_found_returns_400():
    with patch(
        "routes.classes.class_service.update_class",
        side_effect=BadRequestError("Class not found"),
    ):
        client = TestClient(app)
        res = client.put(f"/classes/{uuid4()}", json={"name": "Updated"})
    assert res.status_code == 400
    assert res.json()["error"] == "Class not found"


def test_update_class_succeeds():
    with patch(
        "routes.classes.class_service.update_class",
        return_value=_sample_dict(name="Advanced Piano"),
    ):
        client = TestClient(app)
        res = client.put(f"/classes/{uuid4()}", json={"name": "Advanced Piano"})
    assert res.status_code == 200
    assert res.json()["name"] == "Advanced Piano"


def test_delete_class_not_found():
    with patch(
        "routes.classes.class_service.delete_class",
        side_effect=NotFoundError("Class not found"),
    ):
        client = TestClient(app)
        res = client.delete(f"/classes/{uuid4()}")
    assert res.status_code == 404


def test_delete_class_succeeds():
    with patch("routes.classes.class_service.delete_class", return_value=None):
        client = TestClient(app)
        res = client.delete(f"/classes/{uuid4()}")
    assert res.status_code == 204
