def test_list_classes(client):
    response = client.get("/classes")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "name" in data[0]
        assert "capacity" in data[0]
        assert "registered_count" in data[0]


def test_get_class_not_found(client):
    response = client.get("/classes/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
    assert response.get_json()["error"] == "Class not found"
