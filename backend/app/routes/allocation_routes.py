from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker
from app.database.session import get_db
from app.schemas.allocation_schema import AllocationCreate, AllocationResponse
from app.services import allocation_service

router = APIRouter(
    prefix="/allocations",
    tags=["Allocations"],
    dependencies=[Depends(RoleChecker(["admin", "hr"]))],
)


@router.get("/", response_model=List[AllocationResponse])
def list_allocations(db: Session = Depends(get_db)):
    """Get all allocations."""
    return allocation_service.get_all_allocations(db)


@router.post("/", response_model=AllocationResponse)
def create_allocation(data: AllocationCreate, db: Session = Depends(get_db)):
    """Create a new allocation."""
    return allocation_service.create_allocation(db, data)


@router.get("/project/{project_id}", response_model=List[AllocationResponse])
def get_by_project(project_id: int, db: Session = Depends(get_db)):
    """Get all allocations for a project."""
    return allocation_service.get_allocations_by_project(db, project_id)


@router.get("/employee/{employee_id}", response_model=List[AllocationResponse])
def get_by_employee(employee_id: int, db: Session = Depends(get_db)):
    """Get all allocations for an employee."""
    return allocation_service.get_allocations_by_employee(db, employee_id)
