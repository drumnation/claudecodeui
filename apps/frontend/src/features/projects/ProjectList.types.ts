export interface ProjectListProps {
  onProjectSelect: (project: Project) => void;
  selectedProject: Project | null;
  showMobileLayout?: boolean;
}

export interface Project {
  name: string;
  path: string;
  fullPath?: string;
  type?: 'git' | 'folder';
  lastModified?: Date;
  size?: number;
  branch?: string;
  remote?: string;
  description?: string;
  tags?: string[];
}

export interface ProjectListState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  sortBy: ProjectSortOption;
  filterBy: ProjectFilter;
  showNewProjectModal: boolean;
}

export type ProjectSortOption = 'name' | 'modified' | 'size' | 'type';

export interface ProjectFilter {
  type?: 'all' | 'git' | 'folder';
  tags?: string[];
  hasRemote?: boolean;
}

export interface ProjectItemProps {
  project: Project;
  isSelected: boolean;
  onClick: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
}

export interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (project: NewProjectData) => Promise<void>;
}

export interface NewProjectData {
  name: string;
  path: string;
  type: 'git' | 'folder';
  initGit?: boolean;
  template?: string;
  description?: string;
}

export interface ProjectHeaderProps {
  projectCount: number;
  onNewProject: () => void;
  onRefresh: () => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortBy: ProjectSortOption;
  onSortChange: (sort: ProjectSortOption) => void;
}
