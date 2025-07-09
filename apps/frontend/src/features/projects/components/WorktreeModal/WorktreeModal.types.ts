import {ProjectWithSessions} from '../ProjectItem/ProjectItem.types';

export interface WorktreeModalProps {
  featureName: string;
  setFeatureName: (name: string) => void;
  creatingWorktree: boolean;
  onCreateWorktree: () => void;
  onCancel: () => void;
  project: ProjectWithSessions | null;
}
