#!/bin/bash

# Simple start script for development
echo "Starting TypeScript backend..."

# Set environment variables
export PORT=${PORT:-8765}
export NODE_ENV=development
export LOG_LEVEL=${LOG_LEVEL:-debug}

# Add npm global bin to PATH
export PATH="$HOME/.npm-global/bin:$PATH"

# Check if tsx is available
if ! command -v tsx &> /dev/null; then
    echo "Installing tsx..."
    npm install -g tsx
fi

echo "Starting server on port $PORT..."

# Start the server with tsx directly
tsx watch src/main.ts