import { createLogger } from '@kit/logger/node';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { sessionsService } from './sessions.service';

const logger = createLogger({ scope: 'update-missing-titles' });

/**
 * Scan all sessions and generate titles for those missing them
 */
export async function updateMissingTitles(): Promise<void> {
  const projectsPath = path.join(os.homedir(), '.claude', 'projects');
  
  try {
    const projectDirs = await fs.readdir(projectsPath, { withFileTypes: true });
    
    for (const dir of projectDirs) {
      if (dir.isDirectory()) {
        const projectPath = path.join(projectsPath, dir.name);
        await updateProjectSessions(projectPath, dir.name);
      }
    }
    
    logger.info('Finished updating missing titles');
  } catch (error) {
    logger.error('Failed to update missing titles', { error });
  }
}

async function updateProjectSessions(projectPath: string, projectName: string): Promise<void> {
  try {
    const entries = await fs.readdir(projectPath, { withFileTypes: true });
    const sessionFiles = entries.filter(entry => entry.isFile() && entry.name.endsWith('.jsonl'));
    
    logger.info('Checking sessions in project', { projectName, sessionCount: sessionFiles.length });
    
    for (const file of sessionFiles) {
      const sessionId = file.name.replace('.jsonl', '');
      const sessionPath = path.join(projectPath, file.name);
      
      try {
        const content = await fs.readFile(sessionPath, 'utf8');
        const lines = content.trim().split('\n').filter(line => line.trim());
        
        if (lines.length === 0) continue;
        
        // Check if session needs a title
        let needsTitle = true;
        try {
          const firstLine = JSON.parse(lines[0]);
          if (firstLine.type === 'summary' && 
              firstLine.summary && 
              firstLine.summary !== 'No summary available' &&
              firstLine.summary !== 'New Session') {
            needsTitle = false;
          }
        } catch {
          // First line is not a summary
        }
        
        if (needsTitle) {
          logger.info('Session needs title', { sessionId, projectName });
          
          // Parse messages
          const messages = [];
          for (const line of lines) {
            try {
              const msg = JSON.parse(line);
              if (msg.type !== 'summary' && msg.message) {
                messages.push({
                  role: msg.message.role || 'user',
                  content: typeof msg.message.content === 'string' 
                    ? msg.message.content 
                    : msg.message.content?.map((c: any) => c.text || '').join(' ') || '',
                  timestamp: msg.timestamp
                });
              }
            } catch {
              // Skip invalid lines
            }
          }
          
          if (messages.length > 0) {
            // Generate title
            const useAI = process.env.OPENAI_API_KEY && process.env.USE_AI_TITLES !== 'false';
            let title: string;
            
            if (useAI) {
              title = await sessionsService.generateSessionTitle(messages);
            } else {
              title = sessionsService.generateSessionTitleLocal(messages);
            }
            
            // Determine origin based on session ID
            const metadata: any = {};
            if (sessionId.startsWith('ui-')) {
              metadata.origin = 'webui';
            }
            
            // Update session with new title
            await sessionsService.updateSessionTitle(projectPath, sessionId, title, metadata);
            
            logger.info('Updated session title', { sessionId, title });
          }
        }
      } catch (error) {
        logger.error('Failed to process session', { sessionId, error });
      }
    }
  } catch (error) {
    logger.error('Failed to update project sessions', { projectName, error });
  }
}

// Add CLI support
if (require.main === module) {
  updateMissingTitles()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Failed:', error);
      process.exit(1);
    });
}