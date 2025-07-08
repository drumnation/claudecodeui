import React from 'react';
import { X, Plus, Settings, Shield, AlertTriangle, Moon, Sun, Terminal, Brain } from 'lucide-react';
import { Button } from '@/shared-components/Button';
import { useToolsSettings } from '@/features/settings/ToolsSettings.hook';
import { commonTools } from '@/features/settings/ToolsSettings.logic';
import { ToolCard } from '@/features/settings/components/ToolCard';
import { ThemeToggle } from '@/shared-components/ThemeToggle';
import { SettingToggle } from '@/features/settings/components/SettingToggle';
import { ToolInputSection } from '@/features/settings/components/ToolInputSection';
import {
  ModalBackdrop,
  ModalContainer,
  ModalHeader,
  HeaderTitle,
  HeaderIcon,
  Title,
  ModalContent,
  ContentInner,
  Section,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  QuickAddContainer,
  QuickAddLabel,
  QuickAddGrid,
  ToolList,
  EmptyState,
  HelpContainer,
  HelpTitle,
  HelpList,
  HelpCode,
  ModalFooter,
  FooterStatus,
  FooterActions,
  StatusMessage,
  StatusIcon,
  LoadingSpinner,
  ButtonText
} from '@/features/settings/ToolsSettings.styles';

export const ToolsSettings = ({ isOpen, onClose }) => {
  const {
    // Theme
    isDarkMode,
    toggleDarkMode,
    
    // State
    allowedTools,
    disallowedTools,
    newAllowedTool,
    setNewAllowedTool,
    newDisallowedTool,
    setNewDisallowedTool,
    skipPermissions,
    isSaving,
    saveStatus,
    
    // Claude CLI state
    claudeCliPath,
    claudeCliStatus,
    claudeCliTesting,
    setClaudeCliPath,
    
    // Planner state
    plannerEnabled,
    selectedAgents,
    codeqaiEnabled,
    codeqaiStatus,
    contextLimits,
    codeqaiEmbeddingModel,
    codeqaiUseLocalLLM,
    setCodeqaiEmbeddingModel,
    setCodeqaiUseLocalLLM,
    
    // Actions
    handleAddAllowedTool,
    handleRemoveAllowedTool,
    handleAddDisallowedTool,
    handleRemoveDisallowedTool,
    handleAllowedToolKeyPress,
    handleDisallowedToolKeyPress,
    handleSkipPermissionsChange,
    saveSettings,
    
    // Claude CLI actions
    handleTestClaudeCli,
    handleSaveClaudeCliPath,
    
    // Planner actions
    togglePlanner,
    toggleAgent,
    toggleCodeQAI,
    updateContextLimits
  } = useToolsSettings(isOpen, onClose);

  if (!isOpen) return null;

  return (
    <ModalBackdrop className="modal-backdrop">
      <ModalContainer>
        <ModalHeader>
          <HeaderTitle>
            <Settings as={HeaderIcon} />
            <Title>Tools Settings</Title>
          </HeaderTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground touch-manipulation"
          >
            <X className="w-5 h-5" />
          </Button>
        </ModalHeader>

        <ModalContent>
          <ContentInner>
            {/* Theme Settings */}
            <Section>
              <SectionHeader>
                {isDarkMode ? <Moon className="w-5 h-5 text-blue-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                <SectionTitle>Appearance</SectionTitle>
              </SectionHeader>
              <ThemeToggle />
            </Section>
            
            {/* Skip Permissions */}
            <Section>
              <SectionHeader>
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <SectionTitle>Permission Settings</SectionTitle>
              </SectionHeader>
              <SettingToggle
                checked={skipPermissions}
                onChange={handleSkipPermissionsChange}
                title="Skip permission prompts (use with caution)"
                description="Equivalent to --dangerously-skip-permissions flag"
              />
            </Section>

            {/* Claude CLI Configuration */}
            <Section>
              <SectionHeader>
                <Terminal className="w-5 h-5 text-blue-500" />
                <SectionTitle>Claude CLI Configuration</SectionTitle>
              </SectionHeader>
              <SectionDescription>
                Configure custom path to Claude CLI executable (optional)
              </SectionDescription>
              
              {/* Current Status */}
              <div className="mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Status:</span>
                  {claudeCliStatus?.available ? (
                    <span className="text-green-600 dark:text-green-400 text-sm">✓ Claude CLI Found</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400 text-sm">✗ Claude CLI Not Found</span>
                  )}
                </div>
                {claudeCliStatus?.path && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Path: {claudeCliStatus.path}
                  </div>
                )}
                {claudeCliStatus?.error && (
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                    {claudeCliStatus.error}
                  </div>
                )}
              </div>

              {/* Path Input */}
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Custom Claude CLI Path (optional)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={claudeCliPath}
                      onChange={(e) => setClaudeCliPath(e.target.value)}
                      placeholder="/path/to/claude or leave empty for system PATH"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                    />
                    <Button
                      onClick={handleTestClaudeCli}
                      disabled={claudeCliTesting}
                      variant="outline"
                      size="sm"
                      className="whitespace-nowrap"
                    >
                      {claudeCliTesting ? 'Testing...' : 'Test'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty to use system PATH. Path must be absolute and point to executable file.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveClaudeCliPath}
                    disabled={isSaving}
                    variant="outline"
                    size="sm"
                  >
                    Save Path
                  </Button>
                  <Button
                    onClick={() => setClaudeCliPath('')}
                    variant="outline"
                    size="sm"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Help Text */}
              <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  <strong>When to use custom path:</strong>
                </p>
                <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                  <li>• Claude CLI installed in non-standard location</li>
                  <li>• Running in Docker containers</li>
                  <li>• Claude CLI not in system PATH</li>
                  <li>• Multiple Claude CLI versions installed</li>
                </ul>
              </div>
            </Section>

            {/* Multi-Agent Planner */}
            <Section>
              <SectionHeader>
                <Brain className="w-5 h-5 text-purple-500" />
                <SectionTitle>Multi-Agent Planner</SectionTitle>
              </SectionHeader>
              <SectionDescription>
                Configure the AI-powered feature planning system with specialized agents
              </SectionDescription>
              
              <div className="space-y-4">
                {/* Enable Planner */}
                <SettingToggle
                  checked={plannerEnabled}
                  onChange={togglePlanner}
                  title="Enable Multi-Agent Planner"
                  description="Allow AI agents to analyze and plan features for your projects"
                />

                {plannerEnabled && (
                  <>
                    {/* Agent Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-3">
                        Default Agents
                      </label>
                      <div className="space-y-2">
                        <SettingToggle
                          checked={selectedAgents.includes('ARCH')}
                          onChange={() => toggleAgent('ARCH')}
                          title="ARCH Agent"
                          description="Analyzes system architecture and design patterns"
                        />
                        <SettingToggle
                          checked={selectedAgents.includes('DIFF')}
                          onChange={() => toggleAgent('DIFF')}
                          title="DIFF Agent"
                          description="Identifies files and components that need modification"
                        />
                        <SettingToggle
                          checked={selectedAgents.includes('DEPS')}
                          onChange={() => toggleAgent('DEPS')}
                          title="DEPS Agent"
                          description="Analyzes external and internal dependency requirements"
                        />
                      </div>
                    </div>

                    {/* CodeQAI Integration */}
                    <div>
                      <SettingToggle
                        checked={codeqaiEnabled}
                        onChange={toggleCodeQAI}
                        title="CodeQAI Integration"
                        description="Use semantic code search to provide context to agents"
                      />
                      
                      {codeqaiEnabled && (
                        <div className="ml-6 mt-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Status:</span>
                            {codeqaiStatus?.available ? (
                              <span className="text-green-600 dark:text-green-400 text-sm">✓ CodeQAI Available</span>
                            ) : (
                              <span className="text-red-600 dark:text-red-400 text-sm">✗ CodeQAI Not Found</span>
                            )}
                          </div>
                          {!codeqaiStatus?.available && (
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                              Install CodeQAI: pip install codeqai
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Embedding Model Configuration */}
                    {codeqaiEnabled && (
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Embedding Model
                        </label>
                        <select
                          value={codeqaiEmbeddingModel}
                          onChange={(e) => setCodeqaiEmbeddingModel(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        >
                          <option value="sentence-transformers">Sentence Transformers (Local)</option>
                          <option value="instructor">Instructor Embeddings (Local)</option>
                          <option value="openai">OpenAI Embeddings</option>
                          <option value="azure">Azure OpenAI</option>
                          <option value="anthropic">Anthropic Embeddings</option>
                        </select>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {codeqaiEmbeddingModel === 'sentence-transformers' && 'Fast local embeddings, no API key required'}
                          {codeqaiEmbeddingModel === 'instructor' && 'High-quality local embeddings, no API key required'}
                          {codeqaiEmbeddingModel === 'openai' && 'Requires OpenAI API key'}
                          {codeqaiEmbeddingModel === 'azure' && 'Requires Azure OpenAI configuration'}
                          {codeqaiEmbeddingModel === 'anthropic' && 'Requires Anthropic API key'}
                        </p>
                        
                        {/* Local LLM Option */}
                        <div className="mt-3">
                          <SettingToggle
                            checked={codeqaiUseLocalLLM}
                            onChange={() => setCodeqaiUseLocalLLM(!codeqaiUseLocalLLM)}
                            title="Use Local LLM for Chat"
                            description="Use llama.cpp or Ollama for CodeQAI chat instead of cloud APIs"
                          />
                        </div>
                      </div>
                    )}

                    {/* Context Limits */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Context Limits
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Max Results per Agent
                          </label>
                          <input
                            type="number"
                            value={contextLimits.maxResults}
                            onChange={(e) => updateContextLimits('maxResults', parseInt(e.target.value) || 8)}
                            min="1"
                            max="20"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Snippet Length (chars)
                          </label>
                          <input
                            type="number"
                            value={contextLimits.snippetLength}
                            onChange={(e) => updateContextLimits('snippetLength', parseInt(e.target.value) || 500)}
                            min="100"
                            max="2000"
                            step="100"
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Help Text */}
              <div className="mt-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                  <strong>About Multi-Agent Planning:</strong>
                </p>
                <ul className="text-xs text-purple-600 dark:text-purple-400 space-y-1">
                  <li>• ARCH Agent analyzes system architecture and suggests design patterns</li>
                  <li>• DIFF Agent identifies what files and components need changes</li>
                  <li>• DEPS Agent analyzes dependency requirements and compatibility</li>
                  <li>• CodeQAI provides semantic code search for better context</li>
                </ul>
              </div>
            </Section>

            {/* Allowed Tools */}
            <Section>
              <SectionHeader>
                <Shield className="w-5 h-5 text-green-500" />
                <SectionTitle>Allowed Tools</SectionTitle>
              </SectionHeader>
              <SectionDescription>
                Tools that are automatically allowed without prompting for permission
              </SectionDescription>
              
              <ToolInputSection
                value={newAllowedTool}
                onChange={setNewAllowedTool}
                onAdd={handleAddAllowedTool}
                onKeyPress={handleAllowedToolKeyPress}
                placeholder='e.g., "Bash(git log:*)" or "Write"'
              />

              {/* Common tools quick add */}
              <QuickAddContainer>
                <QuickAddLabel>Quick add common tools:</QuickAddLabel>
                <QuickAddGrid>
                  {commonTools.map(tool => (
                    <Button
                      key={tool}
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddAllowedTool(tool)}
                      disabled={allowedTools.includes(tool)}
                      className="text-xs h-8 touch-manipulation truncate"
                    >
                      {tool}
                    </Button>
                  ))}
                </QuickAddGrid>
              </QuickAddContainer>

              <ToolList>
                {allowedTools.map(tool => (
                  <ToolCard
                    key={tool}
                    tool={tool}
                    variant="allowed"
                    onRemove={handleRemoveAllowedTool}
                  />
                ))}
                {allowedTools.length === 0 && (
                  <EmptyState>No allowed tools configured</EmptyState>
                )}
              </ToolList>
            </Section>

            {/* Disallowed Tools */}
            <Section>
              <SectionHeader>
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <SectionTitle>Disallowed Tools</SectionTitle>
              </SectionHeader>
              <SectionDescription>
                Tools that are automatically blocked without prompting for permission
              </SectionDescription>
              
              <ToolInputSection
                value={newDisallowedTool}
                onChange={setNewDisallowedTool}
                onAdd={handleAddDisallowedTool}
                onKeyPress={handleDisallowedToolKeyPress}
                placeholder='e.g., "Bash(rm:*)" or "Write"'
              />

              <ToolList>
                {disallowedTools.map(tool => (
                  <ToolCard
                    key={tool}
                    tool={tool}
                    variant="disallowed"
                    onRemove={handleRemoveDisallowedTool}
                  />
                ))}
                {disallowedTools.length === 0 && (
                  <EmptyState>No disallowed tools configured</EmptyState>
                )}
              </ToolList>
            </Section>

            {/* Help Section */}
            <HelpContainer>
              <HelpTitle>Tool Pattern Examples:</HelpTitle>
              <HelpList>
                <li><HelpCode>"Bash(git log:*)"</HelpCode> - Allow all git log commands</li>
                <li><HelpCode>"Bash(git diff:*)"</HelpCode> - Allow all git diff commands</li>
                <li><HelpCode>"Write"</HelpCode> - Allow all Write tool usage</li>
                <li><HelpCode>"Read"</HelpCode> - Allow all Read tool usage</li>
                <li><HelpCode>"Bash(rm:*)"</HelpCode> - Block all rm commands (dangerous)</li>
              </HelpList>
            </HelpContainer>
          </ContentInner>
        </ModalContent>

        <ModalFooter>
          <FooterStatus>
            {saveStatus === 'success' && (
              <StatusMessage $variant="success">
                <StatusIcon viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </StatusIcon>
                Settings saved successfully!
              </StatusMessage>
            )}
            {saveStatus === 'error' && (
              <StatusMessage $variant="error">
                <StatusIcon viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </StatusIcon>
                Failed to save settings
              </StatusMessage>
            )}
          </FooterStatus>
          <FooterActions>
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isSaving}
              className="flex-1 sm:flex-none h-10 touch-manipulation"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveSettings} 
              disabled={isSaving}
              className="flex-1 sm:flex-none h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 touch-manipulation"
            >
              {isSaving ? (
                <ButtonText>
                  <LoadingSpinner />
                  Saving...
                </ButtonText>
              ) : (
                'Save Settings'
              )}
            </Button>
          </FooterActions>
        </ModalFooter>
      </ModalContainer>
    </ModalBackdrop>
  );
};