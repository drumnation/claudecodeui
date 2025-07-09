import React, {lazy, Suspense} from 'react';
import {LoadingSpinner} from '@/shared-components/LoadingSpinner';

// Lazy load all tool components for better code splitting
const BashTool = lazy(() => import('./BashTool'));
const EditTool = lazy(() => import('./EditTool'));
const WriteTool = lazy(() => import('./WriteTool'));
const ReadTool = lazy(() => import('./ReadTool'));
const TaskTool = lazy(() => import('./TaskTool'));
const TodoWriteTool = lazy(() => import('./TodoWriteTool'));
const DefaultTool = lazy(() => import('./DefaultTool'));

// Common fallback component for all tools
const ToolFallback = () => (
  <div className="flex items-center justify-center p-4">
    <LoadingSpinner size="sm" />
    <span className="ml-2 text-sm text-gray-600">Loading tool...</span>
  </div>
);

// Tool component props type
interface ToolProps {
  tool: {
    name: string;
    [key: string]: any;
  };
  [key: string]: any;
}

// Main lazy tool renderer
export const LazyTool = React.memo<ToolProps>(({tool, ...props}) => {
  const renderTool = () => {
    switch (tool.name) {
      case 'bash':
        return <BashTool tool={tool} {...props} />;
      case 'edit':
        return <EditTool tool={tool} {...props} />;
      case 'write':
        return <WriteTool tool={tool} {...props} />;
      case 'read':
        return <ReadTool tool={tool} {...props} />;
      case 'task':
        return <TaskTool tool={tool} {...props} />;
      case 'todo_write':
        return <TodoWriteTool tool={tool} {...props} />;
      default:
        return <DefaultTool tool={tool} {...props} />;
    }
  };

  return <Suspense fallback={<ToolFallback />}>{renderTool()}</Suspense>;
});

LazyTool.displayName = 'LazyTool';

// Export individual lazy components for direct usage
export const LazyBashTool = React.memo<ToolProps>((props) => (
  <Suspense fallback={<ToolFallback />}>
    <BashTool {...props} />
  </Suspense>
));

export const LazyEditTool = React.memo<ToolProps>((props) => (
  <Suspense fallback={<ToolFallback />}>
    <EditTool {...props} />
  </Suspense>
));

export const LazyWriteTool = React.memo<ToolProps>((props) => (
  <Suspense fallback={<ToolFallback />}>
    <WriteTool {...props} />
  </Suspense>
));

export const LazyReadTool = React.memo<ToolProps>((props) => (
  <Suspense fallback={<ToolFallback />}>
    <ReadTool {...props} />
  </Suspense>
));

export const LazyTaskTool = React.memo<ToolProps>((props) => (
  <Suspense fallback={<ToolFallback />}>
    <TaskTool {...props} />
  </Suspense>
));

export const LazyTodoWriteTool = React.memo<ToolProps>((props) => (
  <Suspense fallback={<ToolFallback />}>
    <TodoWriteTool {...props} />
  </Suspense>
));

export const LazyDefaultTool = React.memo<ToolProps>((props) => (
  <Suspense fallback={<ToolFallback />}>
    <DefaultTool {...props} />
  </Suspense>
));

LazyBashTool.displayName = 'LazyBashTool';
LazyEditTool.displayName = 'LazyEditTool';
LazyWriteTool.displayName = 'LazyWriteTool';
LazyReadTool.displayName = 'LazyReadTool';
LazyTaskTool.displayName = 'LazyTaskTool';
LazyTodoWriteTool.displayName = 'LazyTodoWriteTool';
LazyDefaultTool.displayName = 'LazyDefaultTool';
