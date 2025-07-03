import type { Project } from "@/app/types";

export interface GitStatus {
  modified?: string[];
  added?: string[];
  deleted?: string[];
  untracked?: string[];
  branch?: string;
}

export interface GitPanelProps {
  selectedProject: Project | null;
  isMobile: boolean;
}

export interface GitCommit {
  hash: string;
  message: string;
  author: string;
  date: string;
  stats: string;
}

export interface GitBranch {
  name: string;
  current: boolean;
}
