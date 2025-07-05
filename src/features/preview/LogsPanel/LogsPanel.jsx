import React from 'react';
import { Button } from '@/shared-components/Button';
import { 
  LogsContainer, 
  LogsHeader, 
  LogsTitle, 
  LogsContent, 
  LogEntry, 
  EmptyLogs 
} from '@/features/preview/LogsPanel/LogsPanel.styles';

export const LogsPanel = ({ serverLogs, onClearLogs }) => {
  return (
    <LogsContainer>
      <LogsHeader>
        <LogsTitle>Server Logs</LogsTitle>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearLogs}
          className="h-6 px-2 text-xs"
        >
          Clear
        </Button>
      </LogsHeader>
      <LogsContent>
        {serverLogs.length === 0 ? (
          <EmptyLogs>No logs yet...</EmptyLogs>
        ) : (
          serverLogs.map((log, index) => (
            <LogEntry key={index} isError={log.type === 'error'}>
              {log.message}
            </LogEntry>
          ))
        )}
      </LogsContent>
    </LogsContainer>
  );
};