from sqlalchemy import Column, Float, ForeignKey, Integer
from sqlalchemy.orm import relationship

from app.database.session import Base


class Allocation(Base):
    __tablename__ = "allocations"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    allocation_percent = Column(Float, nullable=False)

    # Relationships
    employee = relationship("Employee", back_populates="allocations")
    project = relationship("Project", back_populates="allocations")
