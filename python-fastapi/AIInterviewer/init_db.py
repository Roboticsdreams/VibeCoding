# Import the manual patch first to fix bcrypt warnings
import manual_patch  # This applies the bcrypt warning fix

import os
import sys
from sqlalchemy.orm import Session
from app.database.database import SessionLocal, engine
from app.models.models import Base, Topic, Difficulty, Timing, User, QuestionBank
from app.services.auth import get_password_hash

def init_db():
    # Explicitly import all models to ensure they're registered with Base
    from app.models.models import (
        User, Interview, Topic, Difficulty, Timing, 
        QuestionBank, Question, interview_topics
    )
    
    # Import seed questions
    from app.database.seed_questions import SEED_QUESTIONS
    
    print("Creating database tables...")
    # Force recreation of tables
    Base.metadata.drop_all(bind=engine)  # Comment this line if you want to keep existing data
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Create topics from seed_questions.py for consistency
        print("Creating topics...")
        topics = list(SEED_QUESTIONS.keys())
        print(f"Using topics from seed_questions.py: {', '.join(topics)}")
        
        for topic_name in topics:
            topic = Topic(name=topic_name)
            db.add(topic)
        
        db.commit()
        print(f"Added {len(topics)} topics")
        
        # Extract unique difficulties from seed questions
        print("Creating difficulties...")
        difficulty_set = set()
        for questions_list in SEED_QUESTIONS.values():
            for q in questions_list:
                difficulty_set.add(q["difficulty"])
                
        difficulties = sorted(list(difficulty_set))
        print(f"Using difficulties from seed_questions.py: {', '.join(difficulties)}")
        
        for difficulty_name in difficulties:
            difficulty = Difficulty(name=difficulty_name)
            db.add(difficulty)
        
        db.commit()
        print(f"Added {len(difficulties)} difficulties")
        
        # Create timings
        print("Creating timings...")
        timings = [
            {"name": "15 Minutes", "minutes": 15},
            {"name": "30 Minutes", "minutes": 30},
            {"name": "45 Minutes", "minutes": 45},
            {"name": "60 Minutes", "minutes": 60},
            {"name": "90 Minutes", "minutes": 90},
            {"name": "120 Minutes", "minutes": 120}
        ]
        
        for timing_data in timings:
            timing = Timing(name=timing_data["name"], minutes=timing_data["minutes"])
            db.add(timing)
        
        db.commit()
        print(f"Added {len(timings)} timings")
        
        # Create an admin user if none exists
        print("Creating default admin user...")
        
        admin_user = User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("admin"),
            is_admin=True,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        
        print("Default admin user created:")
        print("Username: admin")
        print("Password: admin")
        print("Please change this password after first login!")
        
        # Create some sample question bank items directly from seed questions
        print("Adding questions from seed_questions.py...")
        
        # Get topics, difficulties for reference
        topics_dict = {topic.name: topic.id for topic in db.query(Topic).all()}
        difficulties_dict = {diff.name: diff.id for diff in db.query(Difficulty).all()}
        
        # Add all questions from seed_questions.py
        added_questions = 0
        for topic_name, questions_list in SEED_QUESTIONS.items():
            topic_id = topics_dict.get(topic_name)
            if not topic_id:
                print(f"Warning: Topic '{topic_name}' not found in database")
                continue
                
            for q in questions_list:
                difficulty_id = difficulties_dict.get(q["difficulty"])
                if not difficulty_id:
                    print(f"Warning: Difficulty '{q['difficulty']}' not found in database")
                    continue
                    
                question = QuestionBank(
                    topic_id=topic_id,
                    difficulty_id=difficulty_id,
                    question_text=q["question"]
                )
                db.add(question)
                added_questions += 1
        
        db.commit()
        print(f"Added {added_questions} questions from seed_questions.py")
        
    finally:
        db.close()

def update_model_answers():
    """Update model_answers in the question_bank table after initialization"""
    import sqlite3
    from app.database.seed_questions import SEED_QUESTIONS
    
    print("\nUpdating model answers for questions...")
    
    # Connect to the database
    conn = sqlite3.connect("techinterviewer.db")
    cursor = conn.cursor()
    
    # Get question-answer pairs from seed data
    qa_pairs = []
    for topic_name, questions_list in SEED_QUESTIONS.items():
        for q_data in questions_list:
            if "answer" in q_data:
                qa_pairs.append((q_data["question"], q_data["answer"]))
    
    # Update each question with its answer
    updates = 0
    for question_text, answer in qa_pairs:
        try:
            # Find the question by text
            cursor.execute("SELECT id FROM question_bank WHERE question_text = ?", (question_text,))
            result = cursor.fetchone()
            
            if result:
                question_id = result[0]
                
                # Update the answer
                cursor.execute("UPDATE question_bank SET model_answer = ? WHERE id = ?", 
                              (str(answer), question_id))
                
                updates += 1
        except Exception as e:
            print(f"Error updating question: {e}")
    
    # Commit the changes
    conn.commit()
    
    # Verify update worked
    cursor.execute("SELECT COUNT(*) FROM question_bank WHERE model_answer IS NOT NULL")
    after_count = cursor.fetchone()[0]
    print(f"Updated {updates} questions with model answers")
    
    # Close the connection
    conn.close()

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    update_model_answers()
