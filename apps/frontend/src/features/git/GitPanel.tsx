import React from 'react';
import {
  RefreshCw,
  FileText,
  History,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import {useGitPanel} from '@/features/git/GitPanel.hook';
import {BranchSelector} from '@/features/git/BranchSelector';
import {CommitMessage} from '@/features/git/CommitMessage';
import {FileList} from '@/features/git/FileList';
import {CommitHistory} from '@/features/git/CommitHistory';
import {NewBranchModal} from '@/features/git/NewBranchModal';
import {GitInitPanel} from '@/features/git/GitInitPanel';
import {getStatusLabel} from '@/features/git/GitPanel.logic';
import {MinimalErrorBoundary} from '@/shared-components/ErrorBoundary';
import {GitPanelProps, GitStatus} from './GitPanel.types';
import {
  GitPanelContainer,
  GitPanelHeader,
  RefreshButton,
  TabContainer,
  TabButton,
  TabContent,
  FileSelectionBar,
  FileSelectionText,
  SelectionActions,
  SelectionButton,
  Divider,
  LegendToggle,
  LegendButton,
  LegendContent,
  LegendGrid,
  LegendItem,
  StatusBadge,
  EmptyStateContainer,
  EmptyStateText,
} from '@/features/git/GitPanel.styles';

interface GitPanelComponentProps extends GitPanelProps {
  isMobile?: boolean;
  gitStatus?: GitStatus;
  onGitStatusChange?: (status: GitStatus) => void;
}

export const GitPanel: React.FC<GitPanelComponentProps> = ({
  selectedProject,
  isMobile,
  gitStatus: externalGitStatus,
  onGitStatusChange,
}) => {
  const {
    // State
    gitStatus,
    gitDiff,
    isLoading,
    commitMessage,
    expandedFiles,
    selectedFiles,
    isCommitting,
    currentBranch,
    branches,
    wrapText,
    showLegend,
    showBranchDropdown,
    showNewBranchModal,
    newBranchName,
    isCreatingBranch,
    activeView,
    recentCommits,
    expandedCommits,
    commitDiffs,
    isGeneratingMessage,
    error,
    isCreatingPR,
    prUrl,
    prError,

    // Refs
    textareaRef,
    dropdownRef,

    // Setters
    setCommitMessage,
    setWrapText,
    setShowLegend,
    setShowBranchDropdown,
    setShowNewBranchModal,
    setNewBranchName,
    setActiveView,

    // Actions
    switchBranch,
    createBranch,
    generateCommitMessage,
    handleCommit,
    toggleFileExpanded,
    toggleCommitExpanded,
    toggleFileSelected,
    selectAllFiles,
    deselectAllFiles,
    createPullRequest,
    refresh,
  } = useGitPanel(selectedProject, externalGitStatus, onGitStatusChange);

  if (!selectedProject) {
    return (
      <EmptyStateContainer>
        <EmptyStateText>Select a project to view source control</EmptyStateText>
      </EmptyStateContainer>
    );
  }

  if (error) {
    // Check if this is a "not a git repository" error and project can initialize git
    if (
      error.includes('not a git repository') &&
      selectedProject?.canInitializeGit
    ) {
      return (
        <GitInitPanel
          selectedProject={selectedProject}
          onGitInitialized={refresh}
        />
      );
    }

    return (
      <EmptyStateContainer>
        <EmptyStateText style={{color: '#ef4444'}}>Git Error</EmptyStateText>
        <EmptyStateText style={{marginTop: '8px', fontSize: '14px'}}>
          {error}
        </EmptyStateText>
        {error.includes('not a git repository') &&
          !selectedProject?.canInitializeGit && (
            <EmptyStateText
              style={{marginTop: '16px', fontSize: '13px', color: '#6b7280'}}
            >
              This project is part of a larger repository or cannot initialize
              Git
            </EmptyStateText>
          )}
        {error.includes('Project not found') && (
          <EmptyStateText
            style={{marginTop: '16px', fontSize: '13px', color: '#6b7280'}}
          >
            Make sure the project path exists and is accessible
          </EmptyStateText>
        )}
        <RefreshButton
          onClick={refresh}
          style={{marginTop: '16px'}}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span style={{marginLeft: '8px'}}>Retry</span>
        </RefreshButton>
      </EmptyStateContainer>
    );
  }

  // Show GitInitPanel if no git status and project can initialize git
  if (!gitStatus && !isLoading && selectedProject?.canInitializeGit) {
    return (
      <GitInitPanel
        selectedProject={selectedProject}
        onGitInitialized={refresh}
      />
    );
  }

  const totalFiles =
    (gitStatus?.modified?.length || 0) +
    (gitStatus?.added?.length || 0) +
    (gitStatus?.deleted?.length || 0) +
    (gitStatus?.untracked?.length || 0);

  return (
    <MinimalErrorBoundary name="GitPanel">
      <GitPanelContainer>
        {/* Header */}
        <GitPanelHeader>
          <BranchSelector
            currentBranch={currentBranch}
            branches={branches}
            showDropdown={showBranchDropdown}
            onToggleDropdown={() => setShowBranchDropdown(!showBranchDropdown)}
            onSwitchBranch={switchBranch}
            onCreateNewBranch={() => {
              setShowNewBranchModal(true);
              setShowBranchDropdown(false);
            }}
            dropdownRef={dropdownRef}
          />

          {selectedProject?.isWorktree && (
            <RefreshButton
              onClick={() => createPullRequest('main')}
              disabled={isCreatingPR}
              title="Create Pull Request"
            >
              {isCreatingPR ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <ExternalLink className="w-4 h-4" />
              )}
              <span style={{marginLeft: '8px'}}>
                {isCreatingPR ? 'Creating...' : 'Create PR'}
              </span>
            </RefreshButton>
          )}

          <RefreshButton onClick={refresh} disabled={isLoading}>
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </RefreshButton>
        </GitPanelHeader>

        {/* Tab Navigation */}
        <TabContainer>
          <TabButton
            onClick={() => setActiveView('changes')}
            isActive={activeView === 'changes'}
          >
            <TabContent>
              <FileText className="w-4 h-4" />
              <span>Changes</span>
            </TabContent>
          </TabButton>
          <TabButton
            onClick={() => setActiveView('history')}
            isActive={activeView === 'history'}
          >
            <TabContent>
              <History className="w-4 h-4" />
              <span>History</span>
            </TabContent>
          </TabButton>
        </TabContainer>

        {/* Changes View */}
        {activeView === 'changes' && (
          <>
            {/* Commit Message */}
            <CommitMessage
              commitMessage={commitMessage}
              onCommitMessageChange={setCommitMessage}
              onGenerateMessage={generateCommitMessage}
              onCommit={handleCommit}
              onTranscript={setCommitMessage}
              selectedFilesCount={selectedFiles.size}
              isCommitting={isCommitting}
              isGeneratingMessage={isGeneratingMessage}
              textareaRef={textareaRef}
            />

            {/* File Selection Controls */}
            {gitStatus && (
              <FileSelectionBar>
                <FileSelectionText>
                  {selectedFiles.size} of {totalFiles} files selected
                </FileSelectionText>
                <SelectionActions>
                  <SelectionButton onClick={selectAllFiles}>
                    Select All
                  </SelectionButton>
                  <Divider>|</Divider>
                  <SelectionButton onClick={deselectAllFiles}>
                    Deselect All
                  </SelectionButton>
                </SelectionActions>
              </FileSelectionBar>
            )}

            {/* Status Legend */}
            <LegendToggle>
              <LegendButton onClick={() => setShowLegend(!showLegend)}>
                <Info className="w-3 h-3" />
                <span>File Status Guide</span>
                {showLegend ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </LegendButton>

              {showLegend && (
                <LegendContent>
                  <LegendGrid isMobile={isMobile}>
                    <LegendItem>
                      <StatusBadge status="M">M</StatusBadge>
                      <span className="text-gray-600 dark:text-gray-400 italic">
                        Modified
                      </span>
                    </LegendItem>
                    <LegendItem>
                      <StatusBadge status="A">A</StatusBadge>
                      <span className="text-gray-600 dark:text-gray-400 italic">
                        Added
                      </span>
                    </LegendItem>
                    <LegendItem>
                      <StatusBadge status="D">D</StatusBadge>
                      <span className="text-gray-600 dark:text-gray-400 italic">
                        Deleted
                      </span>
                    </LegendItem>
                    <LegendItem>
                      <StatusBadge status="U">U</StatusBadge>
                      <span className="text-gray-600 dark:text-gray-400 italic">
                        Untracked
                      </span>
                    </LegendItem>
                  </LegendGrid>
                </LegendContent>
              )}
            </LegendToggle>

            {/* File List */}
            <FileList
              gitStatus={gitStatus}
              gitDiff={gitDiff}
              expandedFiles={expandedFiles}
              selectedFiles={selectedFiles}
              isLoading={isLoading}
              isMobile={isMobile}
              wrapText={wrapText}
              onToggleFileExpanded={toggleFileExpanded}
              onToggleFileSelected={toggleFileSelected}
              onToggleWrapText={() => setWrapText(!wrapText)}
            />
          </>
        )}

        {/* History View */}
        {activeView === 'history' && (
          <CommitHistory
            recentCommits={recentCommits}
            expandedCommits={expandedCommits}
            commitDiffs={commitDiffs}
            isLoading={isLoading}
            isMobile={isMobile}
            onToggleCommitExpanded={toggleCommitExpanded}
          />
        )}

        {/* New Branch Modal */}
        <NewBranchModal
          show={showNewBranchModal}
          currentBranch={currentBranch}
          newBranchName={newBranchName}
          isCreating={isCreatingBranch}
          onClose={() => {
            setShowNewBranchModal(false);
            setNewBranchName('');
          }}
          onBranchNameChange={setNewBranchName}
          onCreate={createBranch}
        />
      </GitPanelContainer>
    </MinimalErrorBoundary>
  );
};
