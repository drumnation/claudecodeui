/**
 * Global type definitions for the Claude Code UI application
 */

// Environment types
export interface EnvironmentInfo {
  url: string;
  hostname: string;
  protocol: string;
  port: string;
  isNgrok: boolean;
  isLocalhost: boolean;
}

export interface DeviceFeatures {
  localStorage: boolean;
  webSocket: boolean;
  serviceWorker: boolean;
  touchSupport: boolean;
}

export interface PlatformInfo {
  isMobile: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export interface ViewportInfo {
  width: number;
  height: number;
  devicePixelRatio: number;
}

export interface DebugInfo {
  userAgent: string;
  viewport: ViewportInfo;
  features: DeviceFeatures;
  platform: PlatformInfo;
  environment: EnvironmentInfo;
}

// Session and Project types
export interface Session {
  id: string;
  projectName: string;
  duration?: number;
  messageCount?: number;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  description?: string;
  lastAccessed?: string;
  status?: ProjectStatus;
}

export type ProjectStatus = 'active' | 'inactive' | 'archived';

// User types
export interface User {
  id: string;
  email?: string;
  role?: string;
}

// Request context types
export interface RequestContext {
  id: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
}

// Error types
export interface ErrorInfo {
  message: string;
  name: string;
  stack?: string;
  code?: string | number;
  cause?: ErrorInfo | string;
  timestamp: number;
}

export interface SafeError {
  message: string;
  name: string;
  stack?: string;
  timestamp: number;
  code?: string | number;
  cause?: SafeError | string;
}

// Component Props helpers
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeContext {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Event handler types
export type EventHandler<T = HTMLElement> = (
  event: React.SyntheticEvent<T>,
) => void;
export type ChangeHandler<T = HTMLInputElement> = (
  event: React.ChangeEvent<T>,
) => void;
export type ClickHandler<T = HTMLButtonElement> = (
  event: React.MouseEvent<T>,
) => void;
export type SubmitHandler = (event: React.FormEvent<HTMLFormElement>) => void;

// Logger metadata types
export interface LoggerMetadata {
  [key: string]: any;
}

export interface PerformanceMetrics {
  duration: number;
  startTime: number;
  endTime: number;
  operation?: string;
}
