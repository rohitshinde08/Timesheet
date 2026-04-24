from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker
from app.database.session import get_db
from app.schemas.task_schema import TaskCreate, TaskResponse
from app.services import task_service

router = APIRouter(
    prefix="/tasks",
    tags=["Tasks"],
    dependencies=[Depends(RoleChecker(["admin", "manager", "hr", "employee"]))],
)


@router.post("/", response_model=TaskResponse)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task."""
    return task_service.create_task(db, data)


@router.get("/project/{project_id}", response_model=List[TaskResponse])
def get_by_project(project_id: int, db: Session = Depends(get_db)):
    """Get all tasks for a project."""
    return task_service.get_tasks_by_project(db, project_id)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, data: dict, db: Session = Depends(get_db)):
    """Update a task by ID."""
    return task_service.update_task(db, task_id, data)


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a task by ID."""
    task_service.delete_task(db, task_id)
    return {"detail": "Task deleted"}
