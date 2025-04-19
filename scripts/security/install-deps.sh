#!/bin/bash

# Make sure we're in the project root
cd "$(dirname "$0")/../.."

# Install TypeScript if not already installed
if ! command -v tsc &> /dev/null; then
  echo "Installing TypeScript..."
  npm install typescript --save-dev
fi

# Compile the TypeScript script
npx tsc scripts/security/generate-jwt-secret.ts --esModuleInterop

echo "Dependencies installed and script compiled successfully"
echo "Run with: node scripts/security/generate-jwt-secret.js"
echo "Add --dev flag to also update .env.development file" 