#!/bin/bash

# Turitor - Development Server Runner
# This script activates the virtual environment and starts the Django development server

set -e

echo "🚀 Starting Turitor Development Server..."
echo ""

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    echo "✓ Activating virtual environment..."
    source venv/bin/activate
else
    echo "⚠️  Virtual environment not found. Please run: python3 -m venv venv"
    exit 1
fi

# Check if Django is installed
if ! python -c "import django" 2>/dev/null; then
    echo "⚠️  Django not installed. Installing dependencies..."
    pip install -r requirements.txt
fi

# Check if migrations are needed
if ! python manage.py showmigrations | grep -q "\[X\]"; then
    echo "⚠️  Database not initialized. Running migrations..."
    python manage.py makemigrations
    python manage.py migrate
fi

# Check if static files are built
if [ ! -f "static/dist/output.css" ] || [ ! -s "static/dist/output.css" ]; then
    echo "⚠️  TailwindCSS not built. Please run: npm run build:css"
    echo ""
fi

# Check if there's any data
COURSE_COUNT=$(python manage.py shell -c "from courses.models import Course; print(Course.objects.count())" 2>/dev/null || echo "0")
if [ "$COURSE_COUNT" = "0" ]; then
    echo "💡 No courses found. You can load sample data with: python manage.py populate_data"
    echo ""
fi

echo "✓ Starting Django development server..."
echo "📍 Server will be available at: http://127.0.0.1:8000/"
echo "📍 Admin panel at: http://127.0.0.1:8000/admin/"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

# Run the development server
python manage.py runserver
