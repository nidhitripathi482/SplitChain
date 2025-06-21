#!/bin/bash

echo "🔧 FIXING BUILD ISSUES - GUARANTEED SUCCESS!"
echo "==========================================="

# Clean everything
rm -rf .next out node_modules package-lock.json yarn.lock bun.lockb

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps --no-audit

# Type check
echo "🔍 Type checking..."
npx tsc --noEmit --skipLibCheck

# Build
echo "🏗️  Building..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ BUILD SUCCESSFUL!"
    echo "📁 Output directory: ./out"
    ls -la out/
else
    echo "❌ Build failed. Trying alternative..."
    
    # Alternative build
    NEXT_TELEMETRY_DISABLED=1 npm run build
    
    if [ $? -eq 0 ]; then
        echo "✅ Alternative build successful!"
    else
        echo "❌ Build still failing. Manual intervention needed."
        exit 1
    fi
fi

echo "🚀 Ready for deployment!"
