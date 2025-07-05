import React from 'react';
import { RefreshCw, FileText, History, Info, ChevronDown, ChevronRight } from 'lucide-react';
import { useGitPanel } from '@/features/git/GitPanel.hook';
import { BranchSelector } from '@/features/git/BranchSelector';
import { CommitMessage } from '@/features/git/CommitMessage';
import { FileList } from '@/features/git/FileList';
import { CommitHistory } from '@/features/git/CommitHistory';
import { NewBranchModal } from '@/features/git/NewBranchModal';
import { getStatusLabel } from '@/features/git/GitPanel.logic';
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
  EmptyStateText
} from '@/features/git/GitPanel.styles';

export const GitPanel = ({ selectedProject, isMobile }) => {
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
    refresh
  } = useGitPanel(selectedProject);

  if (!selectedProject) {
    return (
      <EmptyStateContainer>
        <EmptyStateText>Select a project to view source control</EmptyStateText>
      </EmptyStateContainer>
    );
  }

  const totalFiles = (gitStatus?.modified?.length || 0) + 
                    (gitStatus?.added?.length || 0) + 
                    (gitStatus?.deleted?.length || 0) + 
                    (gitStatus?.untracked?.length || 0);

  return (
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
        
        <RefreshButton
          onClick={refresh}
          disabled={isLoading}
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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
              {showLegend ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            </LegendButton>
            
            {showLegend && (
              <LegendContent>
                <LegendGrid isMobile={isMobile}>
                  <LegendItem>
                    <StatusBadge status="M">M</StatusBadge>
                    <span className="text-gray-600 dark:text-gray-400 italic">Modified</span>
                  </LegendItem>
                  <LegendItem>
                    <StatusBadge status="A">A</StatusBadge>
                    <span className="text-gray-600 dark:text-gray-400 italic">Added</span>
                  </LegendItem>
                  <LegendItem>
                    <StatusBadge status="D">D</StatusBadge>
                    <span className="text-gray-600 dark:text-gray-400 italic">Deleted</span>
                  </LegendItem>
                  <LegendItem>
                    <StatusBadge status="U">U</StatusBadge>
                    <span className="text-gray-600 dark:text-gray-400 italic">Untracked</span>
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
  );
};