#!/bin/bash

# BookVerse Backend Services Startup Script
# This script starts all backend services for the BookVerse application

echo "=========================================="
echo "Starting BookVerse Backend Services"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base directory
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Node.js version: $(node --version)${NC}"
echo ""

# Function to start a service
start_service() {
    local service_name=$1
    local service_dir=$2
    local service_file=$3
    local port=$4
    
    echo -e "${YELLOW}Starting ${service_name} on port ${port}...${NC}"
    cd "$BASE_DIR/$service_dir"
    
    if [ ! -f "$service_file" ]; then
        echo -e "${RED}Error: ${service_file} not found in ${service_dir}${NC}"
        return 1
    fi
    
    # Check if port is already in use
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}Warning: Port ${port} is already in use${NC}"
        read -p "Kill existing process? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            lsof -ti:$port | xargs kill -9
            sleep 1
        else
            return 1
        fi
    fi
    
    # Start the service in background with TLS workaround for Node.js v22
    NODE_OPTIONS='--tls-min-v1.0' nohup node "$service_file" > "${service_name}.log" 2>&1 &
    local pid=$!
    
    # Wait a moment and check if service started successfully
    sleep 2
    if ps -p $pid > /dev/null; then
        echo -e "${GREEN}✓ ${service_name} started (PID: ${pid})${NC}"
    else
        echo -e "${RED}✗ ${service_name} failed to start. Check ${service_name}.log${NC}"
        return 1
    fi
    echo ""
}

# Start all services
echo "Starting services..."
echo ""

start_service "Auth Service" "auth-service" "app.js" "5000"
start_service "Book Service" "book-service" "app.js" "3004"
start_service "Cart Service" "cart-service" "src/app.js" "3001"
start_service "Order Service" "order-service" "src/app.js" "3002"
start_service "API Gateway" "api-gateway" "src/server.js" "3000"

echo "=========================================="
echo -e "${GREEN}All services started!${NC}"
echo "=========================================="
echo ""
echo "Service Status:"
echo "  • Auth Service:  http://localhost:5000"
echo "  • Book Service:  http://localhost:3004"
echo "  • Cart Service:  http://localhost:3001"
echo "  • Order Service: http://localhost:3002"
echo "  • API Gateway:   http://localhost:3000"
echo ""
echo "Frontend: http://localhost:4200"
echo ""
echo "To stop all services, run: ./stop-services.sh"
echo "To view logs: tail -f backend/[service-name]/*.log"
echo ""
