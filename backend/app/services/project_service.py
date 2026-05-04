from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.project import Project
from app.schemas.project_schema import ProjectCreate
from sqlalchemy import func
from app.models.time_log import TimeLog

def get_all_projects(db: Session) -> List[Project]:
    """Return all active projects with manager names."""
    projects = db.query(Project).filter(Project.status != "inactive").all()
    for p in projects:
        if p.manager:
            p.manager_name = p.manager.name
    return projects


def get_project(db: Session, project_id: int) -> Project:
    """Get a project by ID with all details."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    
    # Simple aggregation for total hours
    total_hours = db.query(func.sum(TimeLog.hours)).filter(TimeLog.project_id == project_id).scalar()
    project.total_logged_hours = total_hours or 0.0
    
    # Ensure manager name is set
    if project.manager:
        project.manager_name = project.manager.name
        
    return project


def create_project(db: Session, data: ProjectCreate) -> Project:
    """Create a new project."""
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project_id: int, data: dict) -> Project:
    """Update an existing project by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    for key, value in data.items():
        if value is not None:
            setattr(project, key, value)

    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: int) -> None:
    """Soft delete a project by setting status to inactive."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    project.status = "inactive"
    db.commit()
