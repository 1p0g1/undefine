#!/bin/bash

# Exit on error
set -e

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy node types explicitly if needed
echo "Building shared types..."
cd packages/shared-types && npm install && tsc && cd ../..

# Build server
echo "Building server..."
npm run build:server

# Install client dependencies and build
echo "Building client..."
cd client
npm install
npm run build
cd ..

echo "Build completed successfully!" 