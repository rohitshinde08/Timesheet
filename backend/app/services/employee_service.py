from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.employee import Employee
from app.schemas.employee_schema import EmployeeCreate


def get_all_employees(db: Session) -> List[Employee]:
    """Return all employees."""
    return db.query(Employee).all()


def create_employee(db: Session, data: EmployeeCreate) -> Employee:
    """Create a new employee."""
    existing = db.query(Employee).filter(Employee.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    employee = Employee(
        name=data.name,
        email=data.email,
        password=hash_password(data.password),
        role=data.role,
    )
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


def update_employee(db: Session, employee_id: int, data: dict) -> Employee:
    """Update an existing employee by ID."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    for key, value in data.items():
        if value is not None:
            if key == "password":
                value = hash_password(value)
            setattr(employee, key, value)

    db.commit()
    db.refresh(employee)
    return employee


def delete_employee(db: Session, employee_id: int) -> None:
    """Delete an employee by ID."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    db.delete(employee)
    db.commit()
