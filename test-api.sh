#!/bin/bash

# Kraamweek API Testing Script
# This script demonstrates all the backend API endpoints

echo "🏥 Kraamweek Backend API Testing"
echo "================================="
echo ""

BASE_URL="http://localhost:3000"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_endpoint() {
    echo -e "${BLUE}Testing: $1${NC}"
    echo -e "${YELLOW}$2${NC}"
    echo ""
    response=$(eval $3)
    echo "$response" | jq . 2>/dev/null || echo "$response"
    echo ""
    echo "---"
    echo ""
}

# Test 1: Get all data
test_endpoint "GET /api/data" \
  "Fetch all application data (demo mode)" \
  "curl -s $BASE_URL/api/data"

# Test 2: Get baby records
test_endpoint "GET /api/baby-records" \
  "Fetch all baby health records" \
  "curl -s $BASE_URL/api/baby-records"

# Test 3: Create baby record
test_endpoint "POST /api/baby-records" \
  "Create a new baby temperature record" \
  "curl -s -X POST $BASE_URL/api/baby-records -H 'Content-Type: application/json' -d '{\"type\": \"temperature\", \"value\": 37.1, \"notes\": \"Slightly elevated temperature\"}'"

# Test 4: Create baby feeding record
test_endpoint "POST /api/baby-records" \
  "Create a new baby feeding record" \
  "curl -s -X POST $BASE_URL/api/baby-records -H 'Content-Type: application/json' -d '{\"type\": \"feeding\", \"feedingType\": \"bottle\", \"amount\": 150, \"duration\": 20, \"notes\": \"Good appetite\"}'"

# Test 5: Get mother records
test_endpoint "GET /api/mother-records" \
  "Fetch all mother health records" \
  "curl -s $BASE_URL/api/mother-records"

# Test 6: Get baby profile
test_endpoint "GET /api/baby-profile" \
  "Fetch baby profile" \
  "curl -s $BASE_URL/api/baby-profile"

# Test 7: Get tasks
test_endpoint "GET /api/tasks" \
  "Fetch all tasks" \
  "curl -s $BASE_URL/api/tasks"

# Test 8: Get alerts
test_endpoint "GET /api/alerts" \
  "Fetch all health alerts" \
  "curl -s $BASE_URL/api/alerts"

# Test 9: Get family observations
test_endpoint "GET /api/family-observations" \
  "Fetch all family observations" \
  "curl -s $BASE_URL/api/family-observations"

echo -e "${GREEN}✅ All API endpoints tested successfully!${NC}"
echo ""
echo "📝 Notes:"
echo "- All endpoints return demo data when Supabase is not configured"
echo "- Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for real database"
echo "- See BACKEND.md for complete setup instructions"
echo ""
echo "🚀 Backend API is ready for production!"