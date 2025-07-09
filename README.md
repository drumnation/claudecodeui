<div align="center">
  <img src="public/logo.svg" alt="Claude Code UI" width="64" height="64">
  <h1>Claude Code UI</h1>
</div>


A desktop and mobile UI for [Claude Code](https://docs.anthropic.com/en/docs/claude-code), Anthropic's official CLI for AI-assisted coding. You can use it locally or remotely to view your active projects and sessions in claude code and make changes to them the same way you would do it in claude code CLI. This gives you a proper interface that works everywhere. 

## Screenshots

<div align="center">
  
<table>
<tr>
<td align="center">
<h3>Desktop View</h3>
<img src="public/screenshots/desktop-main.png" alt="Desktop Interface" width="400">
<br>
<em>Main interface showing project overview and chat</em>
</td>
<td align="center">
<h3>Mobile Experience</h3>
<img src="public/screenshots/mobile-chat.png" alt="Mobile Interface" width="250">
<br>
<em>Responsive mobile design with touch navigation</em>
</td>
</tr>
</table>



</div>

## Features

- **Responsive Design** - Works seamlessly across desktop, tablet, and mobile
- **Interactive Chat Interface** - Built-in chat interface for seamless communication with Claude Code
- **Multi-Agent Planner** - AI-powered feature planning with specialized agents (ARCH, DIFF, DEPS)
- **Integrated Shell Terminal** - Direct access to Claude Code CLI through built-in shell functionality
- **File Explorer** - Interactive file tree with syntax highlighting and live editing
- **Session Management** - Resume conversations, manage multiple sessions, and track history


## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and configured
- [Claude CLI](https://www.anthropic.com/claude-cli) (optional, required for Multi-Agent Planner feature)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/siteboon/claudecodeui.git
cd claudecodeui
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your preferred settings

# Optional: Set custom Claude CLI path for Multi-Agent Planner
# CLAUDE_BINARY=/path/to/claude
```

4. **Start the application:**
```bash
# Development mode (with hot reload)
npm run dev

```

5. **Open your browser:**
   - Development: `http://localhost:8766`

## Security & Tools Configuration

**🔒 Important Notice**: All Claude Code tools are **disabled by default**. This prevents potentially harmful operations from running automatically.

### Enabling Tools

To use Claude Code's full functionality, you'll need to manually enable tools:

1. **Open Tools Settings** - Click the gear icon in the sidebar
3. **Enable Selectively** - Turn on only the tools you need
4. **Apply Settings** - Your preferences are saved locally

<div align="center">

![Tools Settings Modal](public/screenshots/tools-modal.png)
*Tools Settings interface - enable only what you need*

</div>

**Recommended approach**: Start with basic tools enabled and add more as needed. You can always adjust these settings later.

## Usage Guide

### Core Features

#### Project Management
The UI automatically discovers Claude Code projects from `~/.claude/projects/` and provides:
- **Visual Project Browser** - All available projects with metadata and session counts
- **Project Actions** - Rename, delete, and organize projects
- **Smart Navigation** - Quick access to recent projects and sessions

#### Chat Interface
- **Use responsive chat or Claude Code CLI** - You can either use the adapted chat interface or use the shell button to connect to Claude Code CLI. 
- **Real-time Communication** - Stream responses from Claude with WebSocket connection
- **Session Management** - Resume previous conversations or start fresh sessions
- **Message History** - Complete conversation history with timestamps and metadata
- **Multi-format Support** - Text, code blocks, and file references

#### File Explorer & Editor
- **Interactive File Tree** - Browse project structure with expand/collapse navigation
- **Live File Editing** - Read, modify, and save files directly in the interface
- **Syntax Highlighting** - Support for multiple programming languages
- **File Operations** - Create, rename, delete files and directories

#### Session Management
- **Session Persistence** - All conversations automatically saved
- **Session Organization** - Group sessions by project and timestamp
- **Session Actions** - Rename, delete, and export conversation history
- **Cross-device Sync** - Access sessions from any device

#### Multi-Agent Planner
- **Intelligent Feature Planning** - AI-powered analysis of feature requirements
- **Specialized Agents** - ARCH, DIFF, and DEPS agents for comprehensive planning
- **Real-time Progress** - Live updates as agents analyze your project
- **Contextual Understanding** - CodeQAI integration for semantic code search
- **Actionable Plans** - Detailed implementation strategies with file-level recommendations

### Mobile Experience
- **Responsive Design** - Optimized for all screen sizes
- **Touch-friendly Interface** - Swipe gestures and touch navigation
- **Mobile Navigation** - Bottom tab bar for easy thumb navigation
- **Adaptive Layout** - Collapsible sidebar and smart content prioritization

### Multi-Agent Planner

The Multi-Agent Planner is an advanced AI-powered feature that helps you plan and architect new features for your projects using specialized AI agents.

#### How It Works

1. **Start Planning** - Click "Plan Feature" from any project's context menu
2. **Describe Your Feature** - Enter a natural language description of what you want to build
3. **Agent Selection** - Choose which specialized agents to involve in the planning process
4. **Real-time Analysis** - Watch as agents analyze your codebase and generate insights
5. **Actionable Plan** - Receive a comprehensive plan with specific implementation steps

#### The Agents

**ARCH Agent** - Architecture Analysis
- Analyzes system architecture and design patterns
- Identifies integration points and architectural considerations
- Suggests design patterns and structural improvements
- Evaluates scalability and maintainability implications

**DIFF Agent** - Impact Analysis  
- Identifies files and components that need modification
- Maps dependencies and change propagation
- Highlights potential breaking changes
- Provides change impact assessment

**DEPS Agent** - Dependency Analysis
- Analyzes external and internal dependency requirements
- Identifies missing dependencies and version conflicts
- Suggests optimal dependency management strategies
- Evaluates security and compatibility implications

#### CodeQAI Integration

When enabled, CodeQAI provides semantic code search capabilities:
- **Contextual Understanding** - Agents receive relevant code snippets
- **Semantic Search** - Find related functionality across your codebase
- **Smart Context** - Agents understand your existing patterns and conventions
- **Reduced Hallucination** - Grounded responses based on actual code

#### Configuration

Configure the planner in Settings → Tools Settings → Multi-Agent Planner:
- **Enable/Disable Planner** - Control availability of planning features
- **Agent Selection** - Choose default agents for planning sessions
- **CodeQAI Integration** - Toggle semantic search capabilities
- **Context Limits** - Adjust search result limits and snippet lengths

#### Best Practices

1. **Clear Descriptions** - Provide detailed feature descriptions for better analysis
2. **Enable CodeQAI** - Use semantic search for more accurate insights
3. **Review Agent Results** - Each agent provides unique perspectives - review all
4. **Iterative Planning** - Use planning results to refine and improve your approach

## Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │  Claude CLI     │
│   (React/Vite)  │◄──►│ (Express/WS)    │◄──►│  Integration    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Backend (Node.js + Express)
- **Express Server** - RESTful API with static file serving
- **WebSocket Server** - Communication for chats and project refresh
- **Claude CLI Integration** - Process spawning and management
- **Session Management** - JSONL parsing and conversation persistence
- **File System API** - Exposing file browser for projects

### Frontend (React + Vite)
- **React 18** - Modern component architecture with hooks
- **CodeMirror** - Advanced code editor with syntax highlighting
- **Bulletproof React Architecture** - Scalable component structure with separation of concerns
- **Emotion + Twin.macro** - CSS-in-JS with Tailwind utilities
- **Storybook** - Component documentation and testing

### Project Structure

The project follows a bulletproof React architecture with clear separation of concerns:

```
src/
├── app/                 # Application entry point
├── features/           # Feature-based modules
├── layouts/           # Layout components
├── components/        # Shared UI components
├── shared-components/ # Reusable atomic components
└── ...
```

Each component follows a consistent structure:
- `.jsx` - UI-only component with JSX
- `.hook.js` - Custom hook for state management
- `.logic.js` - Pure functions and business logic
- `.styles.js` - Emotion styled components with Tailwind
- `.stories.jsx` - Storybook documentation

See [Architecture Documentation](docs/architecture/bulletproof-react.md) for detailed guidelines.

### Import Management

All imports use absolute paths with the `@/` alias:

```javascript
import { Button } from '@/shared-components/Button';
import { useAuth } from '@/hooks/useAuth';
```

Available scripts for import management:
- `npm run fix:imports` - Convert relative imports to @/ aliases
- `npm run list:imports` - List any broken imports





### Contributing

We welcome contributions! Please follow these guidelines:

#### Getting Started
1. **Fork** the repository
2. **Clone** your fork: `git clone <your-fork-url>`
3. **Install** dependencies: `npm install`
4. **Create** a feature branch: `git checkout -b feature/amazing-feature`

#### Development Process
1. **Make your changes** following the existing code style
2. **Test thoroughly** - ensure all features work correctly
3. **Run quality checks**: `npm run lint && npm run format`
4. **Commit** with descriptive messages following [Conventional Commits](https://conventionalcommits.org/)
5. **Push** to your branch: `git push origin feature/amazing-feature`
6. **Submit** a Pull Request with:
   - Clear description of changes
   - Screenshots for UI changes
   - Test results if applicable

#### What to Contribute
- **Bug fixes** - Help us improve stability
- **New features** - Enhance functionality (discuss in issues first)
- **Documentation** - Improve guides and API docs
- **UI/UX improvements** - Better user experience
- **Performance optimizations** - Make it faster

## Troubleshooting

### Common Issues & Solutions

#### "No Claude projects found" or "spawn claude ENOENT"
**Problem**: The UI shows no projects or you see "Error · spawn claude ENOENT"
**Root Cause**: Claude CLI is not installed or not found in system PATH

**Solutions**:
1. **Install Claude CLI**:
   - **macOS/Linux**: Download from [https://claude.ai/download](https://claude.ai/download)
   - **Windows**: Download from [https://claude.ai/download](https://claude.ai/download)
   - **Verify installation**: Run `claude --version` in terminal

2. **Check PATH Configuration**:
   ```bash
   # Check if claude is in PATH
   which claude
   
   # Or check version
   claude --version
   ```

3. **Custom Installation Path**:
   If Claude CLI is installed in a non-standard location:
   - **Environment Variable**: Set `CLAUDE_CLI_PATH` in your `.env` file:
     ```env
     CLAUDE_CLI_PATH=/custom/path/to/claude
     ```
   - **UI Configuration**: Use the Settings menu → Tools Settings → Claude CLI Configuration
   - **Docker/Containers**: Mount Claude CLI and set `CLAUDE_CLI_PATH`

4. **Initialize Projects**:
   - After installation, run `claude` in project directories to initialize
   - Verify `~/.claude/projects/` directory exists and has proper permissions

#### Claude CLI Installation Issues
**Problem**: "Claude CLI not installed" error in the application

**Platform-Specific Installation**:

**macOS**:
```bash
# Using official installer
curl -L https://claude.ai/download/cli/macos | bash

# Verify installation
claude --version
```

**Linux**:
```bash
# Using official installer  
curl -L https://claude.ai/download/cli/linux | bash

# Add to PATH if needed
echo 'export PATH="$PATH:$HOME/.local/bin"' >> ~/.bashrc
source ~/.bashrc
```

**Windows**:
- Download the Windows installer from https://claude.ai/download
- Run the installer and follow setup wizard
- Restart terminal/command prompt
- Verify with `claude --version`

#### Custom Claude CLI Path Configuration
**When to use custom paths**:
- Claude CLI installed in non-standard location
- Docker containers or sandboxed environments  
- Multiple Claude CLI versions
- Corporate environments with restricted installations

**Configuration Methods**:

1. **Environment Variable** (Recommended):
   ```env
   # In .env file
   CLAUDE_CLI_PATH=/usr/local/bin/claude
   ```

2. **UI Settings**:
   - Open application → Settings (gear icon)
   - Navigate to "Tools Settings" 
   - Find "Claude CLI Configuration" section
   - Enter custom path and click "Test" then "Save Path"

3. **Docker Example**:
   ```dockerfile
   # Copy Claude CLI binary
   COPY claude /usr/local/bin/claude
   RUN chmod +x /usr/local/bin/claude
   
   # Set environment variable
   ENV CLAUDE_CLI_PATH=/usr/local/bin/claude
   ```

**Troubleshooting Custom Paths**:
- Ensure path is absolute (starts with `/` on Unix systems)
- Verify file exists: `ls -la /path/to/claude`
- Check permissions: `chmod +x /path/to/claude`
- Test manually: `/path/to/claude --version`

#### File Explorer Issues
**Problem**: Files not loading, permission errors, empty directories
**Solutions**:
- Check project directory permissions (`ls -la` in terminal)
- Verify the project path exists and is accessible
- Review server console logs for detailed error messages
- Ensure you're not trying to access system directories outside project scope

#### Multi-Agent Planner Issues
**Problem**: "Plan Feature" option not available or planner not working
**Root Cause**: Planner may be disabled in settings or dependencies missing

**Solutions**:
1. **Install Claude CLI** (Required for planner):
   ```bash
   # Install globally via npm
   npm install -g @anthropic-ai/claude-cli
   
   # Or set custom path via environment variable
   export CLAUDE_BINARY=/path/to/claude
   ```

2. **Enable Planner**:
   - Open Settings → Tools Settings → Multi-Agent Planner
   - Toggle "Enable Multi-Agent Planner" to ON
   - Select desired agents (ARCH, DIFF, DEPS)
   - Save settings

3. **CodeQAI Integration Issues**:
   ```bash
   # Install CodeQAI if not available
   pip install codeqai
   
   # Verify installation
   codeqai --version
   ```

4. **Agent Execution Problems**:
   - Ensure Claude CLI is properly installed and configured:
     ```bash
     # Check if Claude CLI is available
     which claude || echo "Claude CLI not found"
     
     # If using custom binary path
     $CLAUDE_BINARY --version
     ```
   - Check that prompt templates exist in `.brain/prompts/` directory
   - Verify project has sufficient permissions for file analysis
   - Review server logs for detailed error messages

5. **Common Error Messages**:
   - **"Claude CLI not found"**: Install with `npm install -g @anthropic-ai/claude-cli`
   - **"Prompt file missing"**: Ensure `.brain/prompts/` directory exists in project root
   - **"Not executable"**: Run `chmod +x /path/to/claude` to make binary executable
   - **"Project path invalid"**: Verify the project directory exists and is accessible

6. **Performance Issues**:
   - Reduce context limits in planner settings
   - Disable CodeQAI if running on resource-constrained systems
   - Select fewer agents for faster execution

**Problem**: Planner results are incomplete or inaccurate
**Solutions**:
- Provide more detailed feature descriptions
- Enable CodeQAI for better contextual understanding
- Ensure all required agents are selected
- Verify project structure follows standard conventions


## License

GNU General Public License v3.0 - see [LICENSE](LICENSE) file for details.

This project is open source and free to use, modify, and distribute under the GPL v3 license.

## Acknowledgments

### Built With
- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** - Anthropic's official CLI
- **[React](https://react.dev/)** - User interface library
- **[Vite](https://vitejs.dev/)** - Fast build tool and dev server
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[CodeMirror](https://codemirror.net/)** - Advanced code editor


## Support & Community

### Stay Updated
- **Star** this repository to show support
- **Watch** for updates and new releases
- **Follow** the project for announcements

---

<div align="center">
  <strong>Made with care for the Claude Code community</strong>
</div>