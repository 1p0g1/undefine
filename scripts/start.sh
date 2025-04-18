#!/bin/bash

echo "=== Starting Development Server ==="

# Ensure no other node processes are running
echo "Cleaning up existing processes..."
pkill -f "node" || true
sleep 1

# Build and start
echo "Building TypeScript..."
npm run build

echo "Starting server..."
node dist/index.js 