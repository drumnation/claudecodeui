/**
 * TabNavigation.jsx - Tab navigation component for MainContent
 */

import React from 'react';
import {
  TabContainer,
  TabWrapper,
  TabButton,
  TabContent,
  TabIcon,
  TabLabel
} from '@/layouts/root/MainContent/TabNavigation/TabNavigation.styles';

const tabs = [
  {
    id: 'chat',
    label: 'Chat',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    id: 'shell',
    label: 'Shell',
    icon: 'M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
  },
  {
    id: 'files',
    label: 'Files',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z'
  },
  {
    id: 'git',
    label: 'Source Control',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z'
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9'
  }
];

export const TabNavigation = ({ activeTab, onTabChange }) => {
  return (
    <TabContainer>
      <TabWrapper>
        {tabs.map(tab => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          >
            <TabContent>
              <TabIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </TabIcon>
              <TabLabel>{tab.label}</TabLabel>
            </TabContent>
          </TabButton>
        ))}
      </TabWrapper>
    </TabContainer>
  );
};