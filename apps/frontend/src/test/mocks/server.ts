import {vi} from 'vitest';

// Mock server for testing without external dependencies
const mockServer = {
  listen: vi.fn(),
  resetHandlers: vi.fn(),
  close: vi.fn(),
};

// Mock data for testing
const mockProjects = [
  {
    id: 'proj-1',
    name: 'claude-code-ui',
    displayName: 'Claude Code UI',
    path: '/claude-code-ui',
    fullPath: '/Users/developer/projects/claude-code-ui',
    sessions: [
      {
        id: 'session-1',
        summary: 'Implementing dark mode toggle',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        messageCount: 12,
        isActive: false,
      },
      {
        id: 'session-2',
        summary: 'Bug fix: Memory leak in message renderer',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        messageCount: 8,
        isActive: true,
      },
    ],
    sessionMeta: {
      hasMore: true,
      total: 5,
    },
  },
  {
    id: 'proj-2',
    name: 'my-api',
    displayName: 'My API Service',
    path: '/my-api',
    fullPath: '/Users/developer/projects/my-api',
    sessions: [
      {
        id: 'session-3',
        summary: 'Add authentication middleware',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        messageCount: 15,
        isActive: false,
      },
    ],
    sessionMeta: {
      hasMore: false,
      total: 1,
    },
  },
];

const mockMessages = [
  {
    id: 'msg-1',
    role: 'user',
    content: 'Hello Claude!',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: 'msg-2',
    role: 'assistant',
    content: 'Hello! How can I help you today?',
    timestamp: new Date(Date.now() - 1 * 60 * 1000),
    tools: [],
  },
];

const mockConnectionHealth = {
  isConnected: true,
  latency: 150,
  lastError: undefined,
  reconnectAttempts: 0,
};

// Mock API functions for testing
export const mockAPI = {
  projects: {
    getAll: vi.fn(() => Promise.resolve(mockProjects)),
    getById: vi.fn((id) => {
      const project = mockProjects.find((p) => p.id === id);
      return project
        ? Promise.resolve(project)
        : Promise.reject(new Error('Project not found'));
    }),
    create: vi.fn((data) => {
      const project = {
        id: `proj-${Date.now()}`,
        sessions: [],
        sessionMeta: {hasMore: false, total: 0},
        ...data,
      };
      mockProjects.push(project);
      return Promise.resolve(project);
    }),
    delete: vi.fn((id) => {
      const index = mockProjects.findIndex((p) => p.id === id);
      if (index === -1) {
        return Promise.reject(new Error('Project not found'));
      }
      mockProjects.splice(index, 1);
      return Promise.resolve({success: true});
    }),
  },
  sessions: {
    getAll: vi.fn((projectId) => {
      const project = mockProjects.find((p) => p.id === projectId);
      return project
        ? Promise.resolve(project.sessions)
        : Promise.reject(new Error('Project not found'));
    }),
    create: vi.fn((projectId, data) => {
      const project = mockProjects.find((p) => p.id === projectId);
      if (!project) {
        return Promise.reject(new Error('Project not found'));
      }

      const session = {
        id: `session-${Date.now()}`,
        timestamp: new Date().toISOString(),
        messageCount: 0,
        isActive: false,
        ...data,
      };

      project.sessions.push(session);
      project.sessionMeta.total++;

      return Promise.resolve(session);
    }),
  },
  messages: {
    getAll: vi.fn(() => Promise.resolve(mockMessages)),
    send: vi.fn((content) => {
      const message = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      };
      mockMessages.push(message);
      return Promise.resolve(message);
    }),
  },
  health: {
    check: vi.fn(() => Promise.resolve(mockConnectionHealth)),
  },
};

export const server = mockServer;
