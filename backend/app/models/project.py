import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.session import Base


class ProjectStatusEnum(str, enum.Enum):
    active = "active"
    completed = "completed"


class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    estimated_hours = Column(Float, nullable=True)
    estimated_days = Column(Float, nullable=True)
    status = Column(Enum(ProjectStatusEnum), nullable=False, default=ProjectStatusEnum.active)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    manager_id = Column(Integer, ForeignKey("employees.id"), nullable=True)
    manager = relationship("Employee", back_populates="managed_projects", foreign_keys=[manager_id])
    allocations = relationship("Allocation", back_populates="project")
    tasks = relationship("Task", back_populates="project")
    time_logs = relationship("TimeLog", back_populates="project")
