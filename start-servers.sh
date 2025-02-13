#!/bin/bash

# Kill any processes using our ports
echo "Cleaning up ports..."
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:5002 | xargs kill -9 2>/dev/null

# Start backend server
echo "Starting backend server..."
cd backend
source .venv/bin/activate
echo "Running type checks..."
mypy src/ || exit 1  # Exit if type check fails
uvicorn src.main:app --reload --port 5002 &

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "Starting frontend server..."
cd ..
npm start 