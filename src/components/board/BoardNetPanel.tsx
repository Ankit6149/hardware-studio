import React, { useMemo, useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { BoardViewState } from './boardInteractionTypes';
import { Network, Search, CheckCircle2, AlertCircle } from 'lucide-react';

interface BoardNetPanelProps {
  viewState: BoardViewState;
  onViewStateChange: (patch: Partial<BoardViewState>) => void;
}

export const BoardNetPanel: React.FC<BoardNetPanelProps> = ({ viewState, onViewStateChange }) => {
  const { nets, traces, padNetAssignments } = useProjectStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'power' | 'signal' | 'ground' | 'unrouted'>('all');

  const netList = useMemo(() => {
    const allNets = nets || [];
    const allTraces = traces || [];
    return allNets.map(net => {
      const netTraces = allTraces.filter(t => t.netName === net.netName || t.netId === net.id);
      const padCount = (padNetAssignments || []).filter(a => a.netName === net.netName).length;
      return {
        ...net,
        traceCount: netTraces.length,
        padCount,
        isRouted: netTraces.length > 0,
      };
    });
  }, [nets, traces, padNetAssignments]);

  const filteredNets = useMemo(() => {
    let list = netList;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(n => n.netName.toLowerCase().includes(q));
    }
    if (filter === 'power') list = list.filter(n => n.netType === 'Power');
    if (filter === 'signal') list = list.filter(n => ['Signal', 'Clock', 'Differential', 'Analog', 'Digital', 'Programming'].includes(n.netType));
    if (filter === 'ground') list = list.filter(n => n.netType === 'Ground');
    if (filter === 'unrouted') list = list.filter(n => !n.isRouted);
    return list;
  }, [netList, search, filter]);

  const { selectedNetName } = viewState;

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 mb-2">
          <Network className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Nets</span>
          <span className="ml-auto text-[8px] text-slate-600 font-mono">{netList.length}</span>
        </div>
        <div className="relative mb-1.5">
          <Search className="w-3 h-3 text-slate-600 absolute left-1.5 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nets..."
            className="w-full bg-slate-800 text-slate-300 text-[10px] pl-5 pr-2 py-1 rounded border border-slate-700 placeholder-slate-600"
          />
        </div>
        <div className="flex gap-0.5">
          {(['all', 'power', 'signal', 'ground', 'unrouted'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                filter === f ? 'bg-indigo-700 text-indigo-100' : 'text-slate-500 hover:bg-slate-800'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
        {filteredNets.map(net => {
          const isSelected = selectedNetName === net.netName;
          return (
            <button
              key={net.id}
              onClick={() => onViewStateChange({
                selectedNetName: isSelected ? null : net.netName,
                activeTool: isSelected ? viewState.activeTool : 'route-trace',
              })}
              className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded text-[10px] text-left transition-all ${
                isSelected
                  ? 'bg-cyan-900/40 ring-1 ring-cyan-500 text-cyan-200'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
              }`}
            >
              {net.isRouted ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-bold truncate">{net.netName}</div>
                <div className="text-[8px] text-slate-600">
                  {net.netType} • {net.padCount} pads • {net.traceCount} traces
                </div>
              </div>
              <span className={`text-[8px] px-1 py-0.5 rounded font-bold uppercase ${
                net.isRouted ? 'bg-emerald-900/40 text-emerald-400' : 'bg-amber-900/40 text-amber-400'
              }`}>
                {net.isRouted ? 'Routed' : 'Open'}
              </span>
            </button>
          );
        })}
        {filteredNets.length === 0 && (
          <div className="text-center text-[10px] text-slate-600 py-4">No nets found</div>
        )}
      </div>
    </div>
  );
};
