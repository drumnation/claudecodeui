import React from 'react';
import { Button } from '@/shared-components/Button/Button';
import { Badge } from '@/shared-components/Badge/Badge';
import { 
  MessageSquare, 
  Clock, 
  Sparkles, 
  Edit3, 
  Trash2, 
  Check, 
  X,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import * as S from './SessionItem.styles';

export const SessionItemWeb = ({
  session,
  project,
  isSelected,
  isActive,
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
  
  return (
    <S.SessionContainer className="group">
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start font-normal text-left hover:bg-accent/50 transition-colors duration-200 min-h-fit h-auto",
          isSelected ? "bg-accent text-accent-foreground" :
          isActive ? "bg-green-50/50 dark:bg-green-900/10" : ""
        )}
        onClick={() => onSessionSelect(session)}
      >
        <div className="flex items-start gap-3 min-w-0 w-full py-2 px-3">
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
              <div className="flex items-center ml-auto gap-1">
                {/* Show UI-created indicator */}
                {(session.metadata?.origin === 'webui' || session.id?.startsWith('ui-')) && (
                  <Badge variant="outline" className="text-xs px-1 py-0 text-blue-600 border-blue-600">
                    UI
                  </Badge>
                )}
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
            >
              <Check className="w-3 h-3 text-green-600" />
            </S.DesktopSaveButton>
            <S.DesktopCancelButton
              onClick={(e) => {
                e.stopPropagation();
                setEditingSession(null);
                setEditingSessionName('');
              }}
            >
              <X className="w-3 h-3 text-gray-500" />
            </S.DesktopCancelButton>
          </>
        ) : (
          <>
            {!session.summary && (
              <S.DesktopGenerateButton
                onClick={(e) => {
                  e.stopPropagation();
                  onGenerateSessionSummary(project.name, session.id);
                }}
                title="Generate summary"
              >
                {isGeneratingSummary ? (
                  <S.LoadingSpinner />
                ) : (
                  <RefreshCw className="w-3 h-3 text-blue-600" />
                )}
              </S.DesktopGenerateButton>
            )}
            <S.DesktopEditButton
              onClick={(e) => {
                e.stopPropagation();
                setEditingSession(session.id);
                setEditingSessionName(session.summary || '');
              }}
              title="Edit session"
            >
              <Edit3 className="w-3 h-3 text-gray-600" />
            </S.DesktopEditButton>
            <S.DesktopDeleteButton
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(project.name, session.id);
              }}
              title="Delete session"
            >
              <Trash2 className="w-3 h-3 text-red-600" />
            </S.DesktopDeleteButton>
          </>
        )}
      </S.DesktopHoverActions>
    </S.SessionContainer>
  );
};