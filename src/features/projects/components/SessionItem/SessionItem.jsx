/**
 * PLATFORM PATHWAYS PATTERN - Level 3: Full Component Separation
 * 
 * SessionItem has significant layout differences between mobile and desktop:
 * - Mobile: Card-based layout with visible action buttons
 * - Desktop: List-based layout with hover actions
 */

import React from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { SessionItemMobile } from './SessionItem.mobile';
import { SessionItemWeb } from './SessionItem.web';

export const SessionItem = (props) => {
  const isMobile = useIsMobile();
  
  return isMobile ? <SessionItemMobile {...props} /> : <SessionItemWeb {...props} />;
};