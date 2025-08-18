#!/bin/bash

echo "🔍 Checking Cafe Connect Suite Status..."
echo ""

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js: Not installed"
fi

# Check if npm is installed
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm: Not installed"
fi

echo ""
echo "🌐 Server Status:"

# Check frontend server
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ Frontend: Running on http://localhost:8080"
else
    echo "❌ Frontend: Not running on port 8080"
fi

# Check backend server
if curl -s http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "✅ Backend: Running on http://localhost:5000"
    HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health | grep -o '"database":"[^"]*"' | cut -d'"' -f4)
    echo "   Database: $HEALTH_RESPONSE"
else
    echo "❌ Backend: Not running on port 5000"
fi

echo ""
echo "📁 Project Structure:"

if [ -f "package.json" ]; then
    echo "✅ Frontend package.json found"
else
    echo "❌ Frontend package.json missing"
fi

if [ -f "backend/package.json" ]; then
    echo "✅ Backend package.json found"
else
    echo "❌ Backend package.json missing"
fi

if [ -d "node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependencies not installed"
fi

if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend dependencies not installed"
fi

if [ -f "backend/.env" ]; then
    echo "✅ Backend environment file exists"
else
    echo "⚠️  Backend .env file missing (will use defaults)"
fi

echo ""
echo "🚀 Quick Actions:"
echo "   Start Frontend: ./start.sh"
echo "   Start Backend: cd backend && ./start-backend.sh"
echo "   Start Full Stack: ./start-full-stack.sh"
echo "   Check Status: ./check-status.sh"