from fastapi import APIRouter, Depends, Request
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User, Interview
from app.services.auth import validate_admin

router = APIRouter(
    prefix="/admin/system",
    tags=["system"]
)

templates = Jinja2Templates(directory="app/templates")

@router.get("/status")
async def system_status_page(
    request: Request,
    user: User = Depends(validate_admin),
    db: Session = Depends(get_db)
):
    """System status page for administrators"""
    return templates.TemplateResponse(
        "admin/system_status.html", 
        {"request": request, "user": user}
    )
