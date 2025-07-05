import React from 'react';
import { X, Plus, Settings, Shield, AlertTriangle, Moon, Sun } from 'lucide-react';
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
    
    // Actions
    handleAddAllowedTool,
    handleRemoveAllowedTool,
    handleAddDisallowedTool,
    handleRemoveDisallowedTool,
    handleAllowedToolKeyPress,
    handleDisallowedToolKeyPress,
    handleSkipPermissionsChange,
    saveSettings
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