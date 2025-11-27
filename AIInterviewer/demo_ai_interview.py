#!/usr/bin/env python3
"""
Demo script for testing the AI interviewer functionality.
This script creates test topics and difficulties, then generates sample interview questions
using the OpenAI integration.
"""

import os
import sys
import json
from datetime import datetime
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.models import Base, Topic, Difficulty, Timing, User, Interview, Question
from app.services.openai_service import OpenAIService
import uuid

# Load environment variables
load_dotenv()

# Check if OpenAI API key is set
api_key = os.getenv("OPENAI_API_KEY")
if not api_key or api_key == "your-openai-api-key-here":
    print("⚠️  ERROR: OpenAI API key not configured!")
    print("Please set your OpenAI API key in the .env file before running this demo.")
    print("Example: OPENAI_API_KEY=sk-your-api-key")
    sys.exit(1)

# Connect to database
engine = create_engine("sqlite:///techinterviewer.db")
Session = sessionmaker(bind=engine)
session = Session()

# Create test data if needed
def create_test_data():
    """Create test topics and difficulties if they don't exist"""
    
    # Create test topics
    test_topics = ["Python", "JavaScript", "SQL", "System Design", "Algorithms"]
    for topic_name in test_topics:
        if not session.query(Topic).filter(Topic.name == topic_name).first():
            topic = Topic(name=topic_name)
            session.add(topic)
    
    # Create test difficulties
    test_difficulties = ["Beginner", "Intermediate", "Advanced"]
    for diff_name in test_difficulties:
        if not session.query(Difficulty).filter(Difficulty.name == diff_name).first():
            diff = Difficulty(name=diff_name)
            session.add(diff)
    
    # Create a timing
    if not session.query(Timing).first():
        timing = Timing(name="30 minutes", minutes=30)
        session.add(timing)
    
    # Create a test user if none exists
    if not session.query(User).first():
        from passlib.hash import bcrypt
        admin = User(
            username="demo",
            email="demo@example.com",
            hashed_password=bcrypt.hash("demo"),
            is_active=True,
            is_admin=False
        )
        session.add(admin)
    
    session.commit()

def generate_sample_questions():
    """Generate and print sample interview questions"""
    # Get a topic and difficulty
    python_topic = session.query(Topic).filter(Topic.name == "Python").first()
    intermediate = session.query(Difficulty).filter(Difficulty.name == "Intermediate").first()
    
    if not python_topic or not intermediate:
        print("Error: Test data not found. Run the script with --create-data first.")
        return
    
    print("\n🤖 Testing OpenAI Question Generation...")
    print("-" * 60)
    
    try:
        # Generate questions
        questions = OpenAIService.generate_interview_questions(
            topic=python_topic.name,
            difficulty=intermediate.name,
            count=2
        )
        
        print(f"Generated {len(questions)} questions:\n")
        for i, q in enumerate(questions, 1):
            print(f"Question {i}: {q['question_text']}")
            print(f"Expected Answer: {q['expected_answer'][:100]}...\n")
        
        # Test answer evaluation
        if questions:
            print("🧠 Testing Answer Evaluation...")
            print("-" * 60)
            
            sample_answer = "I would use a dictionary to store the frequency of each element, then return the element with the highest count. This would give us O(n) time complexity."
            
            evaluation = OpenAIService.evaluate_answer(
                question=questions[0]["question_text"],
                candidate_answer=sample_answer,
                expected_answer=questions[0]["expected_answer"],
                topic=python_topic.name,
                difficulty=intermediate.name
            )
            
            print(f"Evaluation Score: {evaluation['score']}/100")
            print(f"Feedback: {evaluation['feedback']}")
            print("\nStrengths:")
            for strength in evaluation['strengths']:
                print(f"- {strength}")
            
            print("\nAreas for Improvement:")
            for area in evaluation['areas_for_improvement']:
                print(f"- {area}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        print("Make sure your OpenAI API key is valid and has sufficient credits.")

def create_demo_interview():
    """Create a complete demo interview with AI-generated questions"""
    # Get test data
    python_topic = session.query(Topic).filter(Topic.name == "Python").first()
    js_topic = session.query(Topic).filter(Topic.name == "JavaScript").first()
    intermediate = session.query(Difficulty).filter(Difficulty.name == "Intermediate").first()
    timing = session.query(Timing).first()
    user = session.query(User).first()
    
    if not python_topic or not js_topic or not intermediate or not timing or not user:
        print("Error: Test data not found. Run the script with --create-data first.")
        return
    
    print("\n📝 Creating Demo Interview...")
    print("-" * 60)
    
    try:
        # Create new interview
        interview_uuid = str(uuid.uuid4())
        interview = Interview(
            uuid=interview_uuid,
            candidate_name="Demo Candidate",
            email="candidate@example.com",
            user_id=user.id,
            difficulty_id=intermediate.id,
            timing_id=timing.id,
            status="pending",
            created_at=datetime.now()
        )
        
        session.add(interview)
        session.flush()  # Get the ID without committing
        
        # Add topics
        interview.topics.append(python_topic)
        interview.topics.append(js_topic)
        
        # Generate questions
        python_questions = OpenAIService.generate_interview_questions(
            topic=python_topic.name,
            difficulty=intermediate.name,
            count=2
        )
        
        js_questions = OpenAIService.generate_interview_questions(
            topic=js_topic.name,
            difficulty=intermediate.name,
            count=2
        )
        
        # Save the generated questions
        for i, q_data in enumerate(python_questions + js_questions):
            question = Question(
                interview_id=interview.id,
                topic_id=python_topic.id if i < len(python_questions) else js_topic.id,
                question_text=q_data["question_text"],
                question_order=i + 1
            )
            # Store expected answer as feedback for evaluation
            question.feedback = q_data.get("expected_answer", "")
            session.add(question)
        
        session.commit()
        
        print("✅ Demo interview created successfully!")
        print(f"Interview UUID: {interview_uuid}")
        print(f"Access URL: http://localhost:8000/interview/dynamic-session/{interview_uuid}")
        print("\nStart the server with: ./start.sh")
        print("Then navigate to the URL above to start the demo interview.")
        
    except Exception as e:
        session.rollback()
        print(f"Error creating demo interview: {str(e)}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="AI Interviewer Demo")
    parser.add_argument("--create-data", action="store_true", help="Create test data")
    parser.add_argument("--test-questions", action="store_true", help="Test question generation")
    parser.add_argument("--create-interview", action="store_true", help="Create a demo interview")
    
    args = parser.parse_args()
    
    if args.create_data:
        create_test_data()
        print("✅ Test data created successfully!")
    
    if args.test_questions:
        generate_sample_questions()
    
    if args.create_interview:
        create_demo_interview()
    
    # If no args provided, show help
    if not (args.create_data or args.test_questions or args.create_interview):
        parser.print_help()
