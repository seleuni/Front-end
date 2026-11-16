import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  RotateCcw,
  Upload,
  X,
} from 'lucide-react';
import { useTasko } from '../context/TaskoContext';
import { exportWorkspaceToMarkdown } from '../lib/taskoUtils';

export function DataPortabilityModal() {
  const {
    isDataModalOpen,
    setIsDataModalOpen,
    tasks,
    projects,
    exportSnapshot,
    importSnapshot,
    resetToSampleData,
    showToast,
  } = useTasko();

  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copiedMd, setCopiedMd] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isDataModalOpen) return null;

  const handleDownloadJson = () => {
    const snapshot = exportSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `open-tasko-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON 백업 파일이 다운로드되었습니다.');
  };

  const handleCopyMarkdown = async () => {
    const md = exportWorkspaceToMarkdown(tasks, projects);
    try {
      await navigator.clipboard.writeText(md);
      setCopiedMd(true);
      showToast('Markdown 체크리스트가 클립보드에 복사되었습니다.');
      window.setTimeout(() => setCopiedMd(false), 2000);
    } catch {
      showToast('클립보드 복사에 실패했습니다.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const res = importSnapshot(content);
      if (res.ok) {
        setImportError(null);
        setIsDataModalOpen(false);
      } else {
        setImportError(res.error ?? '가져오기에 실패했습니다.');
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = (e: React.FormEvent) => {
    e.preventDefault();
    const res = importSnapshot(importText);
    if (res.ok) {
      setImportError(null);
      setImportText('');
      setIsDataModalOpen(false);
    } else {
      setImportError(res.error ?? '가져오기에 실패했습니다.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="오픈 데이터 내보내기 및 가져오기"
    >
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-[1px]"
        onClick={() => setIsDataModalOpen(false)}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            데이터 내보내기 · 가져오기
          </h2>
          <button
            type="button"
            onClick={() => setIsDataModalOpen(false)}
            aria-label="창 닫기"
            className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-sm">
          {/* Export section */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              개방형 포맷으로 내보내기
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              현재 {projects.length}개 프로젝트와 {tasks.length}개 작업을 표준 JSON 파일 또는 Markdown 문서로 언제든 반출할 수 있습니다.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownloadJson}
                className="h-9 px-3.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span>JSON 백업 다운로드</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMarkdown}
                className="h-9 px-3.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium inline-flex items-center gap-1.5 whitespace-nowrap"
              >
                {copiedMd ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                ) : (
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                )}
                <span>Markdown 체크리스트 복사</span>
              </button>
            </div>
          </div>

          {/* Import section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                JSON 백업에서 복원하기
              </h3>
              <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                <span>파일 선택</span>
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>

            <form onSubmit={handlePasteImport} className="space-y-2">
              <textarea
                rows={4}
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError(null);
                }}
                placeholder='{"version": 1, "projects": [...], "tasks": [...]}'
                className="w-full p-2.5 text-xs font-mono rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              {importError && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {importError}
                </p>
              )}
              <div className="flex items-center justify-between gap-2">
                <div>
                  {!confirmReset ? (
                    <button
                      type="button"
                      onClick={() => setConfirmReset(true)}
                      className="h-8 px-2.5 rounded-md text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>샘플 데이터로 초기화</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          resetToSampleData();
                          setConfirmReset(false);
                          setIsDataModalOpen(false);
                        }}
                        className="h-8 px-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                      >
                        초기화 확인
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmReset(false)}
                        className="h-8 px-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        취소
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!importText.trim()}
                  className="h-8 px-3.5 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 disabled:opacity-40 text-xs font-semibold whitespace-nowrap"
                >
                  JSON 가져오기
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
