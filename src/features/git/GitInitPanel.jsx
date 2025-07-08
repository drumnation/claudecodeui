import React, { useState } from 'react';
import { GitBranch, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { createLogger } from '@kit/logger/browser';
import * as S from './GitInitPanel.styles';

const logger = createLogger({ scope: 'git-init-panel' });

export const GitInitPanel = ({ selectedProject, onGitInitialized }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initResult, setInitResult] = useState(null);
  const [error, setError] = useState(null);

  const handleInitializeGit = async () => {
    if (!selectedProject) return;

    setIsInitializing(true);
    setError(null);
    setInitResult(null);

    try {
      logger.info('Initializing git repository', {
        projectName: selectedProject.name,
        projectPath: selectedProject.fullPath
      });

      const encodedProjectName = encodeURIComponent(selectedProject.name);
      const response = await fetch(`/api/projects/${encodedProjectName}/git/init`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      logger.info('Git repository initialized successfully', result);
      
      setInitResult(result);
      
      // Notify parent component that git was initialized
      if (onGitInitialized) {
        onGitInitialized();
      }

    } catch (err) {
      logger.error('Failed to initialize git repository', {
        error: err.message,
        projectName: selectedProject.name
      });
      setError(err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  if (!selectedProject || !selectedProject.canInitializeGit) {
    return null;
  }

  return (
    <S.InitPanelContainer>
      <S.InitPanelHeader>
        <GitBranch size={20} />
        <S.HeaderText>Initialize Git Repository</S.HeaderText>
      </S.InitPanelHeader>

      <S.InitPanelContent>
        <S.InfoText>
          This project doesn't have a Git repository yet. Initialize one to start tracking changes and collaborating.
        </S.InfoText>

        {error && (
          <S.ErrorMessage>
            <AlertCircle size={16} />
            <span>Failed to initialize: {error}</span>
          </S.ErrorMessage>
        )}

        {initResult && (
          <S.SuccessMessage>
            <CheckCircle size={16} />
            <div>
              <S.SuccessTitle>Git repository initialized successfully!</S.SuccessTitle>
              <S.SuccessDetails>
                {initResult.details?.initialCommit && (
                  <div>✓ Created initial commit</div>
                )}
                {initResult.details?.gitignoreCreated && (
                  <div>✓ Created .gitignore file</div>
                )}
              </S.SuccessDetails>
            </div>
          </S.SuccessMessage>
        )}

        <S.InitButton 
          onClick={handleInitializeGit}
          disabled={isInitializing || !!initResult}
        >
          {isInitializing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Initializing...
            </>
          ) : initResult ? (
            <>
              <CheckCircle size={16} />
              Repository Initialized
            </>
          ) : (
            <>
              <GitBranch size={16} />
              Initialize Git Repository
            </>
          )}
        </S.InitButton>

        <S.BenefitsList>
          <S.BenefitItem>• Track file changes and history</S.BenefitItem>
          <S.BenefitItem>• Create commits and branches</S.BenefitItem>
          <S.BenefitItem>• Collaborate with others</S.BenefitItem>
          <S.BenefitItem>• Backup and sync your work</S.BenefitItem>
        </S.BenefitsList>
      </S.InitPanelContent>
    </S.InitPanelContainer>
  );
};