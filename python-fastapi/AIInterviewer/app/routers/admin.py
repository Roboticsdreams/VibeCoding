from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from fastapi.responses import RedirectResponse, HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List, Optional
import json
from datetime import datetime
from app.database.database import get_db
from app.models.models import User, Interview, Topic, Difficulty, Timing, Question, QuestionBank
from app.services.auth import validate_admin

router = APIRouter(
    prefix="/admin",
    tags=["admin"]
)

templates = Jinja2Templates(directory="app/templates")
templates.env.globals['datetime'] = datetime

@router.get("/questions")
async def list_questions(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # We only want to show questions from the question bank, not from interviews
    
    # Get questions from the question bank
    question_bank = db.query(QuestionBank).all()
    
    # Prepare data for the template
    question_bank_items = []
    
    # Process question bank items
    for qb in question_bank:
        # Only include if we have topic and difficulty
        if qb.topic and qb.difficulty:
            question_bank_items.append({
                "id": qb.id,  # Prefix to distinguish from interview questions
                "question_text": qb.question_text,
                "answer": None,
                "model_answer": qb.model_answer,  # No answer for question bank items
                "model_answer": qb.model_answer,  # Include model answer if available
                "topic": qb.topic,
                "difficulty": qb.difficulty,
                "interview": None  # No interview for question bank items
            })
    
    # Get all topics and difficulties for filters
    topics = db.query(Topic).all()
    difficulties = db.query(Difficulty).all()
    
    return templates.TemplateResponse(
        "admin/questions.html", 
        {
            "request": request, 
            "admin": admin,
            "all_questions": question_bank_items,
            "topics": topics,
            "difficulties": difficulties
        }
    )
@router.get("/questions-debug")
async def list_questions_debug(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    """Debug version of the questions list that shows raw data"""
    # Get questions from actual interviews - these will have answers
    interview_questions = db.query(Question).all()
    
    # Get questions from the question bank
    question_bank = db.query(QuestionBank).all()
    
    # Create simple response
    interview_q_data = [{"id": q.id, "text": q.question_text[:50], "has_topic": bool(q.topic)} for q in interview_questions]
    bank_q_data = [{"id": q.id, "text": q.question_text[:50], "has_topic": bool(q.topic)} for q in question_bank]
    
    html_content = f"""
    <html>
        <head>
            <title>Questions Debug</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
            </style>
        </head>
        <body>
            <h1>Questions Debug</h1>
            
            <h2>Interview Questions ({len(interview_questions)})</h2>
            <pre>{json.dumps(interview_q_data, indent=2)}</pre>
            
            <h2>Question Bank ({len(question_bank)})</h2>
            <pre>{json.dumps(bank_q_data, indent=2)}</pre>
            
            <p><a href="/admin/questions">Back to Questions</a></p>
        </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@router.get("/dashboard")
async def dashboard(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Get stats for dashboard
    user_count = db.query(User).count()
    interview_count = db.query(Interview).count()
    requested_interviews_count = db.query(Interview).filter(Interview.approval_status == "requested").count()
    
    # Get additional stats
    completed_count = db.query(Interview).filter(Interview.status == "completed").count()
    in_progress_count = db.query(Interview).filter(Interview.status == "in_progress").count()
    rejected_count = db.query(Interview).filter(Interview.approval_status == "rejected").count()
    
    # Get counts for the question bank
    question_count = db.query(QuestionBank).count()
    topic_count = db.query(Topic).count()
    difficulty_count = db.query(Difficulty).count()
    
    # Get recent interviews
    recent_interviews = db.query(Interview).order_by(Interview.created_at.desc()).limit(5).all()
    
    return templates.TemplateResponse(
        "admin/dashboard.html", 
        {
            "request": request, 
            "admin": admin,
            "user_count": user_count,
            "interview_count": interview_count,
            "requested_interviews_count": requested_interviews_count,
            "recent_interviews": recent_interviews,
            "completed_count": completed_count,
            "in_progress_count": in_progress_count,
            "rejected_count": rejected_count,
            "question_count": question_count,
            "topic_count": topic_count,
            "difficulty_count": difficulty_count
        }
    )

@router.get("/users")
async def list_users(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).all()
    
    return templates.TemplateResponse(
        "admin/users.html", 
        {
            "request": request, 
            "admin": admin,
            "users": users
        }
    )

@router.get("/users/add")
async def add_user_form(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    return templates.TemplateResponse(
        "admin/user_form.html", 
        {
            "request": request, 
            "admin": admin,
            "action": "add"
        }
    )

@router.post("/users/add")
async def add_user(
    request: Request,
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    is_admin: bool = Form(False),
    is_active: bool = Form(True),
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Check if username or email already exists
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Create new user
    from app.services.auth import get_password_hash
    hashed_password = get_password_hash(password)
    
    new_user = User(
        username=username,
        email=email,
        hashed_password=hashed_password,
        is_admin=is_admin,
        is_active=is_active
    )
    
    db.add(new_user)
    db.commit()
    
    return RedirectResponse(url="/admin/users", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/users/edit/{user_id}")
async def edit_user_form(
    request: Request,
    user_id: int,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Get user by ID
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return templates.TemplateResponse(
        "admin/user_form.html", 
        {
            "request": request, 
            "admin": admin,
            "action": "edit",
            "user": user
        }
    )

@router.post("/users/edit/{user_id}")
async def edit_user(
    request: Request,
    user_id: int,
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(None),
    is_admin: bool = Form(False),
    is_active: bool = Form(True),
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Get user by ID
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if username or email already exists (excluding current user)
    if db.query(User).filter(User.username == username, User.id != user_id).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    if db.query(User).filter(User.email == email, User.id != user_id).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    # Update user
    user.username = username
    user.email = email
    user.is_admin = is_admin
    user.is_active = is_active
    
    # Update password if provided
    if password:
        from app.services.auth import get_password_hash
        user.hashed_password = get_password_hash(password)
    
    db.commit()
    
    return RedirectResponse(url="/admin/users", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/interviews")
async def list_interviews(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Get all interviews
    interviews = db.query(Interview).all()
    
    # Separate pending approval interviews
    pending_interviews = [i for i in interviews if i.approval_status == "requested"]
    other_interviews = [i for i in interviews if i.approval_status != "requested"]
    
    # Get topics, difficulties and timings for the schedule modal
    topics = db.query(Topic).all()
    difficulties = db.query(Difficulty).all()
    timings = db.query(Timing).all()
    
    # Get all active users for the schedule modal
    users = db.query(User).filter(User.is_active == True).all()
    
    return templates.TemplateResponse(
        "admin/interviews.html", 
        {
            "request": request, 
            "admin": admin,
            "pending_interviews": pending_interviews,
            "other_interviews": other_interviews,
            "interviews": interviews,
            "topics": topics,
            "difficulties": difficulties,
            "timings": timings,
            "users": users
        }
    )

async def list_interviews(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Get all interviews
    interviews = db.query(Interview).all()
    
    # Separate pending approval interviews
    pending_interviews = [i for i in interviews if i.approval_status == "requested"]
    other_interviews = [i for i in interviews if i.approval_status != "requested"]
    
    # Get topics, difficulties and timings for the schedule modal
    topics = db.query(Topic).all()
    difficulties = db.query(Difficulty).all()
    timings = db.query(Timing).all()
    
    # Get all active users for the schedule modal
    users = db.query(User).filter(User.is_active == True).all()
    
    return templates.TemplateResponse(
        "admin/interviews.html", 
        {
            "request": request, 
            "admin": admin,
            "pending_interviews": pending_interviews,
            "other_interviews": other_interviews,
            "topics": topics,
            "difficulties": difficulties,
            "timings": timings,
            "users": users
        }
    )

@router.get("/interviews/{interview_id}")
async def view_interview(
    request: Request,
    interview_id: int,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Get questions for this interview
    questions = db.query(Question).filter(Question.interview_id == interview_id).all()
    
    return templates.TemplateResponse(
        "admin/interview_details.html", 
        {
            "request": request, 
            "admin": admin,
            "interview": interview,
            "questions": questions
        }
    )

@router.post("/interviews/schedule")
async def schedule_interview(
    request: Request,
    user_id: int = Form(...),
    difficulty_id: int = Form(...),
    timing_id: int = Form(...),
    topic_ids: List[int] = Form(...),
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Get the user
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create a unique identifier for the interview
    from uuid import uuid4
    
    # Create interview
    interview = Interview(
        uuid=str(uuid4()),
        candidate_name=user.username,
        email=user.email,
        user_id=user.id,
        difficulty_id=difficulty_id,
        timing_id=timing_id,
        status="pending",
        approval_status="approved",
        approved_by=admin.id,
        approved_at=datetime.now()
    )
    
    db.add(interview)
    db.commit()
    
    # Add topics
    for topic_id in topic_ids:
        topic = db.query(Topic).filter(Topic.id == topic_id).first()
        if topic:
            interview.topics.append(topic)
    
    db.commit()
    
    return RedirectResponse(url="/admin/interviews", status_code=status.HTTP_303_SEE_OTHER)

@router.post("/interviews/approve/{interview_id}")
async def approve_interview(
    request: Request,
    interview_id: int,
    admin_notes: str = Form(None),
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Get interview by ID
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Update interview
    interview.approval_status = "approved"
    interview.approved_by = admin.id
    interview.approved_at = datetime.now()
    
    if admin_notes:
        interview.admin_notes = admin_notes
    
    db.commit()
    
    # Return a success response for fetch API
    if "application/json" in request.headers.get("accept", ""):
        return JSONResponse(content={"success": True})
    else:
        return RedirectResponse(url="/admin/interviews", status_code=status.HTTP_303_SEE_OTHER)

@router.post("/interviews/reject/{interview_id}")
async def reject_interview(
    request: Request,
    interview_id: int,
    admin_notes: str = Form(None),
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Get interview by ID
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    # Update interview
    interview.approval_status = "rejected"
    interview.approved_by = admin.id
    interview.approved_at = datetime.now()
    
    if admin_notes:
        interview.admin_notes = admin_notes
    
    db.commit()
    
    # Return a success response for fetch API
    if "application/json" in request.headers.get("accept", ""):
        return JSONResponse(content={"success": True})
    else:
        return RedirectResponse(url="/admin/interviews", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/topics")
async def list_topics(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    topics = db.query(Topic).all()
    
    return templates.TemplateResponse(
        "admin/topics.html", 
        {
            "request": request, 
            "admin": admin,
            "topics": topics
        }
    )

@router.get("/topics/add")
async def add_topic_form(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    return templates.TemplateResponse(
        "admin/topic_form.html", 
        {
            "request": request, 
            "admin": admin,
            "action": "add"
        }
    )

@router.post("/topics/add")
async def add_topic(
    request: Request,
    name: str = Form(...),
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Check if topic already exists
    if db.query(Topic).filter(Topic.name == name).first():
        raise HTTPException(status_code=400, detail="Topic already exists")
    
    # Create new topic
    new_topic = Topic(name=name)
    db.add(new_topic)
    db.commit()
    
    return RedirectResponse(url="/admin/topics", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/difficulties")
async def list_difficulties(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    difficulties = db.query(Difficulty).all()
    
    return templates.TemplateResponse(
        "admin/difficulties.html", 
        {
            "request": request, 
            "admin": admin,
            "difficulties": difficulties
        }
    )

@router.get("/difficulties/add")
async def add_difficulty_form(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    return templates.TemplateResponse(
        "admin/difficulty_form.html", 
        {
            "request": request, 
            "admin": admin,
            "action": "add"
        }
    )

@router.post("/difficulties/add")
async def add_difficulty(
    request: Request,
    name: str = Form(...),
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Check if difficulty already exists
    if db.query(Difficulty).filter(Difficulty.name == name).first():
        raise HTTPException(status_code=400, detail="Difficulty already exists")
    
    # Create new difficulty
    new_difficulty = Difficulty(name=name)
    db.add(new_difficulty)
    db.commit()
    
    return RedirectResponse(url="/admin/difficulties", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/timings")
async def list_timings(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    timings = db.query(Timing).all()
    
    return templates.TemplateResponse(
        "admin/timings.html", 
        {
            "request": request, 
            "admin": admin,
            "timings": timings
        }
    )

@router.get("/timings/add")
async def add_timing_form(
    request: Request,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    return templates.TemplateResponse(
        "admin/timing_form.html", 
        {
            "request": request, 
            "admin": admin,
            "action": "add"
        }
    )

@router.post("/timings/add")
async def add_timing(
    request: Request,
    name: str = Form(...),
    minutes: int = Form(...),
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    # Check if timing already exists
    if db.query(Timing).filter(Timing.name == name).first():
        raise HTTPException(status_code=400, detail="Timing already exists")
    
    # Create new timing
    new_timing = Timing(name=name, minutes=minutes)
    db.add(new_timing)
    db.commit()
    
    return RedirectResponse(url="/admin/timings", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/debug/interview/{interview_id}")
async def debug_admin_interview_details(
    request: Request,
    interview_id: int,
    admin: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    
    if not interview:
        return HTMLResponse(content=f"<html><body><h1>Interview not found: {interview_id}</h1></body></html>", status_code=404)
    
    # Get questions for this interview
    questions = db.query(Question).filter(Question.interview_id == interview_id).order_by(Question.question_order).all()
    
    # Create a simplified HTML view
    html_content = f'''
    <html>
        <head>
            <title>Admin Interview Debug</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .card {{ border: 1px solid #ddd; border-radius: 5px; padding: 15px; margin-bottom: 20px; }}
                .question {{ margin-bottom: 30px; padding: 10px; border-left: 4px solid #0275d8; }}
                .answer {{ background-color: #f8f9fa; padding: 10px; border-left: 4px solid #5cb85c; }}
                .no-answer {{ background-color: #f8f9fa; padding: 10px; color: #777; font-style: italic; }}
                .badge {{ padding: 5px 10px; border-radius: 4px; color: white; font-size: 12px; }}
                .badge-success {{ background-color: #5cb85c; }}
                .badge-secondary {{ background-color: #6c757d; }}
            </style>
        </head>
        <body>
            <h1>Admin Interview Details Debug</h1>
            
            <div class="card">
                <h2>Interview Information</h2>
                <p><strong>ID:</strong> {interview.id}</p>
                <p><strong>Candidate:</strong> {interview.candidate_name}</p>
                <p><strong>Email:</strong> {interview.email}</p>
                <p><strong>Status:</strong> {interview.status}</p>
                <p><strong>Approval Status:</strong> {interview.approval_status}</p>
                <p><strong>Created At:</strong> {interview.created_at}</p>
            </div>
            
            <div class="card">
                <h2>Questions ({len(questions)})</h2>
                {''.join([f'''
                <div class="question">
                    <h3>Q{q.question_order or '?'}: {q.question_text}</h3>
                    <p><span class="badge {'badge-success' if q.answer else 'badge-secondary'}">
                        {'Answered' if q.answer else 'Not Answered'}
                    </span></p>
                    <h4>Answer:</h4>
                    <div class="{'answer' if q.answer else 'no-answer'}">
                        {q.answer or 'Not answered yet'}
                    </div>
                    <p><strong>Answered at:</strong> {q.answered_at or 'N/A'}</p>
                </div>
                ''' for q in questions])}
            </div>
            
            <p><a href="/admin/interviews">Back to Interviews</a></p>
        </body>
    </html>
    '''
    
    return HTMLResponse(content=html_content)
