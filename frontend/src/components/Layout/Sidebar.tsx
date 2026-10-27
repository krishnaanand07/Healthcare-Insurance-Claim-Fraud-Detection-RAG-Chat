import React from 'react';
import { 
  ShieldAlert, 
  FilePlus, 
  LayoutDashboard, 
  History, 
  BarChart3, 
  Users, 
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export type NavTab = 'dashboard' | 'new-claim' | 'history' | 'analytics' | 'providers' | 'reports';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onSelectTab, 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'new-claim', label: 'New Claim', icon: <FilePlus size={18} /> },
    { id: 'history', label: 'Claim History', icon: <History size={18} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
    { id: 'providers', label: 'Providers', icon: <Users size={18} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
  ];

  return (
    <aside 
      className={`h-full min-h-screen p-4 flex flex-col justify-between bg-[var(--color-surface)] border-r border-[var(--color-border)] select-none transition-all duration-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo and App Title */}
        <div className={`flex items-center gap-3 mb-6 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-amber-400 dark:bg-amber-500 flex items-center justify-center text-slate-950 font-bold shrink-0">
            <ShieldAlert size={22} />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight leading-none">ClaimLens AI</h1>
              <p className="text-[10px] text-[var(--color-text-secondary)] font-semibold uppercase mt-1 tracking-wider">Fraud Intelligence</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer font-medium text-xs tracking-wide w-full text-left transition-colors ${
                  isActive
                    ? 'bg-[#172554] dark:bg-blue-600 text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <div className={`shrink-0 ${isActive ? 'text-amber-400' : ''}`}>
                  {item.icon}
                </div>
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle Button and Bottom Footer */}
      <div>
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 py-2 mb-3 rounded-lg bg-[var(--color-surface-hover)] hover:bg-slate-200 dark:hover:bg-slate-800 text-[var(--color-text-secondary)] text-xs font-medium transition-colors cursor-pointer border border-[var(--color-border)]"
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>

        {!isCollapsed && (
          <div className="p-3 rounded-lg bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-center text-xs">
            <ShieldAlert className="mx-auto text-amber-500 mb-1" size={18} />
            <p className="font-semibold text-[var(--color-text-primary)]">Enterprise RAG Shield</p>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Trust data. Protect people.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
