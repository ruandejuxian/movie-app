#!/bin/bash

# Script to test backend API endpoints

echo "Testing Backend API Endpoints..."
echo "================================"

# Base URL
BASE_URL="http://localhost:5000/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test an endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local description=$3
  local data=$4
  local auth_token=$5

  echo -e "\n${YELLOW}Testing: ${description}${NC}"
  echo "Endpoint: ${method} ${endpoint}"
  
  # Build curl command
  cmd="curl -s -X ${method} ${BASE_URL}${endpoint}"
  
  # Add auth header if token is provided
  if [ ! -z "$auth_token" ]; then
    cmd="${cmd} -H \"Authorization: Bearer ${auth_token}\""
  fi
  
  # Add data if provided
  if [ ! -z "$data" ]; then
    cmd="${cmd} -H \"Content-Type: application/json\" -d '${data}'"
  fi
  
  # Execute the command
  echo "Command: ${cmd}"
  response=$(eval ${cmd})
  
  # Check if response is valid JSON
  if echo "$response" | jq . >/dev/null 2>&1; then
    echo -e "${GREEN}Response: $(echo $response | jq .)${NC}"
  else
    echo -e "${RED}Invalid JSON response: ${response}${NC}"
  fi
  
  echo "--------------------------------"
}

# Register a test user
echo -e "\n${YELLOW}Step 1: Register a test user${NC}"
register_data='{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "inviteCode": "testcode123"
}'
test_endpoint "POST" "/auth/register" "Register User" "$register_data"

# Login to get token
echo -e "\n${YELLOW}Step 2: Login to get auth token${NC}"
login_data='{
  "email": "test@example.com",
  "password": "password123"
}'
login_response=$(curl -s -X POST ${BASE_URL}/auth/login -H "Content-Type: application/json" -d "$login_data")
echo "Login response: $login_response"

# Extract token from login response
token=$(echo $login_response | jq -r '.token')
if [ "$token" != "null" ] && [ ! -z "$token" ]; then
  echo -e "${GREEN}Successfully obtained auth token${NC}"
else
  echo -e "${RED}Failed to obtain auth token${NC}"
  # Use a dummy token for testing subsequent endpoints
  token="dummy_token_for_testing"
fi

# Test authenticated endpoints
echo -e "\n${YELLOW}Step 3: Test authenticated endpoints${NC}"

# Get user profile
test_endpoint "GET" "/users/profile" "Get User Profile" "" "$token"

# Get movies list
test_endpoint "GET" "/movies?page=1&limit=10" "Get Movies List" ""

# Get movie by ID (assuming ID 1 exists)
test_endpoint "GET" "/movies/1" "Get Movie by ID" ""

# Add movie to favorites
test_endpoint "POST" "/users/favorites/1" "Add Movie to Favorites" "" "$token"

# Get user's favorites
test_endpoint "GET" "/users/favorites" "Get User's Favorites" "" "$token"

# Add movie to watch history
test_endpoint "POST" "/users/watch-history/1" "Add Movie to Watch History" "" "$token"

# Get user's watch history
test_endpoint "GET" "/users/watch-history" "Get User's Watch History" "" "$token"

# Post a comment
comment_data='{
  "movie": "1",
  "content": "This is a test comment"
}'
test_endpoint "POST" "/comments" "Post a Comment" "$comment_data" "$token"

# Get comments for a movie
test_endpoint "GET" "/comments/movie/1" "Get Comments for a Movie" ""

# Get notifications
test_endpoint "GET" "/notifications" "Get Notifications" "" "$token"

echo -e "\n${GREEN}API Testing Completed!${NC}"
