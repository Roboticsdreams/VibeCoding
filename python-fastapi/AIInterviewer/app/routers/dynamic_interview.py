from fastapi import APIRouter, Depends, HTTPException, Request, Form, Query
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from app.database.database import get_db
from app.models.models import User, Interview, Topic, Difficulty, Question
from app.services.auth import validate_logged_in
from app.services.openai_service import OpenAIService

router = APIRouter(
    prefix="/interview",
    tags=["dynamic_interview"]
)

templates = Jinja2Templates(directory="app/templates")

@router.get("/ai-intro")
async def ai_intro_page(
    request: Request,
    user: User = Depends(validate_logged_in)
):
    """Show introduction page for AI-powered interviews"""
    return templates.TemplateResponse(
        "interview/ai_intro.html", 
        {"request": request, "user": user}
    )

@router.get("/create-dynamic")
async def create_dynamic_interview_form(
    request: Request,
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    # Get all topics and difficulties
    topics = db.query(Topic).all()
    difficulties = db.query(Difficulty).all()
    
    return templates.TemplateResponse(
        "interview/dynamic_interview.html", 
        {
            "request": request, 
            "topics": topics,
            "difficulties": difficulties
        }
    )

@router.get("/dynamic-session/{interview_uuid}")
async def dynamic_interview_session(
    request: Request,
    interview_uuid: str,
    question_index: int = Query(0),
    db: Session = Depends(get_db)
):
    # Get the interview by UUID
    interview = db.query(Interview).filter(Interview.uuid == interview_uuid).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Only allow access if interview is pending or in_progress
    if interview.status == "completed":
        return RedirectResponse(
            url=f"/interview/dynamic-evaluation/{interview_uuid}", 
            status_code=302
        )
    
    # Update interview status if it's pending
    if interview.status == "pending":
        interview.status = "in_progress"
        interview.started_at = datetime.now()
        db.commit()
    
    # Get all questions
    questions = interview.questions
    
    # Calculate progress
    total_questions = len(questions)
    if total_questions == 0:
        raise HTTPException(status_code=400, detail="No questions found for this interview")
    
    # Make sure question_index is valid
    if question_index >= total_questions:
        question_index = 0
    
    current_question = questions[question_index]
    progress = int((question_index / total_questions) * 100)
    
    # Get related data
    topics = [topic.name for topic in interview.topics]
    difficulty = interview.difficulty.name
    
    return templates.TemplateResponse(
        "interview/dynamic_session.html", 
        {
            "request": request, 
            "interview": interview,
            "questions": questions,
            "current_question": current_question,
            "current_question_index": question_index,
            "total_questions": total_questions,
            "progress": progress,
            "topics": topics,
            "difficulty": difficulty,
            "is_last_question": question_index == total_questions - 1,
            "feedback": request.query_params.get("feedback"),
            "evaluation": request.query_params.get("evaluation")
        }
    )

@router.get("/dynamic-evaluation/{interview_uuid}")
async def dynamic_interview_evaluation(
    request: Request,
    interview_uuid: str,
    db: Session = Depends(get_db)
):
    # Get the interview by UUID
    interview = db.query(Interview).filter(Interview.uuid == interview_uuid).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Check if interview is completed
    if interview.status != "completed":
        return RedirectResponse(
            url=f"/interview/dynamic-session/{interview_uuid}", 
            status_code=302
        )
    
    # Get topics and difficulty
    topics = [topic.name for topic in interview.topics]
    difficulty = interview.difficulty.name
    
    # Parse summary from the interview
    if interview.summary:
        summary_data = interview.summary
    else:
        summary_data = "No summary available."
    
    # Calculate overall score
    questions = interview.questions
    scores = [q.score for q in questions if q.score is not None]
    overall_score = round(sum(scores) / len(scores)) if scores else 0
    
    # Extract basic topic scores (in a real implementation, this would be parsed from the AI summary)
    topic_scores = {}
    for topic in interview.topics:
        topic_questions = [q for q in questions if q.topic_id == topic.id]
        if topic_questions:
            topic_scores[topic.name] = round(sum(q.score for q in topic_questions if q.score is not None) / len(topic_questions))
        else:
            topic_scores[topic.name] = 0
    
    # Extract strengths and areas for improvement (would be parsed from AI summary)
    # For now using placeholder data
    strengths = [
        "Successfully answered technical questions",
        "Demonstrated knowledge in key areas"
    ]
    
    areas_for_improvement = [
        "Provide more detailed examples in responses",
        "Review core concepts in some topics"
    ]
    
    return templates.TemplateResponse(
        "interview/dynamic_evaluation.html", 
        {
            "request": request, 
            "interview": interview,
            "questions": questions,
            "topics": topics,
            "difficulty": difficulty,
            "summary": summary_data,
            "overall_score": overall_score,
            "topic_scores": topic_scores,
            "strengths": strengths,
            "areas_for_improvement": areas_for_improvement
        }
    )
