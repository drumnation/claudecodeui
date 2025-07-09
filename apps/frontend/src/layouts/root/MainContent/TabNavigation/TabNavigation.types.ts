export type TabId = 'chat' | 'shell' | 'files' | 'backlog' | 'git' | 'preview';

export interface Tab {
  id: TabId;
  label: string;
  icon: string; // SVG path data
}

export interface TabNavigationProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}
