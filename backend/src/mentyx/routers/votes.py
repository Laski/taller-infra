from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from mentyx.database import get_session
from mentyx.models import Question, Vote
from mentyx.schemas import VoteCreate, VoteRead, VoteSummary

router = APIRouter(prefix="/votes", tags=["votes"])


@router.post("", response_model=VoteRead, status_code=201)
async def cast_vote(data: VoteCreate, db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Question))
    question = result.scalar_one_or_none()
    if question is None:
        raise HTTPException(status_code=404, detail="No hay pregunta activa")
    if not question.is_open:
        raise HTTPException(status_code=409, detail="La encuesta está cerrada")
    vote = Vote(question_id=question.id, value=data.value)
    db.add(vote)
    await db.commit()
    await db.refresh(vote)
    return vote


@router.get("/summary", response_model=VoteSummary)
async def get_summary(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Question))
    question = result.scalar_one_or_none()
    if question is None:
        raise HTTPException(status_code=404, detail="No hay pregunta activa")
    rows = await db.execute(
        select(Vote.value, func.count(Vote.id))
        .where(Vote.question_id == question.id)
        .group_by(Vote.value)
    )
    counts_from_db: dict[int, int] = {value: count for value, count in rows.all()}
    # Ensure all values 1-5 are present in the response, even if no votes were cast
    counts = {i: counts_from_db.get(i, 0) for i in range(1, 6)}
    return VoteSummary(counts=counts, total=sum(counts.values()))
