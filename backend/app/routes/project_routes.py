from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import RoleChecker
from app.database.session import get_db
from app.schemas.project_schema import ProjectCreate, ProjectResponse, ProjectDetailResponse
from app.services import project_service

router = APIRouter(
    prefix="/projects",
    tags=["Projects"],
    dependencies=[Depends(RoleChecker(["admin", "hr", "manager", "employee"]))],
)


@router.get("/", response_model=List[ProjectResponse])
def list_projects(db: Session = Depends(get_db)):
    """Get all projects."""
    return project_service.get_all_projects(db)


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a single project by ID."""
    return project_service.get_project(db, project_id)


@router.post("/", response_model=ProjectResponse)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    """Create a new project."""
    return project_service.create_project(db, data)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, data: dict, db: Session = Depends(get_db)):
    """Update a project by ID."""
    return project_service.update_project(db, project_id, data)


@router.delete("/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    """Delete a project by ID."""
    project_service.delete_project(db, project_id)
    return {"detail": "Project deleted"}
