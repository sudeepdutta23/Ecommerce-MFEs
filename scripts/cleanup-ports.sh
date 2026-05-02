#!/bin/bash

# Kill processes on ports 3000-3006
echo "🔌 Cleaning up ports 3000-3006..."

for port in 3000 3001 3002 3003 3004 3005 3006; do
  if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "  Killing process on port $port..."
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
  fi
done

echo "✅ Ports cleaned up. Waiting 2 seconds..."
sleep 2
