import React from 'react';
import { SessionItem } from '../SessionItem';
import { Button } from '@/shared-components/Button/Button';
import { Plus, ChevronDown } from 'lucide-react';
import * as S from './SessionList.styles';

export const SessionList = ({
  project,
  sessions,
  selectedSession,
  editingSession,
  editingSessionName,
  generatingSummary,
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
  onLoadMoreSessions,
  setEditingSession,
  setEditingSessionName,
  handleTouchClick
}) => {
  const isLoadingSessions = !initialSessionsLoaded.has(project.name);
  const hasNoSessions = sessions.length === 0 && !loadingSessions[project.name];

  if (isLoadingSessions) {
    return (
      <S.LoadingSkeletons>
        {Array.from({ length: 3 }).map((_, i) => (
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
        <Button
          variant="default"
          size="sm"
          className="hidden md:flex w-full justify-start gap-2 mt-1 h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
          onClick={() => onNewSession(project)}
        >
          <Plus className="w-3 h-3" />
          New Session
        </Button>
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
          isEditing={editingSession === session.id}
          editingSessionName={editingSessionName}
          isGeneratingSummary={generatingSummary[`${project.name}-${session.id}`]}
          currentTime={currentTime}
          formatTimeAgo={formatTimeAgo}
          onProjectSelect={onProjectSelect}
          onSessionSelect={onSessionSelect}
          onDeleteSession={onDeleteSession}
          onGenerateSessionSummary={onGenerateSessionSummary}
          onUpdateSessionSummary={onUpdateSessionSummary}
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
      
      <Button
        variant="default"
        size="sm"
        className="hidden md:flex w-full justify-start gap-2 mt-1 h-8 text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
        onClick={() => onNewSession(project)}
      >
        <Plus className="w-3 h-3" />
        New Session
      </Button>
    </S.SessionsWrapper>
  );
};