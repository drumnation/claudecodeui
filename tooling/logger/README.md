# @kit/logger 🎨

A universal, lightweight logging library for the monorepo with automatic environment detection, structured logging, React integration, and **beautiful color themes**.

## ✨ Features

- 🌍 **Universal**: Works in both Node.js and browser environments
- 🎨 **Color Themes**: Multiple beautiful color schemes to match your style
- 🎯 **Scoped Logging**: Create child loggers with specific scopes
- 📊 **Structured Data**: Log with metadata and context
- ⚛️ **React Integration**: Hooks and context for React apps
- 🎨 **Pretty Formatting**: Colored output in development
- 🚀 **Performance**: Optimized with Pino under the hood
- 📝 **TypeScript**: Full type safety

## 🎨 Pick Your Palette

Choose from our curated color themes to match your terminal aesthetic:

### 🦇 **Dracula** - Dark & Vibrant

Perfect for late-night coding sessions with high contrast colors.

```typescript
const logger = createLogger({theme: 'Dracula'});
```

<details>
<summary>Color Map</summary>

- Time: `#6272a4` (muted blue-gray)
- Scope: `#f1fa8c` (bright yellow)
- Trace: `#6272a4` (comment gray)
- Debug: `#8be9fd` (cyan)
- Info: `#50fa7b` (green)
- Warn: `#ffb86c` (orange)
- Error: `#ff5555` (red)
- Fatal: `#ff79c6` (pink)
</details>

### ☀️ **Solarized** - Balanced & Scientific

Reduces eye strain with carefully chosen colors based on fixed color wheel relationships.

```typescript
const logger = createLogger({theme: 'Solarized'});
```

<details>
<summary>Color Map</summary>

- Time: `#93a1a1` (base1)
- Scope: `#b58900` (yellow)
- Trace: `#586e75` (base01)
- Debug: `#268bd2` (blue)
- Info: `#859900` (green)
- Warn: `#cb4b16` (orange)
- Error: `#dc322f` (red)
- Fatal: `#d33682` (magenta)
</details>

### 🏔️ **Nord** - Arctic & Clean

Inspired by the Arctic, north-bluish color palette.

```typescript
const logger = createLogger({theme: 'Nord'});
```

<details>
<summary>Color Map</summary>

- Time: `#4C566A` (nord3)
- Scope: `#EBCB8B` (nord13)
- Trace: `#4C566A` (nord3)
- Debug: `#81A1C1` (nord9)
- Info: `#A3BE8C` (nord14)
- Warn: `#D08770` (nord12)
- Error: `#BF616A` (nord11)
- Fatal: `#B48EAD` (nord15)
</details>

### 🍂 **Gruvbox** - Retro & Warm

Designed as a bright theme with pastel 'retro groove' colors.

```typescript
const logger = createLogger({theme: 'Gruvbox'});
```

<details>
<summary>Color Map</summary>

- Time: `#928374` (gray)
- Scope: `#fabd2f` (yellow)
- Trace: `#928374` (gray)
- Debug: `#83a598` (blue)
- Info: `#b8bb26` (green)
- Warn: `#fe8019` (orange)
- Error: `#fb4934` (red)
- Fatal: `#d3869b` (purple)
</details>

### 🦉 **Night Owl** - Optimized for Night Coding

Fine-tuned for developers who live in their text editor at night.

```typescript
const logger = createLogger({theme: 'NightOwl'});
```

<details>
<summary>Color Map</summary>

- Time: `#5f7e97` (steel blue)
- Scope: `#ecc48d` (peach)
- Trace: `#5f7e97` (gray)
- Debug: `#82aaff` (blue)
- Info: `#addb67` (green)
- Warn: `#ffcb8b` (orange)
- Error: `#ff5874` (red)
- Fatal: `#c792ea` (purple)
</details>

### ⚫ **Monochrome** - Minimalist & Clean

No colors, just style variations. Perfect for CI/CD logs or minimalist setups.

```typescript
const logger = createLogger({theme: 'Monochrome'});
```

<details>
<summary>Style Map</summary>

- Time: dim
- Scope: bold
- Trace: dim
- Debug: normal
- Info: normal
- Warn: bold
- Error: bold
- Fatal: inverse (white on black)
</details>

### 🎯 **Classic** - The Original

Our original color scheme, refined over time.

```typescript
const logger = createLogger({theme: 'Classic'});
// Or just omit the theme option - Classic is the default!
```

## 📦 Installation

```bash
pnpm add @kit/logger
```

## 🚀 Quick Start

### Basic Usage

```typescript
import {createLogger} from '@kit/logger';

// Create a logger with your favorite theme
const logger = createLogger({
  theme: 'Dracula',
  scope: 'my-app',
});

logger.info('Application started', {version: '1.0.0'});
logger.warn('Cache miss', {key: 'user:123'});
logger.error('Database connection failed', {
  host: 'localhost',
  port: 5432,
});
```

### Environment Variables

Set themes globally via environment variables:

```bash
# Node.js
LOG_THEME=Dracula

# Browser (Vite)
VITE_LOG_THEME=Nord
```

### Custom Themes

Create your own theme with any colors you like:

```typescript
const myTheme = {
  time: '#ff00ff',
  scope: '#00ff00',
  10: '#gray', // trace
  20: '#blue', // debug
  30: '#green', // info
  40: '#yellow', // warn
  50: '#red', // error
  60: '#magenta', // fatal
};

const logger = createLogger({theme: myTheme});
```

### React Integration

```tsx
import {LoggerProvider, useLogger} from '@kit/logger';

// Set theme at the app level
function App() {
  return (
    <LoggerProvider theme="Nord" level="debug">
      <YourApp />
    </LoggerProvider>
  );
}

// Use in components
function Component() {
  const logger = useLogger('Component');

  useEffect(() => {
    logger.info('Component mounted');
  }, []);
}
```

## 📚 Configuration

### Logger Options

```typescript
interface LoggerOptions {
  level?: LogLevel; // 'silent' | 'error' | 'warn' | 'info' | 'debug' | 'trace'
  scope?: string; // Logger namespace
  prettyPrint?: boolean; // Enable colored output (auto in dev)
  metadata?: Record<string, any>; // Default metadata for all logs
  theme?: string | ThemeDefinition; // Color theme
}
```

### Environment Variables

```bash
# Log levels
LOG_LEVEL=debug          # Node.js
VITE_LOG_LEVEL=debug    # Browser

# Themes
LOG_THEME=Dracula       # Node.js
VITE_LOG_THEME=Dracula  # Browser
```

## 🎯 API Reference

### Core Methods

```typescript
// Log at different levels
logger.error('Error message', { code: 'ERR_001' });
logger.warn('Warning message');
logger.info('Info message');
logger.debug('Debug message', { details: { ... } });
logger.trace('Trace message');

// Create child logger with inherited theme
const dbLogger = logger.child({ module: 'database' });

// Check if level is enabled (for performance)
if (logger.isLevelEnabled('debug')) {
  const expensiveData = calculateMetrics();
  logger.debug('Metrics', expensiveData);
}
```

### Theme Functions

```typescript
import {themes, getThemeByName, isValidTheme} from '@kit/logger';

// Get a theme by name
const draculaTheme = getThemeByName('Dracula');

// Check if a theme name is valid
if (isValidTheme('Dracula')) {
  // Use the theme
}

// Access all themes
console.log(themes.Nord);
console.log(themes.Solarized);
```

## 💡 Examples

### Backend Server with Theme

```typescript
import {createLogger} from '@kit/logger/node';

const logger = createLogger({
  theme: 'Gruvbox',
  scope: 'api-server',
});

app.listen(3000, () => {
  logger.info('Server started', {port: 3000});
});

app.use((req, res, next) => {
  logger.debug('Request received', {
    method: req.method,
    path: req.path,
  });
  next();
});
```

### Frontend with Dark Mode Support

```typescript
import {createLogger} from '@kit/logger/browser';

// Match logger theme to app theme
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
const logger = createLogger({
  theme: isDarkMode ? 'Dracula' : 'Solarized',
});
```

### CI/CD with Monochrome

```typescript
// Perfect for CI environments where ANSI colors might not render properly
const logger = createLogger({
  theme: 'Monochrome',
  level: process.env.CI ? 'info' : 'debug',
});
```

## 🏃 Migration Guide

### From console.log

```typescript
// Before
console.log('User logged in:', userId);
console.error('Failed to save:', error);

// After (with theme!)
const logger = createLogger({theme: 'NightOwl'});
logger.info('User logged in', {userId});
logger.error('Failed to save', {error});
```

### Adding Themes to Existing Loggers

```typescript
// Before
const logger = createLogger({scope: 'app'});

// After - just add the theme option
const logger = createLogger({
  scope: 'app',
  theme: 'Nord', // ← Add this!
});
```

## 🎨 Theme Gallery

Want to see all themes in action? Run this in your app:

```typescript
import {themes, createLogger} from '@kit/logger';

// Demo all themes
Object.keys(themes).forEach((themeName) => {
  const logger = createLogger({theme: themeName});
  logger.info(`Testing ${themeName} theme`);
  logger.debug('Debug message');
  logger.warn('Warning message');
  logger.error('Error message');
});
```

## 🐛 Troubleshooting

### Theme Not Applied?

1. Check environment variable:

   ```typescript
   console.log('Theme:', process.env.LOG_THEME);
   ```

2. Verify theme name is valid:

   ```typescript
   import {isValidTheme} from '@kit/logger';
   console.log(isValidTheme('YourTheme'));
   ```

3. Ensure pretty printing is enabled:
   ```typescript
   const logger = createLogger({
     theme: 'Dracula',
     prettyPrint: true, // Force enable
   });
   ```

### Colors Not Showing?

- Some terminals don't support colors. Try a different terminal.
- In CI/CD, use the `Monochrome` theme for better compatibility.
- Check if `NO_COLOR` environment variable is set.

## 🔧 Advanced Usage

### Dynamic Theme Switching

```typescript
// Change theme based on time of day
const hour = new Date().getHours();
const theme = hour >= 18 || hour < 6 ? 'Dracula' : 'Solarized';
const logger = createLogger({theme});
```

### Theme-Aware Components

```tsx
function ThemedLogger({children, theme}) {
  const logger = createLogger({theme});

  return (
    <LoggerContext.Provider value={logger}>{children}</LoggerContext.Provider>
  );
}
```

## 🤝 Contributing

Have a theme idea? We'd love to see it! Check our contribution guidelines for adding new themes.

---

Made with 🎨 by the @kit team
