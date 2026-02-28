def test_get_registrations_requires_parent_id(client):
    response = client.get("/registrations")
    assert response.status_code == 422


def test_get_registrations_with_parent_id(client):
    response = client.get(
        "/registrations?parentId=11111111-1111-1111-1111-111111111111"
    )
    assert response.status_code == 200
    data = response.get_json()
    assert "registrations" in data
    assert isinstance(data["registrations"], list)


def test_get_all_registrations(client):
    response = client.get("/registrations/all")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)


def test_register_missing_fields(client):
    response = client.post("/registrations", json={})
    assert response.status_code == 400
    assert response.get_json()["error"] == "classId and parentId required"


def test_register_class_not_found(client):
    response = client.post(
        "/registrations",
        json={
            "classId": "00000000-0000-0000-0000-000000000000",
            "parentId": "11111111-1111-1111-1111-111111111111",
        },
    )
    assert response.status_code == 404
    assert response.get_json()["error"] == "Class not found"


def test_register_success(client):
    response = client.post(
        "/registrations",
        json={
            "classId": "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
            "parentId": "33333333-3333-3333-3333-333333333333",
        },
    )
    assert response.status_code == 201
    data = response.get_json()
    assert data["status"] == "registered"


def test_register_full_class(client):
    response = client.post(
        "/registrations",
        json={
            "classId": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            "parentId": "33333333-3333-3333-3333-333333333333",
        },
    )
    assert response.status_code == 409
    assert response.get_json()["error"] == "Class is full"


def test_cancel_not_found(client):
    response = client.delete(
        "/registrations/00000000-0000-0000-0000-000000000000"
    )
    assert response.status_code == 404
    assert response.get_json()["error"] == "Registration not found"
