from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RoleEnum(str, Enum):
    admin = "admin"
    hr = "hr"
    manager = "manager"
    employee = "employee"


class EmployeeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    role: RoleEnum = RoleEnum.employee


class EmployeeCreate(EmployeeBase):
    password: str = Field(..., min_length=6, max_length=255)


class EmployeeResponse(EmployeeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
