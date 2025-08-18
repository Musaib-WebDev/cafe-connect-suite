@echo off
echo 🚀 Starting Cafe Connect Suite Backend...

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first:
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

REM Check if .env file exists
if not exist ".env" (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ .env file created - you can customize it if needed
)

echo 🔧 Starting backend server...
echo 🌐 Backend API will be available at: http://localhost:5000
echo 📋 Health check: http://localhost:5000/api/health
echo 🛑 Press Ctrl+C to stop the server
echo.

REM Check if MongoDB is available
where mongod >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ MongoDB is available
) else (
    echo ⚠️  MongoDB not found - using mock data for development
    echo 💡 To use real MongoDB, install MongoDB or set MONGODB_URI in .env
)

echo.

REM Start the backend server
npm start