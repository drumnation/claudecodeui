import {formatTaskForDisplay} from '../../BacklogBoard.logic';
import type {
  Task,
  TaskDisplayInfo,
  MetaItem,
  TaskPriority,
  TaskStatus,
} from './TaskCard.types';

/**
 * Shared logic for TaskCard components
 * Contains all platform-agnostic task formatting and display logic
 */

/**
 * Get task display information
 * @param {Object} task - The task object
 * @returns {Object} Formatted task display data
 */
export function getTaskDisplayInfo(task: Task): TaskDisplayInfo {
  return formatTaskForDisplay(task);
}

/**
 * Determine if a task should show overdue indicator
 * @param {Object} task - The task object
 * @returns {boolean} Whether task is overdue
 */
export function isTaskOverdue(task: Task): boolean {
  const displayTask = formatTaskForDisplay(task);
  return displayTask.isOverdue;
}

/**
 * Get due date display text
 * @param {Object} task - The task object
 * @returns {string|null} Due date text or null if no due date
 */
export function getDueDateText(task: Task): string | null {
  const displayTask = formatTaskForDisplay(task);

  if (!task.dueDate) return null;

  if (displayTask.isOverdue) {
    return 'Overdue';
  }

  if (displayTask.daysUntilDue === 0) return 'Due today';
  if (displayTask.daysUntilDue === 1) return 'Due tomorrow';
  if (displayTask.daysUntilDue < 0)
    return `${Math.abs(displayTask.daysUntilDue)} days overdue`;
  return `${displayTask.daysUntilDue} days`;
}

/**
 * Get task meta items for display
 * @param {Object} task - The task object
 * @param {boolean} isMobile - Whether this is for mobile display
 * @returns {Array} Array of meta items to display
 */
export function getTaskMetaItems(task: Task, isMobile = false): MetaItem[] {
  const metaItems: MetaItem[] = [];

  // Always show assignee if present
  if (task.assignee) {
    metaItems.push({
      type: 'assignee',
      value: task.assignee,
      icon: 'User',
    });
  }

  // Always show due date if present
  if (task.dueDate) {
    metaItems.push({
      type: 'dueDate',
      value: getDueDateText(task),
      icon: 'Calendar',
      isOverdue: isTaskOverdue(task),
    });
  }

  // On mobile, limit to 2 meta items to save space
  if (isMobile && metaItems.length > 2) {
    return metaItems.slice(0, 2);
  }

  return metaItems;
}

/**
 * Determine which labels to show
 * @param {Array} labels - Task labels
 * @param {boolean} isMobile - Whether this is for mobile display
 * @returns {Array} Labels to display
 */
export function getDisplayLabels(
  labels: string[] = [],
  isMobile = false,
): string[] {
  if (!labels || labels.length === 0) return [];

  // On mobile, limit to 2 labels to prevent overflow
  if (isMobile && labels.length > 2) {
    return labels.slice(0, 2);
  }

  return labels;
}

/**
 * Check if task has overflow content that might need expansion
 * @param {Object} task - The task object
 * @returns {boolean} Whether task has overflow content
 */
export function hasOverflowContent(task: Task): boolean {
  const _displayTask = formatTaskForDisplay(task);

  // Check if title or description was truncated
  const titleTruncated = task.title.length > 50;
  const descriptionTruncated =
    task.description && task.description.length > 100;

  // Check if has many labels
  const manyLabels = task.labels && task.labels.length > 2;

  return titleTruncated || descriptionTruncated || manyLabels;
}

/**
 * Get task priority color
 * @param {string} priority - Task priority
 * @returns {string} Color code for priority
 */
export function getPriorityColor(priority?: TaskPriority): string {
  switch (priority?.toLowerCase()) {
    case 'critical':
      return '#dc2626'; // red-600
    case 'high':
      return '#ea580c'; // orange-600
    case 'medium':
      return '#ca8a04'; // yellow-600
    case 'low':
      return '#16a34a'; // green-600
    default:
      return '#6b7280'; // gray-500
  }
}

/**
 * Get task status color
 * @param {string} status - Task status
 * @returns {string} Color code for status
 */
export function getStatusColor(status?: TaskStatus): string {
  switch (status?.toLowerCase()) {
    case 'todo':
      return '#6b7280'; // gray-500
    case 'in_progress':
    case 'in-progress':
      return '#3b82f6'; // blue-500
    case 'done':
      return '#10b981'; // green-500
    case 'blocked':
      return '#ef4444'; // red-500
    case 'archived':
      return '#8b5cf6'; // violet-500
    default:
      return '#6b7280'; // gray-500
  }
}
