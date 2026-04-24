from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.allocation import Allocation
from app.schemas.allocation_schema import AllocationCreate


def create_allocation(db: Session, data: AllocationCreate) -> Allocation:
    """Create a new allocation, ensuring total per employee does not exceed 100%."""
    existing_allocations = db.query(Allocation).filter(Allocation.employee_id == data.employee_id).all()
    total_allocated = sum(a.allocation_percent for a in existing_allocations)
    
    if total_allocated + data.allocation_percent > 100.0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Allocation exceeded: Current is {total_allocated}%, cannot add {data.allocation_percent}%",
        )

    allocation = Allocation(**data.model_dump())
    db.add(allocation)
    db.commit()
    db.refresh(allocation)
    return allocation


def get_allocations_by_project(db: Session, project_id: int) -> List[Allocation]:
    """Return all allocations for a project."""
    return db.query(Allocation).filter(Allocation.project_id == project_id).all()


def get_allocations_by_employee(db: Session, employee_id: int) -> List[Allocation]:
    """Return all allocations for an employee."""
    return db.query(Allocation).filter(Allocation.employee_id == employee_id).all()


def get_all_allocations(db: Session) -> List[Allocation]:
    """Return all allocations."""
    return db.query(Allocation).all()
