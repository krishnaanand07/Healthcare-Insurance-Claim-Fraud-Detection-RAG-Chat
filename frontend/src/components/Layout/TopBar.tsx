import React from 'react';
import { Bell, ChevronDown, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const TopBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="w-full h-20 flex items-center justify-between px-6 sm:px-8 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      {/* Title or Breadcrumb space */}
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
          Claim Fraud Detection & RAG Investigation
        </h2>
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* White / Dark Mode Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle White/Dark Mode"
          title={`Switch to ${theme === 'dark' ? 'White' : 'Dark'} Mode`}
          className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun size={18} className="text-amber-400" />
          ) : (
            <Moon size={18} className="text-slate-600" />
          )}
        </button>

        {/* Notifications */}
        <div className="w-10 h-10 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] transition-colors cursor-pointer relative">
          <Bell size={18} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3 cursor-pointer pl-1">
          <div className="w-10 h-10 rounded-xl bg-[#172554] dark:bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            RK
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-[var(--color-text-primary)] leading-tight">Ruthvik K.</p>
            <p className="text-[11px] text-[var(--color-text-secondary)]">Claims Analyst</p>
          </div>
          <ChevronDown size={14} className="text-[var(--color-text-secondary)] hidden sm:block" />
        </div>
      </div>
    </header>
  );
};

