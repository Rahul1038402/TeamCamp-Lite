export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  MY_TASKS: '/my-tasks',
} as const;

export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  DONE: 'done',
} as const;

export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const PROJECT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold',
} as const;

export const USER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

export const STATUS_COLORS = {
  todo: 'text-text-secondary',
  in_progress: 'text-primary',
  done: 'text-accent',
} as const;

export const PRIORITY_COLORS = {
  low: 'text-text-secondary',
  medium: 'text-yellow-500',
  high: 'text-red-500',
} as const;