import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.session import Base


class TaskStatusEnum(str, enum.Enum):
    todo = "todo"
    in_progress = "in-progress"
    done = "done"


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assigned_to = Column(Integer, ForeignKey("employees.id"), nullable=False)
    status = Column(Enum(TaskStatusEnum), nullable=False, default=TaskStatusEnum.todo)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("Employee", back_populates="assigned_tasks", foreign_keys=[assigned_to])
    time_logs = relationship("TimeLog", back_populates="task")
