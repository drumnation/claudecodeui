import React from 'react';
import { Play, Square, Terminal } from 'lucide-react';
import { Button } from '@/shared-components/Button';
import { Badge } from '@/shared-components/Badge';
import { StatusIndicator } from '@/features/preview/StatusIndicator';
import { 
  ControlsContainer, 
  ScriptSelectorContainer, 
  ScriptSelect, 
  ButtonsContainer 
} from '@/features/preview/ServerControls/ServerControls.styles';

export const ServerControls = ({
  availableScripts,
  currentScript,
  serverStatus,
  isMobile,
  showLogs,
  onScriptChange,
  onStartServer,
  onStopServer,
  onToggleLogs
}) => {
  return (
    <ControlsContainer isMobile={isMobile}>
      <ScriptSelectorContainer isMobile={isMobile}>
        <ScriptSelect
          value={currentScript || ''}
          onChange={onScriptChange}
          disabled={serverStatus === 'starting' || serverStatus === 'stopping'}
        >
          <option value="">Select a script...</option>
          {availableScripts.length > 0 ? (
            availableScripts.map(script => (
              <option key={script} value={script}>
                {script}
              </option>
            ))
          ) : (
            <option disabled>Loading scripts...</option>
          )}
        </ScriptSelect>
        
        <StatusIndicator serverStatus={serverStatus} />
      </ScriptSelectorContainer>

      <ButtonsContainer isMobile={isMobile}>
        {serverStatus === 'stopped' || serverStatus === 'error' ? (
          <Button
            size="sm"
            onClick={() => currentScript && onStartServer(currentScript)}
            disabled={!currentScript || serverStatus === 'starting'}
            className={`h-10 gap-1.5 ${isMobile ? 'flex-1' : ''}`}
          >
            <Play className="h-3.5 w-3.5" />
            Start
          </Button>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            onClick={onStopServer}
            disabled={serverStatus === 'stopping'}
            className={`h-10 gap-1.5 ${isMobile ? 'flex-1' : ''}`}
          >
            <Square className="h-3.5 w-3.5" />
            Stop
          </Button>
        )}

        <Button
          size="sm"
          variant="outline"
          onClick={onToggleLogs}
          className={`h-10 gap-1.5 ${isMobile ? 'flex-1' : ''} ${showLogs ? 'bg-accent dark:bg-gray-700' : ''}`}
        >
          <Terminal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logs</span>
        </Button>
      </ButtonsContainer>
    </ControlsContainer>
  );
};