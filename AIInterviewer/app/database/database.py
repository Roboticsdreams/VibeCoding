from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./techinterviewer.db"

# Create engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create base class
Base = declarative_base()

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create tables
def create_tables():
    from app.models.models import User, Interview, Topic, Difficulty, Timing, QuestionBank
    Base.metadata.create_all(bind=engine)
    seed_initial_data()

def seed_initial_data():
    """Seed initial data including topics, difficulties, timings, and questions"""
    from app.models.models import Topic, Difficulty, Timing, User, QuestionBank
    from app.services.auth import get_password_hash
    from app.database.seed_questions import SEED_QUESTIONS
    
    db = SessionLocal()
    
    try:
        # Extract topics from SEED_QUESTIONS (source of truth)
        topics_from_questions = list(SEED_QUESTIONS.keys())
        print(f"📚 Found {len(topics_from_questions)} topics in seed data: {', '.join(topics_from_questions)}")
        
        # Seed topics dynamically
        for topic_name in topics_from_questions:
            if not db.query(Topic).filter(Topic.name == topic_name).first():
                db.add(Topic(name=topic_name))
                print(f"  ✓ Added topic: {topic_name}")
        
        # Extract unique difficulties from SEED_QUESTIONS (source of truth)
        difficulties_set = set()
        for questions_list in SEED_QUESTIONS.values():
            for q in questions_list:
                difficulties_set.add(q["difficulty"])
        
        difficulties_from_questions = sorted(list(difficulties_set))
        print(f"📊 Found {len(difficulties_from_questions)} difficulty levels: {', '.join(difficulties_from_questions)}")
        
        # Seed difficulties dynamically
        for diff_name in difficulties_from_questions:
            if not db.query(Difficulty).filter(Difficulty.name == diff_name).first():
                db.add(Difficulty(name=diff_name))
                print(f"  ✓ Added difficulty: {diff_name}")
        
        # Seed timings (these are independent of questions)
        timings_data = [
            {"name": "15 Minutes", "minutes": 15},
            {"name": "30 Minutes", "minutes": 30},
            {"name": "45 Minutes", "minutes": 45},
            {"name": "60 Minutes", "minutes": 60},
            {"name": "90 Minutes", "minutes": 90},
            {"name": "120 Minutes", "minutes": 120},
        ]
        
        # Create a clean timing table approach
        minutes_in_db = {}  # track minutes values we've seen
        
        # First pass: Find all timings and their variants in db
        all_timings = db.query(Timing).all()
        for timing in all_timings:
            if timing.minutes in minutes_in_db:
                minutes_in_db[timing.minutes].append(timing)
            else:
                minutes_in_db[timing.minutes] = [timing]
        
        # Second pass: Process and standardize
        for timing_data in timings_data:
            minutes = timing_data["minutes"]
            std_name = timing_data["name"]
            
            # Case 1: No timing with these minutes exists
            if minutes not in minutes_in_db:
                new_timing = Timing(name=std_name, minutes=minutes)
                db.add(new_timing)
                print(f"  ✓ Added timing: {std_name} ({minutes} min)")
                
            # Case 2: One or more timings exist with these minutes
            else:
                existing_timings = minutes_in_db[minutes]
                
                # If only one exists and it has the standard name, nothing to do
                if len(existing_timings) == 1 and existing_timings[0].name == std_name:
                    continue
                    
                # Otherwise, keep the one with the standard name or create it
                std_timing_exists = False
                for timing in existing_timings:
                    if timing.name == std_name:
                        std_timing_exists = True
                    else:
                        # Silently remove non-standard names
                        db.delete(timing)
                
                if not std_timing_exists:
                    new_timing = Timing(name=std_name, minutes=minutes)
                    db.add(new_timing)
                    print(f"  ✓ Standardized timing: {std_name} ({minutes} min)")
        
        db.commit()
        
        # Seed default admin user
        admin = db.query(User).filter(User.username == "admin").first()
        if not admin:
            admin = User(
                username="admin",
                email="admin@techinterviewer.com",
                hashed_password=get_password_hash("admin"),
                is_admin=True
            )
            db.add(admin)
            db.commit()
        
        # Seed questions from seed_questions.py
        existing_questions = db.query(QuestionBank).count()
        if existing_questions == 0:
            print("Seeding questions directly from SEED_QUESTIONS...")
            
            # First add the questions using the ORM for maximum compatibility
            questions_added = 0
            
            for topic_name, questions_list in SEED_QUESTIONS.items():
                topic = db.query(Topic).filter(Topic.name == topic_name).first()
                if not topic:
                    continue
                    
                for q_data in questions_list:
                    difficulty_name = q_data["difficulty"]
                    difficulty = db.query(Difficulty).filter(Difficulty.name == difficulty_name).first()
                    if not difficulty:
                        continue
                    
                    # Create and add the question (without answer for now)
                    question = QuestionBank(
                        topic_id=topic.id,
                        difficulty_id=difficulty.id,
                        question_text=q_data["question"]
                    )
                    db.add(question)
                    questions_added += 1
            
            db.commit()
            print(f"Added {questions_added} questions to database.")
            
            print("\nUpdating questions with model answers using direct SQL...")
            
            # Now use direct SQL to update the model_answers
            # This is a workaround for potential ORM issues with TEXT fields
            import sqlite3
            
            # Create a direct connection to the database
            # This is more reliable for updating TEXT fields like model_answer
            conn = sqlite3.connect("techinterviewer.db")
            cursor = conn.cursor()
            
            # First check if we need to update answers
            cursor.execute("SELECT COUNT(*) FROM question_bank WHERE model_answer IS NULL")
            null_answers = cursor.fetchone()[0]
            
            if null_answers == 0:
                print("All questions already have model answers. No updates needed.")
                conn.close()
                return
                
            # Get all questions in the database
            cursor.execute("SELECT id, question_text FROM question_bank")
            db_questions = {question_text: question_id for question_id, question_text in cursor.fetchall()}
            
            # Update each question with its answer from seed data
            updates = 0
            for topic_name, questions_list in SEED_QUESTIONS.items():
                for q_data in questions_list:
                    if "answer" in q_data and q_data["question"] in db_questions:
                        question_id = db_questions[q_data["question"]]
                        answer = str(q_data["answer"])
                        
                        cursor.execute(
                            "UPDATE question_bank SET model_answer = ? WHERE id = ?",
                            (answer, question_id)
                        )
                        updates += 1
            
            # Commit the updates
            conn.commit()
            print(f"Updated {updates} questions with model answers")
            
            # Verify the updates worked
            cursor.execute("SELECT COUNT(*) FROM question_bank WHERE model_answer IS NOT NULL")
            with_answers = cursor.fetchone()[0]
            print(f"Questions with model answers: {with_answers}/{questions_added}")
            
            # Check the first question to verify it has an answer
            cursor.execute("SELECT model_answer FROM question_bank WHERE id=1")
            first_answer = cursor.fetchone()
            if first_answer and first_answer[0]:
                print("Success: First question has model answer")
            else:
                print("Warning: First question still has no model answer")
            
            print(f"✓ Seeded {questions_added} questions and updated {updates} with model answers")
        
    except Exception as e:
        print(f"Error seeding data: {str(e)}")
        db.rollback()
    finally:
        db.close()
