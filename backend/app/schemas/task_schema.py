from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class TaskStatusEnum(str, Enum):
    todo = "todo"
    in_progress = "in-progress"
    done = "done"


class TaskBase(BaseModel):
    project_id: int
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    assigned_to: int
    status: TaskStatusEnum = TaskStatusEnum.todo


class TaskCreate(TaskBase):
    pass


class TaskResponse(TaskBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
