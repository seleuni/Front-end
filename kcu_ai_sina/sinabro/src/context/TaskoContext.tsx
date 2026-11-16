import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  NavScope,
  ProjectItem,
  SortBy,
  TaskItem,
  TaskPriority,
  TaskStatus,
  ViewMode,
  WorkspaceSnapshot,
} from '../types/tasko';
import { INITIAL_PROJECTS, INITIAL_TASKS, TODAY_ISO } from '../data/initialData';
import { isDueToday, isOverdue, sortTasks } from '../lib/taskoUtils';

const STORAGE_KEY = 'open_tasko_workspace_v1';
const THEME_KEY = 'open_tasko_theme_v1';

interface StoredState {
  projects: ProjectItem[];
  tasks: TaskItem[];
  nextTaskNumber: number;
}

export interface NewTaskDraft {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  dueDate?: string | null;
  estimateHours?: number | null;
  tags?: string[];
  subtaskTitles?: string[];
}

interface TaskoContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  projects: ProjectItem[];
  tasks: TaskItem[];
  filteredTasks: TaskItem[];

  navScope: NavScope;
  setNavScope: (scope: NavScope) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  priorityFilter: TaskPriority | 'all';
  setPriorityFilter: (p: TaskPriority | 'all') => void;
  hideCompleted: boolean;
  setHideCompleted: (v: boolean) => void;
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;

  selectedTaskId: string | null;
  selectedTask: TaskItem | null;
  setSelectedTaskId: (id: string | null) => void;

  isNewTaskModalOpen: boolean;
  newTaskPreset: Partial<NewTaskDraft> | null;
  openNewTaskModal: (preset?: Partial<NewTaskDraft>) => void;
  closeNewTaskModal: () => void;

  isNewProjectModalOpen: boolean;
  setIsNewProjectModalOpen: (open: boolean) => void;

  isDataModalOpen: boolean;
  setIsDataModalOpen: (open: boolean) => void;

  toastMessage: string | null;
  showToast: (msg: string) => void;

  createTask: (draft: NewTaskDraft) => TaskItem;
  updateTask: (id: string, patch: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  toggleTaskDone: (id: string) => void;
  moveTaskStatus: (id: string, status: TaskStatus) => void;

  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;

  addTaskNote: (taskId: string, content: string) => void;

  createProject: (name: string, color: ProjectItem['color'], description: string) => ProjectItem;

  exportSnapshot: () => WorkspaceSnapshot;
  importSnapshot: (rawJson: string) => { ok: boolean; error?: string };
  resetToSampleData: () => void;
}

const TaskoContext = createContext<TaskoContextValue | null>(null);

function loadStoredWorkspace(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        projects: INITIAL_PROJECTS,
        tasks: INITIAL_TASKS,
        nextTaskNumber: 110,
      };
    }
    const parsed = JSON.parse(raw) as Partial<StoredState>;
    if (
      Array.isArray(parsed.projects) &&
      Array.isArray(parsed.tasks) &&
      parsed.projects.length > 0
    ) {
      return {
        projects: parsed.projects,
        tasks: parsed.tasks,
        nextTaskNumber: typeof parsed.nextTaskNumber === 'number' ? parsed.nextTaskNumber : 110,
      };
    }
  } catch {
    // Fall back to initial seed data if local storage is malformed
  }
  return {
    projects: INITIAL_PROJECTS,
    tasks: INITIAL_TASKS,
    nextTaskNumber: 110,
  };
}

function loadInitialTheme(): 'light' | 'dark' {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    // ignore
  }
  return 'light';
}

export function TaskoProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(loadInitialTheme);
  const [workspace, setWorkspace] = useState<StoredState>(loadStoredWorkspace);

  const [navScope, setNavScope] = useState<NavScope>({ type: 'all' });
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.LIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy>(SortBy.MANUAL);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskPreset, setNewTaskPreset] = useState<Partial<NewTaskDraft> | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
    } catch {
      // ignore quota errors
    }
  }, [workspace]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const openNewTaskModal = useCallback((preset?: Partial<NewTaskDraft>) => {
    setNewTaskPreset(preset ?? null);
    setIsNewTaskModalOpen(true);
  }, []);

  const closeNewTaskModal = useCallback(() => {
    setIsNewTaskModalOpen(false);
    setNewTaskPreset(null);
  }, []);

  const createTask = useCallback(
    (draft: NewTaskDraft): TaskItem => {
      const now = new Date().toISOString();
      const num = workspace.nextTaskNumber;
      const newTask: TaskItem = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code: `OT-${num}`,
        title: draft.title.trim(),
        description: draft.description?.trim() ?? '',
        status: draft.status ?? TaskStatus.BACKLOG,
        priority: draft.priority ?? TaskPriority.MEDIUM,
        projectId: draft.projectId ?? workspace.projects[0]?.id ?? 'proj-core',
        dueDate: draft.dueDate === undefined ? null : draft.dueDate,
        estimateHours: draft.estimateHours ?? null,
        tags: draft.tags ?? [],
        subtasks: (draft.subtaskTitles ?? [])
          .map((t) => t.trim())
          .filter(Boolean)
          .map((t, idx) => ({
            id: `st-${Date.now()}-${idx}`,
            title: t,
            completed: false,
          })),
        notes: [],
        createdAt: now,
        updatedAt: now,
      };

      setWorkspace((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
        nextTaskNumber: prev.nextTaskNumber + 1,
      }));
      showToast(`${newTask.code} 작업이 추가되었습니다.`);
      return newTask;
    },
    [workspace.nextTaskNumber, workspace.projects, showToast]
  );

  const updateTask = useCallback((id: string, patch: Partial<TaskItem>) => {
    const now = new Date().toISOString();
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: now } : t)),
    }));
  }, []);

  const deleteTask = useCallback(
    (id: string) => {
      setWorkspace((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
      }));
      setSelectedTaskId((prev) => (prev === id ? null : prev));
      showToast('작업이 삭제되었습니다.');
    },
    [showToast]
  );

  const toggleTaskDone = useCallback((id: string) => {
    const now = new Date().toISOString();
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== id) return t;
        const nextStatus =
          t.status === TaskStatus.DONE ? TaskStatus.BACKLOG : TaskStatus.DONE;
        return { ...t, status: nextStatus, updatedAt: now };
      }),
    }));
  }, []);

  const moveTaskStatus = useCallback((id: string, status: TaskStatus) => {
    const now = new Date().toISOString();
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === id ? { ...t, status, updatedAt: now } : t
      ),
    }));
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    const clean = title.trim();
    if (!clean) return;
    const now = new Date().toISOString();
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              updatedAt: now,
              subtasks: [
                ...t.subtasks,
                { id: `st-${Date.now()}`, title: clean, completed: false },
              ],
            }
          : t
      ),
    }));
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    const now = new Date().toISOString();
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              updatedAt: now,
              subtasks: t.subtasks.map((st) =>
                st.id === subtaskId ? { ...st, completed: !st.completed } : st
              ),
            }
          : t
      ),
    }));
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    const now = new Date().toISOString();
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              updatedAt: now,
              subtasks: t.subtasks.filter((st) => st.id !== subtaskId),
            }
          : t
      ),
    }));
  }, []);

  const addTaskNote = useCallback((taskId: string, content: string) => {
    const clean = content.trim();
    if (!clean) return;
    const now = new Date().toISOString();
    setWorkspace((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              updatedAt: now,
              notes: [
                ...t.notes,
                { id: `note-${Date.now()}`, content: clean, createdAt: now },
              ],
            }
          : t
      ),
    }));
  }, []);

  const createProject = useCallback(
    (name: string, color: ProjectItem['color'], description: string): ProjectItem => {
      const proj: ProjectItem = {
        id: `proj-${Date.now()}`,
        name: name.trim(),
        color,
        description: description.trim(),
      };
      setWorkspace((prev) => ({
        ...prev,
        projects: [...prev.projects, proj],
      }));
      showToast(`"${proj.name}" 프로젝트가 생성되었습니다.`);
      return proj;
    },
    [showToast]
  );

  const exportSnapshot = useCallback((): WorkspaceSnapshot => {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      projects: workspace.projects,
      tasks: workspace.tasks,
      nextTaskNumber: workspace.nextTaskNumber,
    };
  }, [workspace]);

  const importSnapshot = useCallback(
    (rawJson: string): { ok: boolean; error?: string } => {
      try {
        const parsed = JSON.parse(rawJson) as Partial<WorkspaceSnapshot>;
        if (!Array.isArray(parsed.projects) || !Array.isArray(parsed.tasks)) {
          return { ok: false, error: '유효한 Open Tasko JSON 형식이 아닙니다.' };
        }
        if (parsed.projects.length === 0) {
          return { ok: false, error: '최소 1개 이상의 프로젝트가 포함되어야 합니다.' };
        }
        setWorkspace({
          projects: parsed.projects,
          tasks: parsed.tasks,
          nextTaskNumber:
            typeof parsed.nextTaskNumber === 'number'
              ? parsed.nextTaskNumber
              : parsed.tasks.length + 101,
        });
        setSelectedTaskId(null);
        showToast(`${parsed.tasks.length}개의 작업을 가져왔습니다.`);
        return { ok: true };
      } catch {
        return { ok: false, error: 'JSON 구문을 해석할 수 없습니다.' };
      }
    },
    [showToast]
  );

  const resetToSampleData = useCallback(() => {
    setWorkspace({
      projects: INITIAL_PROJECTS,
      tasks: INITIAL_TASKS,
      nextTaskNumber: 110,
    });
    setSelectedTaskId(null);
    showToast('기본 샘플 워크스페이스로 복원되었습니다.');
  }, [showToast]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = workspace.tasks.filter((task) => {
      if (navScope.type === 'today') {
        if (!isDueToday(task) && !isOverdue(task)) return false;
      } else if (navScope.type === 'upcoming') {
        if (!task.dueDate || task.dueDate < TODAY_ISO) return false;
      } else if (navScope.type === 'project') {
        if (task.projectId !== navScope.projectId) return false;
      }

      if (hideCompleted && task.status === TaskStatus.DONE) return false;

      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      if (q) {
        const haystack = [
          task.code,
          task.title,
          task.description,
          ...task.tags,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });

    return sortTasks(list, sortBy);
  }, [workspace.tasks, navScope, hideCompleted, priorityFilter, searchQuery, sortBy]);

  const selectedTask = useMemo(
    () => workspace.tasks.find((t) => t.id === selectedTaskId) ?? null,
    [workspace.tasks, selectedTaskId]
  );

  const value: TaskoContextValue = {
    theme,
    toggleTheme,
    projects: workspace.projects,
    tasks: workspace.tasks,
    filteredTasks,
    navScope,
    setNavScope,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
    hideCompleted,
    setHideCompleted,
    sortBy,
    setSortBy,
    selectedTaskId,
    selectedTask,
    setSelectedTaskId,
    isNewTaskModalOpen,
    newTaskPreset,
    openNewTaskModal,
    closeNewTaskModal,
    isNewProjectModalOpen,
    setIsNewProjectModalOpen,
    isDataModalOpen,
    setIsDataModalOpen,
    toastMessage,
    showToast,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskDone,
    moveTaskStatus,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addTaskNote,
    createProject,
    exportSnapshot,
    importSnapshot,
    resetToSampleData,
  };

  return <TaskoContext.Provider value={value}>{children}</TaskoContext.Provider>;
}

export function useTasko(): TaskoContextValue {
  const ctx = useContext(TaskoContext);
  if (!ctx) throw new Error('useTasko must be used inside TaskoProvider');
  return ctx;
}
