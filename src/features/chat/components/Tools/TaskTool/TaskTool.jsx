import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { parseTaskContent, getTaskIcon, formatTaskTime } from '@/features/chat/components/Tools/TaskTool/TaskTool.logic';
import * as S from '@/features/chat/components/Tools/TaskTool/TaskTool.styles';

const TaskTool = memo(({ taskData, timestamp }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const parsedTask = parseTaskContent(taskData);
  const iconType = getTaskIcon(parsedTask.description);

  const renderTaskIcon = () => {
    const icons = {
      refactor: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      ),
      bug: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      test: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      ),
      search: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      ),
      create: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M12 4v16m8-8H4" />
      ),
      optimize: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      ),
      task: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      )
    };

    return (
      <S.TaskIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icons[iconType]}
      </S.TaskIcon>
    );
  };

  return (
    <S.TaskContainer>
      <S.TaskHeader>
        <S.TaskIconWrapper>
          {renderTaskIcon()}
        </S.TaskIconWrapper>
        <S.TaskHeaderContent>
          <S.TaskLabel>AI Task</S.TaskLabel>
          <S.TaskTitle>{parsedTask.description}</S.TaskTitle>
          <S.TaskDescription>
            Autonomous task execution with specialized agent
          </S.TaskDescription>
        </S.TaskHeaderContent>
      </S.TaskHeader>

      <S.TaskContent>
        <S.PromptSection>
          <S.PromptHeader>
            <S.PromptLabel>
              <S.PromptIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </S.PromptIcon>
              <S.PromptLabelText>Task Instructions</S.PromptLabelText>
            </S.PromptLabel>
            <S.ExpandButton onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 'Show less' : 'Show more'}
              <S.ChevronIcon 
                isExpanded={isExpanded}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </S.ChevronIcon>
            </S.ExpandButton>
          </S.PromptHeader>
          <S.PromptContent isCollapsed={!isExpanded}>
            {isExpanded ? parsedTask.rawPrompt : parsedTask.prompt}
          </S.PromptContent>
        </S.PromptSection>

        {parsedTask.files.length > 0 && (
          <S.FilesSection>
            <S.FilesHeader>
              <S.FilesIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </S.FilesIcon>
              <S.FilesLabel>Files to Create</S.FilesLabel>
            </S.FilesHeader>
            <S.FilesList>
              {parsedTask.files.map((file, index) => (
                <S.FileItem key={index}>
                  <S.FileIcon fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l4 4a1 1 0 01.293.707V17a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h2.586a1 1 0 01.707.293z" clipRule="evenodd" />
                  </S.FileIcon>
                  <S.FileName>{file}</S.FileName>
                </S.FileItem>
              ))}
            </S.FilesList>
          </S.FilesSection>
        )}

        {parsedTask.requirements.length > 0 && (
          <S.RequirementsSection>
            <S.RequirementsHeader>
              <S.RequirementsIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </S.RequirementsIcon>
              <S.RequirementsLabel>Key Requirements</S.RequirementsLabel>
            </S.RequirementsHeader>
            <S.RequirementsList>
              {parsedTask.requirements.map((req, index) => (
                <S.RequirementItem key={index}>
                  <S.CheckIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </S.CheckIcon>
                  <S.RequirementText>{req}</S.RequirementText>
                </S.RequirementItem>
              ))}
              {parsedTask.requirements.length === 5 && (
                <S.RequirementItem>
                  <S.RequirementText>...and more</S.RequirementText>
                </S.RequirementItem>
              )}
            </S.RequirementsList>
          </S.RequirementsSection>
        )}
      </S.TaskContent>

      <S.TaskMetadata>
        <S.MetadataItem>
          <S.MetadataIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </S.MetadataIcon>
          <S.MetadataText>{formatTaskTime(timestamp)}</S.MetadataText>
        </S.MetadataItem>
        <S.MetadataItem>
          <S.MetadataIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </S.MetadataIcon>
          <S.MetadataText>Autonomous Execution</S.MetadataText>
        </S.MetadataItem>
      </S.TaskMetadata>
    </S.TaskContainer>
  );
});

TaskTool.displayName = 'TaskTool';

TaskTool.propTypes = {
  taskData: PropTypes.shape({
    description: PropTypes.string,
    prompt: PropTypes.string
  }).isRequired,
  timestamp: PropTypes.string
};

TaskTool.defaultProps = {
  timestamp: new Date().toISOString()
};

export default TaskTool;