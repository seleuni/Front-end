import {
  ProjectItem,
  SortBy,
  TaskItem,
  TaskPriority,
  TaskStatus,
} from '../types/tasko';
import { TODAY_ISO } from '../data/initialData';

export const STATUS_META: Record<
  TaskStatus,
  { label: string; shortLabel: string; order: number }
> = {
  [TaskStatus.BACKLOG]: { label: '대기', shortLabel: '대기', order: 0 },
  [TaskStatus.IN_PROGRESS]: { label: '진행 중', shortLabel: '진행 중', order: 1 },
  [TaskStatus.REVIEW]: { label: '검토', shortLabel: '검토', order: 2 },
  [TaskStatus.DONE]: { label: '완료', shortLabel: '완료', order: 3 },
};

export const PRIORITY_META: Record<
  TaskPriority,
  { label: string; weight: number }
> = {
  [TaskPriority.URGENT]: { label: '긴급', weight: 0 },
  [TaskPriority.HIGH]: { label: '높음', weight: 1 },
  [TaskPriority.MEDIUM]: { label: '보통', weight: 2 },
  [TaskPriority.LOW]: { label: '낮음', weight: 3 },
};

export const PROJECT_COLOR_DOT: Record<ProjectItem['color'], string> = {
  blue: 'bg-blue-600 dark:bg-blue-400',
  emerald: 'bg-emerald-600 dark:bg-emerald-400',
  amber: 'bg-amber-600 dark:bg-amber-400',
  violet: 'bg-violet-600 dark:bg-violet-400',
  slate: 'bg-slate-500 dark:bg-slate-400',
};

export function isOverdue(task: TaskItem): boolean {
  if (!task.dueDate || task.status === TaskStatus.DONE) return false;
  return task.dueDate < TODAY_ISO;
}

export function isDueToday(task: TaskItem): boolean {
  return task.dueDate === TODAY_ISO;
}

export function formatShortDate(isoDate: string | null): string {
  if (!isoDate) return '기한 없음';
  if (isoDate === TODAY_ISO) return '오늘';
  const [, m, d] = isoDate.split('-');
  if (!m || !d) return isoDate;
  return `${Number(m)}/${Number(d)}`;
}

export function formatDateTimeLabel(isoString: string): string {
  try {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('ko-KR', {
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return isoString;
  }
}

export function sortTasks(tasks: TaskItem[], sortBy: SortBy): TaskItem[] {
  const copy = [...tasks];
  switch (sortBy) {
    case SortBy.DUE_DATE:
      return copy.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
    case SortBy.PRIORITY:
      return copy.sort(
        (a, b) => PRIORITY_META[a.priority].weight - PRIORITY_META[b.priority].weight
      );
    case SortBy.CREATED:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case SortBy.MANUAL:
    default:
      return copy;
  }
}

export function exportWorkspaceToMarkdown(
  tasks: TaskItem[],
  projects: ProjectItem[]
): string {
  const projectMap = new Map(projects.map((p) => [p.id, p.name]));
  const lines: string[] = [
    '# Open Tasko 내보내기',
    '',
    `내보낸 시각: ${new Date().toISOString().slice(0, 10)} · 총 ${tasks.length}개 작업`,
    '',
  ];

  const statuses: TaskStatus[] = [
    TaskStatus.IN_PROGRESS,
    TaskStatus.REVIEW,
    TaskStatus.BACKLOG,
    TaskStatus.DONE,
  ];

  for (const status of statuses) {
    const group = tasks.filter((t) => t.status === status);
    if (group.length === 0) continue;
    lines.push(`## ${STATUS_META[status].label} (${group.length})`);
    lines.push('');
    for (const task of group) {
      const check = task.status === TaskStatus.DONE ? 'x' : ' ';
      const projectName = projectMap.get(task.projectId) ?? '미분류';
      const due = task.dueDate ? ` · 마감 ${task.dueDate}` : '';
      lines.push(
        `- [${check}] **${task.code}** ${task.title} (${projectName} · ${PRIORITY_META[task.priority].label}${due})`
      );
      if (task.description.trim()) {
        lines.push(`  > ${task.description.trim().replace(/\n/g, ' ')}`);
      }
      for (const st of task.subtasks) {
        lines.push(`  - [${st.completed ? 'x' : ' '}] ${st.title}`);
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}
