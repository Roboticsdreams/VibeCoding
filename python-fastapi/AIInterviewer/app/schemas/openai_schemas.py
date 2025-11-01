from pydantic import BaseModel, Field
from typing import List, Optional, Dict

# Request schemas
class TopicRequest(BaseModel):
    topic_ids: List[int] = Field(..., description="List of topic IDs selected by the user")
    difficulty_id: int = Field(..., description="ID of the selected difficulty level")

class GenerateQuestionRequest(BaseModel):
    topic_name: str = Field(..., description="The name of the topic")
    difficulty_name: str = Field(..., description="The difficulty level (e.g., Beginner, Intermediate, Advanced)")
    question_count: int = Field(1, description="Number of questions to generate")

class EvaluateAnswerRequest(BaseModel):
    question: str = Field(..., description="The question that was asked")
    expected_answer: Optional[str] = Field(None, description="The expected or reference answer if available")
    candidate_answer: str = Field(..., description="The candidate's answer")
    topic: str = Field(..., description="The topic of the question")
    difficulty: str = Field(..., description="The difficulty level of the question")

class SummarizeInterviewRequest(BaseModel):
    evaluations: List[Dict] = Field(..., description="List of question evaluations with scores")
    topics: List[str] = Field(..., description="List of topics covered in the interview")
    difficulty: str = Field(..., description="The difficulty level of the interview")

# Response schemas
class GeneratedQuestion(BaseModel):
    question_text: str = Field(..., description="The generated interview question")
    expected_answer: str = Field(..., description="The expected answer or key points")

class GenerateQuestionsResponse(BaseModel):
    questions: List[GeneratedQuestion] = Field(..., description="List of generated questions")

class EvaluationResponse(BaseModel):
    score: int = Field(..., description="Score out of 100")
    feedback: str = Field(..., description="Detailed feedback on the answer")
    strengths: List[str] = Field(..., description="Key strengths of the answer")
    areas_for_improvement: List[str] = Field(..., description="Areas where the answer could be improved")

class InterviewSummaryResponse(BaseModel):
    overall_score: int = Field(..., description="Overall score out of 100")
    summary: str = Field(..., description="Detailed summary of the interview performance")
    strengths: List[str] = Field(..., description="Key strengths demonstrated in the interview")
    areas_for_improvement: List[str] = Field(..., description="Areas where improvement is needed")
    topic_scores: Dict[str, int] = Field(..., description="Scores broken down by topic")
