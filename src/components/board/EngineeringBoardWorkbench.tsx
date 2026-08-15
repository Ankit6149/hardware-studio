'use client';

import React, { useCallback, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircuitBoard,
  Eye,
  EyeOff,
  Layers,
  Magnet,
  MousePointer2,
  Move,
  Network,
  PanelRight,
  RotateCw,
  Route,
  Circle,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { BoardCanvas } from './BoardCanvas';
import { DEFAULT_VIEW_STATE, GRID_PRESETS, type BoardDesignerUIState } from './boardInteraction';
import { runBoardDRC } from '../../lib/boardDRC';
import { getFootprint } from '../../lib/footprints';
import { EditorDockButton } from '../editor/EditorDockButton';
import {
  EditorToolButton,
  EngineeringDock,
  EngineeringEditorBar,
  EngineeringStatusBar,
} from '../editor/EngineeringEditorShell';

type BrowserTab = 'components' | 'layers';
type InspectorTab = 'selection' | 'nets' | 'drc';

const ROUTING_LAYERS = [
  { id: 'top-copper', label: 'Top copper', routable: true },
  { id: 'bottom-copper', label: 'Bottom copper', routable: true },
  { id: 'silkscreen', label: 'Silkscreen', routable: false },
  { id: 'drill', label: 'Drill / vias', routable: false },
  { id: 'keepouts', label: 'Keepouts', routable: false },
  { id: 'ratsnest', label: 'Ratsnest', routable: false },
] as const;

function numericRuleValue(value?: string): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export const EngineeringBoardWorkbench: React.FC = () => {
  const store = useProjectStore();
  const {
    boards = [], boardOutlines = [], boardComponents = [], traces = [], vias = [], nets = [],
    padNetAssignments = [], pcbRules = [], setActiveBoard, updatePCBPlacement,
    updateBoardComponent, updateTrace, setActiveView,
  } = store;
  const {
    activeBoardId: contextBoardId,
    activeComponentId,
    activeNetName,
    setActiveBoard: setContextBoard,
    setActiveComponent,
    setActiveNet,
    beginHandoff,
  } = useStudioContextStore();

  const initialBoardId = [contextBoardId, store.activeBoardId, boards[0]?.id]
    .find((candidate): candidate is string => Boolean(candidate && boards.some((board) => board.id === candidate))) || null;
  const [viewState, setViewState] = useState<BoardDesignerUIState>({
    ...DEFAULT_VIEW_STATE,
    activeBoardId: initialBoardId,
    selectedComponentId: activeComponentId,
    selectedNetName: activeNetName,
  });
  const [browserOpen, setBrowserOpen] = useState(true);
  const [browserTab, setBrowserTab] = useState<BrowserTab>('components');
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('selection');
  const [drcResults, setDrcResults] = useState(() => runBoardDRC({ ...store, activeBoardId: initialBoardId || '' }));

  const activeBoard = boards.find((board) => board.id === viewState.activeBoardId) || null;
  const outline = boardOutlines.find((candidate) => candidate.boardId === activeBoard?.id) || null;
  const components = activeBoard ? boardComponents.filter((component) => component.boardId === activeBoard.id) : [];
  const placed = components.filter((component) => component.placementX != null && component.placementY != null);
  const unplaced = components.filter((component) => component.placementX == null || component.placementY == null);
  const boardTraces = activeBoard ? traces.filter((trace) => trace.boardId === activeBoard.id) : [];
  const widthRule = pcbRules.find((rule) => rule.boardId === activeBoard?.id && /(?:track|trace).*width/i.test(rule.ruleType));
  const configuredRouteWidth = numericRuleValue(widthRule?.value);
  const routeWidthMm = configuredRouteWidth || 0.25;

  const selectedComponent = boardComponents.find((component) => component.id === viewState.selectedComponentId) || null;
  const selectedTrace = traces.find((trace) => trace.id === viewState.selectedTraceId) || null;
  const selectedVia = vias.find((via) => via.id === viewState.selectedViaId) || null;
  const netRows = nets.map((net) => {
    const assignments = padNetAssignments.filter((assignment) => assignment.netName === net.netName && components.some((component) => component.id === assignment.componentId || component.referenceDesignator === assignment.componentId));
    const routed = boardTraces.filter((trace) => trace.netName === net.netName || trace.netId === net.id);
    return { ...net, padCount: assignments.length, traceCount: routed.length };
  });

  const updateView = useCallback((patch: Partial<BoardDesignerUIState>) => {
    setViewState((previous) => ({ ...previous, ...patch }));
    if (patch.activeBoardId !== undefined) {
      setContextBoard(patch.activeBoardId);
      setActiveBoard(patch.activeBoardId || '');
    }
    if (patch.selectedComponentId !== undefined) setActiveComponent(patch.selectedComponentId);
    if (patch.selectedNetName !== undefined) setActiveNet(patch.selectedNetName);
  }, [setActiveBoard, setActiveComponent, setActiveNet, setContextBoard]);

  const selectComponent = (componentId: string) => {
    updateView({ selectedComponentId: componentId, selectedTraceId: null, selectedViaId: null, selectedDrillHoleId: null, selectedKeepoutId: null, activeTool: 'select' });
    setInspectorTab('selection');
    setInspectorOpen(true);
  };

  const runDrc = () => {
    const results = runBoardDRC({ ...useProjectStore.getState(), activeBoardId: viewState.activeBoardId || '' });
    setDrcResults(results);
    setInspectorTab('drc');
    setInspectorOpen(true);
  };

  const rotateSelected = () => {
    if (!selectedComponent) return;
    updatePCBPlacement(selectedComponent.id, { rotationDeg: ((selectedComponent.rotationDeg || 0) + 90) % 360 });
  };

  const openSchematic = () => {
    beginHandoff('board-designer', 'board-designer');
    setActiveView('schematic-editor');
  };

  if (!activeBoard) {
    return (
      <section className="flex h-full min-h-0 flex-col bg-[#f7f5ef]">
        <EngineeringEditorBar domain="Electronics" title="PCB Layout" meta="No board selected" actions={<button type="button" onClick={() => setActiveView('board-settings')} className="h-8 bg-slate-950 px-3 text-[10px] font-semibold text-white">Board settings</button>} />
        <div className="grid min-h-0 flex-1 place-items-center bg-white p-6"><div className="max-w-lg text-center"><CircuitBoard className="mx-auto h-8 w-8 text-slate-300" /><h1 className="mt-3 text-base font-semibold text-slate-950">Create or select a board before layout</h1><p className="mt-1 text-xs leading-5 text-slate-500">PCB placement and routing require a real board identity. Hardware Studio will not invent one.</p></div></div>
      </section>
    );
  }

  if (!outline) {
    return (
      <section className="flex h-full min-h-0 flex-col bg-[#f7f5ef]">
        <EngineeringEditorBar domain="Electronics" title="PCB Layout" meta={`${activeBoard.name} · outline unresolved`} actions={<button type="button" onClick={() => setActiveView('board-settings')} className="h-8 bg-slate-950 px-3 text-[10px] font-semibold text-white">Define outline</button>} />
        <div className="grid min-h-0 flex-1 place-items-center bg-white p-6"><div className="max-w-lg text-center"><CircuitBoard className="mx-auto h-8 w-8 text-slate-300" /><h1 className="mt-3 text-base font-semibold text-slate-950">Define the board outline first</h1><p className="mt-1 text-xs leading-5 text-slate-500">The editing canvas stays blocked until the board has explicit physical geometry. No hidden fallback is used as design truth.</p></div></div>
      </section>
    );
  }

  const hardDrcCount = drcResults.filter((result) => result.severity === 'Blocker' || result.severity === 'Error').length;

  return (
    <section className="hs-engineering-pcb flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f5ef] text-slate-900" aria-label="PCB engineering workbench">
      <EngineeringEditorBar
        domain="Electronics"
        title="PCB Layout"
        meta={`${activeBoard.name} · ${placed.length}/${components.length} placed · ${boardTraces.length} traces · ${hardDrcCount} DRC errors`}
        tools={<>
          <EditorToolButton label="Select" active={viewState.activeTool === 'select'} onClick={() => updateView({ activeTool: 'select', isRouting: false, routePreviewPoints: [] })}><MousePointer2 className="h-3.5 w-3.5" /></EditorToolButton>
          <EditorToolButton label="Pan" active={viewState.activeTool === 'pan'} onClick={() => updateView({ activeTool: 'pan', isRouting: false, routePreviewPoints: [] })}><Move className="h-3.5 w-3.5" /></EditorToolButton>
          <EditorToolButton label="Route" active={viewState.activeTool === 'route'} onClick={() => updateView({ activeTool: 'route' })}><Route className="h-3.5 w-3.5" /></EditorToolButton>
          <EditorToolButton label="Via" active={viewState.activeTool === 'via'} disabled={!viewState.selectedNetName} onClick={() => updateView({ activeTool: 'via' })}><Circle className="h-3.5 w-3.5" /></EditorToolButton>
          <EditorToolButton label="Rotate" disabled={!selectedComponent} onClick={rotateSelected}><RotateCw className="h-3.5 w-3.5" /></EditorToolButton>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          <select value={viewState.gridSizeMm} onChange={(event) => updateView({ gridSizeMm: Number.parseFloat(event.target.value) })} className="h-7 border border-slate-300 bg-white px-1.5 font-mono text-[9px] text-slate-700" aria-label="PCB grid size">{GRID_PRESETS.map((grid) => <option key={grid} value={grid}>{grid} mm</option>)}</select>
          <button type="button" onClick={() => updateView({ snapToGrid: !viewState.snapToGrid })} aria-pressed={viewState.snapToGrid} className={`inline-flex h-7 items-center gap-1 px-2 text-[9px] font-semibold ${viewState.snapToGrid ? 'bg-slate-950 text-white' : 'border border-slate-300 bg-white text-slate-600'}`}><Magnet className="h-3 w-3" /> Snap</button>
        </>}
        docks={<><EditorDockButton label="Browser" icon={Boxes} active={browserOpen} count={unplaced.length} onClick={() => setBrowserOpen((value) => !value)} /><EditorDockButton label="Inspector" icon={PanelRight} active={inspectorOpen} count={hardDrcCount} onClick={() => setInspectorOpen((value) => !value)} /></>}
        actions={<><button type="button" onClick={runDrc} className="inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><AlertTriangle className="h-3.5 w-3.5" /> DRC</button><button type="button" onClick={openSchematic} className="inline-flex h-8 items-center gap-1.5 bg-slate-950 px-2.5 text-[10px] font-semibold text-white hover:bg-slate-800">Schematic <ArrowRight className="h-3 w-3" /></button></>}
      />

      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        <BoardCanvas viewState={viewState} onViewStateChange={updateView} drcResults={drcResults} />

        {browserOpen && <EngineeringDock side="left" title="Design browser" subtitle="Components and routing layers" onClose={() => setBrowserOpen(false)} widthClassName="w-[300px]">
          <div className="flex border-b border-slate-200 bg-white p-1"><button type="button" onClick={() => setBrowserTab('components')} className={`h-7 flex-1 text-[9px] font-semibold ${browserTab === 'components' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Boxes className="mr-1 inline h-3 w-3" /> Components</button><button type="button" onClick={() => setBrowserTab('layers')} className={`h-7 flex-1 text-[9px] font-semibold ${browserTab === 'layers' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Layers className="mr-1 inline h-3 w-3" /> Layers</button></div>
          {browserTab === 'components' ? <div className="p-2"><p className="px-1 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Unplaced · {unplaced.length}</p><div className="space-y-1">{unplaced.map((component) => <div key={component.id} draggable onDragStart={(event) => { event.dataTransfer.setData('application/hardware-studio-component', component.id); selectComponent(component.id); }} className="flex cursor-grab items-center gap-2 border border-slate-200 bg-white px-2 py-1.5"><div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-slate-900">{component.referenceDesignator} · {component.componentName}</p><p className="truncate font-mono text-[8px] text-slate-400">{component.footprint || 'footprint unresolved'}</p></div><span className="text-[8px] text-slate-400">drag to board</span></div>)}{unplaced.length === 0 && <p className="p-3 text-[10px] text-slate-400">All board components are placed.</p>}</div><p className="px-1 pb-1.5 pt-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Placed · {placed.length}</p><div className="space-y-0.5">{placed.map((component) => <button key={component.id} type="button" onClick={() => selectComponent(component.id)} className={`flex w-full items-center gap-2 px-2 py-1.5 text-left ${viewState.selectedComponentId === component.id ? 'bg-slate-950 text-white' : 'hover:bg-slate-100'}`}><span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{component.referenceDesignator} · {component.componentName}</span><span className={`font-mono text-[8px] ${viewState.selectedComponentId === component.id ? 'text-white/60' : 'text-slate-400'}`}>{component.placementX?.toFixed(2)}, {component.placementY?.toFixed(2)}</span></button>)}</div></div> : <div className="p-2">{ROUTING_LAYERS.map((layer) => { const visible = viewState.layerVisibility[layer.id] !== false; const active = viewState.activeLayerId === layer.id; return <div key={layer.id} className={`flex min-h-9 items-center gap-2 px-1.5 ${active ? 'bg-slate-100' : ''}`}><button type="button" onClick={() => updateView({ layerVisibility: { ...viewState.layerVisibility, [layer.id]: !visible }, showRatsnest: layer.id === 'ratsnest' ? !visible : viewState.showRatsnest })} className="grid h-7 w-7 place-items-center text-slate-400 hover:text-slate-900">{visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button><button type="button" disabled={!layer.routable} onClick={() => updateView({ activeLayerId: layer.id })} className={`min-w-0 flex-1 truncate text-left text-[10px] ${active ? 'font-semibold text-slate-950' : layer.routable ? 'text-slate-600' : 'text-slate-400'}`}>{layer.label}</button></div>; })}<div className="mt-3 border-t border-slate-200 pt-3 text-[9px] leading-4 text-slate-500">Only copper layers can become the active routing layer. Other entries control visibility only.</div></div>}
        </EngineeringDock>}

        {inspectorOpen && <EngineeringDock side="right" title="Inspector" subtitle="Selection, nets and design rules" onClose={() => setInspectorOpen(false)} widthClassName="w-[320px]">
          <div className="flex border-b border-slate-200 bg-white p-1">{([['selection', 'Selection', PanelRight], ['nets', 'Nets', Network], ['drc', 'DRC', AlertTriangle]] as const).map(([id, label, Icon]) => <button key={id} type="button" onClick={() => setInspectorTab(id)} className={`h-7 flex-1 text-[9px] font-semibold ${inspectorTab === id ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}><Icon className="mr-1 inline h-3 w-3" />{label}</button>)}</div>
          {inspectorTab === 'selection' ? <div className="p-3">{selectedComponent ? <div className="space-y-3"><div><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Footprint</p><p className="mt-1 text-[12px] font-semibold text-slate-950">{selectedComponent.referenceDesignator} · {selectedComponent.componentName}</p><p className="mt-0.5 font-mono text-[9px] text-slate-500">{selectedComponent.footprint}</p></div><div className="grid grid-cols-2 gap-2"><label className="text-[9px] text-slate-500">X mm<input type="number" step={viewState.gridSizeMm} value={selectedComponent.placementX ?? ''} onChange={(event) => updatePCBPlacement(selectedComponent.id, { placementX: Number.parseFloat(event.target.value) })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 font-mono text-[10px]" /></label><label className="text-[9px] text-slate-500">Y mm<input type="number" step={viewState.gridSizeMm} value={selectedComponent.placementY ?? ''} onChange={(event) => updatePCBPlacement(selectedComponent.id, { placementY: Number.parseFloat(event.target.value) })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 font-mono text-[10px]" /></label></div><label className="block text-[9px] text-slate-500">Rotation<input type="number" value={selectedComponent.rotationDeg || 0} onChange={(event) => updatePCBPlacement(selectedComponent.id, { rotationDeg: Number.parseFloat(event.target.value) || 0 })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 font-mono text-[10px]" /></label><div className="grid grid-cols-2 gap-px border border-slate-200 bg-slate-200 text-[9px]">{[['Side', selectedComponent.side || 'Top'], ['Pads', String(getFootprint(selectedComponent.footprint).pads.length)], ['Criticality', selectedComponent.placementCriticality], ['Status', selectedComponent.placementStatus || 'Placed']].map(([label, value]) => <div key={label} className="bg-white p-2"><p className="text-slate-400">{label}</p><p className="mt-0.5 truncate font-semibold text-slate-800">{value}</p></div>)}</div><div className="flex gap-1"><button type="button" onClick={rotateSelected} className="h-8 flex-1 border border-slate-300 bg-white text-[9px] font-semibold text-slate-700">Rotate 90°</button><button type="button" onClick={() => updateBoardComponent(selectedComponent.id, { side: selectedComponent.side === 'Bottom' ? 'Top' : 'Bottom' })} className="h-8 flex-1 border border-slate-300 bg-white text-[9px] font-semibold text-slate-700">Flip side</button></div></div> : selectedTrace ? <div className="space-y-3"><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Trace</p><p className="text-[12px] font-semibold text-slate-950">{selectedTrace.netName || 'Unnamed net'}</p><label className="block text-[9px] text-slate-500">Width mm<input type="number" step="0.05" value={selectedTrace.width || 0.25} onChange={(event) => updateTrace(selectedTrace.id, { width: Number.parseFloat(event.target.value) || 0.25 })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 font-mono text-[10px]" /></label><p className="text-[9px] text-slate-500">{selectedTrace.layerId || 'top-copper'} · {selectedTrace.points?.length || 0} vertices · {selectedTrace.status || 'Draft'}</p></div> : selectedVia ? <div><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Via</p><p className="mt-1 font-mono text-[10px] text-slate-700">{selectedVia.x?.toFixed(2)}, {selectedVia.y?.toFixed(2)} mm</p><p className="mt-2 text-[9px] text-slate-500">Ø {selectedVia.outerDiameter || 0.6} / drill {selectedVia.drillDiameter || 0.3} mm</p></div> : <p className="text-[10px] leading-5 text-slate-500">Select a footprint, trace, or via. The inspector edits that object without changing workspaces.</p>}</div> : inspectorTab === 'nets' ? <div className="p-2"><p className="px-1 pb-1.5 text-[9px] text-slate-500">Choose a net to arm routing. A route still starts from a real pad, via, or trace endpoint.</p><div className="space-y-0.5">{netRows.map((net) => <button key={net.id} type="button" onClick={() => { updateView({ selectedNetName: net.netName, activeTool: 'route' }); setInspectorOpen(false); }} className={`flex w-full items-center gap-2 px-2 py-1.5 text-left ${viewState.selectedNetName === net.netName ? 'bg-slate-950 text-white' : 'hover:bg-slate-100'}`}><span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{net.netName}</span><span className={`font-mono text-[8px] ${viewState.selectedNetName === net.netName ? 'text-white/60' : 'text-slate-400'}`}>{net.padCount} pads · {net.traceCount} traces</span></button>)}</div></div> : <div className="p-2"><div className="mb-2 flex items-center justify-between px-1"><span className="text-[9px] text-slate-500">Current board findings</span><button type="button" onClick={runDrc} className="h-7 border border-slate-300 bg-white px-2 text-[9px] font-semibold text-slate-700">Run again</button></div><div className="space-y-1">{drcResults.map((result) => <button key={result.id} type="button" onClick={() => { if (result.linkedObjectType === 'component') selectComponent(result.linkedObjectId); }} className="w-full border-l-2 border-amber-500 bg-amber-50 px-2 py-1.5 text-left"><p className="text-[9px] font-semibold text-amber-950">{result.severity} · {result.title}</p><p className="mt-0.5 text-[9px] leading-4 text-amber-800">{result.description}</p></button>)}{drcResults.length === 0 && <p className="p-3 text-[9px] text-emerald-700">No current DRC findings.</p>}</div></div>}
        </EngineeringDock>}
      </div>

      <EngineeringStatusBar
        left={viewState.isRouting ? `Routing ${viewState.selectedNetName || 'net'} · click to fix segments · finish on matching anchor · Esc cancels` : viewState.activeTool === 'route' ? 'Route: click a pad/via/trace endpoint to begin. Empty-space starts are rejected.' : 'Select and move footprints directly. Drag unplaced components from the browser.'}
        center={`${viewState.activeLayerId} · ${configuredRouteWidth ? `configured width ${routeWidthMm.toFixed(2)} mm` : 'no explicit trace-width rule; new routes remain draft evidence'}`}
        right={`${viewState.mouseXMm.toFixed(2)}, ${viewState.mouseYMm.toFixed(2)} mm`}
      />
    </section>
  );
};
