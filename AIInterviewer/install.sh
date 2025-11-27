#!/bin/bash

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Display header
echo -e "${BLUE}"
cat << "EOF"
  _____           _                _  _                    
 |_   _|         | |              | || |                   
   | |  _ __  ___| |_ __ _  __  __| || | ___ _ __          
   | | | '_ \/ __| __/ _` | \ \/ /| || |/ _ \ '__|         
  _| |_| | | \__ \ || (_| |  >  < | || |  __/ |            
 |_____|_| |_|___/\__\__,_| /_/\_\|_||_|\___|_|            
                                                            
EOF
echo -e "${NC}"

echo -e "${GREEN}===================================${NC}"
echo -e "${YELLOW}AI Interviewer Installation${NC}"
echo -e "${GREEN}===================================${NC}"

# Check Python version
echo -e "${BLUE}Checking Python version...${NC}"
if command -v python3 >/dev/null 2>&1; then
    python_version=$(python3 --version)
    echo -e "${GREEN}✓ Found $python_version${NC}"
else
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    echo "Please install Python 3.8 or higher and try again."
    exit 1
fi

# Create virtual environment
echo -e "${BLUE}Creating virtual environment...${NC}"
if [ -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment already exists. Skipping creation.${NC}"
else
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error creating virtual environment${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${BLUE}Activating virtual environment...${NC}"
source venv/bin/activate
if [ $? -ne 0 ]; then
    echo -e "${RED}Error activating virtual environment${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Virtual environment activated${NC}"

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo -e "${RED}Error installing dependencies${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create .env file if it doesn't exist
echo -e "${BLUE}Checking for .env file...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
else
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cp .env.example .env
    if [ $? -ne 0 ]; then
        echo -e "${RED}Error creating .env file${NC}"
    else
        echo -e "${GREEN}✓ .env file created from template${NC}"
        echo -e "${YELLOW}⚠️ Please edit the .env file to set your OpenAI API key${NC}"
    fi
fi

# Initialize the database
echo -e "${BLUE}Initializing database...${NC}"
python init_db.py
if [ $? -ne 0 ]; then
    echo -e "${RED}Error initializing database${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database initialized${NC}"

echo
echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}✓ Installation complete!${NC}"
echo -e "${GREEN}===================================${NC}"
echo
echo -e "${BLUE}To start the application:${NC}"
echo -e "  ${YELLOW}./start.sh${NC}"
echo
echo -e "${BLUE}To run a demo:${NC}"
echo -e "  ${YELLOW}./run_demo.sh${NC}"
echo
echo -e "${BLUE}Default admin credentials:${NC}"
echo -e "  ${YELLOW}Username:${NC} admin"
echo -e "  ${YELLOW}Password:${NC} admin"
echo
echo -e "${RED}Note:${NC} Please change the default admin password after first login."
echo
