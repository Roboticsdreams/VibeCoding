from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import random
from app.database.database import get_db
from app.models.models import User, Interview, Topic, Difficulty, Timing, Question, QuestionBank
from app.services.auth import validate_logged_in

router = APIRouter(
    prefix="/interview",
    tags=["interview"]
)

templates = Jinja2Templates(directory="app/templates")
templates.env.globals['datetime'] = datetime

# Public interview session (no login required)
@router.get("/session/{interview_uuid}")
async def public_interview_session(
    request: Request,
    interview_uuid: str,
    db: Session = Depends(get_db)
):
    # Get the interview by UUID
    interview = db.query(Interview).filter(Interview.uuid == interview_uuid).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Only allow access if interview is pending or in_progress
    if interview.status == "completed":
        return templates.TemplateResponse(
            "interview/completed.html", 
            {
                "request": request, 
                "interview": interview
            }
        )
    
    # Update interview status if it's pending
    if interview.status == "pending":
        interview.status = "in_progress"
        db.commit()
    
    # Get related data
    topics = [topic.name for topic in interview.topics]
    difficulty = interview.difficulty.name
    
    # Generate questions if they don't exist yet
    if not interview.questions:
        # Get questions from QuestionBank
        difficulty_obj = db.query(Difficulty).filter(Difficulty.name == difficulty).first()
        
        questions_per_topic = 5 // len(interview.topics) + 1
        selected_questions = []
        
        for topic in interview.topics:
            # Get random questions for this topic and difficulty
            available_questions = db.query(QuestionBank).filter(
                QuestionBank.topic_id == topic.id,
                QuestionBank.difficulty_id == difficulty_obj.id
            ).all()
            
            if available_questions:
                # Randomly select questions
                num_to_select = min(questions_per_topic, len(available_questions))
                selected = random.sample(available_questions, num_to_select)
                selected_questions.extend(selected)
        
        # Limit to 5 questions total
        selected_questions = selected_questions[:5]
        
        # Save the questions to the interview
        for q_bank in selected_questions:
            question = Question(
                interview_id=interview.id,
                topic_id=q_bank.topic_id,
                question_text=q_bank.question_text
            )
            db.add(question)
        
        db.commit()
        db.refresh(interview)
    
    return templates.TemplateResponse(
        "interview/session.html", 
        {
            "request": request, 
            "interview": interview,
            "questions": interview.questions
        }
    )

@router.post("/session/{interview_uuid}/submit")
async def submit_public_answer(
    request: Request,
    interview_uuid: str,
    question_id: int = Form(...),
    answer: str = Form(...),
    db: Session = Depends(get_db)
):
    # Get the interview by UUID
    interview = db.query(Interview).filter(Interview.uuid == interview_uuid).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Get the question
    question = db.query(Question).filter(
        Question.id == question_id, 
        Question.interview_id == interview.id
    ).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Save the answer
    question.answer = answer
    
    # Basic scoring based on answer length and completeness
    score = 0
    feedback = "Answer received. "
    
    if len(answer.strip()) < 20:
        score = 30
        feedback += "Your answer is too brief. Please provide more details."
    elif len(answer.strip()) < 100:
        score = 60
        feedback += "Good attempt, but could be more comprehensive."
    else:
        score = 80
        feedback += "Well-detailed answer with good coverage."
    
    question.feedback = feedback
    question.score = score
    db.commit()
    
    # Check if all questions have been answered
    all_answered = True
    for q in interview.questions:
        if not q.answer:
            all_answered = False
            break
    
    # If all questions answered, complete the interview
    if all_answered:
        interview.status = "completed"
        
        # Generate simple summary
        total_score = sum(q.score for q in interview.questions if q.score)
        average_score = total_score / len(interview.questions) if interview.questions else 0
        
        performance_level = "Excellent" if average_score >= 80 else "Good" if average_score >= 60 else "Needs Improvement"
        
        summary = f"Interview completed with an average score of {average_score:.1f}/100.\n"
        summary += f"Overall Performance: {performance_level}\n\n"
        summary += f"Questions Answered: {len(interview.questions)}\n"
        summary += f"Topics Covered: {', '.join([t.name for t in interview.topics])}"
        
        interview.summary = summary
        db.commit()
        
        # Redirect to the evaluation page
        return RedirectResponse(
            url=f"/interview/evaluation/{interview_uuid}", 
            status_code=status.HTTP_303_SEE_OTHER
        )
    
    # Show feedback and continue with next question
    return templates.TemplateResponse(
        "interview/session.html", 
        {
            "request": request, 
            "interview": interview,
            "questions": interview.questions,
            "current_question_id": question_id,
            "feedback": feedback,
            "score": score
        }
    )

@router.get("/evaluation/{interview_uuid}")
async def public_interview_evaluation(
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
            url=f"/interview/session/{interview_uuid}", 
            status_code=status.HTTP_303_SEE_OTHER
        )
    
    # Calculate average score
    total_score = 0
    question_count = 0
    for question in interview.questions:
        if question.score is not None:
            total_score += question.score
            question_count += 1
    
    average_score = total_score / question_count if question_count > 0 else 0
    
    return templates.TemplateResponse(
        "interview/evaluation.html", 
        {
            "request": request, 
            "interview": interview,
            "questions": interview.questions,
            "average_score": average_score
        }
    )

# API endpoints for interview preparation
@router.post("/api/generate-questions")
async def api_generate_questions(
    request: Request,
    topic_ids: List[int] = Form(...),
    difficulty_id: int = Form(...),
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    # Get topics and difficulty
    topics = db.query(Topic).filter(Topic.id.in_(topic_ids)).all()
    difficulty = db.query(Difficulty).filter(Difficulty.id == difficulty_id).first()
    
    if not topics or not difficulty:
        return JSONResponse(
            status_code=400,
            content={"error": "Invalid topics or difficulty"}
        )
    
    # Get sample questions from QuestionBank
    questions_data = []
    for topic in topics:
        available_questions = db.query(QuestionBank).filter(
            QuestionBank.topic_id == topic.id,
            QuestionBank.difficulty_id == difficulty.id
        ).limit(2).all()
        
        for q in available_questions:
            questions_data.append({
                "topic": topic.name,
                "question": q.question_text,
                "difficulty": difficulty.name
            })
    
    return JSONResponse(
        content={"questions": questions_data[:5]}
    )

@router.get("/share/{interview_uuid}")
async def share_interview_link(
    request: Request,
    interview_uuid: str,
    db: Session = Depends(get_db)
):
    # Get the interview by UUID
    interview = db.query(Interview).filter(Interview.uuid == interview_uuid).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Generate the shareable link
    interview_link = f"{request.base_url}interview/session/{interview_uuid}"
    
    return templates.TemplateResponse(
        "interview/share.html", 
        {
            "request": request, 
            "interview": interview,
            "interview_link": interview_link
        }
    )
