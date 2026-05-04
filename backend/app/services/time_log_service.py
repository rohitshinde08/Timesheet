from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.time_log import TimeLog
from app.schemas.time_log_schema import TimeLogCreate


def create_time_log(db: Session, data: TimeLogCreate) -> TimeLog:
    """Create a new time log entry."""
    if data.hours <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logged hours must be greater than zero.",
        )
    time_log = TimeLog(**data.model_dump())
    db.add(time_log)
    db.commit()
    db.refresh(time_log)
    return time_log


def get_my_time_logs(db: Session, employee_id: int) -> List[TimeLog]:
    """Return all time logs for the current employee."""
    return db.query(TimeLog).filter(TimeLog.employee_id == employee_id).all()


def get_time_logs_by_project(db: Session, project_id: int) -> List[TimeLog]:
    """Return all time logs for a project."""
    return db.query(TimeLog).filter(TimeLog.project_id == project_id).all()


def get_all_time_logs(db: Session) -> List[TimeLog]:
    """Return all time logs."""
    return db.query(TimeLog).all()
