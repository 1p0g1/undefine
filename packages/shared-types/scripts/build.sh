#!/bin/bash

# Clean the dist directory
rm -rf dist

# Run TypeScript compiler with the build configuration
tsc -p tsconfig.build.json

# Check if the declaration file was generated
if [ ! -f "dist/index.d.ts" ]; then
  echo "❌ Types build failed!"
  exit 1
fi

echo "✅ Types build successful!"
exit 0 