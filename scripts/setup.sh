#!/bin/bash

# Business Analytics Dashboard Setup Script

echo "🚀 Setting up Business Analytics Dashboard..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 12+ first."
    exit 1
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo "❌ Redis is not installed. Please install Redis 6+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install
cd ..

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd frontend && npm install --legacy-peer-deps
cd ..

# Create backend environment file if not exists
if [ ! -f backend/.env ]; then
    echo "⚙️ Creating backend environment file..."
    cp backend/.env.example backend/.env
    echo "✏️  Please edit backend/.env with your database credentials"
fi

# Create frontend environment file if not exists
if [ ! -f frontend/.env ]; then
    echo "⚙️ Creating frontend environment file..."
    echo "REACT_APP_API_URL=http://localhost:5000" > frontend/.env
fi

# Create logs directory
mkdir -p backend/logs

echo "🗄️ Database setup:"
echo "1. Create database: createdb analytics_dashboard"
echo "2. Run schema: psql -d analytics_dashboard -f database/schema.sql"
echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "To start the development servers:"
echo "npm run dev"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:3000"  
echo "- Backend API: http://localhost:5000"
echo ""
echo "Demo credentials:"
echo "- Admin: admin@example.com / password"
echo "- User: user@example.com / password"