import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/shared-components/Input/Input';
import { Button } from '@/shared-components/Button/Button';
import { Brain, X, Zap, CheckCircle, Clock, AlertCircle, FileText, Image, Upload, Camera, Terminal, Download } from 'lucide-react';
import { usePlanner } from './PlannerModal.hook';
import * as S from './PlannerModal.styles';

export const PlannerModal = ({
  selectedProject,
  onClose,
  onPlanComplete
}) => {
  const {
    featureDescription,
    setFeatureDescription,
    plannerMode,
    setPlannerMode,
    selectedAgents,
    setSelectedAgents,
    autoGenerateCode,
    setAutoGenerateCode,
    screenshots,
    isPlanning,
    plannerState,
    agentResults,
    finalPlan,
    error,
    startPlanning,
    cancelPlanning,
    createSessionFromPlan,
    handleScreenshotPaste,
    handleScreenshotFile,
    removeScreenshot
  } = usePlanner(selectedProject, onPlanComplete);

  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);

  const agentOptions = [
    { 
      id: 'ARCH', 
      name: 'Architecture', 
      description: 'Analyze system architecture and design patterns',
      icon: Brain
    },
    { 
      id: 'DIFF', 
      name: 'Change Impact', 
      description: 'Identify files and components that need modification',
      icon: FileText
    },
    { 
      id: 'DEPS', 
      name: 'Dependencies', 
      description: 'Analyze external and internal dependency requirements',
      icon: Zap
    }
  ];

  const handleAgentToggle = (agentId) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    );
  };

  const handleStartPlanning = () => {
    console.log('handleStartPlanning called', {
      featureDescription: featureDescription.trim(),
      selectedAgents,
      plannerMode
    });
    
    if (featureDescription.trim() && (plannerMode === 'single' || selectedAgents.length > 0)) {
      console.log('Starting planning...');
      startPlanning();
    } else {
      console.log('Validation failed', {
        hasDescription: !!featureDescription.trim(),
        agentCount: selectedAgents.length,
        mode: plannerMode
      });
    }
  };

  // Set up paste event listener
  useEffect(() => {
    const handlePaste = (e) => {
      handleScreenshotPaste(e);
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [handleScreenshotPaste]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    handleScreenshotFile(files);
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getAgentStatus = (agentId) => {
    if (!plannerState.progress) return 'pending';
    
    const { currentAgent, completedAgents } = plannerState.progress;
    
    if (completedAgents.includes(agentId)) return 'completed';
    if (currentAgent === agentId) return 'running';
    return 'pending';
  };

  const getErrorHelp = (errorMessage) => {
    if (!errorMessage) return null;
    
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('claude cli not found') || lowerError.includes('claude_binary_missing')) {
      return (
        <>
          <Terminal className="w-3 h-3 inline mr-1" />
          Install Claude CLI: <code>npm install -g @anthropic-ai/claude-cli</code>
        </>
      );
    }
    
    if (lowerError.includes('prompt file') || lowerError.includes('prompt_file_missing')) {
      return 'Ensure prompt files are present in the .brain/prompts directory';
    }
    
    if (lowerError.includes('not executable')) {
      return 'Make the Claude binary executable: chmod +x <path-to-claude>';
    }
    
    if (lowerError.includes('project path')) {
      return 'Verify the project path exists and is accessible';
    }
    
    if (lowerError.includes('websocket') || lowerError.includes('connection')) {
      return 'Check your network connection and ensure the backend is running';
    }
    
    return null;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'running':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <S.Container>
      {/* Desktop Form */}
      <S.DesktopForm>
        <S.FormHeader>
          <Brain className="w-6 h-6 text-primary" />
          <div className="flex-1">
            <div>Plan Feature with Multi-Agent AI</div>
            {selectedProject && selectedProject.displayName && (
              <div className="text-xs text-muted-foreground mt-0.5">
                {selectedProject.displayName}
              </div>
            )}
          </div>
        </S.FormHeader>
        
        {!isPlanning ? (
          <>
            <S.FormSection>
              <S.ModeTabs>
                <S.ModeTab 
                  active={plannerMode === 'single'}
                  onClick={() => setPlannerMode('single')}
                >
                  Single Agent
                </S.ModeTab>
                <S.ModeTab 
                  active={plannerMode === 'multi'}
                  onClick={() => setPlannerMode('multi')}
                >
                  Multi Agent
                </S.ModeTab>
              </S.ModeTabs>
            </S.FormSection>

            <S.FormSection>
              <S.SectionLabel>Feature Description</S.SectionLabel>
              <S.TextArea
                value={featureDescription}
                onChange={(e) => setFeatureDescription(e.target.value)}
                placeholder="Describe the feature you want to implement..."
                rows={4}
                autoFocus
                disabled={isPlanning}
              />
              <S.CharacterCount>
                {featureDescription.length} / 1000 characters
              </S.CharacterCount>
            </S.FormSection>

            {/* Screenshot Section */}
            <S.FormSection>
              <S.SectionLabel>Screenshots (Optional)</S.SectionLabel>
              <S.ScreenshotContainer>
                {screenshots.length > 0 && (
                  <S.ScreenshotGrid>
                    {screenshots.map((screenshot) => (
                      <S.ScreenshotItem key={screenshot.id}>
                        <S.ScreenshotImage src={screenshot.preview} alt={screenshot.name} />
                        <S.ScreenshotOverlay>
                          <S.ScreenshotName>{screenshot.name}</S.ScreenshotName>
                          <S.RemoveButton
                            onClick={() => removeScreenshot(screenshot.id)}
                            title="Remove screenshot"
                          >
                            <X className="w-4 h-4" />
                          </S.RemoveButton>
                        </S.ScreenshotOverlay>
                      </S.ScreenshotItem>
                    ))}
                  </S.ScreenshotGrid>
                )}
                <S.ScreenshotActions>
                  <S.ScreenshotButton
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload screenshot"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload</span>
                  </S.ScreenshotButton>
                  <S.ScreenshotHint>
                    or paste from clipboard (Ctrl/Cmd+V)
                  </S.ScreenshotHint>
                </S.ScreenshotActions>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileSelect}
                />
              </S.ScreenshotContainer>
            </S.FormSection>

            {plannerMode === 'multi' && (
              <S.FormSection>
                <S.SectionLabel>Select AI Agents</S.SectionLabel>
                <S.AgentGrid>
                {agentOptions.map((agent) => {
                  const Icon = agent.icon;
                  const isSelected = selectedAgents.includes(agent.id);
                  
                  return (
                    <S.AgentCard
                      key={agent.id}
                      selected={isSelected}
                      onClick={() => handleAgentToggle(agent.id)}
                      disabled={isPlanning}
                    >
                      <S.AgentHeader>
                        <Icon className="w-4 h-4" />
                        <S.AgentName>{agent.name}</S.AgentName>
                        <S.AgentCheckbox checked={isSelected} />
                      </S.AgentHeader>
                      <S.AgentDescription>
                        {agent.description}
                      </S.AgentDescription>
                    </S.AgentCard>
                  );
                })}
                </S.AgentGrid>
              </S.FormSection>
            )}

            <S.FormSection>
              <S.AutoGenerateToggle>
                <S.ToggleCheckbox
                  type="checkbox"
                  id="autoGenerate"
                  checked={autoGenerateCode}
                  onChange={(e) => setAutoGenerateCode(e.target.checked)}
                />
                <S.ToggleLabel htmlFor="autoGenerate">
                  Auto generate code changes
                </S.ToggleLabel>
              </S.AutoGenerateToggle>
            </S.FormSection>
          </>
        ) : (
          <S.PlanningSection>
            <S.ProgressHeader>
              <S.ProgressTitle>Planning in Progress</S.ProgressTitle>
              {plannerState.progress && (
                <S.ProgressPercentage>
                  {Math.round(plannerState.progress.progressPercentage)}%
                </S.ProgressPercentage>
              )}
            </S.ProgressHeader>
            
            {plannerState.progress && (
              <S.ProgressBar>
                <S.ProgressFill 
                  width={plannerState.progress.progressPercentage}
                />
              </S.ProgressBar>
            )}

            <S.AgentStatusGrid>
              {selectedAgents.map((agentId) => {
                const agent = agentOptions.find(a => a.id === agentId);
                const status = getAgentStatus(agentId);
                const result = agentResults.find(r => r.agentType === agentId);
                
                return (
                  <S.AgentStatusCard key={agentId} status={status}>
                    <S.AgentStatusHeader>
                      {getStatusIcon(status)}
                      <S.AgentStatusName>{agent.name}</S.AgentStatusName>
                      {result && result.duration && (
                        <S.AgentDuration>
                          {Math.round(result.duration / 1000)}s
                        </S.AgentDuration>
                      )}
                    </S.AgentStatusHeader>
                    
                    {result && result.output && (
                      <S.AgentOutput>
                        {result.output.substring(0, 150)}...
                      </S.AgentOutput>
                    )}
                  </S.AgentStatusCard>
                );
              })}
            </S.AgentStatusGrid>

            {error && (
              <S.ErrorMessage>
                <AlertCircle className="w-4 h-4" />
                <div>
                  <div>{error}</div>
                  {getErrorHelp(error) && (
                    <S.ErrorHelp>{getErrorHelp(error)}</S.ErrorHelp>
                  )}
                </div>
              </S.ErrorMessage>
            )}
          </S.PlanningSection>
        )}

        {finalPlan && (
          <S.PlanResultSection>
            <S.PlanHeader>
              <CheckCircle className="w-4 h-4 text-green-500" />
              Planning Complete
            </S.PlanHeader>
            <S.PlanPreview>
              {finalPlan.substring(0, 300)}...
            </S.PlanPreview>
          </S.PlanResultSection>
        )}
        
        <S.FormActions>
          {!isPlanning && !finalPlan && (
            <>
              <Button
                size="sm"
                onClick={handleStartPlanning}
                disabled={!featureDescription.trim() || selectedAgents.length === 0}
                className="flex-1 h-8 text-xs hover:bg-primary/90 transition-colors"
              >
                Create Plan (⌘ + ↩)
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                className="h-8 text-xs hover:bg-accent transition-colors"
              >
                Cancel
              </Button>
            </>
          )}
          
          {isPlanning && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={cancelPlanning}
                className="flex-1 h-8 text-xs hover:bg-destructive/10 transition-colors"
              >
                Cancel Planning
              </Button>
            </>
          )}
          
          {finalPlan && (
            <>
              <Button
                size="sm"
                onClick={createSessionFromPlan}
                className="flex-1 h-8 text-xs hover:bg-primary/90 transition-colors"
              >
                Execute in Claude
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onClose}
                className="h-8 text-xs hover:bg-accent transition-colors"
              >
                Close
              </Button>
            </>
          )}
        </S.FormActions>
      </S.DesktopForm>
      
      {/* Mobile Form */}
      <S.MobileOverlay>
        <S.MobileModal>
          <S.MobileHeader>
            <S.MobileHeaderContent>
              <S.MobileIconWrapper>
                <Brain className="w-5 h-5 text-primary" />
              </S.MobileIconWrapper>
              <div>
                <S.MobileTitle>Plan Feature</S.MobileTitle>
                {selectedProject && selectedProject.displayName && (
                  <S.MobileSubtitle>{selectedProject.displayName}</S.MobileSubtitle>
                )}
              </div>
            </S.MobileHeaderContent>
            <S.MobileCloseButton
              onClick={onClose}
              disabled={isPlanning}
            >
              <X className="w-3 h-3" />
            </S.MobileCloseButton>
          </S.MobileHeader>
          
          <S.MobileFormContent>
            {!isPlanning ? (
              <>
                <S.MobileSection>
                  <S.ModeTabs>
                    <S.ModeTab 
                      active={plannerMode === 'single'}
                      onClick={() => setPlannerMode('single')}
                    >
                      Single Agent
                    </S.ModeTab>
                    <S.ModeTab 
                      active={plannerMode === 'multi'}
                      onClick={() => setPlannerMode('multi')}
                    >
                      Multi Agent
                    </S.ModeTab>
                  </S.ModeTabs>
                </S.MobileSection>

                <S.MobileSection>
                  <S.MobileSectionLabel>Feature Description</S.MobileSectionLabel>
                  <S.MobileTextArea
                    value={featureDescription}
                    onChange={(e) => setFeatureDescription(e.target.value)}
                    placeholder="Describe the feature you want to implement..."
                    rows={4}
                    disabled={isPlanning}
                  />
                  <S.MobileCharacterCount>
                    {featureDescription.length} / 1000
                  </S.MobileCharacterCount>
                </S.MobileSection>

                {/* Mobile Screenshot Section */}
                <S.MobileSection>
                  <S.MobileSectionLabel>Add Screenshots</S.MobileSectionLabel>
                  {screenshots.length > 0 && (
                    <S.MobileScreenshotGrid>
                      {screenshots.map((screenshot) => (
                        <S.MobileScreenshotItem key={screenshot.id}>
                          <S.MobileScreenshotImage src={screenshot.preview} alt={screenshot.name} />
                          <S.MobileRemoveButton
                            onClick={() => removeScreenshot(screenshot.id)}
                          >
                            <X className="w-3 h-3" />
                          </S.MobileRemoveButton>
                        </S.MobileScreenshotItem>
                      ))}
                    </S.MobileScreenshotGrid>
                  )}
                  <S.MobileScreenshotActions>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 h-10 flex items-center justify-center gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Add Screenshot
                    </Button>
                  </S.MobileScreenshotActions>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />
                </S.MobileSection>

                {plannerMode === 'multi' && (
                  <S.MobileSection>
                    <S.MobileSectionLabel>Select AI Agents</S.MobileSectionLabel>
                    <S.MobileAgentGrid>
                    {agentOptions.map((agent) => {
                      const Icon = agent.icon;
                      const isSelected = selectedAgents.includes(agent.id);
                      
                      return (
                        <S.MobileAgentCard
                          key={agent.id}
                          selected={isSelected}
                          onClick={() => handleAgentToggle(agent.id)}
                          disabled={isPlanning}
                        >
                          <S.MobileAgentHeader>
                            <Icon className="w-4 h-4" />
                            <S.MobileAgentName>{agent.name}</S.MobileAgentName>
                            <S.MobileAgentCheckbox checked={isSelected} />
                          </S.MobileAgentHeader>
                          <S.MobileAgentDescription>
                            {agent.description}
                          </S.MobileAgentDescription>
                        </S.MobileAgentCard>
                      );
                    })}
                    </S.MobileAgentGrid>
                  </S.MobileSection>
                )}

                <S.MobileSection>
                  <S.AutoGenerateToggle>
                    <S.ToggleCheckbox
                      type="checkbox"
                      id="mobileAutoGenerate"
                      checked={autoGenerateCode}
                      onChange={(e) => setAutoGenerateCode(e.target.checked)}
                    />
                    <S.ToggleLabel htmlFor="mobileAutoGenerate">
                      Auto generate code changes
                    </S.ToggleLabel>
                  </S.AutoGenerateToggle>
                </S.MobileSection>
              </>
            ) : (
              <S.MobilePlanningSection>
                <S.MobileProgressHeader>
                  <S.MobileProgressTitle>Planning in Progress</S.MobileProgressTitle>
                  {plannerState.progress && (
                    <S.MobileProgressPercentage>
                      {Math.round(plannerState.progress.progressPercentage)}%
                    </S.MobileProgressPercentage>
                  )}
                </S.MobileProgressHeader>
                
                {plannerState.progress && (
                  <S.MobileProgressBar>
                    <S.MobileProgressFill 
                      width={plannerState.progress.progressPercentage}
                    />
                  </S.MobileProgressBar>
                )}

                <S.MobileAgentStatusList>
                  {selectedAgents.map((agentId) => {
                    const agent = agentOptions.find(a => a.id === agentId);
                    const status = getAgentStatus(agentId);
                    const result = agentResults.find(r => r.agentType === agentId);
                    
                    return (
                      <S.MobileAgentStatusItem key={agentId} status={status}>
                        <S.MobileAgentStatusHeader>
                          {getStatusIcon(status)}
                          <S.MobileAgentStatusName>{agent.name}</S.MobileAgentStatusName>
                          {result && result.duration && (
                            <S.MobileAgentDuration>
                              {Math.round(result.duration / 1000)}s
                            </S.MobileAgentDuration>
                          )}
                        </S.MobileAgentStatusHeader>
                      </S.MobileAgentStatusItem>
                    );
                  })}
                </S.MobileAgentStatusList>

                {error && (
                  <S.MobileErrorMessage>
                    <AlertCircle className="w-4 h-4" />
                    <div>
                      <div>{error}</div>
                      {getErrorHelp(error) && (
                        <S.MobileErrorHelp>{getErrorHelp(error)}</S.MobileErrorHelp>
                      )}
                    </div>
                  </S.MobileErrorMessage>
                )}
              </S.MobilePlanningSection>
            )}

            {finalPlan && (
              <S.MobilePlanResult>
                <S.MobilePlanHeader>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Planning Complete
                </S.MobilePlanHeader>
                <S.MobilePlanPreview>
                  {finalPlan.substring(0, 200)}...
                </S.MobilePlanPreview>
              </S.MobilePlanResult>
            )}
            
            <S.MobileActions>
              {!isPlanning && !finalPlan && (
                <>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 h-9 text-sm rounded-md active:scale-95 transition-transform"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleStartPlanning}
                    disabled={!featureDescription.trim() || selectedAgents.length === 0}
                    className="flex-1 h-9 text-sm rounded-md bg-primary hover:bg-primary/90 active:scale-95 transition-all"
                  >
                    Create Plan
                  </Button>
                </>
              )}
              
              {isPlanning && (
                <Button
                  onClick={cancelPlanning}
                  variant="outline"
                  className="w-full h-9 text-sm rounded-md active:scale-95 transition-transform"
                >
                  Cancel Planning
                </Button>
              )}
              
              {finalPlan && (
                <>
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 h-9 text-sm rounded-md active:scale-95 transition-transform"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={createSessionFromPlan}
                    className="flex-1 h-9 text-sm rounded-md bg-primary hover:bg-primary/90 active:scale-95 transition-all"
                  >
                    Execute in Claude
                  </Button>
                </>
              )}
            </S.MobileActions>
          </S.MobileFormContent>
          
          <S.SafeArea />
        </S.MobileModal>
      </S.MobileOverlay>
    </S.Container>
  );
};