#!/bin/bash

echo "🔍 Checking Claude sessions for missing titles..."
echo ""

# Find all .claude projects
CLAUDE_DIR="$HOME/.claude/projects"

if [ ! -d "$CLAUDE_DIR" ]; then
    echo "❌ No Claude projects directory found at $CLAUDE_DIR"
    exit 1
fi

# Function to check if session has a title
check_session_title() {
    local file="$1"
    local session_id=$(basename "$file" .jsonl)
    
    if [ ! -s "$file" ]; then
        return
    fi
    
    # Read first line
    first_line=$(head -n 1 "$file" 2>/dev/null)
    
    # Check if it's a summary line with a good title
    if echo "$first_line" | grep -q '"type":"summary"' && \
       echo "$first_line" | grep -q '"summary":' && \
       ! echo "$first_line" | grep -q '"summary":"No summary available"' && \
       ! echo "$first_line" | grep -q '"summary":"New Session"'; then
        # Extract the summary
        summary=$(echo "$first_line" | sed -E 's/.*"summary":"([^"]+)".*/\1/')
        echo "  ✅ $session_id - \"$summary\""
    else
        echo "  ❌ $session_id - No title"
        NO_TITLE_COUNT=$((NO_TITLE_COUNT + 1))
    fi
}

# Check each project
for project_dir in "$CLAUDE_DIR"/*; do
    if [ -d "$project_dir" ]; then
        project_name=$(basename "$project_dir")
        echo "📁 Project: $project_name"
        
        NO_TITLE_COUNT=0
        
        # Check each session file
        for session_file in "$project_dir"/*.jsonl; do
            if [ -f "$session_file" ]; then
                check_session_title "$session_file"
            fi
        done
        
        if [ $NO_TITLE_COUNT -gt 0 ]; then
            echo ""
            echo "  📊 $NO_TITLE_COUNT sessions need titles in $project_name"
        fi
        echo ""
    fi
done

echo "✨ Scan complete!"
echo ""
echo "To update missing titles, run:"
echo "  ./update-all-titles.sh"