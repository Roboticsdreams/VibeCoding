from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import random
from uuid import uuid4  # Import UUID generator
from app.database.database import get_db
from app.models.models import User, Interview, Topic, Difficulty, Timing, QuestionBank, Question
from app.services.auth import validate_logged_in

router = APIRouter(
    prefix="/user",
    tags=["user"]
)

templates = Jinja2Templates(directory="app/templates")
templates.env.globals['datetime'] = datetime

@router.get("/dashboard")
async def dashboard(
    request: Request,
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    # Get user's interviews
    interviews = db.query(Interview).filter(Interview.user_id == user.id).order_by(Interview.created_at.desc()).all()
    
    return templates.TemplateResponse(
        "user/dashboard.html", 
        {
            "request": request, 
            "user": user,
            "interviews": interviews
        }
    )

@router.get("/request-interview")
async def request_interview_form(
    request: Request,
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    # Get topics, difficulties and timings for the form
    topics = db.query(Topic).all()
    difficulties = db.query(Difficulty).all()
    timings = db.query(Timing).all()
    
    return templates.TemplateResponse(
        "user/request_interview.html", 
        {
            "request": request, 
            "user": user,
            "topics": topics,
            "difficulties": difficulties,
            "timings": timings
        }
    )

@router.post("/request-interview")
async def request_interview(
    request: Request,
    topic_ids: List[int] = Form(...),
    difficulty_id: int = Form(...),
    timing_id: int = Form(...),
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    # Create the interview request using logged-in user info
    new_interview = Interview(
        uuid=str(uuid4()),  # Generate a UUID for the interview
        candidate_name=user.username,  # Auto-fill from user profile
        email=user.email,              # Auto-fill from user profile
        user_id=user.id,
        difficulty_id=difficulty_id,
        timing_id=timing_id,
        approval_status="requested"
    )
    
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)
    
    # Add topics to the interview
    for topic_id in topic_ids:
        topic = db.query(Topic).filter(Topic.id == topic_id).first()
        if topic:
            new_interview.topics.append(topic)
    
    return RedirectResponse(url="/user/dashboard", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/interviews/{interview_id}")
async def view_interview(
    request: Request,
    interview_id: int,
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Get topics associated with this interview
    topics = interview.topics
    
    # Get questions associated with this interview
    questions = interview.questions
    
    return templates.TemplateResponse(
        "user/interview_details.html", 
        {
            "request": request, 
            "user": user,
            "interview": interview,
            "topics": topics,
            "questions": questions
        }
    )

@router.get("/start-interview/{interview_id}")
async def start_interview(
    request: Request,
    interview_id: int,
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Check if interview is approved
    if interview.approval_status != "approved":
        raise HTTPException(status_code=400, detail="This interview has not been approved yet")
    
    # If the interview is completed, redirect to evaluation
    if interview.status == "completed":
        return RedirectResponse(url=f"/user/interview-evaluation/{interview_id}", status_code=status.HTTP_303_SEE_OTHER)
    
    # If the interview has no questions yet, generate them
    if not interview.questions or len(interview.questions) == 0:
        # Get difficulty level
        difficulty = interview.difficulty
        
        # Get topics selected for this interview
        topics = interview.topics
        
        # Get the question bank for the selected difficulty and topics
        question_bank = db.query(QuestionBank).filter(
            QuestionBank.difficulty_id == difficulty.id,
            QuestionBank.topic_id.in_([t.id for t in topics])
        ).all()
        
        # Determine how many questions to ask based on interview timing
        interview_minutes = interview.timing.minutes
        
        # Roughly one question per 5 minutes, with a minimum of 3 and maximum of 20
        num_questions = max(3, min(20, interview_minutes // 5))
        
        # Randomly select questions from the question bank
        if len(question_bank) > num_questions:
            selected_questions = random.sample(question_bank, num_questions)
        else:
            selected_questions = question_bank
        
        # Create questions for this interview
        for i, qb in enumerate(selected_questions):
            question = Question(
                interview_id=interview.id,
                
                question_text=qb.question_text,
                topic_id=qb.topic_id,
                question_order=i + 1
            )
            db.add(question)
        
        # Mark the interview as in progress
        interview.status = "in_progress"
        interview.started_at = datetime.now()
        
        db.commit()
    
    # Get the first question (or the first unanswered question)
    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).order_by(Question.question_order).all()
    
    # Find the first unanswered question, if any
    current_question = None
    for question in questions:
        if not question.answer:
            current_question = question
            break
    
    # If all questions have been answered, use the last question
    if not current_question and questions:
        current_question = questions[-1]
    
    # If still no question, something is wrong
    if not current_question:
        raise HTTPException(status_code=500, detail="No questions found for this interview")
    
    return RedirectResponse(url=f"/user/answer-question/{interview_id}/{current_question.id}", status_code=status.HTTP_303_SEE_OTHER)

# Complete rewrite of the answer_question_form handler to ensure answers display correctly
@router.get("/answer-question/{interview_id}/{question_id}")
async def answer_question_form(
    request: Request,
    interview_id: int,
    question_id: int,
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    # Get the interview
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Check if interview is approved and in progress
    if interview.approval_status != "approved":
        raise HTTPException(status_code=400, detail="This interview has not been approved yet")
    
    # Get all questions for navigation
    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).order_by(Question.question_order).all()
    
    # Get the current question
    current_question = db.query(Question).filter(
        Question.id == question_id,
        Question.interview_id == interview_id
    ).first()
    
    if not current_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Find the current question index for displaying progress
    current_question_index = next((i for i, q in enumerate(questions) if q.id == question_id), 0)
    
    # Get previous and next questions for navigation
    prev_question = questions[current_question_index - 1] if current_question_index > 0 else None
    next_question = questions[current_question_index + 1] if current_question_index < len(questions) - 1 else None
    
    # Log debug information about the question's answer
    print(f"Debug - Question {question_id}: Answer = {repr(current_question.answer)}")
    
    # Create explicit template context
    template_context = {
        "request": request,
        "user": user,
        "interview": interview,
        "questions": questions,
        "current_question": current_question,
        "current_question_index": current_question_index,
        "prev_question": prev_question,
        "next_question": next_question,
    }
    
    return templates.TemplateResponse("user/interview_session.html", template_context)
@router.post("/answer-question/{interview_id}/{question_id}")
async def submit_answer(
    request: Request,
    interview_id: int,
    question_id: int,
    answer: str = Form(...),
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    # Get the question
    question = db.query(Question).filter(
        Question.id == question_id,
        Question.interview_id == interview_id
    ).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Save the answer
    question.answer = answer
    print(f"Saved answer for question {question_id}: {answer[:30]}...")
    question.answered_at = datetime.now()
    db.commit()
    
    # Get all questions for the interview
    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).order_by(Question.question_order).all()
    
    # Find the current question index
    current_question_index = next((i for i, q in enumerate(questions) if q.id == question_id), 0)
    
    # Check if there is a next question
    if current_question_index < len(questions) - 1:
        next_question = questions[current_question_index + 1]
        return RedirectResponse(
            url=f"/user/answer-question/{interview_id}/{next_question.id}", 
            status_code=status.HTTP_303_SEE_OTHER
        )
    else:
        # If this was the last question, mark the interview as completed
        interview = db.query(Interview).filter(
            Interview.id == interview_id,
            Interview.user_id == user.id
        ).first()
        
        if interview:
            interview.status = "completed"
            interview.completed_at = datetime.now()
            db.commit()
        
        return RedirectResponse(
            url=f"/user/finish-interview/{interview_id}", 
            status_code=status.HTTP_303_SEE_OTHER
        )

@router.get("/finish-interview/{interview_id}")
async def finish_interview(
    request: Request,
    interview_id: int,
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    # Get the interview
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Mark the interview as completed
    interview.status = "completed"
    interview.completed_at = datetime.now()
    db.commit()
    
    # Redirect to the evaluation page
    return RedirectResponse(
        url=f"/user/interview-evaluation/{interview_id}", 
        status_code=status.HTTP_303_SEE_OTHER
    )

@router.get("/interview-evaluation/{interview_id}")
async def interview_evaluation(
    request: Request,
    interview_id: int,
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    # Get the interview
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == user.id
    ).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Check if interview is completed
    if interview.status != "completed":
        raise HTTPException(status_code=400, detail="This interview is not completed yet")
    
    # Get questions with answers
    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).order_by(Question.question_order).all()
    
    # Calculate average score (if questions have been evaluated)
    scores = [q.score for q in questions if q.score is not None]
    average_score = sum(scores) / len(scores) if scores else 0
    
    return templates.TemplateResponse(
        "user/interview_evaluation.html", 
        {
            "request": request, 
            "user": user,
            "interview": interview,
            "questions": questions,
            "average_score": average_score
        }
    )

@router.get("/debug/question/{interview_id}/{question_id}")
async def debug_question_data(
    request: Request,
    interview_id: int,
    question_id: int,
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    """Debug version of the question page that shows all data"""
    # Get the interview
    interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == user.id
    ).first()
    
    if not interview:
        return HTMLResponse(content="<html><body>Interview not found</body></html>", status_code=404)
    
    # Get all questions for navigation
    questions = db.query(Question).filter(
        Question.interview_id == interview_id
    ).order_by(Question.question_order).all()
    
    # Get the current question
    current_question = db.query(Question).filter(
        Question.id == question_id,
        Question.interview_id == interview_id
    ).first()
    
    if not current_question:
        return HTMLResponse(content="<html><body>Question not found</body></html>", status_code=404)
    
    # Find the current question index for displaying progress
    current_question_index = next((i for i, q in enumerate(questions) if q.id == question_id), 0)
    
    # Get previous and next questions for navigation
    prev_question = questions[current_question_index - 1] if current_question_index > 0 else None
    next_question = questions[current_question_index + 1] if current_question_index < len(questions) - 1 else None
    
    # Create a dict of all the data we're sending to the template
    template_data = {
        "request": str(request),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        },
        "interview": {
            "id": interview.id,
            "candidate_name": interview.candidate_name,
            "status": interview.status,
            "difficulty": interview.difficulty.name if interview.difficulty else None,
            "timing_minutes": interview.timing.minutes if interview.timing else None
        },
        "questions": [{"id": q.id, "text": q.question_text[:50], "answer": bool(q.answer)} for q in questions],
        "current_question": {
            "id": current_question.id,
            "text": current_question.question_text,
            "answer": current_question.answer,
        },
        "current_question_index": current_question_index,
        "prev_question_id": prev_question.id if prev_question else None,
        "next_question_id": next_question.id if next_question else None
    }
    
    # Generate HTML
    html_content = f"""
    <html>
        <head>
            <title>Question Debug</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                pre {{ background-color: #f0f0f0; padding: 10px; overflow-x: auto; }}
                .card {{ border: 1px solid #ddd; border-radius: 5px; padding: 10px; margin-bottom: 20px; }}
                textarea {{ width: 100%; height: 200px; }}
                .btn {{ padding: 8px 16px; background-color: #4CAF50; color: white; text-decoration: none; margin-right: 10px; }}
            </style>
        </head>
        <body>
            <h1>Interview Question Debug</h1>
            
            <div class="card">
                <h2>Interview Information:</h2>
                <p>ID: {interview.id}</p>
                <p>Candidate: {interview.candidate_name}</p>
                <p>Status: {interview.status}</p>
                <p>Approval: {interview.approval_status}</p>
                <p>Difficulty: {interview.difficulty.name if interview.difficulty else 'None'}</p>
                <p>Timing: {interview.timing.minutes if interview.timing else 'None'} minutes</p>
            </div>
            
            <div class="card">
                <h2>Current Question:</h2>
                <p>ID: {current_question.id}</p>
                <p>Order: {current_question.question_order}</p>
                <p>Text: {current_question.question_text}</p>
                <form method="post" action="/user/answer-question/{interview_id}/{current_question.id}">
                    <textarea name="answer">{current_question.answer or ''}</textarea>
                    <div style="margin-top: 10px;">
                        <button type="submit" class="btn">Save Answer</button>
                    </div>
                </form>
            </div>
            
            <div class="card">
                <h2>Navigation:</h2>
                <p>Question {current_question_index + 1} of {len(questions)}</p>
                <div>
                    {f'<a href="/user/debug/question/{interview_id}/{prev_question.id}" class="btn">Previous</a>' if prev_question else '<span>No previous</span>'}
                    {f'<a href="/user/debug/question/{interview_id}/{next_question.id}" class="btn">Next</a>' if next_question else '<span>No next</span>'}
                </div>
                <div style="margin-top: 10px;">
                    <a href="/user/debug" class="btn">Debug Dashboard</a>
                </div>
            </div>
            
            <div class="card">
                <h2>All Questions:</h2>
                <ul>
                    {
                        "".join([
                            f'<li><a href="/user/debug/question/{interview_id}/{q.id}">{q.question_order or "?"}: {q.question_text[:50]}...</a> {" (Answered)" if q.answer else ""}</li>'
                            for q in questions
                        ])
                    }
                </ul>
            </div>
            
            <div class="card">
                <h2>Template Debug Info:</h2>
                <p>Base template blocks needed: main_content</p>
                <p>Session template blocks defined: main_content</p>
            </div>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@router.get("/profile")
async def user_profile(
    request: Request,
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    """User profile page where they can update their information"""
    return templates.TemplateResponse(
        "user/profile.html", 
        {
            "request": request, 
            "user": user
        }
    )
