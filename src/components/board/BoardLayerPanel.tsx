import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { BoardDesignerUIState } from './boardInteraction';
import { Eye, EyeOff, Layers, Plus } from 'lucide-react';
import { useFeedback } from '../feedback/FeedbackProvider';

interface BoardLayerPanelProps {
  viewState: BoardDesignerUIState;
  onViewStateChange: (patch: Partial<BoardDesignerUIState>) => void;
}

const LAYER_DEFS = [
  { key: 'top-copper', label: 'Top Copper', color: '#b84a3c' },
  { key: 'bottom-copper', label: 'Bottom Copper', color: '#405a78' },
  { key: 'silkscreen', label: 'Silkscreen', color: '#b38b32' },
  { key: 'mask', label: 'Solder Mask', color: '#75607f' },
  { key: 'paste', label: 'Paste', color: '#a9653a' },
  { key: 'drill', label: 'Drills / Vias', color: '#77736b' },
  { key: 'keepouts', label: 'Keepouts', color: '#a44a42' },
  { key: 'ratsnest', label: 'Ratsnest', color: '#55524d' },
  { key: 'drc', label: 'DRC Markers', color: '#b55b55' },
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
    <section className="flex h-full w-48 shrink-0 flex-col overflow-hidden bg-white" aria-label="PCB layers">
      <div className="border-b border-slate-200 bg-slate-50 p-2.5">
        <div className="flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
          <span className="text-[10px] font-semibold text-slate-700">Layers</span>
        </div>
        <label className="mt-2 block text-[9px] font-medium text-slate-500" htmlFor="pcb-layer-board">Board</label>
        <div className="mt-1 flex gap-1">
          <select
            id="pcb-layer-board"
            value={activeBoardId || ''}
            onChange={(event) => {
              const boardId = event.target.value;
              if (!boardId) return;
              useProjectStore.getState().setActiveBoard(boardId);
              onViewStateChange({ activeBoardId: boardId });
            }}
            className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[10px] text-slate-800 focus:border-slate-500 focus:outline-none"
          >
            <option value="" disabled>Select board</option>
            {(boards || []).map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}
          </select>
          <button type="button" onClick={() => void handleAddBoard()} className="grid h-7 w-7 place-items-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-100" aria-label="Add PCB board" title="Add PCB board"><Plus className="h-3.5 w-3.5" /></button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {LAYER_DEFS.map((layer) => {
          const visible = layerVisibility[layer.key] !== false;
          const isActive = activeLayerId === layer.key;
          return (
            <div key={layer.key} className={`flex min-h-9 items-center gap-1.5 rounded-md px-1.5 ${isActive ? 'bg-slate-100' : 'hover:bg-slate-50'}`}>
              <button type="button" onClick={() => toggleLayer(layer.key)} className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-white hover:text-slate-700" title={visible ? `Hide ${layer.label}` : `Show ${layer.label}`} aria-label={`${visible ? 'Hide' : 'Show'} ${layer.label}`}>
                {visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: layer.color, opacity: visible ? 1 : 0.3 }} aria-hidden="true" />
              <button type="button" onClick={() => onViewStateChange({ activeLayerId: layer.key })} className={`min-w-0 flex-1 truncate text-left text-[10px] ${isActive ? 'font-semibold text-slate-950' : visible ? 'font-medium text-slate-700' : 'text-slate-400'}`} aria-pressed={isActive}>
                {layer.label}
              </button>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-2.5 py-2 text-[9px] text-slate-500">
        Active · {LAYER_DEFS.find((layer) => layer.key === activeLayerId)?.label || 'Top Copper'}
      </div>
    </section>
  );
};