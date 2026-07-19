import React from 'react';
import { useProjectStore } from '../../store/projectStore';
import { BoardDesignerUIState } from './boardInteraction';
import { getFootprint } from '../../lib/footprints';
import { Info, Cpu, Route, Circle as CircleIcon, Drill, Layers, Shield } from 'lucide-react';

interface BoardObjectInspectorProps {
  viewState: BoardDesignerUIState;
  onViewStateChange: (patch: Partial<BoardDesignerUIState>) => void;
}

export const BoardInspector: React.FC<BoardObjectInspectorProps> = ({ viewState }) => {
  const {
    boardComponents, traces, vias, drillHoles, keepoutZones, boards, boardOutlines,
    updateBoardComponent, updateTrace, updateVia, updateDrillHole, updateKeepoutZone, nets,
  } = useProjectStore();

  const {
    selectedComponentId, selectedTraceId, selectedViaId, selectedDrillHoleId, selectedKeepoutId
  } = viewState;

  const selectedObjectId =
    selectedComponentId || selectedTraceId || selectedViaId || selectedDrillHoleId || selectedKeepoutId;
  const selectedObjectType =
    selectedComponentId ? 'component' :
    selectedTraceId ? 'trace' :
    selectedViaId ? 'via' :
    selectedDrillHoleId ? 'drill' :
    selectedKeepoutId ? 'keepout' : null;

  if (!selectedObjectId || !selectedObjectType) {
    // Show board info
    const board = (boards || [])[0];
    const outline = (boardOutlines || [])[0];
    return (
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-3">
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Board Info</span>
        </div>
        {board ? (
          <div className="space-y-2 text-[10px]">
            <Field label="Name" value={board.name} />
            <Field label="Type" value={board.boardType} />
            <Field label="Substrate" value={board.substrate} />
            <Field label="Layers" value={String(board.layerCount)} />
            <Field label="Dimensions" value={board.dimensionsMm} />
            {outline && (
              <>
                <Field label="Width" value={`${outline.width?.toFixed(1) || '—'}mm`} />
                <Field label="Height" value={`${outline.height?.toFixed(1) || '—'}mm`} />
              </>
            )}
            <Field label="Status" value={board.status} />
          </div>
        ) : (
          <div className="text-[10px] text-slate-600">No board defined. Generate Full Product Plan first.</div>
        )}
      </div>
    );
  }

  // Component inspector
  if (selectedObjectType === 'component') {
    const comp = (boardComponents || []).find(c => c.id === selectedObjectId);
    if (!comp) return <NoSelection />;
    const fp = getFootprint(comp.footprint);
    return (
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-3">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Component</span>
        </div>
        <div className="space-y-2 text-[10px]">
          <Field label="RefDes" value={comp.referenceDesignator} />
          <Field label="Name" value={comp.componentName} />
          <Field label="Type" value={comp.componentType} />
          <Field label="Footprint" value={comp.footprint} />
          <Field label="Package" value={comp.packageName} />
          <Field label="Value" value={comp.value} />
          <Field label="Side" value={comp.side} />
          <EditField label="X (mm)" value={String(comp.placementX?.toFixed(2) || '0')} onChange={v => updateBoardComponent(comp.id, { placementX: parseFloat(v) || 0 })} />
          <EditField label="Y (mm)" value={String(comp.placementY?.toFixed(2) || '0')} onChange={v => updateBoardComponent(comp.id, { placementY: parseFloat(v) || 0 })} />
          <EditField label="Rotation" value={String(comp.rotationDeg || 0)} onChange={v => updateBoardComponent(comp.id, { rotationDeg: parseFloat(v) || 0 })} />
          <div className="flex gap-1 pt-1">
            <button
              onClick={() => updateBoardComponent(comp.id, { rotationDeg: ((comp.rotationDeg || 0) + 90) % 360 })}
              className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[9px] font-bold hover:bg-slate-700"
            >
              Rotate 90°
            </button>
            <button
              onClick={() => updateBoardComponent(comp.id, { side: comp.side === 'Top' ? 'Bottom' : 'Top' })}
              className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[9px] font-bold hover:bg-slate-700"
            >
              Flip Side
            </button>
            <button
              onClick={() => updateBoardComponent(comp.id, { lockedPlacement: !comp.lockedPlacement })}
              className={`px-2 py-0.5 rounded text-[9px] font-bold ${comp.lockedPlacement ? 'bg-amber-800 text-amber-100' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {comp.lockedPlacement ? 'Unlock' : 'Lock'}
            </button>
          </div>
          <Field label="Criticality" value={comp.placementCriticality} />
          <Field label="Part #" value={comp.partNumber} />
          <Field label="Pads" value={String(fp.pads.length)} />
          <Field label="Body" value={`${fp.bodyWidthMm}×${fp.bodyHeightMm}mm`} />
        </div>
      </div>
    );
  }

  // Trace inspector
  if (selectedObjectType === 'trace') {
    const trace = (traces || []).find(t => t.id === selectedObjectId);
    if (!trace) return <NoSelection />;
    return (
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-3">
          <Route className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Trace</span>
        </div>
        <div className="space-y-2 text-[10px]">
          <Field label="Net" value={trace.netName || '—'} />
          <Field label="Layer" value={trace.layerId || '—'} />
          <EditField label="Width (mm)" value={String(trace.width || 0.15)} onChange={v => updateTrace(trace.id, { width: parseFloat(v) || 0.15 })} />
          <Field label="Points" value={String(trace.points?.length || 0)} />
          <Field label="Length" value={`${trace.lengthEstimate?.toFixed(2) || '—'}mm`} />
          <Field label="Status" value={trace.status || 'Draft'} />
          {trace.impedanceNote && <Field label="Impedance" value={trace.impedanceNote} />}
        </div>
      </div>
    );
  }

  // Via inspector
  if (selectedObjectType === 'via') {
    const via = (vias || []).find(v => v.id === selectedObjectId);
    if (!via) return <NoSelection />;
    const netName = (nets || []).find(n => n.id === via.netId)?.netName;
    return (
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-3">
          <CircleIcon className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Via</span>
        </div>
        <div className="space-y-2 text-[10px]">
          <Field label="Net" value={netName || '—'} />
          <EditField label="X (mm)" value={String(via.x?.toFixed(2) || 0)} onChange={v => updateVia(via.id, { x: parseFloat(v) || 0 })} />
          <EditField label="Y (mm)" value={String(via.y?.toFixed(2) || 0)} onChange={v => updateVia(via.id, { y: parseFloat(v) || 0 })} />
          <EditField label="Drill Ø" value={String(via.drillDiameter || 0.3)} onChange={v => updateVia(via.id, { drillDiameter: parseFloat(v) || 0.3 })} />
          <EditField label="Outer Ø" value={String(via.outerDiameter || 0.6)} onChange={v => updateVia(via.id, { outerDiameter: parseFloat(v) || 0.6 })} />
          <Field label="From" value={via.fromLayer || 'Top'} />
          <Field label="To" value={via.toLayer || 'Bottom'} />
        </div>
      </div>
    );
  }

  // Drill inspector
  if (selectedObjectType === 'drill') {
    const drill = (drillHoles || []).find(d => d.id === selectedObjectId);
    if (!drill) return <NoSelection />;
    return (
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-3">
          <Drill className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Drill Hole</span>
        </div>
        <div className="space-y-2 text-[10px]">
          <EditField label="X (mm)" value={String(drill.x?.toFixed(2) || 0)} onChange={v => updateDrillHole(drill.id, { x: parseFloat(v) || 0 })} />
          <EditField label="Y (mm)" value={String(drill.y?.toFixed(2) || 0)} onChange={v => updateDrillHole(drill.id, { y: parseFloat(v) || 0 })} />
          <EditField label="Diameter" value={String(drill.diameter || 1.0)} onChange={v => updateDrillHole(drill.id, { diameter: parseFloat(v) || 1.0 })} />
          <Field label="Plated" value={drill.plated ? 'Yes' : 'No'} />
          <Field label="Purpose" value={drill.purpose || '—'} />
        </div>
      </div>
    );
  }

  // Keepout inspector
  if (selectedObjectType === 'keepout') {
    const zone = (keepoutZones || []).find(z => z.id === selectedObjectId);
    if (!zone) return <NoSelection />;
    return (
      <div className="p-3">
        <div className="flex items-center gap-1.5 mb-3">
          <Shield className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Keepout Zone</span>
        </div>
        <div className="space-y-2 text-[10px]">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-semibold">Reason</span>
            <input
              value={zone.reason}
              onChange={(e) => updateKeepoutZone(zone.id, { reason: e.target.value })}
              className="bg-slate-800 text-slate-200 font-mono px-1.5 py-0.5 rounded border border-slate-700 w-full text-[10px]"
            />
          </div>
          <EditField label="X (mm)" value={String(zone.x?.toFixed(2) || 0)} onChange={v => updateKeepoutZone(zone.id, { x: parseFloat(v) || 0 })} />
          <EditField label="Y (mm)" value={String(zone.y?.toFixed(2) || 0)} onChange={v => updateKeepoutZone(zone.id, { y: parseFloat(v) || 0 })} />
          <EditField label="Width (mm)" value={String(zone.width || 0)} onChange={v => updateKeepoutZone(zone.id, { width: parseFloat(v) || 0 })} />
          <EditField label="Height (mm)" value={String(zone.height || 0)} onChange={v => updateKeepoutZone(zone.id, { height: parseFloat(v) || 0 })} />
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-semibold">Scope</span>
            <select
              value={zone.layerScope}
              onChange={(e) => updateKeepoutZone(zone.id, { layerScope: e.target.value as 'All' | 'Top' | 'Bottom' })}
              className="bg-slate-800 text-slate-200 font-mono px-1.5 py-0.5 rounded border border-slate-700 text-[10px]"
            >
              <option value="All">All Layers</option>
              <option value="Top">Top Layer</option>
              <option value="Bottom">Bottom Layer</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  return <NoSelection />;
};

// Backward compatibility export
export const BoardObjectInspector = BoardInspector;

// Helpers
const Field: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-500 font-semibold">{label}</span>
    <span className="text-slate-300 font-mono text-right max-w-[100px] truncate">{value || '—'}</span>
  </div>
);

const EditField: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-slate-500 font-semibold">{label}</span>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-slate-800 text-slate-200 text-right font-mono px-1.5 py-0.5 rounded border border-slate-700 w-20 text-[10px]"
    />
  </div>
);

const NoSelection = () => (
  <div className="p-4 text-center text-[10px] text-slate-600 flex flex-col items-center gap-2">
    <Info className="w-5 h-5 text-slate-700" />
    <span>Select an object on the board to inspect its properties.</span>
  </div>
);
