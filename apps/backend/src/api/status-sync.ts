import { Router, Request, Response } from 'express';
import { createLogger } from '@kit/logger/node';
import { StatusEnvelope } from '../types/status';

const logger = createLogger({ scope: 'status-sync-api' });

// In-memory storage for session status (in production, use Redis or similar)
const sessionStatusCache = new Map<string, {
  lastStatus: StatusEnvelope;
  statusHistory: Array<{ timestamp: number; status: StatusEnvelope }>;
  lastUpdated: number;
}>();

// Configuration
const MAX_HISTORY_SIZE = 100;
const STATUS_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export function createStatusSyncRouter(): Router {
  const router = Router();
  
  /**
   * GET /api/status-sync/:sessionId
   * Get current status for a session
   */
  router.get('/status-sync/:sessionId', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    const sessionData = sessionStatusCache.get(sessionId);
    
    if (!sessionData) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Check if status is expired
    if (Date.now() - sessionData.lastUpdated > STATUS_EXPIRY_MS) {
      sessionStatusCache.delete(sessionId);
      return res.status(404).json({ error: 'Session status expired' });
    }
    
    logger.debug('Returning session status', { 
      sessionId, 
      hasLastStatus: !!sessionData.lastStatus,
      historySize: sessionData.statusHistory.length 
    });
    
    res.json({
      sessionId,
      lastStatus: sessionData.lastStatus,
      lastUpdated: sessionData.lastUpdated,
      historySize: sessionData.statusHistory.length
    });
  });
  
  /**
   * POST /api/status-sync/:sessionId/replay
   * Request replay of missed status messages
   */
  router.post('/status-sync/:sessionId/replay', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { since } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    const sessionData = sessionStatusCache.get(sessionId);
    
    if (!sessionData) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    let history = sessionData.statusHistory;
    
    // Filter by timestamp if provided
    if (since && typeof since === 'number') {
      history = history.filter(h => h.timestamp > since);
    }
    
    // Limit to last 50 updates
    const recentHistory = history.slice(-50);
    
    logger.debug('Replaying status history', { 
      sessionId, 
      since,
      totalHistory: history.length,
      replayCount: recentHistory.length 
    });
    
    res.json({
      sessionId,
      updates: recentHistory,
      currentStatus: sessionData.lastStatus,
      lastUpdated: sessionData.lastUpdated
    });
  });
  
  /**
   * POST /api/status-sync/:sessionId
   * Update status for a session (internal use)
   */
  router.post('/status-sync/:sessionId', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const status: StatusEnvelope = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    if (!status) {
      return res.status(400).json({ error: 'Status data is required' });
    }
    
    // Get or create session data
    let sessionData = sessionStatusCache.get(sessionId);
    if (!sessionData) {
      sessionData = {
        lastStatus: status,
        statusHistory: [],
        lastUpdated: Date.now()
      };
      sessionStatusCache.set(sessionId, sessionData);
    }
    
    // Update session data
    sessionData.lastStatus = status;
    sessionData.lastUpdated = Date.now();
    sessionData.statusHistory.push({
      timestamp: Date.now(),
      status
    });
    
    // Limit history size
    if (sessionData.statusHistory.length > MAX_HISTORY_SIZE) {
      sessionData.statusHistory = sessionData.statusHistory.slice(-MAX_HISTORY_SIZE);
    }
    
    logger.debug('Status updated', { 
      sessionId,
      historySize: sessionData.statusHistory.length 
    });
    
    res.json({ success: true });
  });
  
  /**
   * DELETE /api/status-sync/:sessionId
   * Clear status for a session
   */
  router.delete('/status-sync/:sessionId', (req: Request, res: Response) => {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    const existed = sessionStatusCache.delete(sessionId);
    
    logger.debug('Session status cleared', { sessionId, existed });
    
    res.json({ success: true, existed });
  });
  
  // Cleanup expired sessions periodically
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, data] of sessionStatusCache.entries()) {
      if (now - data.lastUpdated > STATUS_EXPIRY_MS) {
        sessionStatusCache.delete(sessionId);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      logger.debug('Cleaned expired sessions', { 
        cleaned, 
        remaining: sessionStatusCache.size 
      });
    }
  }, 60000); // Run every minute
  
  return router;
}

/**
 * Helper function to update session status (called from WebSocket handlers)
 */
export function updateSessionStatus(sessionId: string, status: StatusEnvelope): void {
  let sessionData = sessionStatusCache.get(sessionId);
  
  if (!sessionData) {
    sessionData = {
      lastStatus: status,
      statusHistory: [],
      lastUpdated: Date.now()
    };
    sessionStatusCache.set(sessionId, sessionData);
  }
  
  sessionData.lastStatus = status;
  sessionData.lastUpdated = Date.now();
  sessionData.statusHistory.push({
    timestamp: Date.now(),
    status
  });
  
  // Limit history size
  if (sessionData.statusHistory.length > MAX_HISTORY_SIZE) {
    sessionData.statusHistory = sessionData.statusHistory.slice(-MAX_HISTORY_SIZE);
  }
}

/**
 * Get session status history for replay
 */
export function getSessionStatusHistory(sessionId: string, since?: number): Array<{ timestamp: number; status: StatusEnvelope }> {
  const sessionData = sessionStatusCache.get(sessionId);
  
  if (!sessionData) {
    return [];
  }
  
  let history = sessionData.statusHistory;
  
  if (since && typeof since === 'number') {
    history = history.filter(h => h.timestamp > since);
  }
  
  return history;
}