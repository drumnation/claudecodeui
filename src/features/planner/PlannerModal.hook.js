import { useState, useEffect, useRef } from 'react';
import { useWebSocket } from '@/utils/websocket';
import { createPlannerWebSocketMessage } from './PlannerModal.logic';

export const usePlanner = (selectedProject, onPlanComplete) => {
  const [featureDescription, setFeatureDescription] = useState('');
  const [plannerMode, setPlannerMode] = useState('multi'); // 'single' or 'multi'
  const [selectedAgents, setSelectedAgents] = useState(['ARCH', 'DIFF', 'DEPS']);
  const [autoGenerateCode, setAutoGenerateCode] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [plannerState, setPlannerState] = useState({
    progress: null,
    sessionId: null,
    status: 'idle'
  });
  const [agentResults, setAgentResults] = useState([]);
  const [finalPlan, setFinalPlan] = useState('');
  const [error, setError] = useState('');
  
  const { ws: socket, isConnected, sendMessage } = useWebSocket();
  const plannerSessionRef = useRef(null);

  // Handle WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        // Only handle planner-related messages
        if (!message.type?.startsWith('planner-')) return;
        
        // Make sure this message is for our session
        if (plannerSessionRef.current && message.sessionId !== plannerSessionRef.current) {
          return;
        }

        switch (message.type) {
          case 'planner-status':
            handlePlannerStatus(message);
            break;
          case 'planner-output':
            handlePlannerOutput(message);
            break;
          case 'planner-complete':
            handlePlannerComplete(message);
            break;
          case 'planner-error':
            handlePlannerError(message);
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, plannerSessionRef.current]);

  const handlePlannerStatus = (message) => {
    setPlannerState(prev => ({
      ...prev,
      progress: message.progress,
      status: message.data?.status || 'running'
    }));
    
    // Clear any previous errors when status updates
    if (error) {
      setError('');
    }
  };

  const handlePlannerOutput = (message) => {
    const { agentType, output, partial } = message;
    
    if (!partial) return; // Only handle partial output for real-time updates
    
    // Update agent results with partial output
    setAgentResults(prev => {
      const existing = prev.find(result => result.agentType === agentType);
      if (existing) {
        return prev.map(result => 
          result.agentType === agentType 
            ? { ...result, output: existing.output + output }
            : result
        );
      } else {
        return [...prev, {
          agentType,
          output,
          status: 'running',
          startTime: Date.now()
        }];
      }
    });
  };

  const handlePlannerComplete = (message) => {
    const { finalPlan: plan, agentResults: results } = message.data || message;
    
    setFinalPlan(plan || '');
    setAgentResults(results || []);
    setIsPlanning(false);
    setPlannerState(prev => ({
      ...prev,
      status: 'completed',
      progress: {
        ...prev.progress,
        overallStatus: 'completed',
        progressPercentage: 100
      }
    }));
    
    // Call completion callback
    if (onPlanComplete) {
      onPlanComplete({
        finalPlan: plan,
        agentResults: results,
        project: selectedProject
      });
    }
  };

  const handlePlannerError = (message) => {
    const errorMsg = message.error || message.data?.error || 'An unknown error occurred';
    setError(errorMsg);
    setIsPlanning(false);
    setPlannerState(prev => ({
      ...prev,
      status: 'failed',
      progress: {
        ...prev.progress,
        overallStatus: 'failed'
      }
    }));
  };

  const startPlanning = async () => {
    if (!selectedProject || !featureDescription.trim() || selectedAgents.length === 0) {
      setError('Please provide a feature description and select at least one agent');
      return;
    }

    if (!isConnected) {
      setError('WebSocket connection not available');
      return;
    }

    // Reset state
    setError('');
    setFinalPlan('');
    setAgentResults([]);
    setIsPlanning(true);
    
    // Generate session ID
    const sessionId = `planner-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    plannerSessionRef.current = sessionId;
    
    setPlannerState({
      sessionId,
      status: 'starting',
      progress: {
        currentAgent: null,
        completedAgents: [],
        overallStatus: 'running',
        totalAgents: selectedAgents.length,
        completedCount: 0,
        progressPercentage: 0
      }
    });

    // Send planner command via WebSocket
    const plannerMessage = createPlannerWebSocketMessage({
      type: 'planner-command',
      projectPath: selectedProject.fullPath,
      featureDescription: featureDescription.trim(),
      selectedAgents: plannerMode === 'single' ? ['ARCH'] : selectedAgents,
      plannerMode,
      autoGenerateCode,
      sessionId
    });

    try {
      sendMessage(plannerMessage);
    } catch (error) {
      console.error('Failed to send planner command:', error);
      setError('Failed to start planning session');
      setIsPlanning(false);
      plannerSessionRef.current = null;
    }
  };

  const cancelPlanning = () => {
    if (plannerSessionRef.current && isConnected) {
      // Send abort message
      sendMessage({
        type: 'abort-session',
        sessionId: plannerSessionRef.current
      });
    }
    
    // Reset state
    setIsPlanning(false);
    setError('');
    setPlannerState(prev => ({
      ...prev,
      status: 'cancelled',
      progress: {
        ...prev.progress,
        overallStatus: 'failed'
      }
    }));
    plannerSessionRef.current = null;
  };

  const createSessionFromPlan = () => {
    if (!finalPlan || !selectedProject) return;
    
    // Navigate to a new Claude session with the plan as the initial message
    const command = `Please review this feature plan and help me implement it:\n\n${finalPlan}`;
    
    // Create a new session URL with the command
    const sessionUrl = `/chat?project=${encodeURIComponent(selectedProject.name)}&command=${encodeURIComponent(command)}`;
    
    // Open in the current window
    window.location.href = sessionUrl;
  };

  // Validation helpers
  const isValidForm = () => {
    return featureDescription.trim().length > 0 && 
           selectedAgents.length > 0 && 
           selectedProject;
  };

  const getFormErrors = () => {
    const errors = [];
    
    if (!featureDescription.trim()) {
      errors.push('Feature description is required');
    }
    
    if (selectedAgents.length === 0) {
      errors.push('At least one agent must be selected');
    }
    
    if (!selectedProject) {
      errors.push('Project must be selected');
    }
    
    return errors;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (plannerSessionRef.current && isConnected) {
        sendMessage({
          type: 'abort-session',
          sessionId: plannerSessionRef.current
        });
      }
    };
  }, []);

  return {
    // Form state
    featureDescription,
    setFeatureDescription,
    plannerMode,
    setPlannerMode,
    selectedAgents,
    setSelectedAgents,
    autoGenerateCode,
    setAutoGenerateCode,
    
    // Planning state
    isPlanning,
    plannerState,
    agentResults,
    finalPlan,
    error,
    
    // WebSocket state
    isConnected,
    
    // Actions
    startPlanning,
    cancelPlanning,
    createSessionFromPlan,
    
    // Validation
    isValidForm,
    getFormErrors,
    
    // Computed values
    canStartPlanning: isValidForm() && isConnected && !isPlanning,
    sessionId: plannerSessionRef.current
  };
};