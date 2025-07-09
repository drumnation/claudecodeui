import React from 'react';
import {SessionItem} from '../SessionItem';
import {Button} from '@/shared-components/Button/Button';
import {Plus, ChevronDown} from 'lucide-react';
import {isSessionActive} from '../../ProjectList.logic';
import * as S from './SessionList.styles';
import {SessionListProps} from './SessionList.types';

export const SessionList = ({
  project,
  sessions,
  selectedSession,
  editingSession,
  editingSessionName,
  generatingSummary,
  regeneratingTitle,
  loadingSessions,
  initialSessionsLoaded,
  currentTime,
  formatTimeAgo,
  hasMore,
  onProjectSelect,
  onSessionSelect,
  onNewSession,
  onDeleteSession,
  onGenerateSessionSummary,
  onUpdateSessionSummary,
  onRegenerateSessionTitle,
  onLoadMoreSessions,
  setEditingSession,
  setEditingSessionName,
  handleTouchClick,
}: SessionListProps) => {
  const isLoadingSessions = !initialSessionsLoaded.has(project.name);
  const hasNoSessions = sessions.length === 0 && !loadingSessions[project.name];

  if (isLoadingSessions) {
    return (
      <S.LoadingSkeletons>
        {Array.from({length: 3}).map((_, i) => (
          <S.SessionSkeleton key={i}>
            <S.SkeletonContent>
              <S.SkeletonDot />
              <S.SkeletonBars>
                <S.SkeletonBar width={`${60 + i * 15}%`} />
                <S.SkeletonBarSmall />
              </S.SkeletonBars>
            </S.SkeletonContent>
          </S.SessionSkeleton>
        ))}
      </S.LoadingSkeletons>
    );
  }

  if (hasNoSessions) {
    return (
      <>
        <S.EmptyState>
          <S.EmptyText>No sessions yet</S.EmptyText>
        </S.EmptyState>

        {/* New Session Button - Mobile optimized */}
        <S.NewSessionMobile>
          <S.NewSessionButton
            onClick={() => {
              onProjectSelect(project);
              onNewSession(project);
            }}
          >
            <Plus className="w-3 h-3" />
            New Session
          </S.NewSessionButton>
        </S.NewSessionMobile>
      </>
    );
  }

  return (
    <S.SessionsWrapper>
      {sessions.map((session) => (
        <SessionItem
          key={session.id}
          session={session}
          project={project}
          isSelected={selectedSession?.id === session.id}
          isActive={isSessionActive(session, currentTime)}
          isEditing={editingSession === session.id}
          editingSessionName={editingSessionName}
          isGeneratingSummary={
            generatingSummary[`${project.name}-${session.id}`]
          }
          isRegeneratingTitle={
            regeneratingTitle?.[`${project.name}-${session.id}`]
          }
          currentTime={currentTime}
          formatTimeAgo={formatTimeAgo}
          onProjectSelect={onProjectSelect}
          onSessionSelect={onSessionSelect}
          onDeleteSession={onDeleteSession}
          onGenerateSessionSummary={onGenerateSessionSummary}
          onUpdateSessionSummary={onUpdateSessionSummary}
          onRegenerateSessionTitle={onRegenerateSessionTitle}
          setEditingSession={setEditingSession}
          setEditingSessionName={setEditingSessionName}
          handleTouchClick={handleTouchClick}
        />
      ))}

      {sessions.length > 0 && hasMore && (
        <S.LoadMoreButton>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center gap-2 text-muted-foreground"
            onClick={() => onLoadMoreSessions(project)}
            disabled={loadingSessions[project.name]}
          >
            <S.LoadMoreContent>
              {loadingSessions[project.name] ? (
                <>
                  <S.Spinner />
                  Loading...
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show more sessions
                </>
              )}
            </S.LoadMoreContent>
          </Button>
        </S.LoadMoreButton>
      )}

      {/* New Session Button - Mobile optimized */}
      <S.NewSessionMobile>
        <S.NewSessionButton
          onClick={() => {
            onProjectSelect(project);
            onNewSession(project);
          }}
        >
          <Plus className="w-3 h-3" />
          New Session
        </S.NewSessionButton>
      </S.NewSessionMobile>
    </S.SessionsWrapper>
  );
};
