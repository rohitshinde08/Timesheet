from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.employee import Employee
from app.schemas.auth_schema import LoginRequest, TokenResponse
from app.schemas.employee_schema import EmployeeCreate


def register_employee(db: Session, data: EmployeeCreate) -> Employee:
    """Register a new employee (admin only)."""
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


def authenticate(db: Session, data: LoginRequest) -> TokenResponse:
    """Authenticate user and return JWT token."""
    user = db.query(Employee).filter(Employee.email == data.email).first()
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if user.status == "inactive":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    token = create_access_token(data={"sub": str(user.id), "role": user.role.value, "email": user.email})
    return TokenResponse(access_token=token)
