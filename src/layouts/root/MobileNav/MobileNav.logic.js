import { MessageSquare, Folder, Terminal, GitBranch, Globe } from 'lucide-react';

export const getNavItems = (setActiveTab) => [
  {
    id: 'chat',
    icon: MessageSquare,
    label: 'Chat',
    onClick: () => setActiveTab('chat')
  },
  {
    id: 'shell',
    icon: Terminal,
    label: 'Shell',
    onClick: () => setActiveTab('shell')
  },
  {
    id: 'files',
    icon: Folder,
    label: 'Files',
    onClick: () => setActiveTab('files')
  },
  {
    id: 'git',
    icon: GitBranch,
    label: 'Git',
    onClick: () => setActiveTab('git')
  },
  {
    id: 'preview',
    icon: Globe,
    label: 'Preview',
    onClick: () => setActiveTab('preview')
  }
];

export const detectDarkMode = () => {
  return document.documentElement.classList.contains('dark');
};