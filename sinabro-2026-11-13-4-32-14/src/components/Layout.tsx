import React, { useState } from 'react';
import {
  BookmarkCheck,
  HeartHandshake,
  Home,
  LogIn,
  LogOut,
  Users,
} from 'lucide-react';
import { Link, NavLink } from 'react-router';
import { useArchive } from '../context/ArchiveContext';
import { AuthModal } from './modals/CreateModals';

interface LayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { to: '/', label: '메인', icon: Home, end: true },
  { to: '/characters', label: '캐릭터', icon: Users, end: false },
  { to: '/checkpoints', label: '체크포인트', icon: BookmarkCheck, end: false },
  { to: '/couple', label: '페어링', icon: HeartHandshake, end: false },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { state, signOut } = useArchive();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink">
      {/* Desktop & Mobile Top Bar (3-zone clean header, <=56px mobile / 64px desktop) */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-hairline pt-safe">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between gap-4">
          {/* Zone 1: Brand Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 focus:outline-none group"
          >
            <span className="w-7 h-7 rounded-lg bg-primary text-white font-display font-bold text-sm flex items-center justify-center tracking-tight">
              시
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-ink whitespace-nowrap">
              시나브로
            </span>
          </Link>

          {/* Zone 2: Desktop Navigation Links (clean text + underline, zero pills) */}
          <nav
            aria-label="주요 메뉴"
            className="hidden md:flex items-center gap-8 h-full"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative h-full inline-flex items-center text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-ink-muted hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center shrink-0">
            {state.user ? (
              <div className="flex items-center gap-3">
                <span className="hidden sm:inline text-xs font-medium text-ink-muted whitespace-nowrap">
                  {state.user.displayName} 작가
                </span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-ink-muted hover:text-ink px-3 py-1.5 rounded-lg border border-hairline bg-surface-low/60 hover:bg-surface-low transition-colors whitespace-nowrap min-h-[36px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>로그아웃</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-white bg-primary hover:bg-primary-container px-4 py-2 rounded-lg transition-colors whitespace-nowrap min-h-[36px]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>로그인</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 pb-24 md:pb-12">
        {children}
      </main>

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-hairline bg-white mt-auto">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8 py-5 flex items-center justify-between text-xs text-ink-subtle">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-ink-muted">시나브로</span>
            <span>·</span>
            <span>자작 캐릭터 · 세계관 · 페어링 서사 아카이브</span>
          </div>
          <div className="flex items-center gap-4 tabular-nums">
            <span>캐릭터 {state.characters.length}</span>
            <span>·</span>
            <span>페어링 {state.pairings.length}</span>
            <span>·</span>
            <span>체크포인트 {state.checkpoints.length}</span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (thumb-first ergonomics, 60px height) */}
      <nav
        aria-label="모바일 하단 내비게이션"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-hairline pb-safe"
      >
        <div className="grid grid-cols-4 h-[60px]">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors min-h-[44px] ${
                    isActive
                      ? 'text-primary font-semibold'
                      : 'text-ink-subtle hover:text-ink'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};
