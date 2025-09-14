#!/bin/bash

# Deployment validation script for Kraamweek app
# This script validates that the deployment setup is correct

set -e

echo "🚀 Kraamweek Deployment Validation"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found. Are you in the correct directory?${NC}"
    exit 1
fi

print_info "Checking project setup..."

# 1. Verify dependencies are installed
print_info "1. Checking dependencies..."
if [ -d "node_modules" ]; then
    print_status 0 "Dependencies installed"
else
    print_warning "Dependencies not installed. Running npm install..."
    npm install
    print_status $? "Dependencies installed"
fi

# 2. Run linting
print_info "2. Running linting..."
npm run lint
print_status $? "Code linting passed"

# 3. Run tests
print_info "3. Running tests..."
npm test
print_status $? "Tests passed"

# 4. Test production build
print_info "4. Testing production build..."
npm run build
print_status $? "Production build successful"

# 5. Check deployment files
print_info "5. Checking deployment configuration..."

# Check vercel.json
if [ -f "vercel.json" ]; then
    print_status 0 "vercel.json exists"
else
    print_status 1 "vercel.json missing"
fi

# Check GitHub workflow
if [ -f ".github/workflows/deploy.yml" ]; then
    print_status 0 "GitHub Actions workflow exists"
else
    print_status 1 "GitHub Actions workflow missing"
fi

# Check environment files
if [ -f ".env.example" ]; then
    print_status 0 ".env.example exists"
else
    print_status 1 ".env.example missing"
fi

if [ -f ".env.production" ]; then
    print_status 0 ".env.production exists"
else
    print_status 1 ".env.production missing"
fi

# Check documentation
if [ -f "DEPLOYMENT.md" ]; then
    print_status 0 "Deployment documentation exists"
else
    print_status 1 "Deployment documentation missing"
fi

# 6. Test health endpoint (if server is running)
print_info "6. Testing health endpoint..."
if nc -z localhost 3000 2>/dev/null; then
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/health)
    if echo "$HEALTH_RESPONSE" | grep -q '"status":"healthy"'; then
        print_status 0 "Health endpoint responding correctly"
    else
        print_status 1 "Health endpoint not responding correctly"
    fi
else
    print_warning "Development server not running. Start with 'npm run dev' to test health endpoint."
fi

# 7. Check required environment variables are documented
print_info "7. Validating environment configuration..."

# Check if all required variables are in .env.example
REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "JWT_SECRET"
    "ENCRYPTION_KEY"
    "NODE_ENV"
    "NEXT_PUBLIC_APP_URL"
)

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "$var" .env.example; then
        print_status 0 "$var documented in .env.example"
    else
        print_status 1 "$var missing from .env.example"
    fi
done

echo ""
echo "🎉 Deployment validation complete!"
echo ""
echo "Next steps:"
echo "1. Set up your Vercel account and import this repository"
echo "2. Configure environment variables in Vercel dashboard"
echo "3. Add GitHub secrets for CI/CD pipeline"
echo "4. Merge to main branch to trigger automated deployment"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"