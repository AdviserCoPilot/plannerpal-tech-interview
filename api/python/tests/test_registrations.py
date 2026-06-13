from unittest.mock import MagicMock

from fastapi.testclient import TestClient

from app import app
from db import get_db


def _override_db(mock_db):
    def override():
        yield mock_db
    app.dependency_overrides[get_db] = override


def _clear_overrides():
    app.dependency_overrides.clear()


class TestGetRegistrations:
    def test_requires_parent_id(self):
        db = MagicMock()
        _override_db(db)

        client = TestClient(app)
        res = client.get("/registrations")
        assert res.status_code == 422

        _clear_overrides()

    def test_with_parent_id(self):
        db = MagicMock()
        _override_db(db)

        query = db.query.return_value
        query.join.return_value.filter.return_value.order_by.return_value.all.return_value = []

        client = TestClient(app)
        res = client.get("/registrations?parentId=11111111-1111-1111-1111-111111111111")
        assert res.status_code == 200
        data = res.json()
        assert "registrations" in data
        assert isinstance(data["registrations"], list)

        _clear_overrides()


class TestGetAllRegistrations:
    def test_returns_list(self):
        db = MagicMock()
        _override_db(db)

        query = db.query.return_value
        query.join.return_value.join.return_value.filter.return_value.order_by.return_value.all.return_value = []

        client = TestClient(app)
        res = client.get("/registrations/all")
        assert res.status_code == 200
        data = res.json()
        assert isinstance(data, list)

        _clear_overrides()


class TestCreateRegistration:
    def test_missing_fields(self):
        db = MagicMock()
        _override_db(db)

        client = TestClient(app)
        res = client.post("/registrations", json={})
        assert res.status_code == 422

        _clear_overrides()

    def test_class_not_found(self):
        db = MagicMock()
        _override_db(db)

        class_query_mock = MagicMock()
        class_query_mock.filter.return_value.with_for_update.return_value.first.return_value = None
        db.query.side_effect = [class_query_mock]

        client = TestClient(app)
        res = client.post(
            "/registrations",
            json={
                "classId": "00000000-0000-0000-0000-000000000000",
                "parentId": "11111111-1111-1111-1111-111111111111",
            },
        )
        assert res.status_code == 404
        assert res.json()["error"] == "Class not found"

        _clear_overrides()

    def test_register_success(self):
        db = MagicMock()
        _override_db(db)

        cls = MagicMock()
        cls.capacity = 10
        parent = MagicMock()

        class_query_mock = MagicMock()
        class_query_mock.filter.return_value.with_for_update.return_value.first.return_value = cls

        parent_query_mock = MagicMock()
        parent_query_mock.filter.return_value.first.return_value = parent

        count_query_mock = MagicMock()
        count_query_mock.filter.return_value.scalar.return_value = 5

        existing_query_mock = MagicMock()
        existing_query_mock.filter.return_value.first.return_value = None

        db.query.side_effect = [
            class_query_mock,
            parent_query_mock,
            count_query_mock,
            existing_query_mock,
        ]

        client = TestClient(app)
        res = client.post(
            "/registrations",
            json={
                "classId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
                "parentId": "33333333-3333-3333-3333-333333333333",
            },
        )
        assert res.status_code == 201
        data = res.json()
        assert data["status"] == "registered"

        _clear_overrides()

    def test_register_full_class(self):
        db = MagicMock()
        _override_db(db)

        cls = MagicMock()
        cls.capacity = 10
        parent = MagicMock()

        class_query_mock = MagicMock()
        class_query_mock.filter.return_value.with_for_update.return_value.first.return_value = cls

        parent_query_mock = MagicMock()
        parent_query_mock.filter.return_value.first.return_value = parent

        count_query_mock = MagicMock()
        count_query_mock.filter.return_value.scalar.return_value = 11

        db.query.side_effect = [
            class_query_mock,
            parent_query_mock,
            count_query_mock,
        ]

        client = TestClient(app)
        res = client.post(
            "/registrations",
            json={
                "classId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
                "parentId": "33333333-3333-3333-3333-333333333333",
            },
        )
        assert res.status_code == 409
        assert res.json()["error"] == "Class is full"

        _clear_overrides()


class TestCancelRegistration:
    def test_not_found(self):
        db = MagicMock()
        _override_db(db)
        db.query.return_value.filter.return_value.first.return_value = None

        client = TestClient(app)
        res = client.delete("/registrations/00000000-0000-0000-0000-000000000000")
        assert res.status_code == 404
        assert res.json()["error"] == "Registration not found"

        _clear_overrides()
