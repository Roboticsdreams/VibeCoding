#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to clean up Docker containers when script exits
cleanup() {
    echo -e "\n${YELLOW}🛑 Stopping Docker containers...${NC}"
    if [ -n "$DOCKER_COMPOSE" ]; then
        $DOCKER_COMPOSE down
    else
        # Fallback if DOCKER_COMPOSE isn't set yet
        if docker compose version &> /dev/null; then
            docker compose down
        else
            docker-compose down
        fi
    fi
    echo -e "${GREEN}✅ Docker containers stopped!${NC}"
    exit 0
}

# Set up trap for various exit signals
trap cleanup EXIT SIGINT SIGTERM

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Bookmarker Development Setup       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Use docker compose (new) or docker-compose (old)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    DOCKER_COMPOSE="docker-compose"
fi

echo -e "${YELLOW}🐳 Starting MongoDB with Docker Compose...${NC}"
$DOCKER_COMPOSE up -d

# Wait for MongoDB to be healthy
echo -e "${YELLOW}⏳ Waiting for MongoDB to be ready...${NC}"
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if docker exec bookmarker-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
        echo -e "${GREEN}✅ MongoDB is ready!${NC}"
        break
    fi
    attempt=$((attempt + 1))
    echo -e "${YELLOW}   Attempt $attempt/$max_attempts...${NC}"
    sleep 1
done

if [ $attempt -eq $max_attempts ]; then
    echo -e "${RED}❌ MongoDB failed to start. Check Docker logs.${NC}"
    exit 1
fi

# Initialize MongoDB replica set
echo -e "${YELLOW}🔧 Initializing MongoDB replica set...${NC}"
sleep 3 # Give MongoDB a moment to fully initialize
docker exec bookmarker-mongodb mongosh --eval "rs.status().ok || rs.initiate({_id: 'rs0', members: [{_id: 0, host: 'localhost:27017'}]})"

# Wait for replica set to initialize
echo -e "${YELLOW}⏳ Waiting for replica set to initialize...${NC}"
sleep 5
echo -e "${GREEN}✅ MongoDB replica set initialized!${NC}"

# Create or update .env.local file with MongoDB connection string
ENV_FILE=".env.local"
echo -e "${YELLOW}🔧 Checking for ${ENV_FILE} file...${NC}"

if [ ! -f "$ENV_FILE" ] || ! grep -q "DATABASE_URL=" "$ENV_FILE"; then
    echo -e "${YELLOW}📝 Creating/Updating ${ENV_FILE} with environment variables...${NC}"
    
    # Generate a secure random secret for NextAuth
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    cat > "$ENV_FILE" << EOF
# Database - MongoDB connection string
DATABASE_URL=mongodb://localhost:27017/bookmarker?replicaSet=rs0

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# Application settings
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ ${ENV_FILE} created with environment variables!${NC}"
else
    echo -e "${GREEN}✅ ${ENV_FILE} already exists with DATABASE_URL!${NC}"
fi

# Check if Prisma Client is generated
if [ ! -d "node_modules/@prisma/client" ]; then
    echo -e "${YELLOW}📦 Prisma Client not found. Generating...${NC}"
    npm run prisma:generate
fi

# Sync Prisma schema with MongoDB (Mongo doesn't support migrate)
echo -e "${YELLOW}🔄 Pushing Prisma schema to MongoDB...${NC}"
if npm run prisma:db:push &> /dev/null; then
    echo -e "${GREEN}✅ Prisma schema synced with MongoDB!${NC}"
else
    echo -e "${RED}❌ Failed to push Prisma schema. Check errors above.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Setup Complete! 🎉            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 MongoDB is running at:${NC} localhost:27017"
echo -e "${BLUE}📚 Database name:${NC} bookmarker"
echo -e "${BLUE}👤 Username:${NC} bookmarker"
echo -e "${BLUE}🔑 Password:${NC} bookmarker_password"
echo -e "${BLUE}👀 Mongo Express UI:${NC} http://localhost:8081"
echo -e "${BLUE}👤 Mongo Express Username:${NC} admin"
echo -e "${BLUE}🔑 Mongo Express Password:${NC} pass"
echo ""
echo -e "${BLUE}🚀 Starting Next.js development server...${NC}"
echo ""

# Start the Next.js development server
npm run dev
