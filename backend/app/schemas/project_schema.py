from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ProjectStatusEnum(str, Enum):
    active = "active"
    completed = "completed"


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    estimated_hours: Optional[float] = Field(None, gt=0)
    estimated_days: Optional[float] = Field(None, gt=0)
    status: ProjectStatusEnum = ProjectStatusEnum.active
    manager_id: Optional[int] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectResponse(ProjectBase):
    id: int
    created_at: datetime
    manager_id: Optional[int] = None

    class Config:
        from_attributes = True
