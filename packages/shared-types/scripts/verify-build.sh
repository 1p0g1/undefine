#!/bin/bash

if [ ! -f "dist/index.d.ts" ]; then
  echo "❌ Types build failed!"
  exit 1
fi

echo "✅ Types build successful!"
exit 0 