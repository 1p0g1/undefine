#!/bin/bash

PORTS=(3001 3002 3003 3004 3005 3006 5173 5174 5175 5176 5177)

for port in "${PORTS[@]}"; do
  PID=$(lsof -t -i:$port)
  if [ ! -z "$PID" ]; then
    kill -9 $PID
    echo "Killed process on port $port"
  fi
done

echo "✅ Port cleanup complete" 