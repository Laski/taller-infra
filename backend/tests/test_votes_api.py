import httpx
import pytest

from mentyx.main import app


@pytest.mark.anyio
async def test_cast_vote_returns_201(override_db):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.post("/question", json={"text": "¿Del 1 al 5?"})
        response = await client.post("/votes", json={"value": 3})

    assert response.status_code == 201
    assert response.json()["value"] == 3


@pytest.mark.anyio
@pytest.mark.parametrize("value", [0, 6, -1, 100])
async def test_cast_vote_rejects_out_of_range(override_db, value):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.post("/question", json={"text": "¿Del 1 al 5?"})
        response = await client.post("/votes", json={"value": value})

    assert response.status_code == 422


@pytest.mark.anyio
async def test_cast_vote_returns_409_when_question_closed(override_db):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.post("/question", json={"text": "¿Del 1 al 5?"})
        await client.patch("/question/close")
        response = await client.post("/votes", json={"value": 3})

    assert response.status_code == 409


@pytest.mark.anyio
async def test_votes_summary_returns_counts_for_all_values(override_db):
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as client:
        await client.post("/question", json={"text": "¿Del 1 al 5?"})
        await client.post("/votes", json={"value": 1})
        await client.post("/votes", json={"value": 1})
        await client.post("/votes", json={"value": 3})
        response = await client.get("/votes/summary")

    assert response.status_code == 200
    data = response.json()
    assert data["counts"] == {"1": 2, "2": 0, "3": 1, "4": 0, "5": 0}
    assert data["total"] == 3
