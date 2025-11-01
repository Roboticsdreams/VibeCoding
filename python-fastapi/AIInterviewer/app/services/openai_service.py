import os
from openai import OpenAI
from typing import List, Dict, Optional
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class OpenAIService:
    @staticmethod
    def generate_interview_questions(topic: str, difficulty: str, count: int = 1) -> List[Dict]:
        """
        Generate interview questions based on topic and difficulty using OpenAI
        
        Args:
            topic (str): The topic for which questions should be generated
            difficulty (str): The difficulty level (Beginner, Intermediate, Advanced)
            count (int): Number of questions to generate
            
        Returns:
            List[Dict]: List of dictionaries with question_text and expected_answer
        """
        prompt = f"""Generate {count} technical interview question(s) about {topic} at {difficulty} level.
        
For each question, provide:
1. A detailed, challenging question that tests deep understanding
2. An expected answer with key points that should be covered in a good response

Format the response as a JSON array with objects containing 'question_text' and 'expected_answer'.
"""

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": "You are an expert technical interviewer specializing in generating precise, challenging questions."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7
            )
            
            # Parse the response content
            content = response.choices[0].message.content
            result = json.loads(content)
            
            # Ensure we have the expected structure
            if "questions" in result:
                return result["questions"]
            else:
                # Try to adapt to different response formats
                if isinstance(result, list):
                    return result
                else:
                    # Create a standard format from whatever we received
                    return [{"question_text": "Default question about " + topic, 
                             "expected_answer": "Please provide a detailed answer."}]
        
        except Exception as e:
            print(f"Error generating questions: {str(e)}")
            # Return a fallback question
            return [{"question_text": f"Tell me about your experience with {topic}?", 
                     "expected_answer": f"The candidate should demonstrate knowledge of {topic}."}]

    @staticmethod
    def evaluate_answer(question: str, candidate_answer: str, expected_answer: Optional[str], 
                       topic: str, difficulty: str) -> Dict:
        """
        Evaluate a candidate's answer using OpenAI
        
        Args:
            question (str): The original question
            candidate_answer (str): The candidate's answer
            expected_answer (Optional[str]): The expected answer or reference points
            topic (str): The topic of the question
            difficulty (str): The difficulty level
            
        Returns:
            Dict: Evaluation results with score, feedback, strengths, and areas_for_improvement
        """
        expected_answer_text = expected_answer if expected_answer else "No specific expected answer provided."
        
        prompt = f"""Evaluate this technical interview response:

Question: {question}
Topic: {topic}
Difficulty: {difficulty}
Expected Answer Points: {expected_answer_text}
Candidate's Answer: {candidate_answer}

Evaluate the answer on:
1. Technical accuracy
2. Completeness
3. Clarity and communication
4. Depth of understanding

Provide:
1. A numerical score out of 100
2. Detailed feedback
3. Key strengths (bullet points)
4. Areas for improvement (bullet points)

Format your response as a JSON object with keys: 'score', 'feedback', 'strengths', and 'areas_for_improvement'.
"""

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": "You are an expert technical interviewer with years of experience evaluating candidates."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
            )
            
            # Parse the response content
            content = response.choices[0].message.content
            result = json.loads(content)
            
            # Ensure we have the expected structure with default values if needed
            return {
                "score": result.get("score", 50),
                "feedback": result.get("feedback", "Evaluation completed."),
                "strengths": result.get("strengths", []),
                "areas_for_improvement": result.get("areas_for_improvement", [])
            }
        
        except Exception as e:
            print(f"Error evaluating answer: {str(e)}")
            # Return a fallback evaluation
            return {
                "score": 50,
                "feedback": "Unable to provide detailed feedback at this time.",
                "strengths": ["Answer was submitted successfully"],
                "areas_for_improvement": ["Try to provide more detailed responses"]
            }

    @staticmethod
    def summarize_interview(evaluations: List[Dict], topics: List[str], difficulty: str) -> Dict:
        """
        Generate an overall interview summary based on all question evaluations
        
        Args:
            evaluations (List[Dict]): List of evaluations with scores and feedback
            topics (List[str]): List of topics covered
            difficulty (str): The difficulty level of the interview
            
        Returns:
            Dict: Summary with overall_score, summary text, strengths, and areas_for_improvement
        """
        # Create a detailed summary of all evaluations for the prompt
        evaluation_summaries = []
        for i, eval_data in enumerate(evaluations):
            evaluation_summaries.append(f"""
Question {i+1}: {eval_data.get('question', 'Unknown question')}
Score: {eval_data.get('score', 0)}/100
Strengths: {', '.join(eval_data.get('strengths', []))}
Areas for improvement: {', '.join(eval_data.get('areas_for_improvement', []))}
""")
        
        all_evaluations = '\n'.join(evaluation_summaries)
        
        prompt = f"""Summarize this technical interview:

Topics covered: {', '.join(topics)}
Difficulty level: {difficulty}

Individual question evaluations:
{all_evaluations}

Provide:
1. An overall score out of 100
2. A comprehensive summary of the candidate's performance (3-4 paragraphs)
3. Key strengths demonstrated across the interview (bullet points)
4. Areas for improvement (bullet points)
5. Topic-specific scores (one score per topic)

Format your response as a JSON object with keys: 'overall_score', 'summary', 'strengths', 'areas_for_improvement', and 'topic_scores'.
The 'topic_scores' should be a dictionary with topics as keys and scores (0-100) as values.
"""

        try:
            response = client.chat.completions.create(
                model="gpt-4o",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": "You are an expert technical interviewer responsible for providing comprehensive interview summaries."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5
            )
            
            # Parse the response content
            content = response.choices[0].message.content
            result = json.loads(content)
            
            # Calculate average score if not provided in the response
            if "overall_score" not in result:
                scores = [eval_data.get("score", 0) for eval_data in evaluations if "score" in eval_data]
                overall_score = sum(scores) / len(scores) if scores else 50
                result["overall_score"] = overall_score
                
            # Ensure we have topic scores
            if "topic_scores" not in result:
                result["topic_scores"] = {topic: 50 for topic in topics}
                
            return {
                "overall_score": result.get("overall_score", 50),
                "summary": result.get("summary", "Interview completed."),
                "strengths": result.get("strengths", []),
                "areas_for_improvement": result.get("areas_for_improvement", []),
                "topic_scores": result.get("topic_scores", {})
            }
        
        except Exception as e:
            print(f"Error generating interview summary: {str(e)}")
            # Return a fallback summary
            return {
                "overall_score": 50,
                "summary": "Interview completed with mixed results.",
                "strengths": ["Successfully completed the interview"],
                "areas_for_improvement": ["Continue practicing technical concepts"],
                "topic_scores": {topic: 50 for topic in topics}
            }
