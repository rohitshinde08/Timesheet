from datetime import date, datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class TimeLogStatusEnum(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class TimeLogBase(BaseModel):
    employee_id: int
    project_id: int
    task_id: int
    date: date
    hours: float = Field(..., gt=0)
    description: Optional[str] = None
    status: TimeLogStatusEnum = TimeLogStatusEnum.pending
    approved_by: Optional[int] = None


class TimeLogCreate(TimeLogBase):
    pass


class TimeLogResponse(TimeLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
