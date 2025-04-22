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

# Debug path resolution
echo "Current directory: $(pwd)"
echo "Does @shared point to: $(realpath client/../packages/shared-types)"
echo "Shared types directory contents:"
ls -la client/../packages/shared-types/src

# Validate environment variables
echo "Validating environment..."
node -e "
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missing = requiredVars.filter(v => !process.env[v]);
  if (missing.length) {
    console.error('Missing required environment variables:', missing);
    process.exit(1);
  }
"

# Verify package-lock.json
echo "Verifying package-lock.json..."
if [ ! -f "package-lock.json" ]; then
  echo "❌ package-lock.json missing"
  exit 1
fi

# Clean any existing build artifacts
echo "Cleaning build artifacts..."
rm -rf packages/shared-types/dist
rm -rf dist-server
rm -rf client/dist

# Install root dependencies
echo "Installing root dependencies..."
npm install --legacy-peer-deps

# Build shared types with verification
echo "Building shared types..."
cd packages/shared-types
npm install --legacy-peer-deps
npm run clean
tsc
# Verify the build output
if [ ! -f "dist/index.d.ts" ]; then
  echo "❌ Failed to generate dist/index.d.ts"
  exit 1
fi
cd ../..

# Build server
echo "Building server..."
npm run build:server

# Install client dependencies and build
echo "Building client..."
cd client
npm install --legacy-peer-deps
npm run build

# Verify path alias configuration
echo "✅ Verifying path alias configuration..."
echo "✅ Vite client alias: @shared -> ../packages/shared-types/src"
echo "✅ TypeScript path alias: @shared/* -> ../packages/shared-types/src/*"

# Final verification
echo "Verifying build outputs..."
if [ ! -f "packages/shared-types/dist/index.d.ts" ]; then
  echo "❌ Missing shared-types build output"
  exit 1
fi
if [ ! -f "dist-server/index.js" ]; then
  echo "❌ Missing server build output"
  exit 1
fi
if [ ! -f "client/dist/index.html" ]; then
  echo "❌ Missing client build output"
  exit 1
fi

echo "✅ Build completed successfully at $(date)"
echo "Build log saved to: $BUILD_LOG" 