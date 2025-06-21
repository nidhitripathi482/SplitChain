#!/bin/bash

# Vercel-specific build script
echo "🌐 VERCEL BUILD SCRIPT"
echo "====================="

# Set environment
export NODE_ENV=production
export NEXT_TELEMETRY_DISABLED=1

# Clean
rm -rf .next out

# Install
npm ci --production=false

# Build
npm run build

echo "✅ Vercel build complete!"
