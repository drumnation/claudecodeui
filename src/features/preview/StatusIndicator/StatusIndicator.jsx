import React from 'react';
import { getStatusText } from '@/features/preview/LivePreviewPanel.logic';
import { StatusBadge, StatusDot, StatusText } from '@/features/preview/StatusIndicator/StatusIndicator.styles';

export const StatusIndicator = ({ serverStatus }) => {
  return (
    <StatusBadge>
      <StatusDot status={serverStatus} />
      <StatusText>{getStatusText(serverStatus)}</StatusText>
    </StatusBadge>
  );
};