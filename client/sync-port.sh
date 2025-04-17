#!/bin/bash
PORT=$(cat ../.api_port)
echo "VITE_API_URL=http://localhost:$PORT" > ./.env
echo "Updated client/.env with API port: $PORT" 