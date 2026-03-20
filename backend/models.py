from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime


# ─── User Models ────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None


class UserResponse(BaseModel):
    id: UUID
    name: str
    email: str
    created_at: datetime


# ─── Chat Models ─────────────────────────────────────────────────────────────

class ChatCreate(BaseModel):
    user_id: UUID
    role: str          # "user" or "assistant"
    message: str


class ChatResponse(BaseModel):
    id: UUID
    user_id: UUID
    role: str
    message: str
    created_at: datetime
