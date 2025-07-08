import { Request, Response } from 'express';
import { createLogger } from '@kit/logger/node';
import { PlannerService } from './planner.service.js';
import { PlannerRequest, AgentType } from './planner.types.js';

const logger = createLogger({ scope: 'planner-controller' });

// Create a singleton instance
let plannerService: PlannerService | null = null;

function getPlannerService(): PlannerService {
  if (!plannerService) {
    plannerService = new PlannerService();
  }
  return plannerService;
}

export async function handlePlanFeature(req: Request, res: Response) {
  try {
    const { projectPath, featureDescription, selectedAgents } = req.body;
    
    // Validate request
    if (!projectPath || typeof projectPath !== 'string') {
      logger.warn('Invalid project path', { projectPath });
      return res.status(400).json({ error: 'Project path is required' });
    }
    
    if (!featureDescription || typeof featureDescription !== 'string') {
      logger.warn('Invalid feature description', { featureDescription });
      return res.status(400).json({ error: 'Feature description is required' });
    }
    
    if (!selectedAgents || !Array.isArray(selectedAgents) || selectedAgents.length === 0) {
      logger.warn('Invalid selected agents', { selectedAgents });
      return res.status(400).json({ error: 'At least one agent must be selected' });
    }
    
    // Validate agent types
    const validAgents = Object.values(AgentType);
    const invalidAgents = selectedAgents.filter(agent => !validAgents.includes(agent));
    if (invalidAgents.length > 0) {
      logger.warn('Invalid agent types', { invalidAgents });
      return res.status(400).json({ error: `Invalid agent types: ${invalidAgents.join(', ')}` });
    }
    
    const service = getPlannerService();
    
    // Check if planning is already in progress
    if (service.isRunning()) {
      logger.warn('Planning already in progress');
      return res.status(409).json({ error: 'Planning is already in progress' });
    }
    
    // Generate session ID
    const sessionId = `planner-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    
    const plannerRequest: PlannerRequest = {
      type: 'planner-command',
      projectPath,
      featureDescription,
      selectedAgents,
      sessionId
    };
    
    logger.info('Starting feature planning', { 
      sessionId,
      projectPath,
      selectedAgents,
      featureDescriptionLength: featureDescription.length
    });
    
    // Start planning process (async)
    service.planFeature(plannerRequest)
      .then(result => {
        logger.info('Planning completed successfully', { 
          sessionId,
          duration: result.totalDuration,
          agentCount: result.agentResults.length
        });
      })
      .catch(error => {
        logger.error('Planning failed', { 
          sessionId,
          error: error.message
        });
      });
    
    // Return immediately with session ID
    res.json({ 
      sessionId,
      status: 'started',
      message: 'Feature planning initiated. Use WebSocket to monitor progress.'
    });
    
  } catch (error: any) {
    logger.error('Failed to start feature planning', { error });
    res.status(500).json({ error: 'Failed to start feature planning' });
  }
}

export async function handleGetPlannerStatus(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    const service = getPlannerService();
    const state = service.getState();
    
    // Check if this is the current session
    if (state.sessionId !== sessionId) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      sessionId,
      isRunning: state.isRunning,
      progress: state.progress,
      currentRequest: state.currentRequest,
      agentResults: Array.from(state.agentResults.values())
    });
    
  } catch (error: any) {
    logger.error('Failed to get planner status', { error });
    res.status(500).json({ error: 'Failed to get planner status' });
  }
}

export async function handleAbortPlanning(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    const service = getPlannerService();
    const state = service.getState();
    
    // Check if this is the current session
    if (state.sessionId !== sessionId) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    if (!state.isRunning) {
      return res.status(400).json({ error: 'No planning session in progress' });
    }
    
    logger.info('Aborting planning session', { sessionId });
    service.abortPlanning();
    
    res.json({ 
      sessionId,
      status: 'aborted',
      message: 'Planning session aborted successfully'
    });
    
  } catch (error: any) {
    logger.error('Failed to abort planning', { error });
    res.status(500).json({ error: 'Failed to abort planning' });
  }
}

// Export the singleton service for WebSocket usage
export function getPlannerServiceInstance(): PlannerService {
  return getPlannerService();
}