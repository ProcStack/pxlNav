#!/bin/bash
# Quick setup script for pxlNav Next testing

echo "   Setting up pxlNav Next Test Environment..."

# Change to the script's directory
cd "$(dirname "$0")" || exit 1

# Install dependencies
echo " -- Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "   Dependencies installed successfully!"
    echo ""
    echo "   Ready to test! Run one of these commands:"
    echo "   npm run dev    # Start Next dev server (http://localhost:3000)"
    echo "   npm run build  # Build for production"
    echo "   npm start      # Start production server after build"
    echo ""
else
    echo "   Installation failed. Please check the errors above."
    exit 1
fi
