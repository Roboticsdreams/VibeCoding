#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Function to check if a port is in use
check_port() {
    local port=$1
    local service=$2
    
    if lsof -ti:${port} &>/dev/null; then
        echo -e "${YELLOW}   Port ${port} (${service}) is in use${NC}"
        return 0
    else
        return 1
    fi
}

# Function to kill process using a specific port
kill_port() {
    local port=$1
    local service=$2
    local force=$3
    
    echo -e "${YELLOW}   Killing processes using port ${port} (${service})...${NC}"
    
    # Check if there are processes to kill
    if lsof -ti:${port} &>/dev/null; then
        if [ "$force" = true ]; then
            # Force kill with SIGKILL
            lsof -ti:${port} | xargs kill -9 2>/dev/null
            
            # Check if processes are still running after force kill
            sleep 1
            if lsof -ti:${port} &>/dev/null; then
                echo -e "${RED}❌ Could not free port ${port}. Please check manually.${NC}"
                return 1
            fi
        else
            # Normal kill with SIGTERM
            lsof -ti:${port} | xargs kill 2>/dev/null
            
            # Check if processes are still running
            sleep 1
            if lsof -ti:${port} &>/dev/null; then
                echo -e "${YELLOW}   Normal kill failed, trying force kill...${NC}"
                kill_port ${port} ${service} true
                return $?
            fi
        fi
        
        echo -e "${GREEN}✅ Port ${port} freed${NC}"
    fi
    
    return 0
}

# Function to clean up and free ports
cleanup_services() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Planning Poker - Service Cleanup  ${NC}"
    echo -e "${BLUE}========================================${NC}\n"

    # Stop and remove Docker containers
    echo -e "${YELLOW}🛑 Stopping Docker containers...${NC}"
    docker stop planningpoker-db planningpoker-pgadmin 2>/dev/null || true
    docker rm planningpoker-db planningpoker-pgadmin 2>/dev/null || true

    # Check and free ports
    echo -e "${YELLOW}🧹 Checking for and freeing required ports...${NC}"

    # List of ports and services - avoid associative arrays for compatibility
    PORTS=("5432" "5050" "5000" "5173")
    SERVICES=("PostgreSQL" "pgAdmin" "Backend" "Frontend")
    
    # Check and free each port
    for i in ${!PORTS[@]}; do
        port=${PORTS[$i]}
        service=${SERVICES[$i]}
        if check_port ${port} ${service}; then
            kill_port ${port} ${service} false || exit 1
        else
            echo -e "${GREEN}✅ Port ${port} (${service}) is available${NC}"
        fi
    done

    echo -e "${GREEN}✅ All ports are now available${NC}\n"

    # Prune Docker resources if requested
    if [ "$1" = "prune" ]; then
        echo -e "${YELLOW}♻️  Pruning unused Docker resources...${NC}"
        docker container prune -f
        docker network prune -f
        docker volume prune -f
        echo -e "${GREEN}✅ Docker system pruned${NC}\n"
    fi
}

# Function to start the database services
start_database() {
    echo -e "${YELLOW}🐳 Starting PostgreSQL and pgAdmin with Docker Compose...${NC}"
    docker-compose up -d

    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    sleep 5

    # Check if PostgreSQL is ready
    until docker exec planningpoker-db pg_isready -U planningpoker &> /dev/null; do
        echo -e "${YELLOW}   Waiting for PostgreSQL...${NC}"
        sleep 2
    done

    echo -e "${GREEN}✅ PostgreSQL is ready!${NC}\n"
}

# Function to start backend services
start_backend() {
    # Backend setup
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Backend Setup${NC}"
    echo -e "${BLUE}========================================${NC}\n"

    cd backend

    # Check if .env exists, if not create from .env.example
    if [ ! -f .env ]; then
        echo -e "${YELLOW}📝 Creating .env file from .env.example...${NC}"
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${GREEN}✅ .env file created${NC}\n"
        else
            echo -e "${RED}❌ .env.example not found. Please create it first.${NC}"
            exit 1
        fi
    fi

    # Install backend dependencies
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
        npm install
        echo -e "${GREEN}✅ Backend dependencies installed${NC}\n"
    else
        echo -e "${GREEN}✅ Backend dependencies already installed${NC}\n"
    fi

    # Initialize database
    echo -e "${YELLOW}🗄️  Initializing database schema...${NC}"
    npm run init-db
    echo -e "${GREEN}✅ Database initialized${NC}\n"

    # Start backend server in background
    echo -e "${YELLOW}🚀 Starting backend server on port 5000...${NC}"
    PORT=5000 npm start &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend server started (PID: $BACKEND_PID)${NC}\n"

    cd ..
    
    return $BACKEND_PID
}

# Function to start frontend services
start_frontend() {
    # Frontend setup
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Frontend Setup${NC}"
    echo -e "${BLUE}========================================${NC}\n"

    cd frontend

    # Install frontend dependencies
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}\n"
    else
        echo -e "${GREEN}✅ Frontend dependencies already installed${NC}\n"
    fi

    # Start frontend server in background
    echo -e "${YELLOW}🚀 Starting frontend development server on port 5173...${NC}"
    VITE_PORT=5173 npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend server started (PID: $FRONTEND_PID)${NC}\n"

    cd ..
    
    return $FRONTEND_PID
}

# Function to display service information
display_info() {
    local backend_pid=$1
    local frontend_pid=$2
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}  🎉 Planning Poker is Running!${NC}"
    echo -e "${BLUE}========================================${NC}\n"

    echo -e "${GREEN}📊 Backend API:${NC}    http://localhost:5000"
    echo -e "${GREEN}🌐 Frontend App:${NC}   http://localhost:5173"
    echo -e "${GREEN}🐘 PostgreSQL:${NC}     localhost:5432"
    echo -e "${GREEN}🖥️ pgAdmin:${NC}       http://localhost:5050"
    
    # Show all available network interfaces for remote access
    echo -e "\n${YELLOW}🔗 Remote Access URLs:${NC}"
    ip_addresses=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}')
    
    # Get regular network interfaces (non-utun, non-point-to-point)
    # Look for en0 (main wifi/ethernet) first as it's usually the most accessible
    regular_ip=$(ifconfig en0 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -n 1)
    
    # If no en0 IP found, try other regular interfaces (skip utun and point-to-point)
    if [ -z "$regular_ip" ]; then
        regular_ip=$(ifconfig | grep -v "utun\|POINTOPOINT" | grep "inet " | grep -v "127.0.0.1" | head -n 1 | awk '{print $2}')
    fi
    
    # If still no IP found, use any non-localhost IP
    if [ -z "$regular_ip" ]; then
        regular_ip=$(echo "$ip_addresses" | head -n 1)
    fi
    
    # Use regular IP as primary
    vpn_ip=$regular_ip
    
    if [ -z "$vpn_ip" ]; then
        vpn_ip="localhost"
    fi
    
    # Show the primary VPN/team access URL prominently
    echo -e "\n${BOLD}${GREEN}🌟 TEAM ACCESS URL:${NC}"
    echo -e "${BOLD}http://${vpn_ip}:5173${NC}\n"
    
    # List all available IPs
    echo -e "${YELLOW}All available access URLs:${NC}"
    for ip in $ip_addresses; do
        if [ "$ip" = "$vpn_ip" ]; then
            echo -e "${GREEN}  Frontend (PRIMARY):${NC} http://$ip:5173"
            echo -e "${GREEN}  Backend (PRIMARY):${NC}  http://$ip:5000"
        else
            echo -e "${GREEN}  Frontend:${NC} http://$ip:5173"
            echo -e "${GREEN}  Backend:${NC}  http://$ip:5000"
        fi
    done
    echo -e "${YELLOW}💾 Database:${NC}       ${POSTGRES_DB:-planningpoker}"
    echo -e "${YELLOW}ℹ️  DB credentials:${NC} See .env file\n"

    echo -e "${BLUE}========================================${NC}"
    echo -e "${YELLOW}ℹ️  Useful Commands:${NC}"
    echo -e "${BLUE}========================================${NC}\n"

    echo -e "  Stop database:      ${YELLOW}docker-compose down${NC}"
    echo -e "  View DB logs:       ${YELLOW}docker logs planningpoker-db${NC}"
    echo -e "  View pgAdmin logs:  ${YELLOW}docker logs planningpoker-pgadmin${NC}"
    echo -e "  Connect to DB:      ${YELLOW}docker exec -it planningpoker-db psql -U planningpoker${NC}"
    echo -e "  Backend PID:        ${YELLOW}$backend_pid${NC}"
    echo -e "  Frontend PID:       ${YELLOW}$frontend_pid${NC}\n"

    echo -e "${YELLOW}ℹ️  pgAdmin login:${NC}"
    echo -e "   Email:    ${YELLOW}${PGADMIN_EMAIL:-admin@planningpoker.local}${NC}"
    echo -e "   Password: ${YELLOW}${PGADMIN_PASSWORD:-admin}${NC}\n"
}

# Function to do a full start
full_start() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Planning Poker - Full Stack Services${NC}"
    echo -e "${BLUE}========================================${NC}\n"

    # Clean up existing services
    cleanup_services

    # Check if root .env exists, if not create from .env.example
    if [ ! -f .env ]; then
        echo -e "${YELLOW}📝 Creating root .env file from .env.example...${NC}"
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${GREEN}✅ Root .env file created${NC}"
            echo -e "${RED}⚠️  IMPORTANT: Please update the passwords in .env before running in production!${NC}\n"
        else
            echo -e "${RED}❌ .env.example not found. Please create it first.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Root .env file exists${NC}\n"
    fi

    # Load environment variables from root .env
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
        exit 1
    fi

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js is not installed. Please install Node.js (v16+) first.${NC}"
        exit 1
    fi

    # Start database
    start_database
    
    # Start backend
    start_backend
    BACKEND_PID=$?
    
    # Start frontend
    start_frontend
    FRONTEND_PID=$?
    
    # Display info
    display_info $BACKEND_PID $FRONTEND_PID
    
    # Wait for user interrupt
    trap "echo -e '\n${YELLOW}🛑 Stopping services...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose down; echo -e '${GREEN}✅ All services stopped${NC}'; exit 0" INT

    # Keep script running
    wait
}

# Function to only restart Docker containers
restart_docker() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Planning Poker - Docker Restart Tool  ${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    # Clean up existing services
    cleanup_services "prune"
    
    # Start database
    start_database
    
    # Display Docker services information
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}  🎉 Docker Services Restarted!${NC}"
    echo -e "${BLUE}========================================${NC}\n"

    echo -e "${GREEN}🐘 PostgreSQL:${NC}     localhost:5432"
    echo -e "${GREEN}🖥️ pgAdmin:${NC}       http://localhost:5050"
    echo -e "${GREEN}💾 Database:${NC}       ${POSTGRES_DB:-planningpokerdb}"

    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${YELLOW}ℹ️  Next Steps:${NC}"
    echo -e "${BLUE}========================================${NC}\n"

    echo -e "  Start all services:    ${YELLOW}$0 start${NC}"
    echo -e "  View DB logs:          ${YELLOW}docker logs planningpoker-db${NC}"
    echo -e "  View pgAdmin logs:     ${YELLOW}docker logs planningpoker-pgadmin${NC}\n"

    echo -e "${GREEN}Done!${NC}\n"
}

# Function to start only the backend service
start_backend_only() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Planning Poker - Backend Only        ${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    # Check if Docker services are running
    if ! docker ps | grep -q "planningpoker-db"; then
        echo -e "${YELLOW}⚠️  PostgreSQL is not running. Starting database services...${NC}"
        start_database
    else
        echo -e "${GREEN}✅ PostgreSQL is already running${NC}\n"
    fi
    
    # Load environment variables
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Start backend
    start_backend
    BACKEND_PID=$?
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}  🎉 Backend Service Running!${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    echo -e "${GREEN}📊 Backend API:${NC}    http://localhost:5000"
    echo -e "${GREEN}🐘 PostgreSQL:${NC}     localhost:5432"
    echo -e "${YELLOW}Backend PID:${NC}      $BACKEND_PID\n"
    
    # Wait for user interrupt
    trap "echo -e '\n${YELLOW}🛑 Stopping backend...${NC}'; kill $BACKEND_PID 2>/dev/null; echo -e '${GREEN}✅ Backend stopped${NC}'; exit 0" INT
    
    # Keep script running
    wait $BACKEND_PID
}

# Function to start only the frontend service
start_frontend_only() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Planning Poker - Frontend Only       ${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    # Load environment variables
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Start frontend
    start_frontend
    FRONTEND_PID=$?
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}  🎉 Frontend Service Running!${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    echo -e "${GREEN}🌐 Frontend App:${NC}   http://localhost:5173"
    echo -e "${YELLOW}Frontend PID:${NC}     $FRONTEND_PID\n"
    
    # Wait for user interrupt
    trap "echo -e '\n${YELLOW}🛑 Stopping frontend...${NC}'; kill $FRONTEND_PID 2>/dev/null; echo -e '${GREEN}✅ Frontend stopped${NC}'; exit 0" INT
    
    # Keep script running
    wait $FRONTEND_PID
}

# Function to restart everything
restart_all() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Planning Poker - Complete Restart     ${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    # Step 1: Clean up existing services and free ports
    echo -e "${YELLOW}🧹 Cleaning up existing services...${NC}"
    cleanup_services
    
    # Step 2: Check if root .env exists, if not create from .env.example
    if [ ! -f .env ]; then
        echo -e "${YELLOW}📝 Creating root .env file from .env.example...${NC}"
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${GREEN}✅ Root .env file created${NC}"
            echo -e "${RED}⚠️  IMPORTANT: Please update the passwords in .env before running in production!${NC}\n"
        else
            echo -e "${RED}❌ .env.example not found. Please create it first.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Root .env file exists${NC}\n"
    fi

    # Load environment variables from root .env
    if [ -f .env ]; then
        export $(cat .env | grep -v '^#' | xargs)
    fi
    
    # Step 3: Start Docker containers for database services
    echo -e "${YELLOW}🐳 Starting Docker containers...${NC}"
    start_database
    
    # Step 4: Start backend service
    echo -e "${YELLOW}🚀 Starting backend service...${NC}"
    start_backend
    BACKEND_PID=$?
    
    # Step 5: Start frontend service
    echo -e "${YELLOW}🚀 Starting frontend service...${NC}"
    start_frontend
    FRONTEND_PID=$?
    
    # Step 6: Display all service information
    display_info $BACKEND_PID $FRONTEND_PID
    
    # Wait for user interrupt
    trap "echo -e '\n${YELLOW}🛑 Stopping all services...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; docker-compose down; echo -e '${GREEN}✅ All services stopped${NC}'; exit 0" INT

    # Keep script running
    wait
}

# Function removed - functionality moved directly into handle_team_urls and start_vpn

# Function to display team access information
display_team_access_info() {
    local vpn_ip=$1
    local all_ips=$2
    
    # Display the URLs with formatting
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BOLD}  📢 TEAM ACCESS URLS:  ${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    echo -e "${GREEN}📱 Frontend URL:${NC} ${BOLD}http://${vpn_ip}:5173${NC}"
    echo -e "${GREEN}🔌 Backend API:${NC}  ${BOLD}http://${vpn_ip}:5000${NC}\n"
    
    # Show additional IPs
    echo -e "${YELLOW}Additional access URLs (if needed):${NC}"
    for ip in $all_ips; do
        if [ "$ip" != "$vpn_ip" ]; then
            echo -e "${GREEN}  Frontend:${NC} http://$ip:5173"
            echo -e "${GREEN}  Backend:${NC}  http://$ip:5000\n"
        fi
    done
    
    # Copy to clipboard if available
    if command -v pbcopy >/dev/null 2>&1; then # macOS
        echo "http://${vpn_ip}:5173" | pbcopy
        echo -e "${GREEN}✅ Frontend URL copied to clipboard${NC}\n"
    elif command -v xclip >/dev/null 2>&1; then # Linux with xclip
        echo "http://${vpn_ip}:5173" | xclip -selection clipboard
        echo -e "${GREEN}✅ Frontend URL copied to clipboard${NC}\n"
    fi
}

# Function to configure for VPN access
configure_vpn_access() {
    local vpn_ip=$1
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  Planning Poker - VPN Access Setup     ${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    # Configure frontend for VPN
    echo -e "${YELLOW}📝 Creating frontend VPN configuration...${NC}"
    if [ -d "frontend" ]; then
        cat > frontend/.env.local <<EOL
# Generated by VPN setup script
VITE_API_URL=http://${vpn_ip}:5000/api
VITE_SOCKET_URL=http://${vpn_ip}:5000
EOL
        echo -e "${GREEN}✅ Frontend VPN configuration created${NC}\n"
    else
        echo -e "${RED}❌ Frontend directory not found${NC}\n"
    fi

    # Configure backend for VPN
    echo -e "${YELLOW}📝 Creating backend VPN configuration...${NC}"
    if [ -d "backend" ]; then
        cat > backend/.env.local <<EOL
# Generated by VPN setup script
PORT=5000
HOST=0.0.0.0
FRONTEND_URL=http://${vpn_ip}:5173
EOL
        echo -e "${GREEN}✅ Backend VPN configuration created${NC}\n"
    else
        echo -e "${RED}❌ Backend directory not found${NC}\n"
    fi
}

# Function to handle team access URLs
handle_team_urls() {
    # Get network information
    echo -e "${YELLOW}🔍 Detecting network interfaces...${NC}"
    
    # Get all network IPs
    ALL_IPS=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}')
    
    # Get regular network interfaces (non-utun, non-point-to-point)
    # Look for en0 (main wifi/ethernet) first as it's usually the most accessible
    REGULAR_IP=$(ifconfig en0 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -n 1)
    
    # If no en0 IP found, try other regular interfaces (skip utun and point-to-point)
    if [ -z "$REGULAR_IP" ]; then
        REGULAR_IP=$(ifconfig | grep -v "utun\|POINTOPOINT" | grep "inet " | grep -v "127.0.0.1" | head -n 1 | awk '{print $2}')
    fi
    
    # If still no IP found, use any non-localhost IP
    if [ -z "$REGULAR_IP" ]; then
        REGULAR_IP=$(echo "$ALL_IPS" | head -n 1)
        echo -e "${YELLOW}⚠️  No regular interface detected. Using first available IP.${NC}"
    fi
    
    # Use regular IP as primary
    VPN_IP=$REGULAR_IP
    
    if [ -z "$VPN_IP" ]; then
        echo -e "${RED}❌ Could not detect any network IP. Using localhost instead.${NC}"
        VPN_IP="localhost"
    else
        echo -e "${GREEN}✅ Primary IP for team access: ${BOLD}$VPN_IP${NC}\n"
    fi
    
    display_team_access_info "$VPN_IP" "$ALL_IPS"
}

# Function to start VPN optimized setup
start_vpn() {
    # Get network information
    echo -e "${YELLOW}🔍 Detecting network interfaces...${NC}"
    
    # Get all network IPs
    ALL_IPS=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}')
    
    # Get regular network interfaces (non-utun, non-point-to-point)
    # Look for en0 (main wifi/ethernet) first as it's usually the most accessible
    REGULAR_IP=$(ifconfig en0 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -n 1)
    
    # If no en0 IP found, try other regular interfaces (skip utun and point-to-point)
    if [ -z "$REGULAR_IP" ]; then
        REGULAR_IP=$(ifconfig | grep -v "utun\|POINTOPOINT" | grep "inet " | grep -v "127.0.0.1" | head -n 1 | awk '{print $2}')
    fi
    
    # If still no IP found, use any non-localhost IP
    if [ -z "$REGULAR_IP" ]; then
        REGULAR_IP=$(echo "$ALL_IPS" | head -n 1)
        echo -e "${YELLOW}⚠️  No regular interface detected. Using first available IP.${NC}"
    fi
    
    # Use regular IP as primary
    VPN_IP=$REGULAR_IP
    
    if [ -z "$VPN_IP" ]; then
        echo -e "${RED}❌ Could not detect any network IP. Using localhost instead.${NC}"
        VPN_IP="localhost"
    else
        echo -e "${GREEN}✅ Primary IP for team access: ${BOLD}$VPN_IP${NC}\n"
    fi
    
    configure_vpn_access "$VPN_IP"
    display_team_access_info "$VPN_IP" "$ALL_IPS"
    
    echo -e "${YELLOW}🚀 Starting Planning Poker with VPN optimization...${NC}\n"
    restart_all
}

# Main script execution
case "$1" in
    start)
        full_start
        ;;
    restart-docker)
        restart_docker
        ;;
    backend)
        start_backend_only
        ;;
    frontend)
        start_frontend_only
        ;;
    clean)
        cleanup_services "prune"
        echo -e "${GREEN}✅ All services cleaned up${NC}\n"
        ;;
    vpn)
        # VPN optimized start
        start_vpn
        ;;
    team-urls)
        # Just generate team URLs without starting the app
        handle_team_urls
        ;;
    help)
        echo -e "${BLUE}========================================${NC}"
        echo -e "${BLUE}  Planning Poker - Service Manager     ${NC}"
        echo -e "${BLUE}========================================${NC}\n"
        echo -e "Usage: $0 [command]\n"
        echo -e "Commands:"
        echo -e "  ${YELLOW}(no args)${NC}     - Start everything with VPN support (recommended)"
        echo -e "  ${YELLOW}start${NC}          - Start all services (database, backend, frontend)"
        echo -e "  ${YELLOW}vpn${NC}            - Start with VPN optimization for team access"
        echo -e "  ${YELLOW}team-urls${NC}      - Generate team access URLs without restarting"
        echo -e "  ${YELLOW}backend${NC}        - Start only the backend service (and database if needed)"
        echo -e "  ${YELLOW}frontend${NC}       - Start only the frontend service"
        echo -e "  ${YELLOW}restart-docker${NC} - Only restart Docker containers (database, pgAdmin)"
        echo -e "  ${YELLOW}clean${NC}          - Stop all services and clean up resources"
        echo -e "  ${YELLOW}help${NC}           - Show this help message\n"
        ;;
    *)
        # Default action when no arguments: restart everything with VPN optimization
        echo -e "${BLUE}========================================${NC}"
        echo -e "${BLUE}  Planning Poker - Auto VPN Mode         ${NC}"
        echo -e "${BLUE}========================================${NC}\n"
        
        # Detect network interfaces
        echo -e "${YELLOW}🔍 Detecting network interfaces...${NC}"
        ALL_IPS=$(ifconfig | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}')
        
        # Get regular network interfaces (non-utun, non-point-to-point)
        # Look for en0 (main wifi/ethernet) first as it's usually the most accessible
        REGULAR_IP=$(ifconfig en0 2>/dev/null | grep "inet " | grep -v "127.0.0.1" | awk '{print $2}' | head -n 1)
        
        # If no en0 IP found, try other regular interfaces (skip utun and point-to-point)
        if [ -z "$REGULAR_IP" ]; then
            REGULAR_IP=$(ifconfig | grep -v "utun\|POINTOPOINT" | grep "inet " | grep -v "127.0.0.1" | head -n 1 | awk '{print $2}')
        fi
        
        # If still no IP found, use any non-localhost IP
        if [ -z "$REGULAR_IP" ]; then
            REGULAR_IP=$(echo "$ALL_IPS" | head -n 1)
            echo -e "${YELLOW}⚠️  No regular interface detected. Using first available IP.${NC}"
        fi
        
        # Use regular IP as primary
        VPN_IP=$REGULAR_IP
        
        if [ -z "$VPN_IP" ]; then
            echo -e "${RED}❌ Could not detect any network IP. Using localhost instead.${NC}"
            VPN_IP="localhost"
        else
            echo -e "${GREEN}✅ Primary IP for team access: ${BOLD}$VPN_IP${NC}\n"
        fi
        
        # Configure for VPN access
        configure_vpn_access "$VPN_IP"
        
        # Restart all services
        restart_all
        
        # Copy to clipboard if available
        if command -v pbcopy >/dev/null 2>&1; then # macOS
            echo "http://${VPN_IP}:5173" | pbcopy
        elif command -v xclip >/dev/null 2>&1; then # Linux with xclip
            echo "http://${VPN_IP}:5173" | xclip -selection clipboard
        fi
        
        # Print footer message with team URL highlighted
        echo -e "\n${BLUE}========================================${NC}"
        echo -e "${GREEN}🚀 ${BOLD}Planning Poker is running with VPN support!${NC}"
        echo -e "${BLUE}========================================${NC}"
        echo -e "\n${GREEN}👉 ${BOLD}TEAM ACCESS URL: http://$VPN_IP:5173${NC}"
        echo -e "${YELLOW}ℹ️  Share this URL with your team (copied to clipboard)${NC}\n"
        ;;
esac

exit 0
