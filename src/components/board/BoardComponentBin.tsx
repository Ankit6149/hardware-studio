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

  const unplaced = useMemo(() => {
    return boardComponents.filter(c => c.placementX == null || c.placementY == null);
  }, [boardComponents]);

  const placed = useMemo(() => {
    return boardComponents.filter(c => c.placementX != null && c.placementY != null);
  }, [boardComponents]);

  const filtered = useMemo(() => {
    const list = showPlaced ? placed : unplaced;
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(c =>
      c.referenceDesignator.toLowerCase().includes(q) ||
      c.componentName.toLowerCase().includes(q)
    );
  }, [showPlaced, placed, unplaced, search]);

  const getStatusBadge = (comp: typeof boardComponents[0]) => {
    if (comp.lockedPlacement) return { text: 'Locked', cls: 'bg-amber-900/40 text-amber-400' };
    if (comp.placementX == null) return { text: 'Unplaced', cls: 'bg-slate-800 text-slate-500' };
    if (comp.placementStatus === 'Needs Review') return { text: 'Review', cls: 'bg-amber-900/40 text-amber-400' };
    const fp = getFootprint(comp.footprint);
    if (fp.name === 'CUSTOM_RECT' && comp.footprint !== 'CUSTOM_RECT') return { text: 'No FP', cls: 'bg-red-900/40 text-red-400' };
    return { text: 'Placed', cls: 'bg-emerald-900/40 text-emerald-400' };
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 shrink-0" style={{ maxHeight: '200px' }}>
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-800">
        <Component className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Components</span>
        <span className="text-[8px] text-slate-600 font-mono">{unplaced.length} unplaced / {placed.length} placed</span>

        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setShowPlaced(false)}
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${!showPlaced ? 'bg-indigo-700 text-indigo-100' : 'text-slate-500 hover:bg-slate-800'}`}
          >
            Unplaced ({unplaced.length})
          </button>
          <button
            onClick={() => setShowPlaced(true)}
            className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${showPlaced ? 'bg-indigo-700 text-indigo-100' : 'text-slate-500 hover:bg-slate-800'}`}
          >
            Placed ({placed.length})
          </button>
          <button onClick={onAutoPlace} className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-100 text-[8px] font-bold uppercase hover:bg-emerald-700">
            Auto Place All
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 px-3 py-1">
        <Search className="w-3 h-3 text-slate-600" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search refdes or name..."
          className="flex-1 bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700 placeholder-slate-600"
        />
      </div>

      <div className="overflow-x-auto overflow-y-auto px-2 pb-2 flex flex-wrap gap-1" style={{ maxHeight: '120px' }}>
        {filtered.map(comp => {
          const badge = getStatusBadge(comp);
          const isSelected = viewState.selectedComponentId === comp.id;
          return (
            <button
              key={comp.id}
              onClick={() => onViewStateChange({
                selectedComponentId: comp.id,
                selectedTraceId: null,
                selectedViaId: null,
                selectedDrillHoleId: null,
                selectedKeepoutId: null,
              })}
              className={`flex items-center gap-1.5 px-2 py-1 rounded border text-[10px] transition-all shrink-0 ${
                isSelected
                  ? 'bg-slate-800 border-indigo-500 text-indigo-200'
                  : 'bg-slate-850 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              <GripVertical className="w-2.5 h-2.5 text-slate-600" />
              <span className="font-bold font-mono">{comp.referenceDesignator}</span>
              <span className="text-slate-600 truncate max-w-[80px]">{comp.componentName}</span>
              <span className={`text-[7px] px-1 py-0.5 rounded font-bold uppercase ${badge.cls}`}>{badge.text}</span>
              {comp.lockedPlacement && <Lock className="w-2.5 h-2.5 text-amber-500" />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-[10px] text-slate-600 py-2 w-full text-center">
            {showPlaced ? 'No placed components' : 'All components placed'}
          </div>
        )}
      </div>
    </div>
  );
};
