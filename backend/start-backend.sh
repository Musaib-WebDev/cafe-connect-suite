#!/bin/bash

# Cafe Connect Suite Backend - Easy Start Script
echo "🚀 Starting Cafe Connect Suite Backend..."

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

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed successfully"
else
    echo "✅ Dependencies already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created - you can customize it if needed"
fi

echo "🔧 Starting backend server..."
echo "🌐 Backend API will be available at: http://localhost:5000"
echo "📋 Health check: http://localhost:5000/api/health"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Check if MongoDB is available
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is available"
else
    echo "⚠️  MongoDB not found - using mock data for development"
    echo "💡 To use real MongoDB, install MongoDB or set MONGODB_URI in .env"
fi

echo ""

# Start the backend server
npm start