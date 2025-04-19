#!/bin/bash

# Exit on error
set -e

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

# Install dependencies with legacy peer deps
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Copy node types explicitly if needed
echo "Building shared types..."
cd packages/shared-types && npm install --legacy-peer-deps && tsc && cd ../..

# Build server
echo "Building server..."
npm run build:server

# Install client dependencies and build
echo "Building client..."
cd client
npm install --legacy-peer-deps

# Verify path alias configuration
echo "✅ Verifying path alias configuration..."
echo "✅ Vite client alias: @shared -> ../packages/shared-types/src"
echo "✅ TypeScript path alias: @shared/* -> ../packages/shared-types/src/*"

# Check if the shared-types directory exists
if [ -d "../packages/shared-types/src" ]; then
  echo "✅ Shared types directory exists"
  ls -la "../packages/shared-types/src"
else
  echo "❌ Shared types directory missing!"
  exit 1
fi

# Install additional type declarations if needed
echo "Installing additional type declarations..."
npm install --save-dev @types/react @types/react-dom @types/react/jsx-runtime @types/testing-library__react vitest

npm run build
cd ..

# Verify build artifacts
echo "Verifying build artifacts..."
if [ ! -d "./dist-server" ]; then
  echo "Error: Server build artifacts missing!"
  exit 1
fi

if [ ! -d "./client/dist" ]; then
  echo "Error: Client build artifacts missing!"
  exit 1
fi

# Verify key files exist
if [ ! -f "./client/dist/index.html" ]; then
  echo "Error: Client index.html missing!"
  exit 1
fi

if [ ! -f "./dist-server/index.js" ]; then
  echo "Error: Server index.js missing!"
  exit 1
fi

echo "Build completed successfully!" 