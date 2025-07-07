import { createLogger } from '@kit/logger/node';
import OpenAI from 'openai';

const logger = createLogger({ scope: 'sessions-service' });

// Initialize OpenAI client (you can also use other providers)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

interface SessionMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export class SessionsService {
  /**
   * Generate a concise session title based on the conversation content
   * Uses GPT-3.5-turbo for efficiency and cost-effectiveness
   */
  async generateSessionTitle(messages: SessionMessage[]): Promise<string> {
    try {
      // Filter to get only user messages for context
      const userMessages = messages
        .filter(msg => msg.role === 'user')
        .slice(0, 5) // Use first 5 user messages max
        .map(msg => msg.content)
        .join('\n');

      if (!userMessages) {
        return 'New Session';
      }

      // Create a prompt for title generation
      const prompt = `Based on the following user messages, generate a concise, descriptive title (max 5 words) that summarizes the main topic or task:

User messages:
${userMessages}

Title:`;

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that generates concise, descriptive titles for conversations. Keep titles under 5 words and make them specific to the content.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 20,
        temperature: 0.7,
      });

      const title = response.choices[0]?.message?.content?.trim() || 'New Session';
      
      // Ensure title is not too long
      if (title.length > 50) {
        return title.substring(0, 47) + '...';
      }

      return title;
    } catch (error) {
      logger.error('Failed to generate session title', { error });
      return 'New Session';
    }
  }

  /**
   * Alternative: Generate title using regex patterns (no AI required)
   * Extracts key phrases from user messages
   */
  generateSessionTitleLocal(messages: SessionMessage[]): string {
    const userMessages = messages
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content);

    if (userMessages.length === 0) {
      return 'New Session';
    }

    const firstMessage = userMessages[0];

    // Common patterns to extract intent
    const patterns = [
      { regex: /(?:fix|debug|solve|resolve)\s+(.+?)(?:\?|$)/i, prefix: 'Fix ' },
      { regex: /(?:test|testing)\s+(.+?)(?:\?|$)/i, prefix: 'Test ' },
      { regex: /(?:help|assist|create|build|make|write|implement)\s+(?:me\s+)?(?:with\s+)?(.+?)(?:\?|$)/i, prefix: '' },
      { regex: /(?:how\s+to|how\s+do\s+i|how\s+can\s+i)\s+(.+?)(?:\?|$)/i, prefix: 'How to ' },
      { regex: /(?:what\s+is|what's|explain)\s+(.+?)(?:\?|$)/i, prefix: '' },
      { regex: /(?:why\s+is|why\s+does)\s+(.+?)(?:\?|$)/i, prefix: 'Why ' },
    ];

    for (const { regex, prefix } of patterns) {
      const match = firstMessage.match(regex);
      if (match && match[1]) {
        const extracted = match[1].trim();
        // Clean up and truncate
        const cleaned = extracted
          .replace(/\s+/g, ' ')
          .replace(/[^\w\s-]/g, '')
          .split(' ')
          .slice(0, 4)
          .join(' ');
        
        return prefix + cleaned;
      }
    }

    // Fallback: Use first few words
    const words = firstMessage
      .replace(/[^\w\s]/g, '')
      .split(' ')
      .filter(word => word.length > 2)
      .slice(0, 4)
      .join(' ');

    return words || 'New Session';
  }

  /**
   * Find duplicate sessions for a given project and base title
   */
  async findDuplicateSessions(projectPath: string, baseTitle: string): Promise<number> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const entries = await fs.readdir(projectPath, { withFileTypes: true });
      const sessionFiles = entries.filter(entry => entry.isFile() && entry.name.endsWith('.jsonl'));
      
      let duplicateCount = 0;
      const titlePattern = new RegExp(`^${baseTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}( \\(\\d+\\))?$`);
      
      for (const file of sessionFiles) {
        try {
          const content = await fs.readFile(path.join(projectPath, file.name), 'utf8');
          const lines = content.trim().split('\n').filter(line => line.trim());
          
          if (lines.length > 0) {
            const firstLine = JSON.parse(lines[0]);
            if (firstLine.type === 'summary' && firstLine.summary && titlePattern.test(firstLine.summary)) {
              duplicateCount++;
            }
          }
        } catch {
          // Skip files that can't be parsed
        }
      }
      
      return duplicateCount;
    } catch (error) {
      logger.error('Failed to find duplicate sessions', { error });
      return 0;
    }
  }

  /**
   * Update session title in the JSONL file
   */
  async updateSessionTitle(projectPath: string, sessionId: string, title: string, metadata?: { origin?: string }): Promise<void> {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    try {
      const sessionPath = path.join(projectPath, `${sessionId}.jsonl`);
      
      // Read all lines
      const content = await fs.readFile(sessionPath, 'utf8');
      const lines = content.trim().split('\n');
      
      if (lines.length === 0) return;
      
      // Check for duplicates and add counter if needed
      const duplicateCount = await this.findDuplicateSessions(projectPath, title);
      let finalTitle = title;
      if (duplicateCount > 0) {
        finalTitle = `${title} (${duplicateCount + 1})`;
      }
      
      // Check if first line is a summary
      try {
        const firstLine = JSON.parse(lines[0]);
        if (firstLine.type === 'summary') {
          // Update existing summary
          firstLine.summary = finalTitle;
          if (metadata?.origin) {
            firstLine.metadata = { ...firstLine.metadata, origin: metadata.origin };
          }
          lines[0] = JSON.stringify(firstLine);
        } else {
          // Insert new summary at the beginning
          const summaryLine = JSON.stringify({
            type: 'summary',
            summary: finalTitle,
            timestamp: new Date().toISOString(),
            metadata: metadata || {}
          });
          lines.unshift(summaryLine);
        }
      } catch {
        // If parsing fails, add new summary
        const summaryLine = JSON.stringify({
          type: 'summary',
          summary: finalTitle,
          timestamp: new Date().toISOString(),
          metadata: metadata || {}
        });
        lines.unshift(summaryLine);
      }
      
      // Write back
      await fs.writeFile(sessionPath, lines.join('\n') + '\n');
      
      logger.info('Updated session title', { sessionId, title: finalTitle, metadata });
    } catch (error) {
      logger.error('Failed to update session title', { error, sessionId });
    }
  }
}

export const sessionsService = new SessionsService();