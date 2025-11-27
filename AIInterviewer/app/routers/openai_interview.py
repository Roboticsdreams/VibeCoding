from fastapi import APIRouter, Depends, HTTPException, Request, Form, Body
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List, Optional, Dict
import uuid
from datetime import datetime

from app.database.database import get_db
from app.models.models import User, Interview, Topic, Difficulty, Question
from app.services.auth import validate_logged_in
from app.services.openai_service import OpenAIService
from app.schemas.openai_schemas import (
    TopicRequest, 
    GenerateQuestionRequest, 
    EvaluateAnswerRequest, 
    SummarizeInterviewRequest,
    GenerateQuestionsResponse,
    EvaluationResponse,
    InterviewSummaryResponse
)

router = APIRouter(
    prefix="/api/openai",
    tags=["openai_interview"]
)

@router.get("/validate-key")
async def validate_openai_api_key():
    """
    Validate that the OpenAI API key is configured and working
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key or api_key == "your-openai-api-key-here":
        return {"valid": False, "message": "OpenAI API key is not configured."}
    
    try:
        # Initialize client with the key
        client = OpenAI(api_key=api_key)
        
        # Make a simple request to test the key
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=5
        )
        
        return {"valid": True}
    except Exception as e:
        return {"valid": False, "message": f"API key validation failed: {str(e)}"}


templates = Jinja2Templates(directory="app/templates")

@router.post("/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(
    request: GenerateQuestionRequest,
    db: Session = Depends(get_db)
):
    """
    Generate interview questions using OpenAI based on topic and difficulty
    """
    try:
        questions = OpenAIService.generate_interview_questions(
            topic=request.topic_name,
            difficulty=request.difficulty_name,
            count=request.question_count
        )
        
        return {"questions": questions}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating questions: {str(e)}"
        )

@router.post("/evaluate-answer", response_model=EvaluationResponse)
async def evaluate_answer(
    request: EvaluateAnswerRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluate a candidate's answer using OpenAI
    """
    try:
        evaluation = OpenAIService.evaluate_answer(
            question=request.question,
            candidate_answer=request.candidate_answer,
            expected_answer=request.expected_answer,
            topic=request.topic,
            difficulty=request.difficulty
        )
        
        return evaluation
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error evaluating answer: {str(e)}"
        )

@router.post("/summarize-interview", response_model=InterviewSummaryResponse)
async def summarize_interview(
    request: SummarizeInterviewRequest,
    db: Session = Depends(get_db)
):
    """
    Generate an interview summary based on all evaluations
    """
    try:
        summary = OpenAIService.summarize_interview(
            evaluations=request.evaluations,
            topics=request.topics,
            difficulty=request.difficulty
        )
        
        return summary
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating interview summary: {str(e)}"
        )

@router.post("/create-dynamic-interview")
async def create_dynamic_interview(
    topic_ids: List[int] = Body(...),
    difficulty_id: int = Body(...),
    candidate_name: str = Body(...),
    email: str = Body(...),
    user: User = Depends(validate_logged_in),
    db: Session = Depends(get_db)
):
    """
    Create a new interview with dynamically generated questions via OpenAI
    """
    # Get topics and difficulty
    topics = db.query(Topic).filter(Topic.id.in_(topic_ids)).all()
    difficulty = db.query(Difficulty).filter(Difficulty.id == difficulty_id).first()
    
    if not topics or not difficulty:
        raise HTTPException(status_code=400, detail="Invalid topics or difficulty")
    
    # Create a new interview
    interview_uuid = str(uuid.uuid4())
    new_interview = Interview(
        uuid=interview_uuid,
        candidate_name=candidate_name,
        email=email,
        user_id=user.id,
        difficulty_id=difficulty.id,
        status="pending",
        created_at=datetime.now()
    )
    
    db.add(new_interview)
    db.flush()  # Get the ID without committing
    
    # Associate topics
    for topic in topics:
        new_interview.topics.append(topic)
    
    # Generate questions using OpenAI for each topic
    for topic in topics:
        # Generate 2 questions per topic
        openai_questions = OpenAIService.generate_interview_questions(
            topic=topic.name,
            difficulty=difficulty.name,
            count=2
        )
        
        # Save the generated questions
        for i, q_data in enumerate(openai_questions):
            question = Question(
                interview_id=new_interview.id,
                topic_id=topic.id,
                question_text=q_data["question_text"],
                question_order=i + 1
            )
            # Store expected answer as feedback for evaluation
            question.feedback = q_data.get("expected_answer", "")
            db.add(question)
    
    db.commit()
    db.refresh(new_interview)
    
    # Return the interview details
    return {
        "interview_uuid": interview_uuid,
        "message": "Interview created successfully with dynamically generated questions"
    }

@router.post("/dynamic-submit-answer/{interview_uuid}")
async def submit_dynamic_answer(
    interview_uuid: str,
    question_id: int = Form(...),
    answer: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Submit a candidate's answer and get immediate AI evaluation
    """
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
    question.answered_at = datetime.now()
    
    # Get topic name and difficulty name
    topic_name = question.topic.name
    difficulty_name = interview.difficulty.name
    
    # The expected answer is stored in the feedback field when questions were generated
    expected_answer = question.feedback
    
    # Evaluate using OpenAI
    evaluation = OpenAIService.evaluate_answer(
        question=question.question_text,
        candidate_answer=answer,
        expected_answer=expected_answer,
        topic=topic_name,
        difficulty=difficulty_name
    )
    
    # Update the question with evaluation results
    question.score = evaluation["score"]
    question.feedback = evaluation["feedback"]
    db.commit()
    
    # Check if all questions have been answered
    all_answered = all(q.answer for q in interview.questions)
    
    if all_answered:
        interview.status = "completed"
        interview.completed_at = datetime.now()
        
        # Prepare data for summary
        evaluations = []
        for q in interview.questions:
            evaluations.append({
                "question": q.question_text,
                "answer": q.answer,
                "score": q.score,
                "feedback": q.feedback,
                "strengths": evaluation.get("strengths", []),
                "areas_for_improvement": evaluation.get("areas_for_improvement", [])
            })
        
        topics = [topic.name for topic in interview.topics]
        
        # Generate interview summary
        summary_result = OpenAIService.summarize_interview(
            evaluations=evaluations,
            topics=topics,
            difficulty=difficulty_name
        )
        
        # Update interview with summary
        interview.summary = summary_result["summary"]
        db.commit()
        
        return {
            "evaluation": evaluation,
            "interview_completed": True,
            "redirect_url": f"/interview/evaluation/{interview_uuid}"
        }
    
    return {
        "evaluation": evaluation,
        "interview_completed": False
    }
