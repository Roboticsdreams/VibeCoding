from fastapi import APIRouter, Depends, HTTPException, status, Request, Form
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User
from app.services.auth import verify_password, get_password_hash
from typing import Optional
from datetime import datetime

router = APIRouter(
    tags=["auth"]
)

templates = Jinja2Templates(directory="app/templates")
templates.env.globals["datetime"] = datetime

@router.get("/register")
async def register_form(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@router.post("/register")
async def register(
    request: Request,
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    confirm_password: str = Form(...),
    db: Session = Depends(get_db)
):
    # Check if passwords match
    if password != confirm_password:
        return templates.TemplateResponse(
            "register.html", 
            {"request": request, "error": "Passwords do not match"}
        )
    
    # Check if username exists
    if db.query(User).filter(User.username == username).first():
        return templates.TemplateResponse(
            "register.html", 
            {"request": request, "error": "Username already exists"}
        )
    
    # Check if email exists
    if db.query(User).filter(User.email == email).first():
        return templates.TemplateResponse(
            "register.html", 
            {"request": request, "error": "Email already exists"}
        )
    
    # Hash password
    hashed_password = get_password_hash(password)
    
    # Create user
    db_user = User(
        username=username,
        email=email,
        hashed_password=hashed_password
    )
    
    # Make the first user an admin
    if db.query(User).count() == 0:
        db_user.is_admin = True
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Store user ID in session
    request.session["user_id"] = db_user.id
    # Store admin status in session
    request.session["is_admin"] = db_user.is_admin
    
    # Redirect to dashboard
    return RedirectResponse(url="/user/dashboard", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/login")
async def login_form(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@router.post("/login")
async def login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    # Find the user
    user = db.query(User).filter(User.username == username).first()
    
    if not user or not verify_password(password, user.hashed_password):
        return templates.TemplateResponse(
            "login.html", 
            {"request": request, "error": "Incorrect username or password"}
        )
    
    # Check if user is active
    if not user.is_active:
        return templates.TemplateResponse(
            "login.html", 
            {"request": request, "error": "Account is inactive"}
        )
    
    # Store user ID in session
    request.session["user_id"] = user.id
    request.session["user"] = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin
    }
    # Store admin status in session
    request.session["is_admin"] = user.is_admin
    
    # Redirect to appropriate dashboard
    if user.is_admin:
        return RedirectResponse(url="/admin/dashboard", status_code=status.HTTP_303_SEE_OTHER)
    else:
        return RedirectResponse(url="/user/dashboard", status_code=status.HTTP_303_SEE_OTHER)

@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)
