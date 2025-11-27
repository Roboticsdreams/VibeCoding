import re
import json
import os
from datetime import datetime
import difflib

# Optional: Import OpenAI for AI-based evaluation
# You'll need to set up OPENAI_API_KEY in your environment
# import openai

def clean_text(text):
    """Clean and normalize text for better comparison."""
    # Convert to lowercase
    text = text.lower()
    
    # Remove code blocks delimiters
    text = re.sub(r'```[a-z]*\n|```', '', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text).strip()
    
    # Remove common punctuation
    text = re.sub(r'[.,;:!?()]', '', text)
    
    return text

def calculate_similarity(text1, text2):
    """Calculate similarity between two text strings."""
    # Clean the texts
    clean1 = clean_text(text1)
    clean2 = clean_text(text2)
    
    # Use SequenceMatcher to get similarity ratio
    similarity = difflib.SequenceMatcher(None, clean1, clean2).ratio()
    
    return similarity

def evaluate_response(question, candidate_response, expected_answer):
    """Evaluate a single response against the expected answer."""
    # Basic text similarity approach
    similarity_score = calculate_similarity(candidate_response, expected_answer)
    
    # Convert similarity to a score out of 5
    raw_score = similarity_score * 5
    
    # Map score to feedback quality
    if raw_score >= 4.5:
        feedback_quality = "excellent"
    elif raw_score >= 3.5:
        feedback_quality = "good"
    elif raw_score >= 2.5:
        feedback_quality = "average"
    elif raw_score >= 1.5:
        feedback_quality = "below_average"
    else:
        feedback_quality = "poor"
    
    # Generate feedback based on quality
    feedback_templates = {
        "excellent": [
            "Excellent answer! Your explanation was comprehensive and technically accurate.",
            "Very well articulated! You demonstrated deep understanding of the concept.",
            "Outstanding response. You covered all key points with great clarity."
        ],
        "good": [
            "Good answer. You covered the main points, though some additional details would strengthen it.",
            "Solid response. You have a good grasp of the concept.",
            "That's a good explanation. You touched on most of the important aspects."
        ],
        "average": [
            "Acceptable answer, though there are some key points missing.",
            "Your understanding is basic but correct. Consider expanding your knowledge in this area.",
            "You've touched on some important aspects, but the explanation could be more complete."
        ],
        "below_average": [
            "Your answer contains some misconceptions. The correct approach would involve more focus on key concepts.",
            "That's partially correct, but there are important concepts you've missed.",
            "Your response indicates some gaps in understanding this topic."
        ],
        "poor": [
            "There are significant inaccuracies in your answer. The correct approach would be quite different.",
            "This response suggests you might need to revisit the fundamentals of this topic.",
            "I appreciate your attempt, but this answer misses the mark on several key points."
        ]
    }
    
    import random
    feedback = random.choice(feedback_templates[feedback_quality])
    
    # Optional: Add specific feedback pointing out missing key concepts
    if feedback_quality in ["average", "below_average", "poor"]:
        # Extract key phrases from expected answer that are missing in candidate response
        # This is a simplified approach - in real implementation you might want to use
        # more sophisticated NLP techniques
        expected_clean = clean_text(expected_answer)
        candidate_clean = clean_text(candidate_response)
        
        # Extract important keywords from expected answer (simplified)
        important_terms = [word for word in expected_clean.split() 
                          if len(word) > 5 and word not in candidate_clean]
        
        if important_terms and len(important_terms) > 3:
            sample_terms = random.sample(important_terms, min(3, len(important_terms)))
            feedback += f" Your answer could be improved by addressing concepts like: {', '.join(sample_terms)}."
    
    return {
        "score": round(raw_score, 1),
        "feedback": feedback,
        "similarity": similarity_score,
        "missing_concepts": []  # Could be populated with more sophisticated analysis
    }

def evaluate_interview(interview_data):
    """Evaluate the entire interview and provide a comprehensive assessment."""
    questions = interview_data["questions"]
    responses = interview_data["candidate_responses"]
    
    # Map responses to questions
    evaluations = []
    total_score = 0
    
    for i, question in enumerate(questions):
        if i < len(responses):
            response = responses[i]["response"]
            expected = question["expected_answer"]
            
            evaluation = evaluate_response(question["question"], response, expected)
            evaluation["question"] = question["question"]
            evaluation["category"] = question["category"]
            evaluation["candidate_response"] = response
            evaluation["expected_answer"] = expected
            
            evaluations.append(evaluation)
            total_score += evaluation["score"]
    
    # Calculate average score
    if evaluations:
        average_score = total_score / len(evaluations)
        percentage_score = (average_score / 5) * 100
    else:
        average_score = 0
        percentage_score = 0
    
    # Identify strengths and weaknesses by category
    category_scores = {}
    for eval in evaluations:
        category = eval["category"]
        if category not in category_scores:
            category_scores[category] = {"total": 0, "count": 0}
        
        category_scores[category]["total"] += eval["score"]
        category_scores[category]["count"] += 1
    
    for category, data in category_scores.items():
        data["average"] = data["total"] / data["count"] if data["count"] > 0 else 0
    
    strengths = [category for category, data in category_scores.items() 
               if data["average"] >= 4.0]
    
    weaknesses = [category for category, data in category_scores.items() 
                if data["average"] <= 2.5]
    
    # Determine hire recommendation
    if percentage_score >= 85:
        recommendation = "Strong Hire"
        recommendation_text = "Based on your performance in this interview, I would strongly recommend hiring you. You demonstrated exceptional technical knowledge across your chosen topics. Your answers were clear, comprehensive, and showed both theoretical understanding and practical experience."
    elif percentage_score >= 70:
        recommendation = "Hire"
        recommendation_text = f"Based on your performance in this interview, I would recommend hiring you. You demonstrated solid technical knowledge in most areas we covered. Your strengths were particularly evident in {', '.join(strengths) if strengths else 'several areas'}. While there's room for growth in {', '.join(weaknesses) if weaknesses else 'some areas'}, you showed good problem-solving abilities and technical communication skills."
    elif percentage_score >= 55:
        recommendation = "Consider"
        recommendation_text = f"Based on your performance, I would consider you for the position with some reservations. You demonstrated good knowledge in {', '.join(strengths) if strengths else 'some areas'}, but there were noticeable gaps in {', '.join(weaknesses) if weaknesses else 'other important areas'}. With additional training and experience in these areas, you could become a strong contributor to the team."
    else:
        recommendation = "No Hire"
        recommendation_text = f"Based on your performance in this interview, I would not recommend hiring you at this time. There were significant gaps in your knowledge of core concepts that would be essential for this role. I'd recommend focusing on strengthening your understanding of {', '.join(weaknesses) if weaknesses else 'fundamental concepts'} and gaining more practical experience before reapplying."
    
    # Compile the final evaluation
    final_evaluation = {
        "evaluations": evaluations,
        "total_score": round(total_score, 1),
        "average_score": round(average_score, 1),
        "percentage_score": round(percentage_score, 1),
        "strengths": strengths,
        "weaknesses": weaknesses,
        "category_scores": category_scores,
        "recommendation": recommendation,
        "recommendation_text": recommendation_text,
        "evaluation_date": datetime.now().isoformat()
    }
    
    return final_evaluation
