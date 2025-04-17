#!/bin/bash
set -e

echo "🔨 Building backend..."
npm run build

echo "🔨 Building frontend..."
cd client && npm run build
cd ..

echo "🚀 Testing production build..."
NODE_ENV=production PORT=3001 node dist/index.js

# The command above will start the server
# Test it by visiting http://localhost:3001 in your browser 