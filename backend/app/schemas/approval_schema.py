from enum import Enum
from typing import Optional

from pydantic import BaseModel


class ApprovalAction(str, Enum):
    approved = "approved"
    rejected = "rejected"


class ApprovalUpdate(BaseModel):
    action: ApprovalAction
    comment: Optional[str] = None
