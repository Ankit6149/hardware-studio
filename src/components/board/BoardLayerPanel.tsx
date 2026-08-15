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
      description: 'Create a real board identity for this project. Physical dimensions, stackup, and manufacturing details can be completed in Board settings.',
      label: 'Board name',
      defaultValue: `PCB ${(boards || []).length + 1}`,
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
      mountingNotes: 'Created from the PCB board selector.',
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
    <div className="flex w-48 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/50 p-2">
        <div className="mb-2 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-indigo-600" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Layers</span>
        </div>

        <div className="mb-2.5 space-y-1.5">
          <label className="block text-[8px] font-bold uppercase tracking-wider text-slate-400">PCB Board</label>
          <div className="flex gap-1">
            <select
              value={activeBoardId || ''}
              onChange={(event) => {
                const boardId = event.target.value;
                if (!boardId) return;
                useProjectStore.getState().setActiveBoard(boardId);
                onViewStateChange({ activeBoardId: boardId });
              }}
              className="flex-1 rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[10px] text-slate-800 shadow-xs focus:border-indigo-500 focus:outline-none"
              aria-label="Active PCB board"
            >
              <option value="" disabled>Select board</option>
              {(boards || []).map((board) => (
                <option key={board.id} value={board.id}>{board.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void handleAddBoard()}
              className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-600 hover:bg-slate-200"
              title="Add a PCB board"
              aria-label="Add PCB board"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-0.5 overflow-y-auto bg-white p-1.5">
        {LAYER_DEFS.map((layer) => {
          const visible = layerVisibility[layer.key] !== false;
          const isActive = activeLayerId === layer.key;
          return (
            <div
              key={layer.key}
              className={`flex items-center gap-1.5 rounded px-2 py-1 text-[10px] transition-all ${
                isActive
                  ? 'bg-indigo-50 font-semibold text-indigo-950 ring-1 ring-indigo-300'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleLayer(layer.key)}
                className="shrink-0"
                title={visible ? 'Hide layer' : 'Show layer'}
                aria-label={`${visible ? 'Hide' : 'Show'} ${layer.label}`}
              >
                {visible ? (
                  <Eye className="h-3 w-3 text-slate-400" />
                ) : (
                  <EyeOff className="h-3 w-3 text-slate-500" />
                )}
              </button>
              <div
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: layer.color, opacity: visible ? 1 : 0.3 }}
              />
              <button
                type="button"
                onClick={() => onViewStateChange({ activeLayerId: layer.key })}
                className={`flex-1 truncate text-left font-semibold ${visible ? 'text-slate-700' : 'text-slate-400'}`}
              >
                {layer.label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-2">
        <div className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
          Active: {LAYER_DEFS.find((layer) => layer.key === activeLayerId)?.label || 'Top Copper'}
        </div>
      </div>
    </div>
  );
};
