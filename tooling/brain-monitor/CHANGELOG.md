# Changelog

All notable changes to @kit/brain-monitor will be documented in this file.

## [Unreleased]

### Added

- 🌐 **Browser Console Capture**: New feature to automatically capture and log browser console output
  - Auto-injection into React/Vue/Angular apps during `brain-monitor init`
  - Browser console logs saved to `_logs/browser-console.log`
  - Express middleware for receiving browser logs
  - Automatic log rotation at 10MB
  - Zero-config after initialization
  - New exports: `@kit/brain-monitor/browser` and `@kit/brain-monitor/server`

### How to Use Browser Console Capture

1. Run `brain-monitor init` in your project - it will automatically inject console capture into your App.tsx/jsx files
2. Add the Express middleware to your backend:
   ```typescript
   import { createBrainMonitorRouter } from "@kit/brain-monitor/server";
   app.use("/_brain-monitor", createBrainMonitorRouter());
   ```
3. Browser console logs will automatically appear in `_logs/browser-console.log`
4. Monitor them with: `tail -f _logs/browser-console.log`

### Technical Details

- Console capture intercepts all console methods (log, warn, error, info, debug)
- Logs are buffered client-side and sent in batches every 5 seconds
- Includes metadata: timestamps, URLs, user agent, stack traces for errors
- The log monitor now includes browser-console as a monitored "server"

## Previous Versions

(Add previous version changes here as they are released)
