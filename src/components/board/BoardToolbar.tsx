import React from 'react';
import { BoardDesignerUIState, BoardTool, GRID_PRESETS } from './boardInteraction';
import {
  MousePointer2, Move, Component, Route, Circle, Drill, Square, Ruler,
  LayoutGrid, Magnet, Play, Zap, FileText, Download, Package, AlertTriangle,
} from 'lucide-react';

interface BoardToolbarProps {
  viewState: BoardDesignerUIState;
  onViewStateChange: (patch: Partial<BoardDesignerUIState>) => void;
  drcCount: number;
  onAutoPlace: () => void;
  onRoughAutoroute: () => void;
  onRunDRC: () => void;
  onGenerateBlueprint: () => void;
  onExportBoard: () => void;
  onOpenFactory: () => void;
}

const tools: { tool: BoardTool; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { tool: 'select', label: 'Select', Icon: MousePointer2 },
  { tool: 'pan', label: 'Pan', Icon: Move },
  { tool: 'place-component', label: 'Place', Icon: Component },
  { tool: 'route', label: 'Route', Icon: Route },
  { tool: 'via', label: 'Via', Icon: Circle },
  { tool: 'drill', label: 'Drill', Icon: Drill },
  { tool: 'keepout', label: 'Keepout', Icon: Square },
  { tool: 'measure', label: 'Measure', Icon: Ruler },
];

export const BoardToolbar: React.FC<BoardToolbarProps> = ({
  viewState, onViewStateChange, drcCount,
  onAutoPlace, onRoughAutoroute, onRunDRC,
  onGenerateBlueprint, onExportBoard, onOpenFactory,
}) => {
  const { activeTool, gridSizeMm, snapToGrid } = viewState;

  return (
    <div className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 border-b border-slate-800 select-none shrink-0">
      {/* Tool buttons */}
      <div className="flex items-center gap-0.5 mr-2 border-r border-slate-800 pr-2">
        {tools.map(({ tool, label, Icon }) => (
          <button
            key={tool}
            onClick={() => onViewStateChange({ activeTool: tool, isRouting: false, routePreviewPoints: [] })}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
              activeTool === tool
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
            title={label}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Grid controls */}
      <div className="flex items-center gap-1.5 mr-2 border-r border-slate-800 pr-2">
        <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
        <select
          value={gridSizeMm}
          onChange={(e) => onViewStateChange({ gridSizeMm: parseFloat(e.target.value) })}
          className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 font-mono"
        >
          {GRID_PRESETS.map(g => (
            <option key={g} value={g}>{g}mm</option>
          ))}
        </select>
        <button
          onClick={() => onViewStateChange({ snapToGrid: !snapToGrid })}
          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
            snapToGrid ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-800 text-slate-500'
          }`}
          title="Toggle snap to grid"
        >
          <Magnet className="w-3 h-3" />
          Snap
        </button>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        <button onClick={onAutoPlace} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors" title="Auto-place all unplaced components">
          <Play className="w-3 h-3 inline mr-0.5" />Auto Place
        </button>
        <button onClick={onRoughAutoroute} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors" title="Rough autoroute simple nets">
          <Zap className="w-3 h-3 inline mr-0.5" />Autoroute
        </button>
        <button onClick={onRunDRC} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors relative" title="Run design rule check">
          <AlertTriangle className="w-3 h-3 inline mr-0.5" />DRC
          {drcCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">{drcCount > 9 ? '9+' : drcCount}</span>
          )}
        </button>

        <div className="w-px h-5 bg-slate-700 mx-1" />

        <button onClick={onGenerateBlueprint} className="px-2 py-1 rounded bg-indigo-700 text-indigo-100 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-600 transition-colors" title="Generate PCB Blueprint">
          <FileText className="w-3 h-3 inline mr-0.5" />Blueprint
        </button>
        <button onClick={onExportBoard} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors" title="Export board layout JSON">
          <Download className="w-3 h-3 inline mr-0.5" />Export
        </button>
        <button onClick={onOpenFactory} className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-700 transition-colors" title="Open Factory Package Builder">
          <Package className="w-3 h-3 inline mr-0.5" />Factory
        </button>
      </div>

      {/* Coordinate readout */}
      <div className="ml-auto text-[10px] font-mono text-slate-500">
        <span className="text-slate-400">{viewState.mouseXMm.toFixed(2)}</span>
        <span className="text-slate-600">,</span>
        <span className="text-slate-400">{viewState.mouseYMm.toFixed(2)}</span>
        <span className="text-slate-600 ml-1">mm</span>
      </div>
    </div>
  );
};
