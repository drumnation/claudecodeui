import React, {useState, useRef, useEffect} from 'react';
import {Button} from '@/shared-components/Button/Button';
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
import {cn} from '@/lib/utils';
import * as S from './SessionItem.styles';
import {SessionItemProps} from './SessionItem.types';

export const SessionItemWeb = ({
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
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close on scroll events or touch events
      if (event.type === 'scroll' || event.type === 'touchmove') {
        return;
      }

      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      // Use setTimeout to avoid immediate closing on the same click that opened the menu
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }, 0);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showMenu]);

  return (
    <S.SessionContainer className="group">
      <Button
        variant="ghost"
        className={cn(
          'w-full justify-start font-normal text-left hover:bg-accent/20 dark:hover:bg-accent/30 transition-colors duration-200 min-h-fit h-auto',
          isSelected
            ? 'bg-accent text-accent-foreground'
            : isActive
              ? 'bg-green-50/50 dark:bg-green-900/10'
              : '',
        )}
        onClick={() => onSessionSelect(session)}
      >
        <div className="flex items-start gap-3 min-w-0 w-full py-2 px-3">
          <MessageSquare
            className={cn(
              'w-3 h-3 mt-0.5 flex-shrink-0',
              isActive
                ? 'text-green-600 dark:text-green-500'
                : 'text-muted-foreground',
            )}
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-medium truncate text-foreground">
              {session.summary || 'New Session'}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock
                className={cn(
                  'w-2.5 h-2.5',
                  isActive
                    ? 'text-green-600 dark:text-green-500'
                    : 'text-muted-foreground',
                )}
              />
              <span
                className={cn(
                  'text-xs',
                  isActive
                    ? 'text-green-600 dark:text-green-500 font-medium'
                    : 'text-muted-foreground',
                )}
              >
                {formatTimeAgo(session.lastActivity, currentTime)}
              </span>
              <div className="flex items-center ml-auto gap-1">
                {/* Show UI-created indicator */}
                {(session.metadata?.origin === 'webui' ||
                  session.id?.startsWith('ui-')) && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1 py-0 text-blue-600 border-blue-600"
                  >
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
      {/* Desktop 3-dot menu - Only show when not editing */}
      {!isEditing && (
        <S.DesktopHoverActions ref={menuRef}>
          <S.DesktopMenuWrapper>
            <S.DesktopMenuButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
              title="More options"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </S.DesktopMenuButton>
            {showMenu && (
              <S.DesktopMenuDropdown
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {!session.summary && (
                  <S.DesktopMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onGenerateSessionSummary(project.name, session.id);
                      setShowMenu(false);
                    }}
                    disabled={isGeneratingSummary}
                  >
                    {isGeneratingSummary ? (
                      <S.LoadingSpinner />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>Generate summary</span>
                  </S.DesktopMenuItem>
                )}
                {session.summary && (
                  <S.DesktopMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onRegenerateSessionTitle(project.name, session.id);
                      setShowMenu(false);
                    }}
                    disabled={isRegeneratingTitle}
                  >
                    {isRegeneratingTitle ? (
                      <S.LoadingSpinner />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    <span>Regenerate title</span>
                  </S.DesktopMenuItem>
                )}
                <S.DesktopMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSession(session.id);
                    setEditingSessionName(session.summary || '');
                    setShowMenu(false);
                  }}
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit title</span>
                </S.DesktopMenuItem>
                <S.DesktopMenuDivider />
                <S.DesktopMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(project.name, session.id);
                    setShowMenu(false);
                  }}
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete session</span>
                </S.DesktopMenuItem>
              </S.DesktopMenuDropdown>
            )}
          </S.DesktopMenuWrapper>
        </S.DesktopHoverActions>
      )}

      {/* Edit mode inline actions */}
      {isEditing && (
        <S.DesktopEditContainer>
          <S.DesktopEditInput
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
          <S.DesktopSaveButton
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSessionSummary(
                project.name,
                session.id,
                editingSessionName,
              );
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
        </S.DesktopEditContainer>
      )}
    </S.SessionContainer>
  );
};
