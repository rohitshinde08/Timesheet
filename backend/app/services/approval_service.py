from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.employee import Employee, RoleEnum
from app.models.project import Project
from app.models.time_log import TimeLog, TimeLogStatusEnum
from app.schemas.approval_schema import ApprovalUpdate


def get_pending_approvals(db: Session, current_user: Employee) -> List[TimeLog]:
    """Return all time logs with pending status, filtered for project manager if not admin."""
    query = db.query(TimeLog).filter(TimeLog.status == TimeLogStatusEnum.pending)
    
    if current_user.role != RoleEnum.admin:
        # Get only logs for projects where the manager matches current_user
        query = query.join(Project).filter(Project.manager_id == current_user.id)
        
    return query.all()


def process_approval(
    db: Session,
    time_log_id: int,
    data: ApprovalUpdate,
    approver_id: int,
) -> TimeLog:
    """Approve or reject a time log entry."""
    time_log = db.query(TimeLog).filter(TimeLog.id == time_log_id).first()
    if not time_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time log not found",
        )

    # Validate that current manager actually owns the project, unless admin
    current_user = db.query(Employee).filter(Employee.id == approver_id).first()
    if current_user and current_user.role != RoleEnum.admin:
        if not time_log.project or time_log.project.manager_id != approver_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to approve logs for this project",
            )

    if time_log.status != TimeLogStatusEnum.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time log has already been processed",
        )

    time_log.status = data.action.value
    time_log.approved_by = approver_id

    db.commit()
    db.refresh(time_log)
    return time_log
