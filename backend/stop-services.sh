#!/bin/bash

# BookVerse Backend Services Stop Script

echo "Stopping BookVerse Backend Services..."

# Function to kill processes on a port
kill_port() {
    local port=$1
    local service=$2
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo "Stopping $service on port $port..."
        lsof -ti:$port | xargs kill -9
        echo "✓ $service stopped"
    else
        echo "• $service not running"
    fi
}

# Stop all services
kill_port 5000 "Auth Service"
kill_port 3004 "Book Service"
kill_port 3001 "Cart Service"
kill_port 3002 "Order Service"
kill_port 3000 "API Gateway"

echo ""
echo "All services stopped!"
