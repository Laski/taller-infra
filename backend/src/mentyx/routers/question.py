from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from mentyx.database import get_session
from mentyx.models import Question, Vote
from mentyx.schemas import QuestionCreate, QuestionRead

router = APIRouter(prefix="/question", tags=["question"])


@router.get("", response_model=QuestionRead)
async def get_question(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Question))
    question = result.scalar_one_or_none()
    if question is None:
        raise HTTPException(status_code=404, detail="No hay pregunta todavía")
    return question


@router.post("", response_model=QuestionRead, status_code=201)
async def create_question(
    data: QuestionCreate, db: AsyncSession = Depends(get_session)
):
    result = await db.execute(select(Question))
    if result.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Ya existe una pregunta")
    question = Question(text=data.text)
    db.add(question)
    await db.commit()
    await db.refresh(question)
    return question


@router.patch("/close", response_model=QuestionRead)
async def close_question(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Question))
    question = result.scalar_one_or_none()
    if question is None:
        raise HTTPException(status_code=404, detail="No hay pregunta")
    question.is_open = False
    await db.commit()
    await db.refresh(question)
    return question


@router.delete("", status_code=204)
async def delete_question(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Question))
    question = result.scalar_one_or_none()
    if question is None:
        raise HTTPException(status_code=404, detail="No hay pregunta")
    await db.execute(delete(Vote).where(Vote.question_id == question.id))
    await db.delete(question)
    await db.commit()


