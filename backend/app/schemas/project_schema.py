from datetime import datetime
from enum import Enum
from typing import Optional, List, Any

from pydantic import BaseModel, Field

# Avoid circular imports by using forward references or basic schemas
class EmployeeBasicInfo(BaseModel):
    id: int
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

class AllocationWithEmployee(BaseModel):
    id: int
    employee: EmployeeBasicInfo
    allocation_percent: float

    class Config:
        from_attributes = True

class ProjectStatusEnum(str, Enum):
    active = "active"
    completed = "completed"
    inactive = "inactive"


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
    # We add a simple manager name for the list view
    manager_name: Optional[str] = None

    class Config:
        from_attributes = True

class TaskBasicInfo(BaseModel):
    id: int
    title: str
    status: str
    assigned_to: Optional[int] = None

    class Config:
        from_attributes = True

class ProjectDetailResponse(ProjectResponse):
    manager: Optional[EmployeeBasicInfo] = None
    allocations: List[AllocationWithEmployee] = []
    tasks: List[TaskBasicInfo] = []
    total_logged_hours: float = 0.0
    
    class Config:
        from_attributes = True
