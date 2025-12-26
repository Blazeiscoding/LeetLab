#!/bin/bash
set -e

echo "=== Build Verification Script ==="
echo "Current directory: $(pwd)"
echo "Listing files:"
ls -la

echo ""
echo "Running npm install..."
npm install

echo ""
echo "Running Prisma generate..."
npx prisma generate

echo ""
echo "Running TypeScript build..."
npm run build

echo ""
echo "Verifying dist folder exists..."
if [ -d "dist" ]; then
    echo "✅ dist folder exists"
    echo "Files in dist:"
    ls -la dist/ | head -20
    if [ -f "dist/index.js" ]; then
        echo "✅ dist/index.js exists"
    else
        echo "❌ dist/index.js NOT FOUND"
        exit 1
    fi
else
    echo "❌ dist folder NOT FOUND"
    exit 1
fi

echo ""
echo "✅ Build completed successfully!"

