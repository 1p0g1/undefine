#!/bin/bash

# Verify type declarations
echo "🔍 Verifying type declarations..."

# Check if dist/types/index.d.ts exists
if [ ! -f "dist/types/index.d.ts" ]; then
  echo "❌ dist/types/index.d.ts is missing!"
  exit 1
fi

# Check if the file is empty
if [ ! -s "dist/types/index.d.ts" ]; then
  echo "❌ dist/types/index.d.ts is empty!"
  exit 1
fi

# Check if the file contains type declarations
if ! grep -q "export type" "dist/types/index.d.ts"; then
  echo "❌ dist/types/index.d.ts does not contain type declarations!"
  exit 1
fi

echo "✅ Type declarations verified successfully!"
exit 0 