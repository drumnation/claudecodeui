import {ComponentType} from 'react';

export type TabId = 'chat' | 'shell' | 'files' | 'backlog' | 'git' | 'preview';

export interface NavItem {
  id: TabId;
  icon: ComponentType;
  label: string;
  onClick: () => void;
}

export interface MobileNavProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isInputFocused: boolean;
}

export interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}
