export enum TaskStatus {
  BACKLOG = 'backlog',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
}

export enum TaskPriority {
  URGENT = 'urgent',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum ViewMode {
  LIST = 'list',
  BOARD = 'board',
  CALENDAR = 'calendar',
}

export enum SortBy {
  MANUAL = 'manual',
  DUE_DATE = 'due_date',
  PRIORITY = 'priority',
  CREATED = 'created',
}

export type NavScope =
  | { type: 'all' }
  | { type: 'today' }
  | { type: 'upcoming' }
  | { type: 'project'; projectId: string };

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TaskNote {
  id: string;
  content: string;
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  color: 'blue' | 'emerald' | 'amber' | 'violet' | 'slate';
  description: string;
}

export interface TaskItem {
  id: string;
  code: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  dueDate: string | null; // YYYY-MM-DD
  estimateHours: number | null;
  tags: string[];
  subtasks: SubTask[];
  notes: TaskNote[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceSnapshot {
  version: number;
  exportedAt: string;
  projects: ProjectItem[];
  tasks: TaskItem[];
  nextTaskNumber: number;
}
