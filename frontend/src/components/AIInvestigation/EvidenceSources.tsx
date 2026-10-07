import React from 'react';
import { FileText, ExternalLink, BookmarkCheck } from 'lucide-react';

export interface EvidenceSourceItem {
  document?: str;
  text?: str;
  filename: string;
  section: string;
  score?: number;
  relevance?: string;
}

interface EvidenceSourcesProps {
  sources: EvidenceSourceItem[];
}

export const EvidenceSources: React.FC<EvidenceSourcesProps> = ({ sources }) => {
  if (!sources || sources.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-100 text-slate-500 text-sm italic">
        No retrieved knowledge-base evidence available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-bold text-[#172554] uppercase tracking-wider flex items-center gap-2">
        <BookmarkCheck size={18} className="text-[#F59E0B]" />
        Retrieved Knowledge Base Evidence ({sources.length} Sources)
      </h4>
      <div className="grid grid-cols-1 gap-3">
        {sources.map((item, idx) => {
          const contentText = item.document || item.text || '';
          const scorePercent = item.score ? Math.round(item.score * 100) : null;
          return (
            <div key={idx} className="p-4 rounded-xl neo-surface border border-slate-200/80 hover:border-[#F59E0B]/50 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#172554]" />
                  <span className="text-xs font-bold text-[#172554] bg-[#EEF3FA] px-2 py-0.5 rounded-md border border-[#172554]/10">
                    {item.filename}
                  </span>
                  {item.section && (
                    <span className="text-xs font-medium text-slate-500">
                      • Section: <strong className="text-slate-700">{item.section}</strong>
                    </span>
                  )}
                </div>
                {scorePercent !== null && (
                  <span className="text-[11px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 px-2 py-0.5 rounded-full">
                    {scorePercent}% match
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white/60 p-2.5 rounded-lg border border-slate-100">
                "{contentText}"
              </p>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                <span>Source Citation: knowledge_base/{item.filename}</span>
                <span className="flex items-center gap-1 text-[#172554] font-semibold">
                  Verified Evidence <ExternalLink size={10} />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
