import React, { useMemo, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { BoardDesignerUIState } from './boardInteraction';
import { Component, Search, GripVertical, Lock } from 'lucide-react';
import { getFootprint } from '../../lib/footprints';

interface BoardComponentBinProps {
  viewState: BoardDesignerUIState;
  onViewStateChange: (patch: Partial<BoardDesignerUIState>) => void;
  onAutoPlace: () => void;
}

export const BoardComponentBin: React.FC<BoardComponentBinProps> = ({ viewState, onViewStateChange, onAutoPlace }) => {
  const { boardComponents = [] } = useProjectStore();
  const [search, setSearch] = useState('');
  const [showPlaced, setShowPlaced] = useState(false);

  const unplaced = useMemo(() => boardComponents.filter((component) => component.placementX == null || component.placementY == null), [boardComponents]);
  const placed = useMemo(() => boardComponents.filter((component) => component.placementX != null && component.placementY != null), [boardComponents]);

  const filtered = useMemo(() => {
    const list = showPlaced ? placed : unplaced;
    if (!search) return list;
    const query = search.toLowerCase();
    return list.filter((component) =>
      component.referenceDesignator.toLowerCase().includes(query)
      || component.componentName.toLowerCase().includes(query)
    );
  }, [placed, search, showPlaced, unplaced]);

  const getStatus = (component: typeof boardComponents[0]) => {
    if (component.lockedPlacement) return { text: 'Locked', cls: 'bg-amber-50 text-amber-800 border-amber-200' };
    if (component.placementX == null || component.placementY == null) return { text: 'Unplaced', cls: 'bg-slate-100 text-slate-600 border-slate-200' };
    if (component.placementStatus === 'Needs Review') return { text: 'Review', cls: 'bg-amber-50 text-amber-800 border-amber-200' };
    const footprint = getFootprint(component.footprint);
    if (footprint.name === 'CUSTOM_RECT' && component.footprint !== 'CUSTOM_RECT') return { text: 'No footprint', cls: 'bg-red-50 text-red-700 border-red-200' };
    return { text: 'Placed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  const selectComponent = (componentId: string) => {
    onViewStateChange({
      selectedComponentId: componentId,
      selectedTraceId: null,
      selectedViaId: null,
      selectedDrillHoleId: null,
      selectedKeepoutId: null,
    });
  };

  return (
    <section className="max-h-[210px] bg-white" aria-label="PCB components">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2">
        <Component className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
        <span className="text-[10px] font-semibold text-slate-700">Components</span>
        <span className="text-[9px] text-slate-400">{unplaced.length} unplaced · {placed.length} placed</span>

        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => setShowPlaced(false)} aria-pressed={!showPlaced} className={`min-h-7 rounded-md px-2 text-[9px] font-semibold ${!showPlaced ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Unplaced</button>
          <button type="button" onClick={() => setShowPlaced(true)} aria-pressed={showPlaced} className={`min-h-7 rounded-md px-2 text-[9px] font-semibold ${showPlaced ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-200'}`}>Placed</button>
          <button type="button" onClick={onAutoPlace} className="min-h-7 rounded-md border border-slate-300 bg-white px-2 text-[9px] font-semibold text-slate-700 hover:bg-slate-100">Auto place</button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 border-b border-slate-100 px-3 py-1.5">
        <Search className="h-3 w-3 text-slate-400" aria-hidden="true" />
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search reference or name" className="h-7 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-2 text-[10px] text-slate-700 outline-none placeholder:text-slate-400 focus:border-slate-500" />
      </div>

      <div className="flex max-h-[130px] flex-wrap gap-1.5 overflow-auto p-2">
        {filtered.map((component) => {
          const status = getStatus(component);
          const selected = viewState.selectedComponentId === component.id;
          return (
            <div
              key={component.id}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/hardware-studio-component', component.id);
                selectComponent(component.id);
              }}
              className={`flex min-h-8 shrink-0 items-center gap-1.5 rounded-md border bg-white px-1.5 py-1 ${selected ? 'border-slate-950 ring-1 ring-slate-950/10' : 'border-slate-200 hover:border-slate-400'}`}
            >
              <GripVertical className="h-3 w-3 cursor-grab text-slate-400" aria-label="Drag component" />
              <button type="button" onClick={() => selectComponent(component.id)} className="flex min-w-0 items-center gap-1.5 text-left">
                <span className="font-mono text-[10px] font-semibold text-slate-900">{component.referenceDesignator}</span>
                <span className="max-w-[110px] truncate text-[9px] text-slate-500">{component.componentName}</span>
              </button>
              <span className={`rounded border px-1 py-0.5 text-[8px] font-semibold ${status.cls}`}>{status.text}</span>
              {component.lockedPlacement && <Lock className="h-3 w-3 text-amber-600" aria-hidden="true" />}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="w-full py-4 text-center text-[10px] text-slate-400">{showPlaced ? 'No placed components' : 'All components are placed'}</div>}
      </div>
    </section>
  );
};