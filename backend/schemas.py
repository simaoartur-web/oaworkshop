from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ProjectBase(BaseModel):
    title: str
    category: str
    location: str
    client: Optional[str] = None
    completion_year: Optional[int] = None
    description: Optional[str] = None
    thumbnail_url: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field, EmailStr

class LeadBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    subject: Optional[str] = Field(None, max_length=150)
    message: str = Field(..., min_length=5, max_length=2000)

class LeadCreate(LeadBase):
    pass

class Lead(LeadBase):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
