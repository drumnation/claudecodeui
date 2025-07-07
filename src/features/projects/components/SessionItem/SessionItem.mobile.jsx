import React from 'react';
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
import * as S from './SessionItem.styles';

export const SessionItemMobile = ({
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
    <S.SessionContainer>
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
            <MessageSquare className="w-3 h-3" />
          </S.SessionIcon>
          <S.SessionInfo>
            <S.SessionTitle>
              {isEditing ? (
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
              ) : (
                session.summary || 'New Session'
              )}
            </S.SessionTitle>
            <S.SessionMeta>
              <S.TimeIcon isActive={isActive}>
                <Clock className="w-full h-full" />
              </S.TimeIcon>
              <S.TimeText isActive={isActive}>
                {formatTimeAgo(session.lastActivity, currentTime)}
              </S.TimeText>
            </S.SessionMeta>
          </S.SessionInfo>
          <S.SessionActions>
            {/* Show UI-created indicator */}
            {(session.metadata?.origin === 'webui' || session.id?.startsWith('ui-')) && (
              <Badge variant="outline" className="text-xs px-1.5 py-0 text-blue-600 border-blue-600">
                UI
              </Badge>
            )}
            {session.messageCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                {session.messageCount}
              </Badge>
            )}
            {isActive && (
              <S.ActiveIndicator />
            )}
            {isEditing ? (
              <S.MobileActions>
                <S.SaveButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateSessionSummary(project.name, session.id, editingSessionName);
                  }}
                >
                  <Check className="w-3 h-3" />
                </S.SaveButton>
                <S.CancelButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSession(null);
                    setEditingSessionName('');
                  }}
                >
                  <X className="w-3 h-3" />
                </S.CancelButton>
              </S.MobileActions>
            ) : (
              <S.MobileActions>
                {!session.summary && (
                  <S.GenerateButton
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateSessionSummary(project.name, session.id);
                    }}
                  >
                    {isGeneratingSummary ? (
                      <S.LoadingSpinner />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                  </S.GenerateButton>
                )}
                <S.EditButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSession(session.id);
                    setEditingSessionName(session.summary || '');
                  }}
                >
                  <Edit3 className="w-3 h-3" />
                </S.EditButton>
                <S.DeleteButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(project.name, session.id);
                  }}
                  onTouchEnd={handleTouchClick(() => onDeleteSession(project.name, session.id))}
                >
                  <Trash2 className="w-3 h-3" />
                </S.DeleteButton>
              </S.MobileActions>
            )}
          </S.SessionActions>
        </S.SessionContent>
      </S.MobileSessionItem>
    </S.SessionContainer>
  );
};