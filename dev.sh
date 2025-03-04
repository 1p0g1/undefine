#!/bin/bash

echo "=== Starting Development Environment ==="

# Function to check if a port is in use
check_port() {
    lsof -i ":$1" >/dev/null 2>&1
    return $?
}

# Kill any existing processes on our ports
echo "Cleaning up ports..."
if check_port 3000; then
    echo "Killing process on port 3000..."
    lsof -ti :3000 | xargs kill -9
fi
if check_port 5173; then
    echo "Killing process on port 5173..."
    lsof -ti :5173 | xargs kill -9
fi

# Wait for ports to clear
sleep 2

# Install dependencies if needed
echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
if [ ! -d "client/node_modules" ]; then
    echo "Installing frontend dependencies..."
    cd client && npm install && cd ..
fi

# Start backend
echo "Starting backend server..."
npm run build
node dist/index.js &
BACKEND_PID=$!

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Check if backend is running
if ! check_port 3000; then
    echo "Error: Backend failed to start on port 3000"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "Starting frontend..."
cd client
npm run dev

# Cleanup on exit
trap 'kill $BACKEND_PID 2>/dev/null' EXIT 