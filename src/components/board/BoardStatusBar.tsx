import React from 'react';
import { BoardDesignerUIState } from './boardInteraction';

interface BoardStatusBarProps {
  viewState: BoardDesignerUIState;
}

export const BoardStatusBar: React.FC<BoardStatusBarProps> = ({ viewState }) => {
  const { mouseXMm, mouseYMm, activeLayerId, selectedNetName, gridSizeMm, zoom } = viewState;

  const xMil = mouseXMm != null ? (mouseXMm * 39.3701).toFixed(0) : '0';
  const yMil = mouseYMm != null ? (mouseYMm * 39.3701).toFixed(0) : '0';

  return (
    <div className="h-9 bg-white border-t border-slate-200 px-4 flex items-center justify-between text-xs text-slate-600 select-none shadow-sm">
      {/* Coordinates (mm and mil) */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-slate-400">X:</span>
          <span className="text-slate-900 font-semibold w-14 text-right">
            {mouseXMm != null ? mouseXMm.toFixed(2) : '0.00'}
          </span>
          <span className="text-slate-400 text-[10px]">mm</span>
          <span className="text-slate-400 text-[10px]">({xMil} mil)</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-slate-400">Y:</span>
          <span className="text-slate-900 font-semibold w-14 text-right">
            {mouseYMm != null ? mouseYMm.toFixed(2) : '0.00'}
          </span>
          <span className="text-slate-400 text-[10px]">mm</span>
          <span className="text-slate-400 text-[10px]">({yMil} mil)</span>
        </div>
      </div>

      {/* Center metadata */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Active Layer:</span>
          <span className="text-indigo-700 font-semibold uppercase text-[11px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {activeLayerId ? activeLayerId.replace('-', ' ') : 'Top Copper'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Active Net:</span>
          <span className="text-emerald-700 font-semibold font-mono text-[11px]">
            {selectedNetName || 'GND'}
          </span>
        </div>
      </div>

      {/* Right settings & scale status */}
      <div className="flex items-center gap-4 font-mono text-right text-[11px]">
        <div>
          <span className="text-slate-400 mr-1">Grid:</span>
          <span className="text-slate-800 font-semibold">{gridSizeMm.toFixed(2)} mm</span>
        </div>
        <div>
          <span className="text-slate-400 mr-1">Scale:</span>
          <span className="text-slate-800 font-semibold">{Math.round(zoom * 10)}%</span>
        </div>
      </div>
    </div>
  );
};
