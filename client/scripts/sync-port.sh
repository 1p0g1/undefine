#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PORT_FILE="$SCRIPT_DIR/../../.api_port"
ENV_FILE="$SCRIPT_DIR/../.env"

# Check if .api_port exists
if [ ! -f "$PORT_FILE" ]; then
    echo "⚠️ No .api_port file found. Has the server started?"
    exit 1
fi

# Read the port
PORT=$(cat "$PORT_FILE")

# Ensure .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo "VITE_API_URL=http://localhost:3001" > "$ENV_FILE"
fi

# Update .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|VITE_API_URL=.*|VITE_API_URL=http://localhost:$PORT|" "$ENV_FILE"
else
    # Linux and others
    sed -i "s|VITE_API_URL=.*|VITE_API_URL=http://localhost:$PORT|" "$ENV_FILE"
fi

echo "✅ Updated VITE_API_URL to http://localhost:$PORT" 