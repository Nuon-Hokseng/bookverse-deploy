#!/bin/bash

# Docker Hub Push Script for BookVerse
# This script builds and pushes all service images to Docker Hub

# Configuration - Replace with your Docker Hub username
DOCKER_USERNAME="${DOCKER_USERNAME:-yourusername}"
VERSION="${VERSION:-latest}"

# Color output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  BookVerse Docker Hub Deployment${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Check if logged in to Docker Hub
if ! docker info | grep -q "Username: $DOCKER_USERNAME"; then
    echo -e "${BLUE}Logging in to Docker Hub...${NC}"
    docker login
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to login to Docker Hub${NC}"
        exit 1
    fi
fi

# Array of services
SERVICES=("auth-service" "book-service" "cart-service" "order-service" "api-gateway")

# Build and push each service
for SERVICE in "${SERVICES[@]}"; do
    echo -e "${BLUE}Building $SERVICE...${NC}"
    
    # Build the image
    docker compose build $SERVICE
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to build $SERVICE${NC}"
        exit 1
    fi
    
    # Tag the image for Docker Hub
    docker tag backend-$SERVICE:latest $DOCKER_USERNAME/bookverse-$SERVICE:$VERSION
    docker tag backend-$SERVICE:latest $DOCKER_USERNAME/bookverse-$SERVICE:latest
    
    echo -e "${GREEN}Pushing $SERVICE to Docker Hub...${NC}"
    
    # Push both tags
    docker push $DOCKER_USERNAME/bookverse-$SERVICE:$VERSION
    docker push $DOCKER_USERNAME/bookverse-$SERVICE:latest
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Successfully pushed $SERVICE${NC}"
    else
        echo -e "${RED}✗ Failed to push $SERVICE${NC}"
        exit 1
    fi
    echo ""
done

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  All services pushed successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Images pushed:"
for SERVICE in "${SERVICES[@]}"; do
    echo "  - $DOCKER_USERNAME/bookverse-$SERVICE:$VERSION"
done
