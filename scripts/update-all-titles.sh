#!/bin/bash

# Script to update all Claude sessions without titles
# This will generate titles for any sessions that show "No summary available"

echo "🔄 Updating Claude session titles..."
echo "This will generate titles for all sessions without them."
echo ""

# Change to backend directory
cd apps/backend

# Load environment variables
export $(cat ../../.env | grep -v '^#' | xargs)

# Run the update script
echo "Running title update script..."
npx tsx src/modules/sessions/update-missing-titles.ts

echo ""
echo "✅ Done! Refresh the Claude Code UI to see the updated titles."