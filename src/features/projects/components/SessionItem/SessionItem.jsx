import React from 'react';
import { Button } from '@/shared-components/Button/Button';
import { Badge } from '@/shared-components/Badge/Badge';
import { 
  MessageSquare, 
  Clock, 
  Check, 
  X, 
  Trash2, 
  Sparkles, 
  Edit2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as S from './SessionItem.styles';

export const SessionItem = ({
  session,
  project,
  isSelected,
  isEditing,
  editingSessionName,
  isGeneratingSummary,
  currentTime,
  formatTimeAgo,
  onProjectSelect,
  onSessionSelect,
  onDeleteSession,
  onGenerateSessionSummary,
  onUpdateSessionSummary,
  setEditingSession,
  setEditingSessionName,
  handleTouchClick
}) => {
  const sessionDate = new Date(session.lastActivity);
  const diffInMinutes = Math.floor((currentTime - sessionDate) / (1000 * 60));
  const isActive = diffInMinutes < 10;

  return (
    <S.SessionContainer className="group">
      {/* Mobile Session Item */}
      <S.MobileWrapper>
        <S.MobileSessionItem
          isSelected={isSelected}
          isActive={isActive}
          onClick={() => {
            onProjectSelect(project);
            onSessionSelect(session);
          }}
          onTouchEnd={handleTouchClick(() => {
            onProjectSelect(project);
            onSessionSelect(session);
          })}
        >
          <S.SessionContent>
            <S.SessionIcon isSelected={isSelected} isActive={isActive}>
              <MessageSquare className={cn(
                "w-3 h-3",
                isSelected ? "text-primary" : 
                isActive ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
              )} />
            </S.SessionIcon>
            <S.SessionInfo>
              <S.SessionTitle>
                {session.summary || 'New Session'}
              </S.SessionTitle>
              <S.SessionMeta>
                <Clock className={cn(
                  "w-2.5 h-2.5",
                  isActive ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
                )} />
                <S.TimeText isActive={isActive}>
                  {formatTimeAgo(session.lastActivity, currentTime)}
                </S.TimeText>
                <S.SessionActions>
                  {session.messageCount > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {session.messageCount}
                    </Badge>
                  )}
                  {isActive && <S.ActiveIndicator />}
                </S.SessionActions>
              </S.SessionMeta>
            </S.SessionInfo>
            {/* Mobile action buttons */}
            <S.MobileActions>
              {isEditing ? (
                <>
                  <S.EditInput
                    type="text"
                    value={editingSessionName}
                    onChange={(e) => setEditingSessionName(e.target.value)}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter') {
                        onUpdateSessionSummary(project.name, session.id, editingSessionName);
                      } else if (e.key === 'Escape') {
                        setEditingSession(null);
                        setEditingSessionName('');
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    autoFocus
                  />
                  <S.SaveButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateSessionSummary(project.name, session.id, editingSessionName);
                    }}
                    onTouchEnd={handleTouchClick(() => onUpdateSessionSummary(project.name, session.id, editingSessionName))}
                  >
                    <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                  </S.SaveButton>
                  <S.CancelButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSession(null);
                      setEditingSessionName('');
                    }}
                    onTouchEnd={handleTouchClick(() => {
                      setEditingSession(null);
                      setEditingSessionName('');
                    })}
                  >
                    <X className="w-2.5 h-2.5 text-gray-600 dark:text-gray-400" />
                  </S.CancelButton>
                </>
              ) : (
                <>
                  <S.GenerateButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateSessionSummary(project.name, session.id);
                    }}
                    onTouchEnd={handleTouchClick(() => onGenerateSessionSummary(project.name, session.id))}
                    disabled={isGeneratingSummary}
                    title="Generate AI summary"
                  >
                    {isGeneratingSummary ? (
                      <S.LoadingSpinner />
                    ) : (
                      <Sparkles className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                    )}
                  </S.GenerateButton>
                  <S.EditButton
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSession(session.id);
                      setEditingSessionName(session.summary || 'New Session');
                    }}
                    onTouchEnd={handleTouchClick(() => {
                      setEditingSession(session.id);
                      setEditingSessionName(session.summary || 'New Session');
                    })}
                    title="Edit session name"
                  >
                    <Edit2 className="w-2.5 h-2.5 text-gray-600 dark:text-gray-400" />
                  </S.EditButton>
                  <S.DeleteButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(project.name, session.id);
                    }}
                    onTouchEnd={handleTouchClick(() => onDeleteSession(project.name, session.id))}
                    title="Delete session"
                  >
                    <Trash2 className="w-2.5 h-2.5 text-red-600 dark:text-red-400" />
                  </S.DeleteButton>
                </>
              )}
            </S.MobileActions>
          </S.SessionContent>
        </S.MobileSessionItem>
      </S.MobileWrapper>
      
      {/* Desktop Session Item */}
      <S.DesktopWrapper>
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start p-2 h-auto font-normal text-left hover:bg-accent/50 transition-colors duration-200",
            isSelected ? "bg-accent text-accent-foreground" :
            isActive ? "bg-green-50/50 dark:bg-green-900/10" : ""
          )}
          onClick={() => onSessionSelect(session)}
          onTouchEnd={handleTouchClick(() => onSessionSelect(session))}
        >
          <div className="flex items-start gap-2 min-w-0 w-full">
            <MessageSquare className={cn(
              "w-3 h-3 mt-0.5 flex-shrink-0",
              isActive ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
            )} />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium truncate text-foreground">
                {session.summary || 'New Session'}
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className={cn(
                  "w-2.5 h-2.5",
                  isActive ? "text-green-600 dark:text-green-500" : "text-muted-foreground"
                )} />
                <span className={cn(
                  "text-xs",
                  isActive ? "text-green-600 dark:text-green-500 font-medium" : "text-muted-foreground"
                )}>
                  {formatTimeAgo(session.lastActivity, currentTime)}
                </span>
                <div className="flex items-center ml-auto">
                  {session.messageCount > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {session.messageCount}
                    </Badge>
                  )}
                  {isActive && (
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-1" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </Button>
        {/* Desktop hover buttons */}
        <S.DesktopHoverActions>
          {isEditing ? (
            <>
              <S.DesktopEditInput
                type="text"
                value={editingSessionName}
                onChange={(e) => setEditingSessionName(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    onUpdateSessionSummary(project.name, session.id, editingSessionName);
                  } else if (e.key === 'Escape') {
                    setEditingSession(null);
                    setEditingSessionName('');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
              <S.DesktopSaveButton
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateSessionSummary(project.name, session.id, editingSessionName);
                }}
                title="Save"
              >
                <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
              </S.DesktopSaveButton>
              <S.DesktopCancelButton
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSession(null);
                  setEditingSessionName('');
                }}
                title="Cancel"
              >
                <X className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </S.DesktopCancelButton>
            </>
          ) : (
            <>
              <S.DesktopGenerateButton
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateSessionSummary(project.name, session.id);
                }}
                title="Generate AI summary for this session"
                disabled={isGeneratingSummary}
              >
                {isGeneratingSummary ? (
                  <div className="w-3 h-3 animate-spin rounded-full border border-blue-600 dark:border-blue-400 border-t-transparent" />
                ) : (
                  <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                )}
              </S.DesktopGenerateButton>
              <S.DesktopEditButton
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingSession(session.id);
                  setEditingSessionName(session.summary || 'New Session');
                }}
                title="Manually edit session name"
              >
                <Edit2 className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              </S.DesktopEditButton>
              <S.DesktopDeleteButton
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSession(project.name, session.id);
                }}
                title="Delete this session permanently"
              >
                <Trash2 className="w-3 h-3 text-red-600 dark:text-red-400" />
              </S.DesktopDeleteButton>
            </>
          )}
        </S.DesktopHoverActions>
      </S.DesktopWrapper>
    </S.SessionContainer>
  );
};