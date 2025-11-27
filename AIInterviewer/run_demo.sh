#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Display ASCII art
echo -e "${BLUE}"
cat << "EOF"
  _____    _____   _____        _                  _                                  
 |  __ \  |_   _| |_   _|      | |                (_)                                 
 | |__) |   | |     | |   _ __ | |_  ___  _ __  __ _   ___  __      __ ___  _ __     
 |  _  /    | |     | |  | '_ \| __|/ _ \| '__|| __ \ / _ \ \ \ /\ / // _ \| '__|    
 | | \ \   _| |_   _| |_ | | | | |_|  __/| | | | |_| | |_| | \ V  V / |  __/| |       
 |_|  \_\ |_____| |_____||_| |_|\__|\___ |_| |_|\____|\___ |  \_/\_/  \___||_|       
                                                                                      
EOF
echo -e "${NC}"

echo -e "${GREEN}===================================${NC}"
echo -e "${YELLOW}AI Interviewer Demo Setup${NC}"
echo -e "${GREEN}===================================${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  Please edit the .env file to add your OpenAI API key before continuing.${NC}"
    echo "Press any key to continue after editing the .env file..."
    read -n 1 -s
fi

# Activate virtual environment
if [ -d "venv" ]; then
    echo -e "${BLUE}Activating virtual environment...${NC}"
    source venv/bin/activate
else
    echo -e "${YELLOW}Virtual environment not found. Creating one...${NC}"
    python -m venv venv
    source venv/bin/activate
    echo -e "${GREEN}✓ Virtual environment created and activated${NC}"
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create demo data
echo -e "${BLUE}Creating demo data...${NC}"
python demo_ai_interview.py --create-data
echo -e "${GREEN}✓ Demo data created${NC}"

# Test OpenAI integration
echo -e "${BLUE}Testing OpenAI integration...${NC}"
python demo_ai_interview.py --test-questions
echo

# Create a demo interview
echo -e "${BLUE}Creating a demo interview...${NC}"
python demo_ai_interview.py --create-interview

# Start the application
echo
echo -e "${GREEN}===================================${NC}"
echo -e "${YELLOW}Starting AI Interviewer application${NC}"
echo -e "${GREEN}===================================${NC}"
echo -e "${BLUE}The application will now start. Access it at http://localhost:8000${NC}"
echo -e "${BLUE}Press Ctrl+C to stop the server when done${NC}"
echo

# Run the application
uvicorn main:app --host localhost --port 8000 --reload
