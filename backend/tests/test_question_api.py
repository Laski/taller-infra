import httpx
import pytest

from mentyx.main import app


@pytest.mark.anyio
async def test_get_question_returns_404_when_none(override_db):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/question")

    assert response.status_code == 404


@pytest.mark.anyio
async def test_create_question_returns_201(override_db):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post(
            "/question", json={"text": "¿Qué tan útil fue esto?"}
        )

    assert response.status_code == 201
    data = response.json()
    assert data["text"] == "¿Qué tan útil fue esto?"
    assert data["is_open"] is True


@pytest.mark.anyio
async def test_create_question_returns_409_if_already_exists(override_db):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.post("/question", json={"text": "Primera"})
        response = await client.post("/question", json={"text": "Segunda"})

    assert response.status_code == 409


@pytest.mark.anyio
async def test_close_question_sets_is_open_false(override_db):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.post("/question", json={"text": "¿Del 1 al 5?"})
        response = await client.patch("/question/close")

    assert response.status_code == 200
    assert response.json()["is_open"] is False


@pytest.mark.anyio
async def test_delete_question_returns_204(override_db):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.post("/question", json={"text": "¿Del 1 al 5?"})
        response = await client.delete("/question")

    assert response.status_code == 204


@pytest.mark.anyio
async def test_delete_question_also_removes_votes(override_db):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.post("/question", json={"text": "¿Del 1 al 5?"})
        await client.post("/votes", json={"value": 3})
        await client.delete("/question")
        # After deletion a new question can be created (no FK leftovers)
        response = await client.post("/question", json={"text": "Nueva"})

    assert response.status_code == 201


@pytest.mark.anyio
async def test_delete_question_returns_404_when_none(override_db):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.delete("/question")

    assert response.status_code == 404
