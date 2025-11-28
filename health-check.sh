#!/bin/bash

# BookVerse Services Health Check Script

echo "🔍 Checking BookVerse Services..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check service
check_service() {
    local name=$1
    local url=$2
    
    if curl -s -f -o /dev/null "$url"; then
        echo -e "${GREEN}✓${NC} $name is running at $url"
        return 0
    else
        echo -e "${RED}✗${NC} $name is NOT responding at $url"
        return 1
    fi
}

# Check all services
echo "Backend Services:"
check_service "Auth Service" "http://localhost:5000/health"
check_service "Book Service" "http://localhost:3004/health"
check_service "Cart Service" "http://localhost:3001/health"
check_service "API Gateway" "http://localhost:3000/health"

echo ""
echo "API Gateway Routes:"
check_service "Auth Endpoint" "http://localhost:3000/v1/auth/health" 2>/dev/null || echo -e "${YELLOW}⚠${NC} Auth endpoint (may require auth)"
check_service "Books Endpoint" "http://localhost:3000/v1/books" 2>/dev/null || echo -e "${YELLOW}⚠${NC} Books endpoint (check if service is up)"

echo ""
echo "Frontend:"
if curl -s -f -o /dev/null "http://localhost:4200"; then
    echo -e "${GREEN}✓${NC} Frontend is running at http://localhost:4200"
else
    echo -e "${YELLOW}⚠${NC} Frontend is not accessible at http://localhost:4200"
fi

echo ""
echo "📊 Test API Gateway -> Books:"
BOOKS_RESPONSE=$(curl -s "http://localhost:3000/v1/books" 2>/dev/null)
if [ -n "$BOOKS_RESPONSE" ]; then
    echo -e "${GREEN}✓${NC} Books API responding through gateway"
    echo "$BOOKS_RESPONSE" | head -c 100
    echo "..."
else
    echo -e "${RED}✗${NC} Books API not responding through gateway"
fi

echo ""
echo "✅ Health check complete!"
