from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker
from app.database.session import get_db
from app.models.employee import Employee
from app.schemas.approval_schema import ApprovalUpdate
from app.schemas.time_log_schema import TimeLogResponse
from app.services import approval_service

router = APIRouter(
    prefix="/approvals",
    tags=["Approvals"],
)

allow_manager = RoleChecker(["admin", "manager"])


@router.get("/pending", response_model=List[TimeLogResponse])
def get_pending(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(allow_manager),
):
    """Get all pending time log approvals."""
    return approval_service.get_pending_approvals(db, current_user)


@router.put("/{time_log_id}", response_model=TimeLogResponse)
def process_approval(
    time_log_id: int,
    data: ApprovalUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(allow_manager),
):
    """Approve or reject a time log entry."""
    return approval_service.process_approval(db, time_log_id, data, current_user.id)
