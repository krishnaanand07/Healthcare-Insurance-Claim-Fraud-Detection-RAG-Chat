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
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'new-claim', label: 'New Claim', icon: <FilePlus size={20} /> },
    { id: 'history', label: 'Claim History', icon: <History size={20} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={20} /> },
    { id: 'providers', label: 'Providers', icon: <Users size={20} /> },
    { id: 'reports', label: 'Reports', icon: <FileText size={20} /> },
  ];

  return (
    <aside 
      className={`h-full min-h-screen p-4 flex flex-col justify-between neo-surface m-4 mr-0 transition-all duration-300 relative select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Logo and App Title */}
        <div className={`flex items-center gap-3 mb-8 px-2 transition-all ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-[#FACC15] flex items-center justify-center neo-surface-hover shadow-md text-[#172554] shrink-0">
            <ShieldAlert size={24} />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="text-xl font-bold text-[#172554] tracking-tight leading-none">ClaimLens AI</h1>
              <p className="text-[9px] text-[#64748B] font-bold uppercase mt-1 tracking-widest">Fraud Intelligence</p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl cursor-pointer transition-all duration-200 font-semibold text-xs tracking-wide w-full text-left ${
                  isActive
                    ? 'bg-[#172554] text-white shadow-md'
                    : 'text-[#64748B] hover:bg-white hover:text-[#172554] neo-surface-hover'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <div className={`shrink-0 ${isActive ? 'text-[#FACC15]' : ''}`}>
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
          className="w-full flex items-center justify-center gap-2 py-2 mb-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
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
          <div className="p-4 neo-inset text-center">
            <ShieldAlert className="mx-auto text-[#FACC15] mb-1.5" size={20} />
            <p className="text-xs font-bold text-[#172554]">Enterprise RAG Shield</p>
            <p className="text-[10px] text-[#64748B] mt-0.5">Trust data. Protect people.</p>
          </div>
        )}
      </div>
    </aside>
  );
};
