import { Request, Response } from 'express';
import { writeFileSync, appendFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createLogger } from '@kit/logger/node';

interface BrowserLogEntry {
  level: string;
  timestamp: string;
  message: string;
  source: string;
  url: string;
  userAgent: string;
  stack?: string;
}

interface BrowserLogRequest {
  logs: BrowserLogEntry[];
  sessionInfo: {
    timestamp: string;
    url: string;
    userAgent: string;
  };
}

// Rate limiting and spam protection
const clientRateLimits = new Map<string, { 
  requests: Array<number>, 
  blockedUntil?: number 
}>();
const RATE_LIMIT_WINDOW = 5000; // 5 seconds
const MAX_REQUESTS_PER_WINDOW = 1; // Only 1 request per 5 seconds
const RATE_LIMIT_BLOCK_DURATION = 30000; // 30 seconds block
const REQUEST_DEDUP_WINDOW = 1000; // 1 second dedup window

// Track request frequency for debugging
const requestTracker = {
  lastRequest: 0,
  requestCount: 0,
  sessions: new Map<string, { count: number, firstSeen: number, lastSeen: number }>()
};

const logger = createLogger({ scope: 'brain-monitor' });

// Compact log messages by removing color codes and reducing redundant formatting
const compactLogMessage = (message: string): string => {
  return message
    // Remove color codes like "color: #A0A0A0 color: #FFEB3B"
    .replace(/color:\s*#[A-Fa-f0-9]{6}\s*/g, '')
    .replace(/color:\s*#[A-Fa-f0-9]{3}\s*/g, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove redundant console formatting patterns
    .replace(/%c/g, '')
    // Clean up JSON formatting for better readability
    .replace(/\{\s*"/g, '{ "')
    .replace(/",\s*"/g, '", "')
    .replace(/"\s*\}/g, '" }')
    // Remove trailing spaces
    .trim();
};

export const handleBrowserLogs = (req: Request, res: Response): void => {
  try {
    const { logs, sessionInfo }: BrowserLogRequest = req.body;
    const now = Date.now();
    
    // Client identification for rate limiting
    const clientId = req.ip || req.connection.remoteAddress || 'unknown';
    const clientKey = `${clientId}_${sessionInfo.userAgent}`;
    
    // Check rate limiting
    let rateLimitData = clientRateLimits.get(clientKey);
    if (!rateLimitData) {
      rateLimitData = { requests: [] };
      clientRateLimits.set(clientKey, rateLimitData);
    }
    
    // Check if client is currently blocked
    if (rateLimitData.blockedUntil && now < rateLimitData.blockedUntil) {
      logger.warn('🚫 Blocked client attempted request', {
        clientKey: clientKey.substring(0, 50),
        blockedUntil: new Date(rateLimitData.blockedUntil).toISOString(),
        remainingBlockTime: rateLimitData.blockedUntil - now
      });
      res.status(429).json({ 
        error: 'Rate limit exceeded', 
        retryAfter: Math.ceil((rateLimitData.blockedUntil - now) / 1000) 
      });
      return;
    }
    
    // Clean old requests outside the window
    const windowStart = now - RATE_LIMIT_WINDOW;
    rateLimitData.requests = rateLimitData.requests.filter(timestamp => timestamp > windowStart);
    
    // Check if exceeding rate limit
    if (rateLimitData.requests.length >= MAX_REQUESTS_PER_WINDOW) {
      // Check for duplicate requests within dedup window
      const lastRequest = rateLimitData.requests[rateLimitData.requests.length - 1];
      if (now - lastRequest < REQUEST_DEDUP_WINDOW) {
        logger.debug('Duplicate request ignored', {
          clientKey: clientKey.substring(0, 50),
          timeSinceLastRequest: now - lastRequest,
          requestsInWindow: rateLimitData.requests.length
        });
        res.status(200).json({ success: true, processed: 0, duplicate: true });
        return;
      }
      
      // Block client for exceeding rate limit
      rateLimitData.blockedUntil = now + RATE_LIMIT_BLOCK_DURATION;
      logger.warn('🚫 Client rate limit exceeded, blocking', {
        clientKey: clientKey.substring(0, 50),
        requestsInWindow: rateLimitData.requests.length,
        windowDuration: RATE_LIMIT_WINDOW,
        blockDuration: RATE_LIMIT_BLOCK_DURATION,
        blockedUntil: new Date(rateLimitData.blockedUntil).toISOString()
      });
      
      res.status(429).json({ 
        error: 'Rate limit exceeded', 
        retryAfter: Math.ceil(RATE_LIMIT_BLOCK_DURATION / 1000) 
      });
      return;
    }
    
    // Add current request to rate limit tracking
    rateLimitData.requests.push(now);
    
    // Track request frequency and timing for debugging
    const interval = requestTracker.lastRequest ? now - requestTracker.lastRequest : 0;
    requestTracker.lastRequest = now;
    requestTracker.requestCount++;
    
    // Track session-specific requests
    const sessionKey = `${sessionInfo.url}_${sessionInfo.userAgent}`;
    const sessionData = requestTracker.sessions.get(sessionKey) || { count: 0, firstSeen: now, lastSeen: now };
    sessionData.count++;
    sessionData.lastSeen = now;
    requestTracker.sessions.set(sessionKey, sessionData);
    
    // Log detailed frequency analysis (reduced frequency)
    if (requestTracker.requestCount % 10 === 1) { // Log every 10th request to reduce noise
      logger.debug('Brain-monitor request stats', {
        requestCount: requestTracker.requestCount,
        interval,
        sessionCount: sessionData.count,
        logEntries: logs.length,
        rateLimitRequests: rateLimitData.requests.length,
        clientKey: clientKey.substring(0, 50)
      });
    }
    
    // Periodic cleanup of old rate limit data
    if (requestTracker.requestCount % 100 === 0) {
      const cutoffTime = now - (RATE_LIMIT_WINDOW * 2);
      for (const [key, data] of clientRateLimits.entries()) {
        if (data.requests.length === 0 && (!data.blockedUntil || data.blockedUntil < cutoffTime)) {
          clientRateLimits.delete(key);
        }
      }
      
      logger.debug('Cleaned up rate limit data', {
        remainingClients: clientRateLimits.size,
        totalRequests: requestTracker.requestCount
      });
    }

    if (!logs || !Array.isArray(logs)) {
      logger.error('Invalid logs format received', {
        requestCount: requestTracker.requestCount,
        bodyType: typeof req.body,
        hasLogs: !!logs,
        isArray: Array.isArray(logs)
      });
      res.status(400).json({ error: 'Invalid logs format' });
      return;
    }

    // Ensure _logs directory exists - use project root, not backend directory
    const projectRoot = join(process.cwd(), '..', '..');
    const logsDir = join(projectRoot, '_logs');
    if (!existsSync(logsDir)) {
      mkdirSync(logsDir, { recursive: true });
    }

    const logFile = join(logsDir, 'claude-code-ui-frontend.log');
    
    // Format logs for append with clear browser vs server distinction and compaction
    const formattedLogs = logs.map(log => {
      const timestamp = new Date(log.timestamp).toLocaleTimeString();
      const level = log.level.toUpperCase().padEnd(5);
      
      // Compact the message by removing color codes and unnecessary formatting
      const compactedMessage = compactLogMessage(log.message);
      
      // Clean format without redundant timestamps and labels
      let logLine = `${compactedMessage}`;
      
      if (log.stack && (log.level === 'error' || log.level === 'warn')) {
        logLine += `\nStack trace: ${log.stack}`;
      }
      
      // Add URL context for browser logs
      if (log.url && !log.url.includes('localhost:8766')) {
        logLine += `\nURL: ${log.url}`;
      }
      
      return logLine;
    }).join('\n');

    // Prepend to log file with section separator (newest logs first)
    if (formattedLogs.trim()) {
      const separator = `--- BROWSER CONSOLE LOGS (${new Date().toISOString()}) ---\n`;
      const newContent = separator + formattedLogs + '\n\n';
      
      // Read existing content
      let existingContent = '';
      if (existsSync(logFile)) {
        existingContent = readFileSync(logFile, 'utf8');
        
        // If it's a server log file (starts with # 📋), preserve the header
        if (existingContent.startsWith('# 📋')) {
          const lines = existingContent.split('\n');
          const headerEndIndex = lines.findIndex(line => line.startsWith('```')) + 1;
          if (headerEndIndex > 0) {
            const header = lines.slice(0, headerEndIndex).join('\n') + '\n';
            const bodyContent = lines.slice(headerEndIndex).join('\n');
            existingContent = header + newContent + bodyContent;
          } else {
            existingContent = newContent + existingContent;
          }
        } else {
          existingContent = newContent + existingContent;
        }
      } else {
        existingContent = newContent;
      }
      
      // Write the new content with newest logs first
      writeFileSync(logFile, existingContent);
    }

    // Enhanced response with debugging information
    res.status(200).json({ 
      success: true, 
      processed: logs.length,
      timestamp: sessionInfo.timestamp,
      debug: {
        requestCount: requestTracker.requestCount,
        interval,
        sessionRequests: sessionData.count,
        averageInterval: sessionData.count > 1 ? (now - sessionData.firstSeen) / (sessionData.count - 1) : 0
      }
    });
    
    logger.debug('Brain-monitor response sent', {
      processed: logs.length,
      totalRequests: requestTracker.requestCount,
      sessionRequests: sessionData.count
    });

  } catch (error) {
    console.error('Failed to process browser logs:', error);
    res.status(500).json({ error: 'Failed to process logs' });
  }
};