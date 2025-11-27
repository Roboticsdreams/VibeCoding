from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, Table, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

# Association table for many-to-many relationship between Interview and Topic
interview_topics = Table(
    "interview_topics",
    Base.metadata,
    Column("interview_id", Integer, ForeignKey("interviews.id"), primary_key=True),
    Column("topic_id", Integer, ForeignKey("topics.id"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    interviews = relationship("Interview", foreign_keys="Interview.user_id", back_populates="user")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    uuid = Column(String, unique=True, index=True)
    candidate_name = Column(String)
    email = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    difficulty_id = Column(Integer, ForeignKey("difficulties.id"))
    timing_id = Column(Integer, ForeignKey("timings.id"))
    status = Column(String, default="pending")  # pending, in_progress, completed
    approval_status = Column(String, default="requested")  # requested, approved, rejected
    approved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="interviews")
    approver = relationship("User", foreign_keys=[approved_by])
    difficulty = relationship("Difficulty", back_populates="interviews")
    timing = relationship("Timing", back_populates="interviews")
    topics = relationship("Topic", secondary=interview_topics, back_populates="interviews")
    questions = relationship("Question", back_populates="interview")

class Topic(Base):
    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    
    # Relationships
    interviews = relationship("Interview", secondary=interview_topics, back_populates="topics")

class Difficulty(Base):
    __tablename__ = "difficulties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    
    # Relationships
    interviews = relationship("Interview", back_populates="difficulty")

class Timing(Base):
    __tablename__ = "timings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)
    minutes = Column(Integer)
    
    # Relationships
    interviews = relationship("Interview", back_populates="timing")

class QuestionBank(Base):
    __tablename__ = "question_bank"

    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    difficulty_id = Column(Integer, ForeignKey("difficulties.id"))
    question_text = Column(Text)
    model_answer = Column(Text, nullable=True)  # Added this field for sample answers
    
    # Relationships
    topic = relationship("Topic")
    difficulty = relationship("Difficulty")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    question_text = Column(Text)
    answer = Column(Text, nullable=True)
    feedback = Column(Text, nullable=True)
    score = Column(Integer, nullable=True)
    question_order = Column(Integer, nullable=True)  # Renamed from 'order' to avoid SQL keyword conflict
    answered_at = Column(DateTime, nullable=True)
    
    # Relationships
    interview = relationship("Interview", back_populates="questions")
    topic = relationship("Topic")
