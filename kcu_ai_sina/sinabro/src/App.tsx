import { useEffect, useRef, useState } from 'react';
import { TaskoProvider, useTasko } from './context/TaskoContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { TaskListView } from './components/TaskListView';
import { TaskBoardView } from './components/TaskBoardView';
import { TaskCalendarView } from './components/TaskCalendarView';
import { TaskInspector } from './components/TaskInspector';
import { NewTaskModal } from './components/NewTaskModal';
import { NewProjectModal } from './components/NewProjectModal';
import { DataPortabilityModal } from './components/DataPortabilityModal';
import { ViewMode } from './types/tasko';

function WorkspaceShell() {
  const {
    viewMode,
    selectedTaskId,
    setSelectedTaskId,
    isNewTaskModalOpen,
    closeNewTaskModal,
    openNewTaskModal,
    isNewProjectModalOpen,
    setIsNewProjectModalOpen,
    isDataModalOpen,
    setIsDataModalOpen,
    toastMessage,
  } = useTasko();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (e.key === 'Escape') {
        if (isNewTaskModalOpen) {
          closeNewTaskModal();
          return;
        }
        if (isNewProjectModalOpen) {
          setIsNewProjectModalOpen(false);
          return;
        }
        if (isDataModalOpen) {
          setIsDataModalOpen(false);
          return;
        }
        if (selectedTaskId) {
          setSelectedTaskId(null);
          return;
        }
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
        return;
      }

      if (
        !isTyping &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey &&
        e.key.toLowerCase() === 'n'
      ) {
        e.preventDefault();
        openNewTaskModal();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isNewTaskModalOpen,
    closeNewTaskModal,
    isNewProjectModalOpen,
    setIsNewProjectModalOpen,
    isDataModalOpen,
    setIsDataModalOpen,
    selectedTaskId,
    setSelectedTaskId,
    mobileMenuOpen,
    openNewTaskModal,
  ]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          searchInputRef={searchInputRef}
        />
        <Toolbar />

        <main className="flex-1 flex flex-col min-w-0">
          {viewMode === ViewMode.LIST && <TaskListView />}
          {viewMode === ViewMode.BOARD && <TaskBoardView />}
          {viewMode === ViewMode.CALENDAR && <TaskCalendarView />}
        </main>
      </div>

      <TaskInspector />
      <NewTaskModal />
      <NewProjectModal />
      <DataPortabilityModal />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 px-3.5 py-2 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-medium shadow-md"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <TaskoProvider>
      <WorkspaceShell />
    </TaskoProvider>
  );
}
