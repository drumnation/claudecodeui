import React, {useState} from 'react';
import {Badge} from '@/shared-components/Badge/Badge';
import {
  MessageSquare,
  Clock,
  Sparkles,
  Edit3,
  Trash2,
  Check,
  X,
  RefreshCw,
  MoreVertical,
} from 'lucide-react';
import * as S from './SessionItem.styles';
import {SessionItemProps, SessionActionMenuProps} from './SessionItem.types';
import {Session, ProjectWithSessions} from '../ProjectItem/ProjectItem.types';

// Component for mobile action menu modal
const SessionActionMenu = ({
  isOpen,
  onClose,
  session,
  project,
  isGeneratingSummary,
  isRegeneratingTitle,
  onGenerateSessionSummary,
  onRegenerateSessionTitle,
  onEditSession,
  onDeleteSession,
}: SessionActionMenuProps) => {
  if (!isOpen) return null;

  return (
    <S.MobileActionOverlay
      onClick={(e) => {
        // Only close if clicking the overlay itself, not during scroll
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchMove={(e) => {
        // Prevent scrolling from triggering overlay close
        e.stopPropagation();
      }}
    >
      <S.MobileActionModal
        onClick={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <S.MobileActionHeader>
          <S.MobileActionTitle>Session Actions</S.MobileActionTitle>
          <S.MobileActionCloseButton onClick={onClose}>
            <X className="w-4 h-4" />
          </S.MobileActionCloseButton>
        </S.MobileActionHeader>

        <S.MobileActionList>
          {!session.summary ? (
            <S.MobileActionButton
              onClick={() => {
                onGenerateSessionSummary(project.name, session.id);
                onClose();
              }}
              disabled={isGeneratingSummary}
            >
              <RefreshCw
                className={`w-5 h-5 ${isGeneratingSummary ? 'animate-spin' : ''}`}
              />
              <span>Generate Summary</span>
            </S.MobileActionButton>
          ) : (
            <S.MobileActionButton
              onClick={() => {
                onRegenerateSessionTitle(project.name, session.id);
                onClose();
              }}
              disabled={isRegeneratingTitle}
            >
              <RefreshCw
                className={`w-5 h-5 ${isRegeneratingTitle ? 'animate-spin' : ''}`}
              />
              <span>Regenerate Title</span>
            </S.MobileActionButton>
          )}

          <S.MobileActionButton
            onClick={() => {
              onEditSession();
              onClose();
            }}
          >
            <Edit3 className="w-5 h-5" />
            <span>Edit Title</span>
          </S.MobileActionButton>

          <S.MobileActionButton
            onClick={() => {
              onDeleteSession(project.name, session.id);
              onClose();
            }}
            variant="destructive"
          >
            <Trash2 className="w-5 h-5" />
            <span>Delete Session</span>
          </S.MobileActionButton>
        </S.MobileActionList>
      </S.MobileActionModal>
    </S.MobileActionOverlay>
  );
};

export const SessionItemMobile = ({
  session,
  project,
  isSelected,
  isActive,
  isEditing,
  editingSessionName,
  isGeneratingSummary,
  isRegeneratingTitle,
  currentTime,
  formatTimeAgo,
  onProjectSelect,
  onSessionSelect,
  onDeleteSession,
  onGenerateSessionSummary,
  onUpdateSessionSummary,
  onRegenerateSessionTitle,
  setEditingSession,
  setEditingSessionName,
  handleTouchClick,
}: SessionItemProps) => {
  const [showActionMenu, setShowActionMenu] = useState(false);

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
        {/* Row 1: Icon + Session Title + Action Menu Button */}
        <S.SessionMainContent>
          <S.SessionIcon isSelected={isSelected} isActive={isActive}>
            <MessageSquare className="w-4 h-4" />
          </S.SessionIcon>

          <S.SessionTitleArea>
            {isEditing ? (
              <S.EditInput
                type="text"
                value={editingSessionName}
                onChange={(e) => setEditingSessionName(e.target.value)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter') {
                    onUpdateSessionSummary(
                      project.name,
                      session.id,
                      editingSessionName,
                    );
                  } else if (e.key === 'Escape') {
                    setEditingSession(null);
                    setEditingSessionName('');
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                autoFocus
              />
            ) : (
              <S.SessionTitle>
                {session.summary || 'New Session'}
              </S.SessionTitle>
            )}
          </S.SessionTitleArea>

          {isEditing ? (
            <S.EditActions>
              <S.SaveButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onUpdateSessionSummary(
                    project.name,
                    session.id,
                    editingSessionName,
                  );
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <Check className="w-4 h-4" />
              </S.SaveButton>
              <S.CancelButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setEditingSession(null);
                  setEditingSessionName('');
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <X className="w-4 h-4" />
              </S.CancelButton>
            </S.EditActions>
          ) : (
            <S.MenuButton
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowActionMenu(true);
              }}
              onTouchEnd={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowActionMenu(true);
              }}
            >
              <MoreVertical className="w-5 h-5" />
            </S.MenuButton>
          )}
        </S.SessionMainContent>

        {/* Row 2: Time + Badges */}
        <S.SessionMetaContent>
          <S.SessionMeta>
            <S.TimeIcon isActive={isActive}>
              <Clock className="w-3 h-3" />
            </S.TimeIcon>
            <S.TimeText isActive={isActive}>
              {formatTimeAgo(session.lastActivity, currentTime)}
            </S.TimeText>
          </S.SessionMeta>

          <S.SessionBadges>
            {(session.metadata?.origin === 'webui' ||
              session.id?.startsWith('ui-')) && (
              <Badge
                variant="outline"
                className="text-xs px-1.5 py-0.5 text-blue-600 border-blue-600"
              >
                UI
              </Badge>
            )}
            {session.messageCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                {session.messageCount}
              </Badge>
            )}
            {isActive && <S.ActiveIndicator />}
          </S.SessionBadges>
        </S.SessionMetaContent>
      </S.MobileSessionItem>

      {/* Action Menu Modal */}
      <SessionActionMenu
        isOpen={showActionMenu}
        onClose={() => setShowActionMenu(false)}
        session={session}
        project={project}
        isGeneratingSummary={isGeneratingSummary}
        isRegeneratingTitle={isRegeneratingTitle}
        onGenerateSessionSummary={onGenerateSessionSummary}
        onRegenerateSessionTitle={onRegenerateSessionTitle}
        onEditSession={() => {
          setEditingSession(session.id);
          setEditingSessionName(session.summary || '');
        }}
        onDeleteSession={onDeleteSession}
      />
    </S.SessionContainer>
  );
};
