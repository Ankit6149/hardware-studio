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
  PanelRight,
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
import { EditorDockButton } from '../editor/EditorDockButton';

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
  const [partsOpen, setPartsOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);

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
      <header className="flex min-h-11 shrink-0 flex-wrap items-center gap-2 border-b border-slate-300 bg-white px-3 py-1.5">
        <div className="flex items-center gap-1" aria-label="Schematic tools">
          <button type="button" onClick={() => updateView({ activeTool: 'select' })} aria-pressed={viewState.activeTool === 'select'} className={`grid h-8 w-8 place-items-center rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 ${viewState.activeTool === 'select' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`} title="Select tool"><MousePointer className="h-4 w-4" /></button>
          <button type="button" onClick={() => updateView({ activeTool: 'wire' })} aria-pressed={viewState.activeTool === 'wire'} className={`grid h-8 w-8 place-items-center rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 ${viewState.activeTool === 'wire' ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`} title="Wire tool"><Route className="h-4 w-4" /></button>
          <button type="button" onClick={rotateSelected} disabled={!selectedComponent} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100 disabled:opacity-30" title="Rotate selected"><RotateCw className="h-4 w-4" /></button>
          <button type="button" onClick={requestDeleteSelected} disabled={!selectedComponent && !selectedWire} className="grid h-8 w-8 place-items-center rounded-md text-red-600 hover:bg-red-50 disabled:opacity-30" title="Delete selected"><Trash2 className="h-4 w-4" /></button>
        </div>

        <div className="hidden min-w-0 flex-1 text-[10px] text-slate-500 md:block">
          <span className="font-semibold text-slate-800">{boards.find((board) => board.id === boardId)?.name || 'No board selected'}</span>
          <span className="mx-1.5">·</span>
          <span>{placedComponents.length} placed</span>
          <span className="mx-1.5">·</span>
          <span>{schematicWires.length} wires</span>
          <span className="mx-1.5">·</span>
          <span className={ercResults.length ? 'font-semibold text-red-700' : 'text-emerald-700'}>{ercResults.length} ERC findings</span>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <EditorDockButton label="Parts" icon={Boxes} active={partsOpen} count={unplacedComponents.length} onClick={() => setPartsOpen((value) => !value)} />
          <EditorDockButton label="Inspector" icon={PanelRight} active={inspectorOpen} count={ercResults.length} onClick={() => setInspectorOpen((value) => !value)} />
          <button type="button" onClick={openPcb} className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-[11px] font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1"><CircuitBoard className="h-3.5 w-3.5" /> {boards.length > 0 ? 'PCB' : 'Create board'} <ArrowRight className="h-3.5 w-3.5" /></button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        <SchematicCanvas viewState={viewState} onViewStateChange={updateView} ercResults={ercResults} />

        {placedComponents.length === 0 && !partsOpen && (
          <div className="absolute left-1/2 top-6 z-10 w-[min(420px,calc(100%-2rem))] -translate-x-1/2 rounded-lg border border-slate-300 bg-white/95 p-3 text-center shadow-sm backdrop-blur">
            <p className="text-[12px] font-semibold text-slate-900">The schematic canvas is empty</p>
            <p className="mt-1 text-[10px] leading-4 text-slate-500">Open Parts and explicitly place an existing project component. Opening this editor never places anything automatically.</p>
            <button type="button" onClick={() => setPartsOpen(true)} className="mt-2 inline-flex min-h-8 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-[11px] font-semibold text-white hover:bg-slate-800"><Boxes className="h-3.5 w-3.5" /> Open Parts</button>
          </div>
        )}

        {partsOpen && (
          <aside className="absolute bottom-3 left-3 top-3 z-30 flex w-[270px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl" aria-label="Schematic parts panel">
            <div className="flex items-start justify-between gap-2 border-b border-slate-200 bg-slate-50 px-3 py-2.5">
              <div><p className="text-[11px] font-semibold text-slate-900">Project parts</p><p className="mt-0.5 text-[9px] leading-4 text-slate-500">Place existing canonical instances. Use the library only to create a new instance.</p></div>
              <button type="button" onClick={() => setPartsOpen(false)} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-200" aria-label="Close parts panel"><X className="h-3.5 w-3.5" /></button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              <div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-semibold text-slate-600">Unplaced</span><span className="text-[9px] tabular-nums text-slate-400">{unplacedComponents.length}</span></div>
              <div className="space-y-1.5">
                {unplacedComponents.map((component) => (
                  <div key={component.id} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white p-2">
                    <div className="min-w-0 flex-1"><p className="truncate text-[10px] font-semibold text-slate-900">{component.referenceDesignator} · {component.componentName}</p><p className="mt-0.5 truncate text-[9px] text-slate-400">{component.footprint || 'Footprint unresolved'}</p></div>
                    <button type="button" onClick={() => placeComponent(component.id)} className="min-h-7 shrink-0 rounded-md bg-slate-950 px-2 text-[9px] font-semibold text-white hover:bg-slate-800">Place</button>
                  </div>
                ))}
                {unplacedComponents.length === 0 && <p className="rounded-md border border-dashed border-slate-300 p-3 text-center text-[10px] text-slate-400">No unplaced project components.</p>}
              </div>

              <div className="mb-2 mt-4 flex items-center justify-between"><span className="text-[10px] font-semibold text-slate-600">Placed</span><span className="text-[9px] tabular-nums text-slate-400">{placedComponents.length}</span></div>
              <div className="space-y-1.5">
                {placedComponents.map((component) => (
                  <div key={component.id} className={`flex items-center gap-1.5 rounded-md border p-1.5 ${component.id === viewState.selectedComponentId ? 'border-slate-950 bg-slate-100' : 'border-slate-200 bg-white'}`}>
                    <div className="min-w-0 flex-1 px-1"><p className="truncate text-[10px] font-semibold text-slate-900">{component.referenceDesignator} · {component.componentName}</p></div>
                    <button type="button" onClick={() => focusComponent(component.id)} className="min-h-7 rounded-md border border-slate-300 bg-white px-2 text-[9px] font-semibold text-slate-700 hover:bg-slate-100">Select</button>
                    <button type="button" onClick={() => unplaceComponent(component.id)} className="min-h-7 rounded-md px-1.5 text-[9px] font-semibold text-red-600 hover:bg-red-50">Unplace</button>
                  </div>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => setActiveView('component-library')} className="m-2 inline-flex min-h-8 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white text-[10px] font-semibold text-slate-700 hover:bg-slate-100"><Plus className="h-3.5 w-3.5" /> Browse component library</button>
          </aside>
        )}

        {inspectorOpen && (
          <aside className="absolute bottom-3 right-3 top-3 z-30 flex w-[310px] flex-col overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl" aria-label="Schematic inspector">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2.5">
              <div className="flex items-center gap-2"><Info className="h-3.5 w-3.5 text-slate-500" /><p className="text-[11px] font-semibold text-slate-900">Inspector & ERC</p></div>
              <button type="button" onClick={() => setInspectorOpen(false)} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-200" aria-label="Close inspector"><X className="h-3.5 w-3.5" /></button>
            </div>
            <section className="min-h-0 flex-1 overflow-y-auto border-b border-slate-200 p-3">
              {selectedComponent ? (
                <div className="space-y-3 text-xs">
                  <div><label className="text-[9px] font-semibold text-slate-500" htmlFor="schematic-reference">Reference</label><input id="schematic-reference" value={selectedComponent.referenceDesignator} onChange={(event) => updateBoardComponent(selectedComponent.id, { referenceDesignator: event.target.value })} className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 outline-none focus:border-slate-500" /></div>
                  <div><label className="text-[9px] font-semibold text-slate-500" htmlFor="schematic-value">Value</label><input id="schematic-value" value={selectedComponent.value || ''} onChange={(event) => updateBoardComponent(selectedComponent.id, { value: event.target.value })} className="mt-1 h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 outline-none focus:border-slate-500" /></div>
                  <dl className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3"><div><dt className="text-[9px] text-slate-500">Component</dt><dd className="mt-0.5 font-semibold text-slate-900">{selectedComponent.componentName}</dd></div><div><dt className="text-[9px] text-slate-500">Footprint</dt><dd className="mt-0.5 text-slate-700">{selectedComponent.footprint || 'Unresolved'}</dd></div><div><dt className="text-[9px] text-slate-500">Board</dt><dd className="mt-0.5 text-slate-700">{boards.find((board) => board.id === selectedComponent.boardId)?.name || selectedComponent.boardId}</dd></div></dl>
                  <div><p className="text-[9px] font-semibold text-slate-500">Symbol terminals</p><div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 p-2">{(selectedComponent.pins || []).map((pin) => <div key={pin.pinNumber} className="flex justify-between gap-2 font-mono text-[9px]"><span className="text-slate-600">{pin.pinNumber}. {pin.pinName}</span><span className={pin.netName ? 'font-bold text-emerald-700' : 'font-bold text-amber-700'}>{pin.netName || 'Unconnected'}</span></div>)}</div></div>
                </div>
              ) : selectedWire ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs"><p className="text-[9px] font-semibold text-slate-500">Selected net</p><p className="mt-1 font-mono font-semibold text-slate-900">{selectedWire.netName}</p><p className="mt-2 text-slate-500">{selectedWire.points.length} wire points</p></div>
              ) : (
                <p className="rounded-md border border-dashed border-slate-300 p-4 text-center text-[10px] leading-5 text-slate-500">Select a component or wire on the canvas. Selection does not navigate away from this editor.</p>
              )}
            </section>
            <section className="h-56 shrink-0 overflow-hidden bg-slate-50">
              <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2"><span className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-600"><AlertTriangle className="h-3.5 w-3.5 text-amber-600" /> ERC findings</span><span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${ercResults.length > 0 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>{ercResults.length || 'Pass'}</span></div>
              <div className="h-[calc(100%-36px)] space-y-1 overflow-y-auto p-2">
                {ercResults.map((result) => (
                  <div key={result.id} className="rounded-md border border-slate-200 bg-white p-2">
                    <p className="text-[10px] font-semibold text-slate-900">{result.title}</p><p className="mt-1 text-[9px] leading-4 text-slate-500">{result.description}</p>
                    {result.linkedObjectType === 'component' && result.linkedObjectId && <button type="button" onClick={() => focusComponent(result.linkedObjectId)} className="mt-1.5 min-h-7 rounded-md border border-slate-300 bg-white px-2 text-[9px] font-semibold text-slate-700 hover:bg-slate-100">Show component</button>}
                  </div>
                ))}
                {ercResults.length === 0 && <div className="flex h-full flex-col items-center justify-center text-center text-[10px] text-slate-500"><CheckCircle2 className="mb-2 h-6 w-6 text-emerald-600" />No electrical violations detected</div>}
              </div>
            </section>
          </aside>
        )}
      </div>

      <Dialog.Root open={Boolean(deleteImpact)} onOpenChange={(open) => { if (!open) setDeleteImpact(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[150] bg-slate-950/65 backdrop-blur-sm" />
          <Dialog.Content aria-describedby="schematic-delete-description" className="fixed left-1/2 top-1/2 z-[160] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-red-200 bg-white p-5 text-slate-900 shadow-2xl outline-none">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-red-50 text-red-700"><Trash2 className="h-5 w-5" /></span><div><Dialog.Title className="text-base font-semibold">Remove component from the whole product?</Dialog.Title><Dialog.Description id="schematic-delete-description" className="mt-1 text-sm leading-6 text-slate-600">This is not a schematic-only delete. Review connected project data before continuing.</Dialog.Description></div></div>
              <Dialog.Close asChild><button type="button" aria-label="Close deletion review" className="grid h-8 w-8 place-items-center rounded-md text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></Dialog.Close>
            </div>
            {deleteImpact && <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-4"><p className="text-sm font-semibold text-red-950">{deleteImpact.title}</p><dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-red-900"><div className="rounded-md bg-white/70 p-2"><dt className="font-semibold">Schematic wires</dt><dd>{deleteImpact.wires}</dd></div><div className="rounded-md bg-white/70 p-2"><dt className="font-semibold">PCB traces</dt><dd>{deleteImpact.traces}</dd></div><div className="rounded-md bg-white/70 p-2"><dt className="font-semibold">Assigned nets</dt><dd>{deleteImpact.nets.join(', ') || 'None'}</dd></div><div className="rounded-md bg-white/70 p-2"><dt className="font-semibold">BOM link</dt><dd>{deleteImpact.bomLinked ? 'Present' : 'Not recorded'}</dd></div></dl></div>}
            <div className="mt-5 flex justify-end gap-2"><Dialog.Close asChild><button type="button" className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">Cancel</button></Dialog.Close><button type="button" onClick={confirmDeleteComponent} className="h-9 rounded-md bg-red-700 px-3 text-sm font-semibold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">Remove from product</button></div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
};