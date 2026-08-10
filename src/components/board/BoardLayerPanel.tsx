import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { BoardDesignerUIState } from './boardInteraction';
import { Eye, EyeOff, Layers } from 'lucide-react';
import { useFeedback } from '../feedback/FeedbackProvider';

interface BoardLayerPanelProps {
  viewState: BoardDesignerUIState;
  onViewStateChange: (patch: Partial<BoardDesignerUIState>) => void;
}

const LAYER_DEFS = [
  { key: 'top-copper', label: 'Top Copper', color: '#ef4444' },
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
  const { notify, prompt: requestText } = useFeedback();
  const { layerVisibility, activeLayerId, activeBoardId } = viewState;


  const handleAddBoard = async () => {
    const name = await requestText({
      title: 'Create a PCB board',
      description: 'Add a separate board document to this project. The board will start with default prototype settings that can be edited afterward.',
      label: 'Board name',
      defaultValue: `Multi-board Layout ${(boards || []).length + 1}`,
      placeholder: 'Main controller board',
      required: true,
      minLength: 2,
      maxLength: 80,
      confirmLabel: 'Create board',
    });
    if (!name) return;

    const state = useProjectStore.getState();
    const newBoard = state.addBoard({
      name,
      mountingNotes: 'Added via Multi-board manager',
    });
    state.setActiveBoard(newBoard.id);
    onViewStateChange({ activeBoardId: newBoard.id });
    notify({ tone: 'success', title: 'PCB board created', detail: `Created “${name}” and made it active.` });
  };

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
    <div className="w-48 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden shadow-sm">
      <div className="p-2 border-b border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-1.5 mb-2">
          <Layers className="w-3.5 h-3.5 text-indigo-600" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Layers</span>
        </div>

        {/* Board selector */}
        <div className="space-y-1.5 mb-2.5">
          <label className="text-[8px] text-slate-400 font-bold block uppercase tracking-wider">PCB Board</label>
          <div className="flex gap-1">
            <select
              value={activeBoardId || 'board-main'}
              onChange={(e) => {
                const val = e.target.value;
                useProjectStore.getState().setActiveBoard(val);
                onViewStateChange({ activeBoardId: val });
              }}
              className="flex-1 bg-white text-slate-800 text-[10px] px-2 py-0.5 rounded border border-slate-200 font-mono focus:outline-none focus:border-indigo-500 shadow-xs"
            >
              {(boards || []).map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            <button
              onClick={() => void handleAddBoard()}
              className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-indigo-600 font-bold text-[9px] rounded border border-slate-200"
              title="Add a new PCB board layer"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 bg-white">
        {LAYER_DEFS.map(layer => {
          const visible = layerVisibility[layer.key] !== false;
          const isActive = activeLayerId === layer.key;
          return (
            <div
              key={layer.key}
              className={`flex items-center gap-1.5 px-2 py-1 rounded text-[10px] cursor-pointer transition-all ${
                isActive ? 'bg-indigo-50 ring-1 ring-indigo-300 font-semibold text-indigo-950' : 'hover:bg-slate-50 text-slate-700'
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
