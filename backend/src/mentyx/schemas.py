import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class QuestionCreate(BaseModel):
    text: str


class QuestionRead(BaseModel):
    id: uuid.UUID
    text: str
    is_open: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class VoteCreate(BaseModel):
    value: int = Field(..., ge=1, le=5)


class VoteRead(BaseModel):
    id: uuid.UUID
    question_id: uuid.UUID
    value: int

    model_config = {"from_attributes": True}


class VoteSummary(BaseModel):
    counts: dict[int, int]  # value (1-5) → vote count
    total: int
