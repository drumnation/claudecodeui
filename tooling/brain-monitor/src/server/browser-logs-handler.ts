import { Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { ensureDirectoryExists } from '../utils/file-utils.js';

interface BrowserLogEntry {
  level: string;
  timestamp: string;
  message: string;
  source: string;
  url: string;
  userAgent: string;
  stack?: string;
}

interface BrowserLogPayload {
  logs: BrowserLogEntry[];
  sessionInfo: {
    timestamp: string;
    url: string;
    userAgent: string;
  };
}

const LOG_DIR = '_logs';
const BROWSER_LOG_FILE = 'browser-console.log';
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Express middleware to handle browser console logs
 */
export async function handleBrowserLogs(req: Request, res: Response): Promise<void> {
  try {
    const payload = req.body as BrowserLogPayload;
    
    if (!payload.logs || !Array.isArray(payload.logs)) {
      res.status(400).json({ error: 'Invalid payload: logs array required' });
      return;
    }

    // Ensure log directory exists
    await ensureDirectoryExists(LOG_DIR);
    
    const logFilePath = path.join(LOG_DIR, BROWSER_LOG_FILE);
    
    // Format logs for file output
    const formattedLogs = payload.logs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      const level = log.level.toUpperCase().padEnd(5);
      const url = new URL(log.url).pathname;
      let message = `[${timestamp}] ${level} [${url}] ${log.message}`;
      
      if (log.stack) {
        message += `\n${log.stack}`;
      }
      
      return message;
    }).join('\n');
    
    // Check if we need to rotate the log file
    try {
      const stats = await fs.stat(logFilePath);
      if (stats.size > MAX_LOG_SIZE) {
        // Rotate the log file
        const backupPath = path.join(LOG_DIR, `browser-console.${Date.now()}.log`);
        await fs.rename(logFilePath, backupPath);
      }
    } catch (error) {
      // File doesn't exist yet, which is fine
    }
    
    // Append to log file
    await fs.appendFile(logFilePath, formattedLogs + '\n');
    
    res.json({ success: true, processed: payload.logs.length });
  } catch (error) {
    console.error('Failed to process browser logs:', error);
    res.status(500).json({ error: 'Failed to process logs' });
  }
}

/**
 * Create Express router for brain-monitor endpoints
 */
export function createBrainMonitorRouter() {
  const { Router } = require('express');
  const router = Router();
  
  router.post('/browser-logs', handleBrowserLogs);
  
  return router;
}