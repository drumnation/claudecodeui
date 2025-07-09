import * as fs from 'fs/promises';
import * as path from 'path';
import { createHash } from 'crypto';
import { createLogger } from '@kit/logger/node';
import { PlannerRequest, PlannerComplete, AgentType } from './planner.types.js';

const logger = createLogger({ scope: 'planner-history-service' });

export interface PlannerHistoryItem {
  id: string;
  projectPath: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'completed' | 'failed' | 'cancelled';
  mode: 'single' | 'multi';
  agents: AgentType[];
  duration?: number;
  finalPlan?: string;
  agentResults?: any[];
  error?: string;
  autoGenerateCode?: boolean;
  screenshotCount?: number;
}

export interface PlannerHistoryFilter {
  projectPath?: string;
  status?: string[];
  mode?: string;
  limit?: number;
  offset?: number;
}

export class PlannerHistoryService {
  private getHistoryDir(projectPath: string): string {
    const encodedPath = createHash('md5').update(projectPath).digest('hex');
    const homeDir = process.env.HOME || process.env.USERPROFILE || '';
    return path.join(homeDir, '.claude', 'projects', encodedPath, 'planner-history');
  }

  private async ensureHistoryDir(projectPath: string): Promise<string> {
    const historyDir = this.getHistoryDir(projectPath);
    await fs.mkdir(historyDir, { recursive: true });
    return historyDir;
  }

  async savePlannerSession(
    request: PlannerRequest,
    result: PlannerComplete,
    sessionId: string
  ): Promise<PlannerHistoryItem> {
    try {
      const historyDir = await this.ensureHistoryDir(request.projectPath);
      
      // Generate title from description
      const title = this.generateTitle(request.featureDescription);
      
      const historyItem: PlannerHistoryItem = {
        id: sessionId,
        projectPath: request.projectPath,
        title,
        description: request.featureDescription,
        timestamp: new Date().toISOString(),
        status: result.status === 'completed' ? 'completed' : 'failed',
        mode: request.plannerMode || 'multi',
        agents: request.selectedAgents,
        duration: result.totalDuration,
        finalPlan: result.finalPlan,
        agentResults: result.agentResults,
        autoGenerateCode: request.autoGenerateCode,
        screenshotCount: request.screenshots?.length || 0
      };

      // Save to file
      const filePath = path.join(historyDir, `${sessionId}.json`);
      await fs.writeFile(filePath, JSON.stringify(historyItem, null, 2), 'utf-8');

      logger.info('Saved planner session to history', {
        sessionId,
        projectPath: request.projectPath,
        title
      });

      return historyItem;
    } catch (error) {
      logger.error('Failed to save planner session', { error, sessionId });
      throw error;
    }
  }

  async listPlannerHistory(filter?: PlannerHistoryFilter): Promise<PlannerHistoryItem[]> {
    try {
      const items: PlannerHistoryItem[] = [];
      
      if (filter?.projectPath) {
        // List for specific project
        const historyDir = this.getHistoryDir(filter.projectPath);
        try {
          const files = await fs.readdir(historyDir);
          for (const file of files) {
            if (file.endsWith('.json')) {
              try {
                const content = await fs.readFile(path.join(historyDir, file), 'utf-8');
                const item = JSON.parse(content) as PlannerHistoryItem;
                items.push(item);
              } catch (err) {
                logger.warn('Failed to read history file', { file, error: err });
              }
            }
          }
        } catch (err) {
          // Directory might not exist yet
          logger.debug('History directory not found', { historyDir });
        }
      } else {
        // List all projects (if needed in future)
        logger.warn('Listing all projects not implemented yet');
      }

      // Apply filters
      let filtered = items;
      
      if (filter?.status && filter.status.length > 0) {
        filtered = filtered.filter(item => filter.status?.includes(item.status));
      }
      
      if (filter?.mode) {
        filtered = filtered.filter(item => item.mode === filter.mode);
      }

      // Sort by timestamp (newest first)
      filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply pagination
      if (filter?.offset !== undefined && filter?.limit !== undefined) {
        filtered = filtered.slice(filter.offset, filter.offset + filter.limit);
      } else if (filter?.limit !== undefined) {
        filtered = filtered.slice(0, filter.limit);
      }

      return filtered;
    } catch (error) {
      logger.error('Failed to list planner history', { error, filter });
      throw error;
    }
  }

  async getPlannerSession(projectPath: string, sessionId: string): Promise<PlannerHistoryItem | null> {
    try {
      const historyDir = this.getHistoryDir(projectPath);
      const filePath = path.join(historyDir, `${sessionId}.json`);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content) as PlannerHistoryItem;
      } catch (err) {
        return null;
      }
    } catch (error) {
      logger.error('Failed to get planner session', { error, sessionId });
      throw error;
    }
  }

  async deletePlannerSession(projectPath: string, sessionId: string): Promise<void> {
    try {
      const historyDir = this.getHistoryDir(projectPath);
      const filePath = path.join(historyDir, `${sessionId}.json`);
      
      await fs.unlink(filePath);
      
      logger.info('Deleted planner session', { sessionId, projectPath });
    } catch (error) {
      logger.error('Failed to delete planner session', { error, sessionId });
      throw error;
    }
  }

  async updatePlannerSession(
    projectPath: string,
    sessionId: string,
    updates: Partial<PlannerHistoryItem>
  ): Promise<PlannerHistoryItem | null> {
    try {
      const existing = await this.getPlannerSession(projectPath, sessionId);
      if (!existing) {
        return null;
      }

      const updated = { ...existing, ...updates, id: sessionId };
      
      const historyDir = this.getHistoryDir(projectPath);
      const filePath = path.join(historyDir, `${sessionId}.json`);
      await fs.writeFile(filePath, JSON.stringify(updated, null, 2), 'utf-8');

      logger.info('Updated planner session', { sessionId, projectPath });
      
      return updated;
    } catch (error) {
      logger.error('Failed to update planner session', { error, sessionId });
      throw error;
    }
  }

  private generateTitle(description: string): string {
    // Extract first meaningful part of the description
    const cleaned = description
      .replace(/[^\w\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 2);

    // Common patterns to extract intent
    const patterns = [
      { regex: /(?:implement|create|build|add|develop)\s+(.+)/i, prefix: '' },
      { regex: /(?:fix|debug|solve|resolve)\s+(.+)/i, prefix: 'Fix ' },
      { regex: /(?:refactor|improve|optimize)\s+(.+)/i, prefix: 'Refactor ' },
      { regex: /(?:test|testing)\s+(.+)/i, prefix: 'Test ' },
    ];

    for (const { regex, prefix } of patterns) {
      const match = description.match(regex);
      if (match && match[1]) {
        const extracted = match[1]
          .trim()
          .split(/\s+/)
          .slice(0, 4)
          .join(' ');
        return prefix + extracted;
      }
    }

    // Fallback: use first few words
    return cleaned.slice(0, 5).join(' ') || 'Feature Planning';
  }

  async cleanOldSessions(projectPath: string, daysToKeep: number = 30): Promise<number> {
    try {
      const historyDir = this.getHistoryDir(projectPath);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      let deletedCount = 0;

      try {
        const files = await fs.readdir(historyDir);
        for (const file of files) {
          if (file.endsWith('.json')) {
            const filePath = path.join(historyDir, file);
            try {
              const content = await fs.readFile(filePath, 'utf-8');
              const item = JSON.parse(content) as PlannerHistoryItem;
              
              if (new Date(item.timestamp) < cutoffDate) {
                await fs.unlink(filePath);
                deletedCount++;
              }
            } catch (err) {
              logger.warn('Failed to process history file for cleanup', { file, error: err });
            }
          }
        }
      } catch (err) {
        logger.debug('History directory not found for cleanup', { historyDir });
      }

      logger.info('Cleaned old planner sessions', { projectPath, deletedCount, daysToKeep });
      
      return deletedCount;
    } catch (error) {
      logger.error('Failed to clean old sessions', { error, projectPath });
      throw error;
    }
  }
}

export const plannerHistoryService = new PlannerHistoryService();