'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircuitBoard,
  Info,
  MousePointer,
  Plus,
  RotateCw,
  Route,
  Trash2,
  X,
} from 'lucide-react';
import { runSchematicERC } from '../../lib/schematicERC';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { SchematicCanvas } from './SchematicCanvas';
import { initialSchematicUIState, type SchematicUIState } from './schematicInteraction';

interface DeleteImpact {
  componentId: string;
  title: string;
  wires: number;
  nets: string[];
  traces: number;
  bomLinked: boolean;
}

function isTextEntryTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || (target instanceof HTMLElement && target.isContentEditable);
}

export const UnifiedSchematicEditor: React.FC = () => {
  const project = useProjectStore();
  const {
    activeView,
    boardComponents = [],
    schematicWires = [],
    padNetAssignments = [],
    traces = [],
    boards = [],
    updateBoardComponent,
    updateProjectState,
    placeComponentOnSchematic,
    unplaceComponentFromSchematic,
    deleteProjectComponent,
    setActiveView,
  } = project;
  const {
    activeBoardId,
    activeComponentId,
    activeNetName,
    setActiveComponent,
    setActiveNet,
    beginHandoff,
  } = useStudioContextStore();

  const [viewState, setViewState] = useState<SchematicUIState>({
    ...initialSchematicUIState,
    selectedComponentId: activeComponentId,
    selectedNetName: activeNetName,
    activeNetName: activeNetName || initialSchematicUIState.activeNetName,
  });
  const [deleteImpact, setDeleteImpact] = useState<DeleteImpact | null>(null);

  const boardId = activeBoardId || project.activeBoardId || boards[0]?.id || '';
  const contextualComponents = useMemo(
    () => boardComponents.filter((component) => !boardId || component.boardId === boardId),
    [boardComponents, boardId],
  );
  const placedComponents = useMemo(
    () => contextualComponents.filter((component) => component.schematic?.placed),
    [contextualComponents],
  );
  const unplacedComponents = useMemo(
    () => contextualComponents.filter((component) => !component.schematic?.placed),
    [contextualComponents],
  );
  const ercResults = useMemo(() => runSchematicERC(project), [project]);
  const selectedComponent = boardComponents.find((component) => component.id === viewState.selectedComponentId);
  const selectedWire = schematicWires.find((wire) => wire.id === viewState.selectedWireId);

  const updateView = useCallback((patch: Partial<SchematicUIState>) => {
    setViewState((previous) => ({ ...previous, ...patch }));
    if (patch.selectedComponentId !== undefined) setActiveComponent(patch.selectedComponentId);
    if (patch.selectedNetName !== undefined) setActiveNet(patch.selectedNetName);
  }, [setActiveComponent, setActiveNet]);

  const focusComponent = useCallback((componentId: string) => {
    const component = boardComponents.find((candidate) => candidate.id === componentId);
    if (!component) return;
    setActiveComponent(component.id);
    if (!component.schematic?.placed || component.schematic.x == null || component.schematic.y == null) {
      setViewState((previous) => ({ ...previous, selectedComponentId: component.id, selectedWireId: null }));
      return;
    }
    setViewState((previous) => ({
      ...previous,
      selectedComponentId: component.id,
      selectedWireId: null,
      panX: 300 - component.schematic!.x! * previous.zoom,
      panY: 250 - component.schematic!.y! * previous.zoom,
    }));
  }, [boardComponents, setActiveComponent]);

  const rotateSelected = useCallback(() => {
    if (!selectedComponent) return;
    updateBoardComponent(selectedComponent.id, {
      schematic: {
        ...selectedComponent.schematic,
        placed: true,
        rotation: ((selectedComponent.schematic?.rotation || 0) + 90) % 360,
      },
    });
  }, [selectedComponent, updateBoardComponent]);

  const requestDeleteSelected = useCallback(() => {
    if (selectedComponent) {
      const assignedNets = Array.from(new Set(
        padNetAssignments
          .filter((assignment) => assignment.componentId === selectedComponent.id)
          .map((assignment) => assignment.netName),
      ));
      const wireCount = schematicWires.filter((wire) => {
        const sourceComponent = wire.sourceAnchor?.type === 'pin' ? wire.sourceAnchor.componentId : undefined;
        const targetComponent = wire.targetAnchor?.type === 'pin' ? wire.targetAnchor.componentId : undefined;
        return sourceComponent === selectedComponent.id
          || targetComponent === selectedComponent.id
          || wire.sourcePinId?.includes(selectedComponent.id)
          || wire.targetPinId?.includes(selectedComponent.id);
      }).length;
      setDeleteImpact({
        componentId: selectedComponent.id,
        title: `${selectedComponent.referenceDesignator} · ${selectedComponent.componentName}`,
        wires: wireCount,
        nets: assignedNets,
        traces: traces.filter((trace) => assignedNets.includes(trace.netName || '')).length,
        bomLinked: Boolean(selectedComponent.bomItemId),
      });
      return;
    }
    if (!selectedWire) return;
    updateProjectState({ schematicWires: schematicWires.filter((wire) => wire.id !== selectedWire.id) });
    updateView({ selectedWireId: null, selectedNetName: null });
  }, [padNetAssignments, schematicWires, selectedComponent, selectedWire, traces, updateProjectState, updateView]);

  const confirmDeleteComponent = () => {
    if (!deleteImpact) return;
    deleteProjectComponent(deleteImpact.componentId, 'entire-product');
    setDeleteImpact(null);
    updateView({ selectedComponentId: null, selectedWireId: null, selectedNetName: null });
  };

  const placeComponent = useCallback((componentId: string) => {
    const column = placedComponents.length % 4;
    const row = Math.floor(placedComponents.length / 4);
    placeComponentOnSchematic(componentId, 140 + column * 180, 140 + row * 140);
    focusComponent(componentId);
  }, [focusComponent, placeComponentOnSchematic, placedComponents.length]);

  const unplaceComponent = useCallback((componentId: string) => {
    unplaceComponentFromSchematic(componentId);
    if (viewState.selectedComponentId === componentId) updateView({ selectedComponentId: null });
  }, [unplaceComponentFromSchematic, updateView, viewState.selectedComponentId]);

  const openPcb = () => {
    beginHandoff(activeView, activeView);
    setActiveView(boards.length > 0 ? 'board-designer' : 'board-settings');
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isTextEntryTarget(event.target)) return;
      if (event.key === 'r' || event.key === 'R') rotateSelected();
      if (event.key === 'Delete' || event.key === 'Backspace') requestDeleteSelected();
      if (event.key === 'Escape') updateView({ isDrawingWire: false, wirePoints: [], sourcePin: null });
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key) || !selectedComponent || selectedComponent.schematic?.locked) return;
      event.preventDefault();
      const amount = event.shiftKey ? 50 : 10;
      const dx = event.key === 'ArrowLeft' ? -amount : event.key === 'ArrowRight' ? amount : 0;
      const dy = event.key === 'ArrowUp' ? -amount : event.key === 'ArrowDown' ? amount : 0;
      updateBoardComponent(selectedComponent.id, {
        schematic: {
          ...selectedComponent.schematic,
          placed: true,
          x: (selectedComponent.schematic?.x || 150) + dx,
          y: (selectedComponent.schematic?.y || 150) + dy,
        },
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [requestDeleteSelected, rotateSelected, selectedComponent, updateBoardComponent, updateView]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-900" aria-label="Unified schematic editor">
      <header className="flex min-h-11 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2 shadow-xs">
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => updateView({ activeTool: 'select' })} aria-pressed={viewState.activeTool === 'select'} className={`grid h-8 w-8 place-items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${viewState.activeTool === 'select' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`} title="Select tool"><MousePointer className="h-4 w-4" /></button>
          <button type="button" onClick={() => updateView({ activeTool: 'wire' })} aria-pressed={viewState.activeTool === 'wire'} className={`grid h-8 w-8 place-items-center rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${viewState.activeTool === 'wire' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'}`} title="Wire tool"><Route className="h-4 w-4" /></button>
          <button type="button" onClick={rotateSelected} disabled={!selectedComponent} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30" title="Rotate selected"><RotateCw className="h-4 w-4" /></button>
          <button type="button" onClick={requestDeleteSelected} disabled={!selectedComponent && !selectedWire} className="grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-slate-100 disabled:opacity-30" title="Delete selected"><Trash2 className="h-4 w-4" /></button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
          <span className={`rounded-full border px-2 py-1 ${ercResults.length > 0 ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{ercResults.length} ERC findings</span>
          <button type="button" onClick={() => setActiveView('component-library')} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-slate-700 hover:bg-slate-50 border-slate-200 shadow-xs"><Boxes className="h-3.5 w-3.5" /> Add component</button>
          <button type="button" onClick={openPcb} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 font-bold text-white hover:bg-indigo-700 shadow-xs"><CircuitBoard className="h-3.5 w-3.5" /> {boards.length > 0 ? 'Open PCB' : 'Create board'} <ArrowRight className="h-3.5 w-3.5" /></button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-60 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white shadow-xs">
          <div className="border-b border-slate-200 p-3 bg-slate-50/50"><p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Canonical project components</p><p className="mt-1 text-[10px] leading-4 text-slate-600">Definitions are created in Component Library. This editor places and connects the same project instances.</p></div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2 bg-white">
            <div className="mb-2 flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Unplaced</span><span className="font-mono text-[9px] text-slate-500">{unplacedComponents.length}</span></div>
            <div className="space-y-1.5">{unplacedComponents.map((component) => <button key={component.id} type="button" onClick={() => placeComponent(component.id)} className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:border-indigo-500 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"><span className="min-w-0"><span className="block text-[10px] font-bold text-slate-900">{component.referenceDesignator}</span><span className="block truncate text-[9px] text-slate-500">{component.componentName}</span></span><span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-indigo-700">Place</span></button>)}{unplacedComponents.length === 0 && <p className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-[9px] text-slate-400">No unplaced instances</p>}</div>
            <div className="mb-2 mt-4 flex items-center justify-between"><span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Placed</span><span className="font-mono text-[9px] text-slate-500">{placedComponents.length}</span></div>
            <div className="space-y-1.5">{placedComponents.map((component) => <div key={component.id} className={`flex items-center gap-1 rounded-lg border p-1.5 ${component.id === viewState.selectedComponentId ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-slate-50'}`}><button type="button" onClick={() => focusComponent(component.id)} className="min-w-0 flex-1 text-left focus:outline-none"><span className="block text-[10px] font-bold text-slate-900">{component.referenceDesignator}</span><span className="block truncate text-[9px] text-slate-500">{component.componentName}</span></button><button type="button" onClick={() => unplaceComponent(component.id)} className="rounded px-1.5 py-1 text-[8px] font-bold text-red-600 hover:bg-red-50">Unplace</button></div>)}</div>
          </div>
          <button type="button" onClick={() => setActiveView('component-library')} className="m-2 inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100"><Plus className="h-4 w-4" /> Choose another component</button>
        </aside>

        <SchematicCanvas viewState={viewState} onViewStateChange={updateView} ercResults={ercResults} />

        <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white shadow-xs">
          <section className="min-h-0 flex-1 overflow-y-auto border-b border-slate-200 p-3">
            <div className="mb-3 flex items-center gap-2"><Info className="h-4 w-4 text-indigo-600" /><h2 className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Shared object inspector</h2></div>
            {selectedComponent ? <div className="space-y-3 text-xs"><div><label className="text-[9px] font-bold uppercase text-slate-500" htmlFor="schematic-reference">Reference</label><input id="schematic-reference" value={selectedComponent.referenceDesignator} onChange={(event) => updateBoardComponent(selectedComponent.id, { referenceDesignator: event.target.value })} className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 font-mono text-xs text-slate-900 outline-none focus:border-indigo-500" /></div><div><label className="text-[9px] font-bold uppercase text-slate-500" htmlFor="schematic-value">Value</label><input id="schematic-value" value={selectedComponent.value || ''} onChange={(event) => updateBoardComponent(selectedComponent.id, { value: event.target.value })} className="mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 font-mono text-xs text-slate-900 outline-none focus:border-indigo-500" /></div><dl className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3"><div><dt className="text-[9px] uppercase text-slate-500">Component</dt><dd className="mt-0.5 font-semibold text-slate-900">{selectedComponent.componentName}</dd></div><div><dt className="text-[9px] uppercase text-slate-500">Footprint</dt><dd className="mt-0.5 font-mono text-slate-700">{selectedComponent.footprint || 'Unresolved'}</dd></div><div><dt className="text-[9px] uppercase text-slate-500">Board</dt><dd className="mt-0.5 text-slate-700">{boards.find((board) => board.id === selectedComponent.boardId)?.name || selectedComponent.boardId}</dd></div></dl><div><p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Symbol terminals</p><div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">{(selectedComponent.pins || []).map((pin) => <div key={pin.pinNumber} className="flex justify-between gap-2 font-mono text-[9px]"><span className="text-slate-600">{pin.pinNumber}. {pin.pinName}</span><span className={pin.netName ? 'text-emerald-700 font-bold' : 'text-amber-600 font-bold'}>{pin.netName || 'Unconnected'}</span></div>)}</div></div></div> : selectedWire ? <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs"><p className="text-[9px] font-bold uppercase text-slate-500">Selected net</p><p className="mt-1 font-mono font-bold text-indigo-700">{selectedWire.netName}</p><p className="mt-2 text-slate-500">{selectedWire.points.length} wire points</p></div> : <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-[10px] leading-5 text-slate-500">Select a component or wire. Shared context remains intact when moving to PCB or 3D.</p>}
          </section>
          <section className="h-60 shrink-0 overflow-hidden bg-slate-50/50"><div className="flex items-center justify-between border-b border-slate-200 px-3 py-2"><span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-slate-500"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" /> ERC findings</span><span className={`rounded px-1.5 py-0.5 text-[8px] font-bold ${ercResults.length > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{ercResults.length || 'Pass'}</span></div><div className="h-[calc(100%-36px)] space-y-1 overflow-y-auto p-2">{ercResults.map((result) => <button key={result.id} type="button" onClick={() => { if (result.linkedObjectType === 'component') focusComponent(result.linkedObjectId); }} className="w-full rounded-lg border border-slate-200 bg-white p-2 text-left hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"><span className="block text-[10px] font-bold text-slate-900">{result.title}</span><span className="mt-1 block text-[9px] leading-4 text-slate-500">{result.description}</span></button>)}{ercResults.length === 0 && <div className="flex h-full flex-col items-center justify-center text-center text-[10px] text-slate-500"><CheckCircle2 className="mb-2 h-6 w-6 text-emerald-600" />No electrical violations detected</div>}</div></section>
        </aside>
      </div>

      <Dialog.Root open={Boolean(deleteImpact)} onOpenChange={(open) => { if (!open) setDeleteImpact(null); }}>
        <Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-[150] bg-slate-950/65 backdrop-blur-sm" /><Dialog.Content aria-describedby="schematic-delete-description" className="fixed left-1/2 top-1/2 z-[160] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-red-200 bg-white p-5 text-slate-900 shadow-2xl outline-none"><div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-700"><Trash2 className="h-5 w-5" /></span><div><Dialog.Title className="text-base font-bold">Remove component from the whole product?</Dialog.Title><Dialog.Description id="schematic-delete-description" className="mt-1 text-sm leading-6 text-slate-600">This is not a schematic-only delete. Review connected project data before continuing.</Dialog.Description></div></div><Dialog.Close asChild><button type="button" aria-label="Close deletion review" className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></Dialog.Close></div>{deleteImpact && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"><p className="text-sm font-bold text-red-950">{deleteImpact.title}</p><dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-red-900"><div className="rounded-lg bg-white/70 p-2"><dt className="font-bold">Schematic wires</dt><dd>{deleteImpact.wires}</dd></div><div className="rounded-lg bg-white/70 p-2"><dt className="font-bold">PCB traces</dt><dd>{deleteImpact.traces}</dd></div><div className="rounded-lg bg-white/70 p-2"><dt className="font-bold">Assigned nets</dt><dd>{deleteImpact.nets.join(', ') || 'None'}</dd></div><div className="rounded-lg bg-white/70 p-2"><dt className="font-bold">BOM link</dt><dd>{deleteImpact.bomLinked ? 'Present' : 'Not recorded'}</dd></div></dl></div>}<div className="mt-5 flex justify-end gap-2"><Dialog.Close asChild><button type="button" className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button></Dialog.Close><button type="button" onClick={confirmDeleteComponent} className="h-9 rounded-lg bg-red-700 px-3 text-sm font-semibold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">Remove from product</button></div></Dialog.Content></Dialog.Portal>
      </Dialog.Root>
    </section>
  );
};
