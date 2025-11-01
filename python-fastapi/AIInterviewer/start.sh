#!/bin/bash

# Variables
VENV_DIR="venv"
APP_MODULE="main:app"
HOST="localhost"
PORT="8000"

# Display header
echo "========================================"
echo "  TechInterviewer Application Launcher"
echo "========================================"

# Check if port is already in use
if lsof -i:$PORT > /dev/null 2>&1; then
    echo "⚠️  Port $PORT is already in use!"
    echo "Stopping any running uvicorn processes..."
    pkill -f "uvicorn" || echo "No previous instances found"
    sleep 2  # Give system time to release the port
    
    # Double-check if port is now free
    if lsof -i:$PORT > /dev/null 2>&1; then
        echo "❌ Port $PORT is still in use. Please check what's using it:"
        lsof -i:$PORT
        echo "Please stop that process and try again."
        exit 1
    else
        echo "✅ Port $PORT is now free"
    fi
fi

# Check if virtual environment exists
if [ ! -d "$VENV_DIR" ]; then
    echo "❌ Virtual environment not found!"
    echo "Creating virtual environment..."
    python3 -m venv $VENV_DIR
    
    if [ ! -d "$VENV_DIR" ]; then
        echo "❌ Failed to create virtual environment. Exiting."
        exit 1
    fi
    
    echo "✅ Virtual environment created!"
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source $VENV_DIR/bin/activate

# Check if requirements are installed
echo "🔄 Checking requirements..."
if [ ! -f "requirements.txt" ]; then
    echo "⚠️ requirements.txt not found, skipping package installation."
else
    echo "Installing requirements..."
    pip install -r requirements.txt
    if [ $? -eq 0 ]; then
        echo "✅ Requirements installed successfully!"
    else
        echo "⚠️ There were some issues with requirements installation."
        echo "Continuing anyway, but some features might not work."
    fi
fi

# Check if database exists, if not initialize it
if [ ! -f "techinterviewer.db" ]; then
    echo "🔄 Database not found. Initializing..."
    python init_db.py
    if [ $? -ne 0 ]; then
        echo "❌ Failed to initialize database. Exiting."
        exit 1
    fi
    echo "✅ Database initialized!"
else
    echo "✅ Database exists!"
fi

# Check for .env file and OpenAI API key
if [ ! -f ".env" ]; then
    echo "⚠️ No .env file found!"
    echo "Creating .env file from template..."
    
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✅ Created .env file from template. Please edit it to add your OpenAI API key."
    else
        echo "SECRET_KEY=your-secure-secret-key-here" > .env
        echo "DATABASE_URL=sqlite:///techinterviewer.db" >> .env
        echo "OPENAI_API_KEY=your-openai-api-key-here" >> .env
        echo "✅ Created basic .env file. Please edit it to add your OpenAI API key."
    fi
    
    echo "⚠️ The AI-powered interview features require an OpenAI API key."
    echo "Please edit the .env file before using those features."
fi

# Check if OpenAI API key is set to default value
if grep -q "OPENAI_API_KEY=your-openai-api-key-here" .env; then
    echo "⚠️ ==============================================="
    echo "⚠️ OpenAI API key not configured in .env file!"
    echo "⚠️ AI-powered interview features will not work."
    echo "⚠️ Get your API key at: https://platform.openai.com/api-keys"
    echo "⚠️ ==============================================="
fi

# Start the application
echo "🚀 Starting TechInterviewer application..."
echo "📌 Press CTRL+C to stop the server"
echo "========================================"

# Run the application with uvicorn
$VENV_DIR/bin/uvicorn $APP_MODULE --host $HOST --port $PORT --reload
