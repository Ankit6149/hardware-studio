import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { runValidationRules } from '../lib/validationRules';
import { AlertCircle, ChevronDown, ChevronUp, CheckCircle, ShieldAlert } from 'lucide-react';

export const ReviewWarnings: React.FC = () => {
  const { nodes, edges } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);

  const warnings = runValidationRules(nodes, edges);
  const criticalCount = warnings.filter(w => w.severity === 'critical').length;
  const warningCount = warnings.filter(w => w.severity === 'warning').length;
  const totalCount = warnings.length;

  const criticalWarnings = warnings.filter(w => w.severity === 'critical');
  const otherWarnings = warnings.filter(w => w.severity === 'warning');
  const infoWarnings = warnings.filter(w => w.severity === 'info');

  return (
    <div className="border-t border-slate-200 bg-white w-full shadow-[0_-3px_15px_rgba(15,23,42,0.04)] transition-all duration-300 z-10 shrink-0 select-none">
      {/* Header bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 border-b border-slate-100 transition-colors text-left focus:outline-none cursor-pointer"
      >
        <div className="flex items-center space-x-2.5">
          <ShieldAlert className={`w-4 h-4 ${criticalCount > 0 ? 'text-red-500 animate-pulse' : totalCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          <span className="text-xs font-extrabold text-slate-800 uppercase tracking-widest">
            Architecture Review
          </span>
          <span className="text-[10px] text-slate-300">|</span>
          {totalCount === 0 ? (
            <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1 uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5 inline mr-1" />
              <span>All validation rules passed</span>
            </span>
          ) : (
            <span className="text-xs font-bold text-slate-600">
              Found {totalCount} architectural constraint issue{totalCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {totalCount > 0 && !isOpen && (
            <div className="flex space-x-1.5 scale-90">
              {criticalCount > 0 && (
                <span className="bg-red-50 border border-red-200 text-red-700 text-[8px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                  {criticalCount} Critical
                </span>
              )}
              {warningCount > 0 && (
                <span className="bg-amber-50 border border-amber-200 text-amber-700 text-[8px] px-2 py-0.5 rounded font-extrabold uppercase tracking-wider">
                  {warningCount} Warning
                </span>
              )}
            </div>
          )}
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Warnings List */}
      {isOpen && (
        <div className="max-h-56 overflow-y-auto p-4 bg-slate-50/50 space-y-4">
          {warnings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-500">
              <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
              <p className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider">Zero Warnings Found</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-sm text-center leading-relaxed">The current hardware blueprint meets all design validation constraints configured for this studio template.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Critical Warnings */}
              {criticalWarnings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest block pl-1">Critical Issues ({criticalWarnings.length})</span>
                  {criticalWarnings.map(w => (
                    <div key={w.id} className="flex items-start space-x-2 px-3 py-2 bg-red-50 border border-red-200 text-red-800 rounded-md text-[11px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-600" />
                      <div className="flex-1 leading-tight">
                        <span className="font-extrabold uppercase tracking-wider text-[8px] bg-red-100/70 border border-red-200 px-1.5 py-0.25 rounded mr-2 inline-block">CRITICAL</span>
                        <span>{w.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Warning Warnings */}
              {otherWarnings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest block pl-1">Architectural Warnings ({otherWarnings.length})</span>
                  {otherWarnings.map(w => (
                    <div key={w.id} className="flex items-start space-x-2 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-md text-[11px] font-medium shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                      <div className="flex-1 leading-tight">
                        <span className="font-extrabold uppercase tracking-wider text-[8px] bg-amber-100/70 border border-amber-200 px-1.5 py-0.25 rounded mr-2 inline-block">WARNING</span>
                        <span>{w.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Info Warnings */}
              {infoWarnings.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block pl-1">Design Suggestions ({infoWarnings.length})</span>
                  {infoWarnings.map(w => (
                    <div key={w.id} className="flex items-start space-x-2 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-md text-[11px] font-medium">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-500" />
                      <div className="flex-1 leading-tight">
                        <span className="font-extrabold uppercase tracking-wider text-[8px] bg-slate-100 border border-slate-200 px-1.5 py-0.25 rounded mr-2 inline-block">SUGGESTION</span>
                        <span>{w.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
