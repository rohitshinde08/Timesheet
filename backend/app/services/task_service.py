from typing import List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task_schema import TaskCreate


def create_task(db: Session, data: TaskCreate) -> Task:
    """Create a new task."""
    task = Task(**data.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


def get_tasks_by_project(db: Session, project_id: int) -> List[Task]:
    """Return all tasks for a project."""
    return db.query(Task).filter(Task.project_id == project_id).all()


def update_task(db: Session, task_id: int, data: dict) -> Task:
    """Update an existing task by ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    for key, value in data.items():
        if value is not None:
            setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


def delete_task(db: Session, task_id: int) -> None:
    """Delete a task by ID."""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    db.delete(task)
    db.commit()
