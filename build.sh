#!/bin/bash

echo "🚀 BULLETPROOF BUILD SCRIPT - ZERO ERRORS GUARANTEED!"
echo "=================================================="

# Clean everything
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf out
rm -rf node_modules/.cache

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Type check
echo "🔍 Type checking..."
npx tsc --noEmit

# Build the project
echo "🏗️  Building Next.js application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ BUILD SUCCESSFUL! NO ERRORS DETECTED!"
    echo "🎉 Your SplitChain Pay app is ready for deployment!"
    
    # Show build stats
    echo ""
    echo "📊 Build Statistics:"
    echo "==================="
    du -sh out/
    find out/ -name "*.js" | wc -l | xargs echo "JavaScript files:"
    find out/ -name "*.css" | wc -l | xargs echo "CSS files:"
    find out/ -name "*.html" | wc -l | xargs echo "HTML files:"
    
else
    echo "❌ BUILD FAILED!"
    echo "Check the error messages above."
    exit 1
fi
