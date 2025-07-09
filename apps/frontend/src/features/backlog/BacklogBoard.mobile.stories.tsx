import React from 'react';
import BacklogBoardMobile from './BacklogBoard.mobile';
import {TaskStatus, TaskPriority} from './constants';
import * as BacklogBoardLogic from './BacklogBoard.logic';
import {vi} from 'vitest';

// Mock the BacklogBoard logic
vi.mock('./BacklogBoard.logic', () => ({
  useBacklogLogic: vi.fn(),
}));

export default {
  title: 'Features/Mobile/BacklogBoard',
  component: BacklogBoardMobile,
  parameters: {
    layout: 'fullscreen',
    docs: {
      autodocs: true,
      description: {
        component:
          'Mobile-optimized BacklogBoard with touch-friendly interactions, bottom sheets, and tap-to-move functionality.',
      },
    },
  },
  globals: {
    viewport: {
      value: 'iphone12',
      isRotated: false,
    },
  },
  argTypes: {
    selectedProject: {control: 'object'},
    selectedSession: {control: 'object'},
  },
};

// Mock project data
const mockProject = {
  name: 'sample-project',
  displayName: 'Sample Project',
  path: '/path/to/sample-project',
  type: 'web',
};

const mockSession = {
  id: 'session-123',
  name: 'Feature Implementation Session',
};

// Mock tasks data
const mockTasks = [
  {
    id: 'task-1',
    title: 'Implement user authentication system',
    description:
      'Set up JWT-based authentication with login/logout functionality and route protection.',
    status: TaskStatus.TODO,
    priority: TaskPriority.HIGH,
    assignee: 'John Doe',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    labels: ['authentication', 'security', 'backend'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Design responsive navigation component',
    description:
      'Create a mobile-first navigation component that works across all device sizes.',
    status: TaskStatus.IN_PROGRESS,
    priority: TaskPriority.MEDIUM,
    assignee: 'Jane Smith',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    labels: ['frontend', 'responsive'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Fix payment processing bug',
    description:
      'Resolve the issue where payment confirmations are not being sent to users.',
    status: TaskStatus.BLOCKED,
    priority: TaskPriority.CRITICAL,
    assignee: 'Bob Johnson',
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day overdue
    labels: ['payments', 'bug', 'critical'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Write API documentation',
    description:
      'Document all REST API endpoints with examples and response schemas.',
    status: TaskStatus.DONE,
    priority: TaskPriority.LOW,
    assignee: 'Alice Wilson',
    completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Completed 2 days ago
    labels: ['documentation', 'api'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Optimize database queries',
    description:
      'Identify and optimize slow database queries to improve application performance.',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    assignee: 'Charlie Brown',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    labels: ['performance', 'database', 'optimization'],
    createdAt: new Date().toISOString(),
  },
];

// Mock the BacklogBoard logic hook
const createMockUseBacklogLogic =
  (customTasks = mockTasks) =>
  () => ({
    tasks: customTasks,
    columns: {
      [TaskStatus.TODO]: customTasks.filter(
        (t) => t.status === TaskStatus.TODO,
      ),
      [TaskStatus.IN_PROGRESS]: customTasks.filter(
        (t) => t.status === TaskStatus.IN_PROGRESS,
      ),
      [TaskStatus.DONE]: customTasks.filter(
        (t) => t.status === TaskStatus.DONE,
      ),
      [TaskStatus.BLOCKED]: customTasks.filter(
        (t) => t.status === TaskStatus.BLOCKED,
      ),
      [TaskStatus.ARCHIVED]: customTasks.filter(
        (t) => t.status === TaskStatus.ARCHIVED,
      ),
    },
    loading: false,
    error: null,
    cliAvailable: true,
    filters: {
      search: '',
      status: [],
      priority: [],
      assignee: '',
      labels: [],
    },
    sortBy: 'priority',
    planText: '',
    generatingTasks: false,
    createTask: async (taskData: any) =>
      console.log('Creating task:', taskData),
    updateTask: async (taskId: any, updates: any) =>
      console.log('Updating task:', taskId, updates),
    deleteTask: async (taskId: any) => console.log('Deleting task:', taskId),
    moveTask: async (taskId: any, newStatus: any) =>
      console.log('Moving task:', taskId, 'to', newStatus),
    generateTasksFromPlan: async () =>
      console.log('Generating tasks from plan'),
    reviewTasks: async (summary: any) =>
      console.log('Reviewing tasks:', summary),
    fetchTasks: async () => console.log('Fetching tasks'),
    updateFilter: (key: any, value: any) =>
      console.log('Updating filter:', key, value),
    clearFilters: () => console.log('Clearing filters'),
    setSortBy: (sortBy: any) => console.log('Setting sort by:', sortBy),
    setPlanText: (text: any) => console.log('Setting plan text:', text),
    checkCliAvailability: async () => console.log('Checking CLI availability'),
  });

// Default story with populated data
export const Default = {
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
  },
  render: (args: any) => {
    // Mock the hook
    const mockUseBacklogLogic = createMockUseBacklogLogic();
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockImplementation(() => mockUseBacklogLogic());

    const component = <BacklogBoardMobile {...args} />;

    return component;
  },
};

// Loading state
export const Loading = {
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
  },
  render: (args: any) => {
    const mockUseBacklogLogic = () => ({
      ...createMockUseBacklogLogic()(),
      loading: true,
      cliAvailable: null,
    });

    const originalHook = BacklogBoardLogic.useBacklogLogic;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockImplementation(() => mockUseBacklogLogic());

    const component = <BacklogBoardMobile {...args} />;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockRestore();

    return component;
  },
};

// Empty state
export const Empty = {
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
  },
  render: (args: any) => {
    const mockUseBacklogLogic = () => ({
      ...createMockUseBacklogLogic([])(),
      tasks: [],
      columns: {
        [TaskStatus.TODO]: [],
        [TaskStatus.IN_PROGRESS]: [],
        [TaskStatus.DONE]: [],
        [TaskStatus.BLOCKED]: [],
        [TaskStatus.ARCHIVED]: [],
      },
    });

    const originalHook = BacklogBoardLogic.useBacklogLogic;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockImplementation(() => mockUseBacklogLogic());

    const component = <BacklogBoardMobile {...args} />;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockRestore();

    return component;
  },
};

// Error state
export const WithError = {
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
  },
  render: (args: any) => {
    const mockUseBacklogLogic = () => ({
      ...createMockUseBacklogLogic()(),
      error:
        'Failed to connect to backlog service. Please check your connection and try again.',
    });

    const originalHook = BacklogBoardLogic.useBacklogLogic;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockImplementation(() => mockUseBacklogLogic());

    const component = <BacklogBoardMobile {...args} />;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockRestore();

    return component;
  },
};

// CLI not available state
export const CliNotAvailable = {
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
  },
  render: (args: any) => {
    const mockUseBacklogLogic = () => ({
      ...createMockUseBacklogLogic()(),
      cliAvailable: false,
    });

    const originalHook = BacklogBoardLogic.useBacklogLogic;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockImplementation(() => mockUseBacklogLogic());

    const component = <BacklogBoardMobile {...args} />;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockRestore();

    return component;
  },
};

// No project selected
export const NoProject = {
  args: {
    selectedProject: null,
    selectedSession: null,
  },
};

// With many tasks (testing overflow)
export const ManyTasks = {
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
  },
  render: (args: any) => {
    const manyTasks = Array.from({length: 20}, (_, i) => ({
      id: `task-${i + 1}`,
      title: `Task ${i + 1}: ${['Implement', 'Fix', 'Design', 'Optimize', 'Test'][i % 5]} ${['authentication', 'navigation', 'payments', 'database', 'UI'][i % 5]}`,
      description: `This is a detailed description for task ${i + 1}. It contains multiple lines of text to test how the mobile layout handles longer content.`,
      status: [
        TaskStatus.TODO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.DONE,
        TaskStatus.BLOCKED,
      ][i % 4],
      priority: [
        TaskPriority.LOW,
        TaskPriority.MEDIUM,
        TaskPriority.HIGH,
        TaskPriority.CRITICAL,
      ][i % 4],
      assignee: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Wilson'][
        i % 4
      ],
      dueDate: new Date(
        Date.now() + (i - 10) * 24 * 60 * 60 * 1000,
      ).toISOString(),
      labels: [`label-${i}`, `category-${i % 3}`, `type-${i % 2}`],
      createdAt: new Date().toISOString(),
    }));

    const mockUseBacklogLogic = createMockUseBacklogLogic(manyTasks);

    const originalHook = BacklogBoardLogic.useBacklogLogic;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockImplementation(() => mockUseBacklogLogic());

    const component = <BacklogBoardMobile {...args} />;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockRestore();

    return component;
  },
};

// Interactive story for testing mobile interactions
export const Interactive = {
  args: {
    selectedProject: mockProject,
    selectedSession: mockSession,
  },
  render: (args: any) => {
    const [tasks, setTasks] = React.useState(mockTasks);
    const [loading, setLoading] = React.useState(false);

    const mockUseBacklogLogic = () => ({
      tasks,
      columns: {
        [TaskStatus.TODO]: tasks.filter((t) => t.status === TaskStatus.TODO),
        [TaskStatus.IN_PROGRESS]: tasks.filter(
          (t) => t.status === TaskStatus.IN_PROGRESS,
        ),
        [TaskStatus.DONE]: tasks.filter((t) => t.status === TaskStatus.DONE),
        [TaskStatus.BLOCKED]: tasks.filter(
          (t) => t.status === TaskStatus.BLOCKED,
        ),
        [TaskStatus.ARCHIVED]: tasks.filter(
          (t) => t.status === TaskStatus.ARCHIVED,
        ),
      },
      loading,
      error: null,
      cliAvailable: true,
      filters: {search: '', status: [], priority: [], assignee: '', labels: []},
      sortBy: 'priority',
      planText: '',
      generatingTasks: false,
      createTask: async (taskData: any) => {
        console.log('Creating task:', taskData);
        const newTask = {
          id: `task-${Date.now()}`,
          ...taskData,
          createdAt: new Date().toISOString(),
        };
        setTasks((prev) => [...prev, newTask]);
      },
      updateTask: async (taskId: any, updates: any) => {
        console.log('Updating task:', taskId, updates);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? {...t, ...updates} : t)),
        );
      },
      deleteTask: async (taskId: any) => {
        console.log('Deleting task:', taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
      },
      moveTask: async (taskId: any, newStatus: any) => {
        console.log('Moving task:', taskId, 'to', newStatus);
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? {...t, status: newStatus} : t)),
        );
      },
      generateTasksFromPlan: async () =>
        console.log('Generating tasks from plan'),
      reviewTasks: async (summary: any) =>
        console.log('Reviewing tasks:', summary),
      fetchTasks: async () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1000);
      },
      updateFilter: (key: any, value: any) =>
        console.log('Updating filter:', key, value),
      clearFilters: () => console.log('Clearing filters'),
      setSortBy: (sortBy: any) => console.log('Setting sort by:', sortBy),
      setPlanText: (text: any) => console.log('Setting plan text:', text),
      checkCliAvailability: async () =>
        console.log('Checking CLI availability'),
    });

    const originalHook = BacklogBoardLogic.useBacklogLogic;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockImplementation(() => mockUseBacklogLogic());

    const component = <BacklogBoardMobile {...args} />;
    vi.mocked(BacklogBoardLogic.useBacklogLogic).mockRestore();

    return component;
  },
};
