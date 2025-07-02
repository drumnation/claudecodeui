import {Router} from 'express';
import type {Request, Response} from 'express';
import fetch from 'node-fetch';
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

export const createSessionRoutes = (): Router => {
  const router = Router({mergeParams: true});

  // Get sessions for a project
  router.get('/', getSessionsHandler);

  // Get messages for a specific session
  router.get('/:sessionId/messages', getSessionMessagesHandler);

  // Update session summary
  router.put('/:sessionId/summary', updateSessionSummary);

  // Generate session summary
  router.post(
    '/:sessionId/generate-summary',
    async (req: Request, res: Response) => {
      try {
        const {projectName, sessionId} = req.params;
        const {messages} = req.body;

        if (!messages || messages.length === 0) {
          return res.status(400).json({error: 'No messages provided'});
        }

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

        console.log('🔄 Summary API response status:', summaryResponse.status);

        if (!summaryResponse.ok) {
          const errorText = await summaryResponse.text();
          console.error('❌ Summary API error:', errorText);
          throw new Error(`Failed to generate summary: ${errorText}`);
        }

        const summaryData = await summaryResponse.json();
        console.log('✅ Summary generated:', summaryData);

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
          console.error('❌ No summary in response:', summaryData);
          res
            .status(500)
            .json({
              error: 'Failed to generate summary - no summary in response',
            });
        }
      } catch (error: any) {
        console.error('❌ Error generating session summary:', error);
        res.status(500).json({error: error.message});
      }
    },
  );

  // Delete session
  router.delete('/:sessionId', deleteSession);

  return router;
};
