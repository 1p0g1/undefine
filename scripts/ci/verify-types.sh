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

# Check for required @types packages
echo "Checking for required @types packages..."
cd ../..
node scripts/check-types.js

# Verify tsconfig settings
echo "Verifying tsconfig settings..."
for tsconfig in $(find . -name "tsconfig*.json" -not -path "*/node_modules/*"); do
  echo "Checking $tsconfig..."
  
  # Check for required settings
  if ! grep -q '"declaration": true' "$tsconfig"; then
    echo "❌ Missing 'declaration: true' in $tsconfig"
    exit 1
  fi
  
  if ! grep -q '"skipLibCheck": false' "$tsconfig"; then
    echo "❌ Missing 'skipLibCheck: false' in $tsconfig"
    exit 1
  fi
  
  if ! grep -q '"forceConsistentCasingInFileNames": true' "$tsconfig"; then
    echo "❌ Missing 'forceConsistentCasingInFileNames: true' in $tsconfig"
    exit 1
  fi
  
  if ! grep -q '"strict": true' "$tsconfig"; then
    echo "❌ Missing 'strict: true' in $tsconfig"
    exit 1
  fi
  
  if ! grep -q '"moduleResolution": "NodeNext"' "$tsconfig"; then
    echo "❌ Missing 'moduleResolution: NodeNext' in $tsconfig"
    exit 1
  fi
  
  if ! grep -q '"module": "NodeNext"' "$tsconfig"; then
    echo "❌ Missing 'module: NodeNext' in $tsconfig"
    exit 1
  fi
done

echo "✅ Type definitions verified successfully" 