from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.employee import Employee
from app.schemas.time_log_schema import TimeLogCreate, TimeLogResponse
from app.services import time_log_service

router = APIRouter(prefix="/time-logs", tags=["Time Logs"])


@router.post("/", response_model=TimeLogResponse)
def create_time_log(
    data: TimeLogCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Create a new time log entry (sets employee_id from token)."""
    data.employee_id = current_user.id
    return time_log_service.create_time_log(db, data)


@router.get("/my", response_model=List[TimeLogResponse])
def get_my_logs(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Get all time logs for the authenticated employee."""
    return time_log_service.get_my_time_logs(db, current_user.id)


@router.get("/project/{project_id}", response_model=List[TimeLogResponse])
def get_by_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user),
):
    """Get all time logs for a project."""
    return time_log_service.get_time_logs_by_project(db, project_id)
