import { AlertCircle, ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { TaskPriority } from '../types/tasko';
import { PRIORITY_META } from '../lib/taskoUtils';

interface PriorityIndicatorProps {
  priority: TaskPriority;
  showLabel?: boolean;
}

export function PriorityIndicator({
  priority,
  showLabel = true,
}: PriorityIndicatorProps) {
  const label = PRIORITY_META[priority].label;

  const config: Record<
    TaskPriority,
    { icon: typeof AlertCircle; colorClass: string }
  > = {
    [TaskPriority.URGENT]: {
      icon: AlertCircle,
      colorClass: 'text-red-600 dark:text-red-400',
    },
    [TaskPriority.HIGH]: {
      icon: ArrowUp,
      colorClass: 'text-amber-600 dark:text-amber-400',
    },
    [TaskPriority.MEDIUM]: {
      icon: Minus,
      colorClass: 'text-blue-600 dark:text-blue-400',
    },
    [TaskPriority.LOW]: {
      icon: ArrowDown,
      colorClass: 'text-slate-400 dark:text-slate-500',
    },
  };

  const { icon: Icon, colorClass } = config[priority];

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap shrink-0 ${colorClass}`}
      title={`우선순위: ${label}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
