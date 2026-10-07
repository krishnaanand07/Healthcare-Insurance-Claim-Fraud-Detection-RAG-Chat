import React from 'react';
import { ShieldAlert, FilePlus, LayoutDashboard, History, BarChart3, Users, FileText, Settings } from 'lucide-react';

export const Sidebar = () => {
  const menuItems = [
    { icon: <FilePlus size={20} />, label: 'New Claim', active: true },
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { icon: <History size={20} />, label: 'Claim History' },
    { icon: <BarChart3 size={20} />, label: 'Analytics' },
    { icon: <Users size={20} />, label: 'Providers' },
    { icon: <FileText size={20} />, label: 'Reports' },
    { icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <aside className="w-64 h-full min-h-screen p-6 flex flex-col justify-between neo-surface m-4 mr-0 hidden lg:flex">
      <div>
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 rounded-xl bg-[#FACC15] flex items-center justify-center neo-surface-hover shadow-md text-[#172554]">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#172554] tracking-tight leading-none">ClaimLens AI</h1>
            <p className="text-[9px] text-[#64748B] font-bold uppercase mt-1 tracking-widest">Fair claims</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 font-medium ${
                item.active
                  ? 'bg-[#FACC15]/20 text-[#172554] shadow-inner shadow-[#FACC15]/30'
                  : 'text-[#64748B] hover:bg-[#F5F8FC] hover:text-[#172554] neo-surface-hover'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </div>

      <div className="mt-8 p-5 neo-inset text-center">
        <ShieldAlert className="mx-auto text-[#FACC15] mb-2" size={24} />
        <p className="text-sm font-bold text-[#172554]">Trust data. Protect people.</p>
        <p className="text-xs text-[#64748B] mt-1">Smarter insurance for a fairer world.</p>
      </div>
    </aside>
  );
};
