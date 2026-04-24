from pydantic import BaseModel, Field


class AllocationBase(BaseModel):
    employee_id: int
    project_id: int
    allocation_percent: float = Field(..., gt=0, le=100)


class AllocationCreate(AllocationBase):
    pass


class AllocationResponse(AllocationBase):
    id: int

    class Config:
        from_attributes = True
