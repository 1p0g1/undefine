#!/bin/bash

# Exit on error
set -e

# Print commands for debugging
set -x

# Create timestamped build log
BUILD_LOG="build-$(date +%Y%m%d-%H%M%S).log"
exec 1> >(tee -a "$BUILD_LOG")
exec 2> >(tee -a "$BUILD_LOG" >&2)

echo "=== Build Started at $(date) ==="
echo "Build log: $BUILD_LOG"

# Clean up any existing installations
echo "Cleaning up previous installations..."
rm -rf node_modules
rm -rf packages/shared-types/node_modules
rm -rf client/node_modules
rm -rf .render
rm -f package-lock.json

# Install root dependencies
echo "Installing root dependencies..."
npm install --legacy-peer-deps

# Build shared types
echo "Building shared types..."
cd packages/shared-types
npm install --legacy-peer-deps
npm run clean
npm run build
cd ../..

# Build client
echo "Building client..."
cd client
npm install --legacy-peer-deps
npm run build
cd ..

echo "✅ Build completed successfully at $(date)"
echo "Build log saved to: $BUILD_LOG" 