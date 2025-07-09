/**
 * PLATFORM PATHWAYS PATTERN - Level 3: Full Component Separation
 *
 * ProjectItem has significant layout differences between mobile and desktop:
 * - Mobile: Card-based layout with border and rounded corners
 * - Desktop: Button-based layout with hover states
 */

import React from 'react';
import {useIsMobile} from '@/hooks/useIsMobile';
import {ProjectItemMobile} from './ProjectItem.mobile';
import {ProjectItemWeb} from './ProjectItem.web';
import {ProjectItemProps} from './ProjectItem.types';

export const ProjectItem = (props: ProjectItemProps) => {
  const isMobile = useIsMobile();

  return isMobile ? (
    <ProjectItemMobile {...props} />
  ) : (
    <ProjectItemWeb {...props} />
  );
};
