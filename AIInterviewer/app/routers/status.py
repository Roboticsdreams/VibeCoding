from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
import os
from openai import OpenAI
from app.database.database import get_db
from sqlalchemy.orm import Session
import sqlalchemy
import sys
import platform
import time

router = APIRouter(
    prefix="/api/status",
    tags=["status"]
)

@router.get("/system")
async def system_status():
    """
    Get system information and status
    """
    try:
        return {
            "status": "ok",
            "system": {
                "python_version": sys.version,
                "platform": platform.platform(),
                "time": time.strftime("%Y-%m-%d %H:%M:%S")
            }
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )

@router.get("/database")
async def database_status(db: Session = Depends(get_db)):
    """
    Check database connection and status
    """
    try:
        # Execute simple query to verify database connection
        result = db.execute(sqlalchemy.text("SELECT 1")).scalar()
        
        if result == 1:
            return {"status": "ok", "message": "Database connection successful"}
        else:
            return JSONResponse(
                status_code=500,
                content={"status": "error", "message": "Database connection failed"}
            )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": str(e)}
        )

@router.get("/openai")
async def openai_status():
    """
    Check OpenAI API connection and status
    """
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key or api_key == "your-openai-api-key-here":
        return JSONResponse(
            status_code=403,
            content={
                "status": "error", 
                "message": "OpenAI API key not configured",
                "configuration_required": True
            }
        )
    
    try:
        start_time = time.time()
        
        # Initialize client with the key
        client = OpenAI(api_key=api_key)
        
        # Make a simple request to test the key
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hello"}],
            max_tokens=5
        )
        
        latency = time.time() - start_time
        
        return {
            "status": "ok", 
            "message": "OpenAI API connection successful",
            "model": "gpt-3.5-turbo",
            "latency_seconds": round(latency, 2)
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"status": "error", "message": f"OpenAI API error: {str(e)}"}
        )

@router.get("/health")
async def health_check():
    """
    Quick health check for monitoring
    """
    return {"status": "ok"}
