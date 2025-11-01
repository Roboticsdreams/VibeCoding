from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    is_admin: bool
    is_active: bool

    class Config:
        from_attributes = True

# Topic schemas
class TopicBase(BaseModel):
    name: str

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    id: int

    class Config:
        from_attributes = True

# Difficulty schemas
class DifficultyBase(BaseModel):
    name: str

class DifficultyCreate(DifficultyBase):
    pass

class Difficulty(DifficultyBase):
    id: int

    class Config:
        from_attributes = True

# Timing schemas
class TimingBase(BaseModel):
    name: str
    minutes: int

class TimingCreate(TimingBase):
    pass

class Timing(TimingBase):
    id: int

    class Config:
        from_attributes = True

# Question schemas
class QuestionBase(BaseModel):
    question_text: str
    topic_id: int

class QuestionCreate(QuestionBase):
    interview_id: int

class QuestionUpdate(BaseModel):
    answer: Optional[str] = None
    feedback: Optional[str] = None
    score: Optional[int] = None

class Question(QuestionBase):
    id: int
    interview_id: int
    answer: Optional[str] = None
    feedback: Optional[str] = None
    score: Optional[int] = None

    class Config:
        from_attributes = True

# Interview schemas
class InterviewBase(BaseModel):
    candidate_name: str
    email: EmailStr

class InterviewCreate(InterviewBase):
    difficulty_id: int
    timing_id: int
    topic_ids: List[int]
    scheduled_date: datetime

class InterviewUpdate(BaseModel):
    candidate_name: Optional[str] = None
    email: Optional[EmailStr] = None
    difficulty_id: Optional[int] = None
    timing_id: Optional[int] = None
    scheduled_date: Optional[datetime] = None
    status: Optional[str] = None
    summary: Optional[str] = None

class Interview(InterviewBase):
    id: int
    uuid: str
    user_id: int
    difficulty_id: int
    timing_id: int
    scheduled_date: datetime
    status: str
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InterviewWithDetails(Interview):
    difficulty: Difficulty
    timing: Timing
    topics: List[Topic]
    questions: List[Question] = []

    class Config:
        from_attributes = True
