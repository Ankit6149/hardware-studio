import React from 'react';
import { BoardDesignerUIState } from './boardInteraction';

interface BoardStatusBarProps {
  viewState: BoardDesignerUIState;
}

export const BoardStatusBar: React.FC<BoardStatusBarProps> = ({ viewState }) => {
  const { mouseXMm, mouseYMm, activeLayerId, selectedNetName, gridSizeMm, zoom } = viewState;

  return (
    <div className="h-9 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 select-none">
      {/* Coordinates */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 font-mono">
          <span className="text-slate-500">X:</span>
          <span className="text-slate-200 font-semibold w-16 text-right">
            {mouseXMm != null ? mouseXMm.toFixed(2) : '0.00'}
          </span>
          <span className="text-slate-500">mm</span>
        </div>
        <div className="flex items-center gap-1 font-mono">
          <span className="text-slate-500">Y:</span>
          <span className="text-slate-200 font-semibold w-16 text-right">
            {mouseYMm != null ? mouseYMm.toFixed(2) : '0.00'}
          </span>
          <span className="text-slate-500">mm</span>
        </div>
      </div>

      {/* Center metadata */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Active Layer:</span>
          <span className="text-slate-200 font-medium capitalize">
            {activeLayerId ? activeLayerId.replace('-', ' ') : 'None'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500">Selected Net:</span>
          <span className="text-indigo-400 font-semibold font-mono">
            {selectedNetName || 'None'}
          </span>
        </div>
      </div>

      {/* Right control settings status */}
      <div className="flex items-center gap-4 font-mono text-right">
        <div>
          <span className="text-slate-500 mr-1">Grid:</span>
          <span className="text-slate-300 font-semibold">{gridSizeMm.toFixed(2)} mm</span>
        </div>
        <div>
          <span className="text-slate-500 mr-1">Zoom:</span>
          <span className="text-slate-300 font-semibold">{Math.round(zoom * 10)}%</span>
        </div>
      </div>
    </div>
  );
};
