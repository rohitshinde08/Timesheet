import enum
from datetime import date, datetime

from sqlalchemy import Column, Date, DateTime, Enum, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship

from app.database.session import Base


class TimeLogStatusEnum(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class TimeLog(Base):
    __tablename__ = "time_logs"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    date = Column(Date, nullable=False)
    hours = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TimeLogStatusEnum), nullable=False, default=TimeLogStatusEnum.pending)
    approved_by = Column(Integer, ForeignKey("employees.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    employee = relationship("Employee", back_populates="time_logs", foreign_keys=[employee_id])
    project = relationship("Project", back_populates="time_logs")
    task = relationship("Task", back_populates="time_logs")
    approver = relationship("Employee", back_populates="approved_logs", foreign_keys=[approved_by])
