import React from 'react';
import {getStatusText} from '@/features/preview/LivePreviewPanel.logic';
import {
  StatusBadge,
  StatusDot,
  StatusText,
} from '@/features/preview/StatusIndicator/StatusIndicator.styles';
import type {StatusIndicatorProps} from './StatusIndicator.types';

export const StatusIndicator = ({serverStatus}: StatusIndicatorProps) => {
  return (
    <StatusBadge>
      <StatusDot status={serverStatus} />
      <StatusText>{getStatusText(serverStatus)}</StatusText>
    </StatusBadge>
  );
};
