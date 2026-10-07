import React from 'react';
import { Search, Bell, ChevronDown, Moon } from 'lucide-react';

export const TopBar = () => {
  return (
    <header className="w-full h-24 flex items-center justify-between px-8">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#64748B]" size={20} />
        <input 
          type="text" 
          placeholder="Search claims, providers, or patients..." 
          className="neo-input pl-12 pr-16"
        />
        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
          <kbd className="px-2 py-1 bg-[#EEF3FA] border border-[#172554]/10 rounded text-xs font-mono text-[#64748B] shadow-inner">Ctrl K</kbd>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6 ml-8">
        <div className="w-12 h-12 rounded-full neo-surface flex items-center justify-center text-[#64748B] cursor-pointer neo-surface-hover relative">
          <Bell size={20} />
          <span className="absolute top-3 right-3 w-2 h-2 bg-[#EF4444] rounded-full"></span>
        </div>
        
        <div className="w-12 h-12 rounded-full neo-surface flex items-center justify-center text-[#64748B] cursor-pointer neo-surface-hover">
          <Moon size={20} />
        </div>

        <div className="flex items-center gap-4 cursor-pointer pl-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#172554] to-[#52658F] text-white flex items-center justify-center font-bold shadow-lg">
            RK
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-[#172554]">Ruthvik K.</p>
            <p className="text-xs text-[#64748B] font-medium">Claims Analyst</p>
          </div>
          <ChevronDown size={16} className="text-[#64748B] hidden md:block" />
        </div>
      </div>
    </header>
  );
};
