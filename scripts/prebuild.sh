#!/bin/bash

# Prebuild script to verify types before building
echo "🔍 Running prebuild type verification..."

# Check if dist/types/index.d.ts exists in shared-types package
if [ ! -f "packages/shared-types/dist/types/index.d.ts" ]; then
  echo "❌ Error: packages/shared-types/dist/types/index.d.ts does not exist"
  echo "Please run 'npm run build:types' first"
  exit 1
fi

# Check if the file is empty
if [ ! -s "packages/shared-types/dist/types/index.d.ts" ]; then
  echo "❌ Error: packages/shared-types/dist/types/index.d.ts is empty"
  echo "Please run 'npm run build:types' first"
  exit 1
fi

echo "✅ Prebuild type verification succeeded"
exit 0 