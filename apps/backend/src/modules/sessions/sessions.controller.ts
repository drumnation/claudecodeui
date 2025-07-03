import {Router} from 'express';
import type {Request, Response} from 'express';
import fetch from 'node-fetch';
import type {Logger} from '@kit/logger/types';
import {
  getSessionsHandler,
  getSessionMessagesHandler,
  updateSessionSummary,
  deleteSession,
} from '../projects/index.js';
import {
  markSessionAsManuallyEdited,
  clearManualEditFlag,
} from '../claude-cli/index.js';

// Track session operations for debugging
const sessionOperationTracker = new Map<string, {
  loadCount: number,
  lastLoad: number,
  messageRetrieval: number,
  operations: Array<{ type: string, timestamp: number }>
}>();

export const createSessionRoutes = (logger: Logger): Router => {
  const router = Router({mergeParams: true});

  // Enhanced session listing with operation tracking
  router.get('/', (req: Request, res: Response) => {
    const projectName = req.params.projectName;
    const now = Date.now();
    
    logger.debug('Sessions list requested', {
      projectName,
      timestamp: now,
      userAgent: req.get('User-Agent')?.substring(0, 50)
    });
    
    return getSessionsHandler(req, res);
  });

  // Enhanced session messages with comprehensive tracking
  router.get('/:sessionId/messages', (req: Request, res: Response) => {
    const { projectName, sessionId } = req.params;
    const now = Date.now();
    
    // Track session message retrieval patterns
    const sessionKey = `${projectName}_${sessionId}`;
    const existing = sessionOperationTracker.get(sessionKey) || {
      loadCount: 0,
      lastLoad: 0,
      messageRetrieval: 0,
      operations: []
    };
    
    const timeSinceLastLoad = existing.lastLoad ? now - existing.lastLoad : 0;
    existing.messageRetrieval++;
    existing.lastLoad = now;
    existing.operations.push({ type: 'message_retrieval', timestamp: now });
    
    // Keep only last 10 operations for memory efficiency
    if (existing.operations.length > 10) {
      existing.operations = existing.operations.slice(-10);
    }
    
    sessionOperationTracker.set(sessionKey, existing);
    
    logger.debug('Session messages requested', {
      projectName,
      sessionId,
      retrievalCount: existing.messageRetrieval,
      timeSinceLastLoad,
      recentOperations: existing.operations.length
    });
    
    // Detect rapid session message requests
    if (timeSinceLastLoad > 0 && timeSinceLastLoad < 5000 && existing.messageRetrieval > 1) {
      logger.warn('Rapid session message retrieval detected', {
        sessionKey,
        retrievalCount: existing.messageRetrieval,
        timeSinceLastLoad,
        averageInterval: existing.operations.length > 1 
          ? (now - existing.operations[0].timestamp) / (existing.operations.length - 1)
          : 0
      });
    }
    
    // Log high frequency access patterns
    if (existing.messageRetrieval > 5) {
      const sessionDuration = now - existing.operations[0].timestamp;
      logger.warn('High frequency session access detected', {
        sessionKey,
        messageRetrievals: existing.messageRetrieval,
        sessionDuration,
        operationsInWindow: existing.operations.length
      });
    }
    
    return getSessionMessagesHandler(req, res);
  });

  // Update session summary
  router.put('/:sessionId/summary', updateSessionSummary);

  // Generate session summary with enhanced logging
  router.post(
    '/:sessionId/generate-summary',
    async (req: Request, res: Response) => {
      const startTime = Date.now();
      const {projectName, sessionId} = req.params;
      
      try {
        const {messages} = req.body;
        
        logger.info('Session summary generation requested', {
          projectName,
          sessionId,
          messageCount: messages?.length || 0,
          requestStart: startTime
        });

        if (!messages || messages.length === 0) {
          logger.warn('Session summary generation failed: no messages', {
            projectName,
            sessionId,
            hasMessages: !!messages,
            messageCount: messages?.length || 0
          });
          return res.status(400).json({error: 'No messages provided'});
        }
        
        // Track summary generation operations
        const sessionKey = `${projectName}_${sessionId}`;
        const existing = sessionOperationTracker.get(sessionKey) || {
          loadCount: 0,
          lastLoad: 0,
          messageRetrieval: 0,
          operations: []
        };
        existing.operations.push({ type: 'summary_generation', timestamp: startTime });
        sessionOperationTracker.set(sessionKey, existing);

        const PORT = process.env['PORT'] || '8765';
        const summaryResponse = await fetch(
          `http://localhost:${PORT}/api/generate-session-summary`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({messages}),
          },
        );

        logger.info('🔄 Summary API response status', {status: summaryResponse.status});

        if (!summaryResponse.ok) {
          const errorText = await summaryResponse.text();
          logger.error('❌ Summary API error', {errorText});
          throw new Error(`Failed to generate summary: ${errorText}`);
        }

        const summaryData = await summaryResponse.json();
        logger.info('✅ Summary generated', {summaryData});

        if (summaryData.summary) {
          // Update the session summary
          if (!projectName || !sessionId) {
            return res
              .status(400)
              .json({error: 'Project name and session ID are required'});
          }

          // Import the service functions directly
          const {findSessionFile, appendToJsonlFile} = await import(
            '../projects/index.js'
          );

          const homePath = process.env['HOME'] || '';
          const jsonlFile = await findSessionFile(
            homePath,
            projectName,
            sessionId,
          );

          if (!jsonlFile) {
            return res
              .status(404)
              .json({error: `Session ${sessionId} not found`});
          }

          const summaryEntry = {
            sessionId,
            type: 'summary',
            summary: summaryData.summary,
            timestamp: new Date().toISOString(),
          };

          await appendToJsonlFile(jsonlFile, summaryEntry);

          // Clear manual edit flag since this is a generated summary
          if (sessionId) clearManualEditFlag(sessionId);

          res.json({
            success: true,
            summary: summaryData.summary,
          });
        } else {
          const processingTime = Date.now() - startTime;
          logger.error('❌ No summary in response', {
            summaryData,
            projectName,
            sessionId,
            processingTime
          });
          res
            .status(500)
            .json({
              error: 'Failed to generate summary - no summary in response',
            });
        }
      } catch (error: any) {
        const processingTime = Date.now() - startTime;
        logger.error('❌ Error generating session summary', {
          error: error.message,
          stack: error.stack,
          projectName,
          sessionId,
          processingTime,
          messageCount: req.body?.messages?.length || 0
        });
        res.status(500).json({error: error.message});
      }
    },
  );

  // Delete session
  router.delete('/:sessionId', deleteSession);

  return router;
};
