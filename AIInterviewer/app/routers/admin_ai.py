from fastapi import APIRouter, Depends, Request, Form, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database.database import get_db
from app.models.models import User, Interview
from app.services.auth import validate_admin
import os
import dotenv
from pathlib import Path

router = APIRouter(
    prefix="/admin/ai",
    tags=["admin_ai"]
)

templates = Jinja2Templates(directory="app/templates")

@router.get("/settings")
async def ai_settings_page(
    request: Request,
    user: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    """Admin page for managing OpenAI API settings"""
    # Get current API key (redacted)
    api_key = os.getenv("OPENAI_API_KEY", "")
    if api_key and api_key != "your-openai-api-key-here":
        redacted_key = f"{api_key[:4]}{'*' * (len(api_key) - 8)}{api_key[-4:]}" if len(api_key) > 8 else "****"
    else:
        redacted_key = "Not configured"
    
    # Get AI interview statistics
    total_ai_interviews = db.query(Interview).count()
    completed_ai_interviews = db.query(Interview).filter(Interview.status == "completed").count()
    
    return templates.TemplateResponse(
        "admin/ai_settings.html",
        {
            "request": request,
            "user": user,
            "api_key_status": redacted_key,
            "total_ai_interviews": total_ai_interviews,
            "completed_ai_interviews": completed_ai_interviews
        }
    )

@router.post("/update-api-key")
async def update_api_key(
    request: Request,
    api_key: str = Form(...),
    user: User = Depends(validate_admin)
):
    """Update the OpenAI API key in the .env file"""
    env_path = Path(".env")
    
    # Check if .env file exists
    if not env_path.exists():
        return templates.TemplateResponse(
            "admin/ai_settings.html",
            {
                "request": request,
                "user": user,
                "error": "The .env file does not exist. Please create it first."
            },
            status_code=400
        )
    
    try:
        # Load current .env content
        dotenv.load_dotenv()
        
        # Update the specific variable
        dotenv.set_key(env_path, "OPENAI_API_KEY", api_key)
        
        # Reload the environment variables
        dotenv.load_dotenv()
        
        return RedirectResponse(
            url="/admin/ai/settings?updated=true",
            status_code=303
        )
        
    except Exception as e:
        return templates.TemplateResponse(
            "admin/ai_settings.html",
            {
                "request": request,
                "user": user,
                "error": f"Failed to update API key: {str(e)}"
            },
            status_code=500
        )

@router.get("/interviews")
async def list_ai_interviews(
    request: Request,
    user: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    """List all AI-powered interviews"""
    # Get all interviews
    interviews = db.query(Interview).order_by(Interview.created_at.desc()).all()
    
    return templates.TemplateResponse(
        "admin/ai_interviews.html",
        {
            "request": request,
            "user": user,
            "interviews": interviews
        }
    )
