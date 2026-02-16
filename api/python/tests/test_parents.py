def test_list_parents(client):
    response = client.get("/parents")
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "name" in data[0]
        assert "email" in data[0]
        assert "id" in data[0]
