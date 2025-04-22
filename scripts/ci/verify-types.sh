#!/bin/bash

# Exit on error
set -e

echo "=== Verifying Type Definitions ==="

# Check shared-types build output
if [ ! -f "packages/shared-types/dist/index.d.ts" ]; then
  echo "❌ Missing shared-types/dist/index.d.ts"
  echo "Current directory: $(pwd)"
  echo "Directory contents:"
  ls -la packages/shared-types/dist || true
  exit 1
fi

# Verify type definitions are valid
echo "Verifying type definitions..."
cd packages/shared-types
npx tsc --noEmit

# Check for any direct src/index.ts imports
echo "Checking for direct src/index.ts imports..."
if grep -r "from ['\"].*shared-types/src" --include="*.ts" --include="*.tsx" ../..; then
  echo "❌ Found direct imports from shared-types/src"
  exit 1
fi

echo "✅ Type definitions verified successfully" 