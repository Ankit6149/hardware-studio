import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { BoardDesignerUIState } from './boardInteraction';
import { Eye, EyeOff, Layers } from 'lucide-react';

interface BoardLayerPanelProps {
  viewState: BoardDesignerUIState;
  onViewStateChange: (patch: Partial<BoardDesignerUIState>) => void;
}

const LAYER_DEFS = [
  { key: 'top-copper', label: 'Top Copper', color: '#22c55e' },
  { key: 'bottom-copper', label: 'Bottom Copper', color: '#3b82f6' },
  { key: 'silkscreen', label: 'Silkscreen', color: '#fbbf24' },
  { key: 'mask', label: 'Solder Mask', color: '#a855f7' },
  { key: 'paste', label: 'Paste', color: '#f97316' },
  { key: 'drill', label: 'Drills / Vias', color: '#94a3b8' },
  { key: 'keepouts', label: 'Keepouts', color: '#ef4444' },
  { key: 'ratsnest', label: 'Ratsnest', color: '#475569' },
  { key: 'drc', label: 'DRC Markers', color: '#fca5a5' },
];

export const BoardLayerPanel: React.FC<BoardLayerPanelProps> = ({ viewState, onViewStateChange }) => {
  const { boards } = useProjectStore();
  const { layerVisibility, activeLayerId, activeBoardId } = viewState;

  const toggleLayer = (key: string) => {
    onViewStateChange({
      layerVisibility: {
        ...layerVisibility,
        [key]: !layerVisibility[key],
      },
      showRatsnest: key === 'ratsnest' ? !layerVisibility[key] : viewState.showRatsnest,
      showDRC: key === 'drc' ? !layerVisibility[key] : viewState.showDRC,
    });
  };

  return (
    <div className="w-48 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 overflow-hidden">
      <div className="p-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Layers</span>
        </div>

        {/* Board selector */}
        <div className="space-y-1.5 mb-2.5">
          <label className="text-[8px] text-slate-500 font-bold block uppercase tracking-wider">PCB Board</label>
          <div className="flex gap-1">
            <select
              value={activeBoardId || 'board-main'}
              onChange={(e) => {
                const val = e.target.value;
                useProjectStore.getState().setActiveBoard(val);
                onViewStateChange({ activeBoardId: val });
              }}
              className="flex-1 bg-slate-950 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-800 font-mono focus:outline-none focus:border-indigo-500"
            >
              {(boards || []).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button
              onClick={() => {
                const name = window.prompt("Enter new PCB board name:", `Multi-board Layout ${(boards || []).length + 1}`);
                if (name) {
                  const state = useProjectStore.getState();
                  const newBoard = state.addBoard({
                    name,
                    mountingNotes: 'Added via Multi-board manager'
                  });
                  state.setActiveBoard(newBoard.id);
                  onViewStateChange({ activeBoardId: newBoard.id });
                }
              }}
              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold text-[9px] rounded"
              title="Add a new PCB board layer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {LAYER_DEFS.map(layer => {
          const visible = layerVisibility[layer.key] !== false;
          const isActive = activeLayerId === layer.key;
          return (
            <div
              key={layer.key}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] cursor-pointer transition-all ${
                isActive ? 'bg-slate-800 ring-1 ring-indigo-500' : 'hover:bg-slate-800/50'
              }`}
            >
              <button
                onClick={() => toggleLayer(layer.key)}
                className="shrink-0"
                title={visible ? 'Hide layer' : 'Show layer'}
              >
                {visible ? (
                  <Eye className="w-3 h-3 text-slate-400" />
                ) : (
                  <EyeOff className="w-3 h-3 text-slate-600" />
                )}
              </button>
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: layer.color, opacity: visible ? 1 : 0.3 }}
              />
              <button
                onClick={() => onViewStateChange({ activeLayerId: layer.key })}
                className={`flex-1 text-left font-semibold truncate ${
                  visible ? 'text-slate-300' : 'text-slate-600'
                }`}
              >
                {layer.label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="p-2 border-t border-slate-800">
        <div className="text-[8px] text-slate-600 uppercase tracking-wider font-bold">
          Active: {LAYER_DEFS.find(l => l.key === activeLayerId)?.label || 'Top Copper'}
        </div>
      </div>
    </div>
  );
};
