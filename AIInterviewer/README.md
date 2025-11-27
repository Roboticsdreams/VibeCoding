# AI Interviewer

A platform for conducting technical interviews with AI assistance, featuring dynamic question generation and real-time answer evaluation powered by OpenAI.

## Quick Start Demo

To quickly test the AI-powered interview functionality, run the demo script:

```bash
# Run the full demo (setup, create interview, and start server)
./run_demo.sh
```

This will:

1. Create test data
2. Test the OpenAI integration
3. Create a demo interview with AI-generated questions
4. Start the server

You can then navigate to [http://localhost:8000](http://localhost:8000) to test the interview process.

### Individual Demo Components

You can also run individual demo components:

```bash
# Create test data (if needed)
./demo_ai_interview.py --create-data

# Test OpenAI question generation
./demo_ai_interview.py --test-questions

# Create a demo interview
./demo_ai_interview.py --create-interview
```

## Installation

### Automatic Installation

For quick setup, use the installation script:

```bash
# Run the installer script
./install.sh
```

This script will:

1. Check Python version
2. Create and activate a virtual environment
3. Install all dependencies
4. Create a .env file from template
5. Initialize the database

### Manual Setup

If you prefer a manual setup:

1. Create a Python virtual environment:

   ```bash
   python -m venv venv
   ```

2. Activate the virtual environment:

   ```bash
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database:

   ```bash
   python init_db.py
   ```

5. Run the application:

   ```bash
   ./start.sh
   ```

## Default Admin Credentials

Username: admin  
Password: admin

*Please change these credentials after first login.*

## OpenAI Integration

This application features seamless integration with OpenAI to enhance the interview experience:

### Key Features

1. **Dynamic Question Generation**: Questions are generated on-the-fly based on selected topics and difficulty level
2. **Real-time Answer Evaluation**: Candidate answers are evaluated in real-time with detailed feedback
3. **Comprehensive Interview Summary**: Get an AI-powered summary and scoring of the entire interview

### OpenAI API Configuration

#### Setting Up Your API Key

To use the OpenAI features, you need to set up your API key:

1. Create an account at [OpenAI Platform](https://platform.openai.com/) if you don't have one
2. Generate an API key at [API Keys page](https://platform.openai.com/api-keys)
3. Set your API key in the `.env` file:

   ```bash
   # Copy the example file (if not already done by installer)
   cp .env.example .env
   
   # Edit the .env file and add your API key
   OPENAI_API_KEY=your-api-key-here
   ```

#### API Key Management

Admins can manage the API key through the admin panel:

1. Log in as admin
2. Navigate to "OpenAI Settings" from the sidebar
3. Update or validate the API key

### Using AI-Powered Interviews

#### Creating an Interview

1. Log in to the application
2. Click "AI-Powered Interview" from the dashboard or sidebar
3. Select interview topics and difficulty level
4. Enter candidate information
5. Click "Create Dynamic Interview"

#### Interview Process

1. Share the generated interview link with the candidate
2. The candidate answers questions one by one
3. Each answer receives immediate AI evaluation with:
   - Numerical score
   - Detailed feedback
   - Strengths and areas for improvement
4. After all questions are answered, a comprehensive evaluation is generated

#### Reviewing Results

1. Access the interview results from your dashboard
2. Review the comprehensive AI-generated evaluation
3. See detailed breakdowns by topic and question

### Customization

The AI features can be customized by editing the `app/services/openai_service.py` file:

- Change the OpenAI model (default: gpt-4o)
- Adjust temperature settings for question generation and evaluations
- Modify prompt templates for different evaluation criteria
