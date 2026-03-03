#!/bin/bash

# Bitbucket Clone Django Server Startup Script
# This script activates the virtual environment and starts the Django development server

echo "🚀 Starting Bitbucket Clone Django Application..."
echo "=================================================="

# Check if virtual environment exists
if [ ! -d "./venv" ]; then
    echo "Virtual environment not found. Creating..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source ./venv/bin/activate

# Check if Django is installed
if ! python -c "import django" 2>/dev/null; then
    echo "❌ Django not found. Installing dependencies..."
    pip install -r requirements.txt
fi

# Run migrations if needed
echo "🗃️  Running database migrations..."
python manage.py migrate --run-syncdb

# Collect static files (for production-like setup)
echo "📄 Collecting static files..."
python manage.py collectstatic --noinput --clear 2>/dev/null || echo "Static files collection skipped (development mode)"

# Start the development server
echo "🌐 Starting Django development server..."
echo "=================================================="
echo "🎉 Application will be available at:"
echo "   👉 http://127.0.0.1:8000"
echo "   👉 http://localhost:8000"
echo ""
echo "📋 Available pages:"
echo "   • Dashboard: http://localhost:8000/"
echo "   • Overview: http://localhost:8000/overview/"
echo "   • Diff: http://localhost:8000/diff/"
echo "   • Commits: http://localhost:8000/commits/"
echo "   • Builds: http://localhost:8000/builds/"
echo ""
echo "⏹️  Press Ctrl+C to stop the server"
echo "=================================================="

# Start the server
python manage.py runserver 0.0.0.0:8000
