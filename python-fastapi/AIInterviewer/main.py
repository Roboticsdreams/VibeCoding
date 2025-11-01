# Import the manual patch first to fix bcrypt warnings
import manual_patch  # This applies the bcrypt warning fix

import uvicorn
from fastapi import FastAPI, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.sessions import SessionMiddleware
from contextlib import asynccontextmanager
import os
from datetime import datetime
from dotenv import load_dotenv
from app.database.database import create_tables, get_db
from app.models.models import User
from app.routers import auth, user, admin, interview, openai_interview, dynamic_interview, admin_ai, status
from fastapi.responses import RedirectResponse

# Load environment variables from .env file
load_dotenv()

# Define lifespan context manager (replaces on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic
    create_tables()
    yield
    # Shutdown logic (if any)

app = FastAPI(title="TechInterviewer", lifespan=lifespan)

# Configure middleware
app.add_middleware(SessionMiddleware, secret_key=os.getenv("SECRET_KEY", "your-secret-key"))

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Configure templates
templates = Jinja2Templates(directory="app/templates")
templates.env.globals["datetime"] = datetime

# Include routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(admin.router)
app.include_router(interview.router)
app.include_router(openai_interview.router)
app.include_router(dynamic_interview.router)
app.include_router(admin_ai.router)
app.include_router(status.router)

@app.get("/")
async def root(request: Request):
    # Check if user is logged in
    user_id = request.session.get("user_id")
    is_admin = request.session.get("is_admin")
    
    # If user is logged in, redirect to the appropriate dashboard
    if user_id:
        if is_admin:
            return RedirectResponse(url="/admin/dashboard")
        else:
            return RedirectResponse(url="/user/dashboard")
    
    # Show homepage for non-authenticated users
    return templates.TemplateResponse("index.html", {"request": request})

if __name__ == "__main__":
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
