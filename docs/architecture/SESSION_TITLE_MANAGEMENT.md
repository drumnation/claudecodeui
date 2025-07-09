# Session Title Management

## Overview
The Claude Code UI now automatically generates and maintains intelligent session titles using GPT-3.5, ensuring every session has a meaningful title that evolves with the conversation.

## Key Features

### 1. Immediate Title Generation
- **First Message Trigger**: As soon as the first user message is sent, a title is generated
- **No More "No summary available"**: Every session gets a proper title immediately
- **Smart Timing**: Title generation happens 1 second after the first message to ensure it's saved

### 2. Evolving Titles with Topic Detection
- **Periodic Updates**: Titles are checked every 5 messages (configurable)
- **Topic Change Detection**: GPT-3.5 analyzes if the conversation has shifted to a new topic
- **Smart Updates**: Only updates the title if the topic has actually changed
- **Preserves Context**: Uses the last 10 messages to detect topic changes

### 3. Duplicate Management
- **Automatic Numbering**: When similar sessions exist, new ones are numbered (e.g., "Fix auth bug (2)")
- **Clean Base Titles**: Duplicate counters are stripped when checking for topic changes

### 4. Manual Controls
- **Editable Titles**: Users can manually edit any session title
- **Protected Edits**: Manually edited titles won't be auto-updated
- **Force Regenerate**: API endpoint to force title regeneration

## Configuration

Add these to your `.env` file:

```bash
# Enable AI-based title generation (requires OpenAI API key)
USE_AI_TITLES=true
OPENAI_API_KEY=your_openai_api_key_here

# Update titles every N messages (default: 5)
SESSION_SUMMARY_UPDATE_INTERVAL=5

# Delay before updating (milliseconds, default: 2000)
SESSION_SUMMARY_UPDATE_DELAY=2000

# Enable topic change detection (default: true)
DETECT_TOPIC_CHANGES=true
```

## Title Generation Methods

### 1. AI-Based (Recommended)
- Uses GPT-3.5-turbo for intelligent title generation
- Understands context and extracts the main topic
- Handles topic change detection
- Generates concise, descriptive titles (max 5 words)

### 2. Pattern-Based Fallback
- Used when OpenAI API key is not available
- Extracts patterns like "help with X", "fix Y", "how to Z"
- Basic but effective for common queries

## API Endpoints

### Update Session Title
```bash
POST /api/projects/:projectName/sessions/:sessionId/update-title
Body: { forceRegenerate: true/false }
```

## Bulk Title Updates

For existing sessions without titles, run:
```bash
cd apps/backend
npx tsx src/modules/sessions/update-missing-titles.ts
```

This will:
- Scan all projects and sessions
- Generate titles for sessions missing them
- Respect existing titles (won't overwrite)
- Use AI or pattern-based generation based on config

## How It Works

### Initial Title Generation
1. User sends first message in a new session
2. System waits 1 second for message to be saved
3. Generates title based on the first message
4. Updates session file with the new title

### Periodic Updates
1. Every 5 messages (configurable), system checks for updates
2. Analyzes recent messages for topic changes
3. If topic has changed, generates a new title
4. Updates session file and notifies frontend

### Topic Change Detection
The AI analyzes:
- Recent conversation context (last 10 messages)
- Current session title
- Whether the focus has shifted significantly

Example prompt to GPT-3.5:
```
Current title: "Fix authentication bug"
Recent messages: [discussing database schema]
→ New title: "Database schema design"
```

## Frontend Integration

Sessions display:
- **Blue "UI" badge**: For sessions created through the web interface
- **Automatic updates**: Titles update in real-time when changed
- **Edit capability**: Click edit button to manually change titles

## Best Practices

1. **Set OpenAI API Key**: For best results, use AI-based generation
2. **Reasonable Update Interval**: 5-10 messages is usually optimal
3. **Let It Evolve**: Don't manually edit unless necessary - let titles evolve naturally
4. **Monitor Costs**: GPT-3.5 is very affordable, but monitor usage for large teams

## Troubleshooting

### Titles Not Generating
- Check if `OPENAI_API_KEY` is set correctly
- Verify `USE_AI_TITLES` is not set to `false`
- Check backend logs for errors

### Titles Not Updating
- Verify `SESSION_SUMMARY_UPDATE_INTERVAL` is not 0
- Check if session was manually edited (protected from updates)
- Ensure `DETECT_TOPIC_CHANGES` is enabled

### Performance Considerations
- Title generation is asynchronous and won't block chat
- Uses GPT-3.5-turbo for fast, affordable generation
- Implements delays to batch updates efficiently