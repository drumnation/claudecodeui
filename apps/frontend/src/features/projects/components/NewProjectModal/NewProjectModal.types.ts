export interface NewProjectModalProps {
  newProjectPath: string;
  setNewProjectPath: (path: string) => void;
  creatingProject: boolean;
  onCreateProject: () => void;
  onCancel: () => void;
}
