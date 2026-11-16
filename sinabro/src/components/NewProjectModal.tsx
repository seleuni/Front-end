import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTasko } from '../context/TaskoContext';
import { PROJECT_COLOR_DOT } from '../lib/taskoUtils';
import { ProjectItem } from '../types/tasko';

const COLOR_OPTIONS: { value: ProjectItem['color']; label: string }[] = [
  { value: 'blue', label: '블루' },
  { value: 'violet', label: '바이올렛' },
  { value: 'emerald', label: '에메랄드' },
  { value: 'amber', label: '앰버' },
  { value: 'slate', label: '슬레이트' },
];

export function NewProjectModal() {
  const {
    isNewProjectModalOpen,
    setIsNewProjectModalOpen,
    createProject,
    setNavScope,
  } = useTasko();

  const [name, setName] = useState('');
  const [color, setColor] = useState<ProjectItem['color']>('blue');
  const [description, setDescription] = useState('');

  if (!isNewProjectModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const created = createProject(name, color, description);
    setNavScope({ type: 'project', projectId: created.id });
    setName('');
    setDescription('');
    setIsNewProjectModalOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="새 프로젝트 만들기"
    >
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1px]"
        onClick={() => setIsNewProjectModalOpen(false)}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            새 프로젝트 만들기
          </h2>
          <button
            type="button"
            onClick={() => setIsNewProjectModalOpen(false)}
            aria-label="창 닫기"
            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              프로젝트 이름
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: Mobile Client v2"
              className="w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">
              식별 색상
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setColor(opt.value)}
                  className={`h-8 px-2.5 rounded-md border text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                    color === opt.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-500'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-xs ${PROJECT_COLOR_DOT[opt.value]}`}
                    aria-hidden="true"
                  />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              설명 (선택)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="프로젝트 목적을 간단히 적어주세요"
              className="w-full h-9 px-3 text-sm rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewProjectModalOpen(false)}
              className="h-9 px-3.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="h-9 px-4 rounded-md bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold"
            >
              프로젝트 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
