#!/bin/bash

echo "🚀 Setting up Course Platform with Python 3.12..."

# Check for python3.12
if ! command -v python3.12 &> /dev/null; then
    echo "❌ Python 3.12 not found!"
    echo ""
    echo "Please install Python 3.12 first:"
    echo "  brew install python@3.12"
    echo ""
    echo "Or see PYTHON_VERSION_FIX.md for other options."
    exit 1
fi

echo "✅ Found Python 3.12"

# Create virtual environment with Python 3.12
echo "📦 Creating virtual environment..."
python3.12 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Verify we're using the right Python
echo "Using Python: $(python --version)"

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install setuptools first
echo "📥 Installing setuptools..."
pip install "setuptools>=65.0.0"

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Copy .env.example to .env if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual credentials!"
fi

# Run migrations
echo "🔄 Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Check if superuser exists
echo ""
SUPERUSER_EXISTS=$(python manage.py shell -c "from django.contrib.auth.models import User; print('yes' if User.objects.filter(is_superuser=True).exists() else 'no')")

if [ "$SUPERUSER_EXISTS" = "yes" ]; then
    echo "✅ Superuser already exists, skipping creation."
else
    echo "👤 Create a superuser account:"
    python manage.py createsuperuser --noinput --username admin --email admin@example.com --password admin123
fi


# Run development server
echo "🚀 Starting Django development server..."
python manage.py runserver
