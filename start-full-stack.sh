#!/bin/bash

# Cafe Connect Suite - Full Stack Start Script
echo "🚀 Starting Cafe Connect Suite Full Stack Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first:"
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
    echo "✅ Frontend dependencies installed"
else
    echo "✅ Frontend dependencies already installed"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
    echo "✅ Backend dependencies installed"
else
    echo "✅ Backend dependencies already installed"
fi

# Setup backend environment
if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
    echo "✅ Backend .env file created"
fi

cd ..

echo ""
echo "🔧 Starting both frontend and backend servers..."
echo ""
echo "📱 Frontend will be available at: http://localhost:8080"
echo "🌐 Backend API will be available at: http://localhost:5000"
echo "📋 Backend health check: http://localhost:5000/api/health"
echo ""
echo "🛑 Press Ctrl+C to stop both servers"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend server in background
echo "🚀 Starting backend server..."
cd backend
nohup npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if curl -s http://localhost:5000/api/health > /dev/null; then
    echo "✅ Backend server started successfully"
else
    echo "⚠️  Backend server may take a moment to start"
fi

# Start frontend server in background
echo "🚀 Starting frontend server..."
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a moment for frontend to start
sleep 5

# Check if frontend started successfully
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Frontend server started successfully"
else
    echo "⚠️  Frontend server may take a moment to start"
fi

echo ""
echo "🎉 Full stack application is now running!"
echo ""
echo "📱 Open your browser to: http://localhost:8080"
echo "🌐 Backend API documentation: http://localhost:5000/api/health"
echo ""
echo "📋 Log files:"
echo "   Frontend: frontend.log"
echo "   Backend: backend.log"
echo ""
echo "🛑 Press Ctrl+C to stop both servers"

# Keep script running and wait for interrupt
while true; do
    sleep 1
done