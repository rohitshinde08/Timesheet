from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker
from app.database.session import get_db
from app.schemas.employee_schema import EmployeeCreate, EmployeeResponse
from app.services import employee_service

router = APIRouter(
    prefix="/employees",
    tags=["Employees"],
    dependencies=[Depends(RoleChecker(["admin", "hr"]))],
)


@router.get("/", response_model=List[EmployeeResponse])
def list_employees(db: Session = Depends(get_db)):
    """Get all employees."""
    return employee_service.get_all_employees(db)


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    """Get a single employee by ID."""
    return employee_service.get_employee(db, employee_id)


@router.post("/", response_model=EmployeeResponse)
def create_employee(data: EmployeeCreate, db: Session = Depends(get_db)):
    """Create a new employee."""
    return employee_service.create_employee(db, data)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: int, data: dict, db: Session = Depends(get_db)):
    """Update an employee by ID."""
    return employee_service.update_employee(db, employee_id, data)


@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """Delete an employee by ID."""
    employee_service.delete_employee(db, employee_id)
    return {"detail": "Employee deleted"}
