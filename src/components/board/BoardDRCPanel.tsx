import React from 'react';
import { ReviewResult } from '../../types';
import { BoardViewState } from './boardInteractionTypes';
import { AlertTriangle, AlertOctagon, Info, CheckCircle2 } from 'lucide-react';

interface BoardDRCPanelProps {
  results: ReviewResult[];
  onViewStateChange: (patch: Partial<BoardViewState>) => void;
}

const severityOrder: Record<string, number> = { Blocker: 0, Error: 1, Warning: 2, Info: 3 };
const severityIcon: Record<string, React.FC<{ className?: string }>> = {
  Blocker: AlertOctagon, Error: AlertTriangle, Warning: AlertTriangle, Info: Info,
};
const severityColor: Record<string, string> = {
  Blocker: 'text-red-400', Error: 'text-red-400', Warning: 'text-amber-400', Info: 'text-blue-400',
};

export const BoardDRCPanel: React.FC<BoardDRCPanelProps> = ({ results, onViewStateChange }) => {
  const sorted = [...results].sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

  const blockers = results.filter(r => r.severity === 'Blocker').length;
  const errors = results.filter(r => r.severity === 'Error').length;
  const warnings = results.filter(r => r.severity === 'Warning').length;
  const infos = results.filter(r => r.severity === 'Info').length;

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 mb-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Design Rules</span>
        </div>
        <div className="flex gap-2 text-[9px] font-bold">
          {blockers > 0 && <span className="text-red-400">{blockers} Blocker{blockers > 1 ? 's' : ''}</span>}
          {errors > 0 && <span className="text-red-400">{errors} Error{errors > 1 ? 's' : ''}</span>}
          {warnings > 0 && <span className="text-amber-400">{warnings} Warning{warnings > 1 ? 's' : ''}</span>}
          {infos > 0 && <span className="text-blue-400">{infos} Info</span>}
          {results.length === 0 && (
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> All clear
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {sorted.map((r, i) => {
          const Icon = severityIcon[r.severity] || Info;
          const color = severityColor[r.severity] || 'text-slate-400';
          return (
            <button
              key={r.id || i}
              onClick={() => {
                if (r.linkedObjectId && r.linkedObjectType) {
                  const typeMap: Record<string, string> = {
                    component: 'component', trace: 'trace', via: 'via', drill: 'drill',
                  };
                  onViewStateChange({
                    selectedObjectId: r.linkedObjectId,
                    selectedObjectType: (typeMap[r.linkedObjectType] || null) as BoardViewState['selectedObjectType'],
                  });
                }
              }}
              className="w-full text-left flex items-start gap-1.5 px-2 py-1.5 rounded hover:bg-slate-800/50 transition-colors"
            >
              <Icon className={`w-3 h-3 shrink-0 mt-0.5 ${color}`} />
              <div className="min-w-0">
                <div className={`text-[10px] font-bold ${color}`}>{r.title}</div>
                <div className="text-[9px] text-slate-600 leading-relaxed">{r.description}</div>
                {r.suggestedFix && (
                  <div className="text-[8px] text-slate-600 mt-0.5 italic">💡 {r.suggestedFix}</div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
