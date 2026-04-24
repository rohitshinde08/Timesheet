from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker, get_current_user
from app.database.session import get_db
from app.models.employee import Employee
from app.schemas.auth_schema import LoginRequest, TokenResponse
from app.schemas.employee_schema import EmployeeCreate, EmployeeResponse
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate and return a JWT token."""
    return auth_service.authenticate(db, data)


@router.post(
    "/register",
    response_model=EmployeeResponse,
    dependencies=[Depends(RoleChecker(["admin"]))],
)
def register(data: EmployeeCreate, db: Session = Depends(get_db)):
    """Register a new employee (admin only)."""
    return auth_service.register_employee(db, data)
