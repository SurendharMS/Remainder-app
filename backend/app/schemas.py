from datetime import datetime, date
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict

RecurrencePattern = Literal["once", "daily", "weekly", "monthly", "yearly"]
TaskStatus = Literal["pending", "completed"]

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    note: Optional[str] = None
    recurrence_pattern: RecurrencePattern = "once"
    due_date: datetime

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    note: Optional[str] = None
    recurrence_pattern: Optional[RecurrencePattern] = None
    due_date: Optional[datetime] = None
    status: Optional[TaskStatus] = None

class TaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    title: str
    note: Optional[str] = None
    recurrence_pattern: RecurrencePattern
    status: TaskStatus
    created_at: datetime
    due_date: datetime
    completed_at: Optional[datetime] = None

class ImportantDateBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    event_date: date

class ImportantDateCreate(ImportantDateBase):
    pass

class ImportantDateUpdate(BaseModel):
    title: Optional[str] = None
    event_date: Optional[date] = None

class ImportantDateResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: Optional[str] = None
    title: str
    event_date: date
    created_at: datetime
    days_remaining: Optional[int] = None

class AuthenticatedUser(BaseModel):
    id: str
    github_username: str
    email: Optional[str] = None
