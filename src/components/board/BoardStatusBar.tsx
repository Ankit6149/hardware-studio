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
    <div className="h-9 bg-slate-950 border-t border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 select-none backdrop-blur">
      {/* Coordinates (mm and mil) */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-slate-500">X:</span>
          <span className="text-slate-100 font-semibold w-14 text-right">
            {mouseXMm != null ? mouseXMm.toFixed(2) : '0.00'}
          </span>
          <span className="text-slate-500 text-[10px]">mm</span>
          <span className="text-slate-600 text-[10px]">({xMil} mil)</span>
        </div>

        <div className="flex items-center gap-1.5 font-mono">
          <span className="text-slate-500">Y:</span>
          <span className="text-slate-100 font-semibold w-14 text-right">
            {mouseYMm != null ? mouseYMm.toFixed(2) : '0.00'}
          </span>
          <span className="text-slate-500 text-[10px]">mm</span>
          <span className="text-slate-600 text-[10px]">({yMil} mil)</span>
        </div>
      </div>

      {/* Center metadata */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Active Layer:</span>
          <span className="text-indigo-300 font-semibold uppercase text-[11px] bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            {activeLayerId ? activeLayerId.replace('-', ' ') : 'Top Copper'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Active Net:</span>
          <span className="text-emerald-400 font-semibold font-mono text-[11px]">
            {selectedNetName || 'GND'}
          </span>
        </div>
      </div>

      {/* Right settings & scale status */}
      <div className="flex items-center gap-4 font-mono text-right text-[11px]">
        <div>
          <span className="text-slate-500 mr-1">Grid:</span>
          <span className="text-slate-200 font-semibold">{gridSizeMm.toFixed(2)} mm</span>
        </div>
        <div>
          <span className="text-slate-500 mr-1">Scale:</span>
          <span className="text-slate-200 font-semibold">{Math.round(zoom * 10)}%</span>
        </div>
      </div>
    </div>
  );
};
