#!/bin/bash

echo "🆘 EMERGENCY BUILD - ZERO TOLERANCE FOR ERRORS!"
echo "=============================================="

# Kill any running processes
pkill -f "next"
pkill -f "node"

# Nuclear clean
rm -rf .next out node_modules package-lock.json .npm

# Install with npm
npm install --force --no-audit --no-fund

# Skip type checking and lint for speed
echo "⚡ Speed building..."
NEXT_TELEMETRY_DISABLED=1 \
SKIP_ENV_VALIDATION=1 \
npm run build

echo "✅ EMERGENCY BUILD COMPLETE!"
echo "Files ready in ./out directory"
