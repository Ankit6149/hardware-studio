'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CircuitBoard,
  Minus,
  MousePointer2,
  Move,
  PanelRight,
  Plus,
  RotateCw,
  Route,
  Trash2,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { runSchematicERC } from '../../lib/schematicERC';
import { SchematicCanvas } from './SchematicCanvas';
import { initialSchematicUIState, type SchematicUIState } from './schematicInteraction';
import { EditorDockButton } from '../editor/EditorDockButton';
import {
  EditorToolButton,
  EngineeringBottomDock,
  EngineeringDock,
  EngineeringEditorBar,
  EngineeringInspector,
  EngineeringStatusBar,
} from '../editor/EngineeringEditorShell';

function isTextEntryTarget(target: EventTarget | null): boolean {
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || (target instanceof HTMLElement && target.isContentEditable);
}

export const EngineeringSchematicWorkbench: React.FC = () => {
  const store = useProjectStore();
  const {
    boards = [],
    boardComponents = [],
    schematicWires = [],
    updateBoardComponent,
    placeComponentOnSchematic,
    unplaceComponentFromSchematic,
    updateProjectState,
    setActiveView,
  } = store;
  const {
    activeBoardId,
    activeComponentId,
    activeNetName,
    setActiveComponent,
    setActiveNet,
    beginHandoff,
  } = useStudioContextStore();

  const boardId = activeBoardId || store.activeBoardId || boards[0]?.id || '';
  const board = boards.find((candidate) => candidate.id === boardId);
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
  const ercResults = useMemo(() => runSchematicERC(store), [store]);

  const [viewState, setViewState] = useState<SchematicUIState>({
    ...initialSchematicUIState,
    selectedComponentId: activeComponentId,
    selectedNetName: activeNetName,
    activeNetName: activeNetName || initialSchematicUIState.activeNetName,
  });
  const [browserOpen, setBrowserOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [problemsOpen, setProblemsOpen] = useState(false);
  const [panDrag, setPanDrag] = useState<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  const selectedComponent = boardComponents.find((component) => component.id === viewState.selectedComponentId) || null;
  const selectedWire = schematicWires.find((wire) => wire.id === viewState.selectedWireId) || null;

  const updateView = useCallback((patch: Partial<SchematicUIState>) => {
    setViewState((previous) => ({ ...previous, ...patch }));
    if (patch.selectedComponentId !== undefined) setActiveComponent(patch.selectedComponentId);
    if (patch.selectedNetName !== undefined) setActiveNet(patch.selectedNetName);
  }, [setActiveComponent, setActiveNet]);

  const armPlacement = useCallback((componentId: string) => {
    updateView({
      activeTool: 'place-component',
      placingComponentId: componentId,
      selectedComponentId: componentId,
      selectedWireId: null,
      isDrawingWire: false,
      wirePoints: [],
      sourcePin: null,
    });
    setBrowserOpen(false);
  }, [updateView]);

  const placeAtPointer = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const componentId = viewState.placingComponentId;
    const host = canvasHostRef.current;
    if (!componentId || !host) return;
    const rect = host.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left - viewState.panX) / viewState.zoom) / 10) * 10;
    const y = Math.round(((event.clientY - rect.top - viewState.panY) / viewState.zoom) / 10) * 10;
    placeComponentOnSchematic(componentId, x, y);
    updateView({
      activeTool: 'select',
      placingComponentId: null,
      selectedComponentId: componentId,
    });
    setInspectorOpen(true);
  }, [placeComponentOnSchematic, updateView, viewState.panX, viewState.panY, viewState.placingComponentId, viewState.zoom]);

  const rotateSelected = useCallback(() => {
    if (!selectedComponent?.schematic?.placed) return;
    updateBoardComponent(selectedComponent.id, {
      schematic: {
        ...selectedComponent.schematic,
        placed: true,
        rotation: ((selectedComponent.schematic.rotation || 0) + 90) % 360,
      },
    });
  }, [selectedComponent, updateBoardComponent]);

  const removeSelectedFromSheet = useCallback(() => {
    if (selectedComponent?.schematic?.placed) {
      unplaceComponentFromSchematic(selectedComponent.id);
      updateView({ selectedComponentId: null });
      return;
    }
    if (selectedWire) {
      updateProjectState({ schematicWires: schematicWires.filter((wire) => wire.id !== selectedWire.id) });
      updateView({ selectedWireId: null, selectedNetName: null });
    }
  }, [schematicWires, selectedComponent, selectedWire, unplaceComponentFromSchematic, updateProjectState, updateView]);

  const zoomBy = useCallback((factor: number) => {
    updateView({ zoom: Math.max(0.35, Math.min(2.5, Number((viewState.zoom * factor).toFixed(2)))) });
  }, [updateView, viewState.zoom]);

  const openPcb = useCallback(() => {
    beginHandoff('schematic-editor', 'schematic-editor');
    setActiveView(board ? 'board-designer' : 'board-settings');
  }, [beginHandoff, board, setActiveView]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTextEntryTarget(event.target)) return;
      if (event.key === 'Escape') {
        updateView({ activeTool: 'select', placingComponentId: null, isDrawingWire: false, wirePoints: [], sourcePin: null });
      }
      if ((event.key === 'r' || event.key === 'R') && selectedComponent) rotateSelected();
      if ((event.key === 'Delete' || event.key === 'Backspace') && (selectedComponent || selectedWire)) removeSelectedFromSheet();
      if (event.key === 'w' || event.key === 'W') updateView({ activeTool: 'wire', placingComponentId: null });
      if (event.key === 'm' || event.key === 'M') updateView({ activeTool: 'select', placingComponentId: null });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [removeSelectedFromSheet, rotateSelected, selectedComponent, selectedWire, updateView]);

  const panOverlay = viewState.activeTool === 'pan';
  const placementOverlay = viewState.activeTool === 'place-component' && Boolean(viewState.placingComponentId);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f5ef] text-slate-900" aria-label="Schematic engineering workbench">
      <EngineeringEditorBar
        domain="Electronics"
        title="Schematic"
        meta={`${board?.name || 'No board'} · ${placedComponents.length}/${contextualComponents.length} symbols · ${schematicWires.length} wires · ${ercResults.length} ERC`}
        tools={(
          <>
            <EditorToolButton label="Select" active={viewState.activeTool === 'select'} onClick={() => updateView({ activeTool: 'select', placingComponentId: null })}><MousePointer2 className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Pan" active={viewState.activeTool === 'pan'} onClick={() => updateView({ activeTool: 'pan', placingComponentId: null, isDrawingWire: false })}><Move className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Wire" active={viewState.activeTool === 'wire'} onClick={() => updateView({ activeTool: 'wire', placingComponentId: null })}><Route className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Rotate" disabled={!selectedComponent} onClick={rotateSelected}><RotateCw className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Remove" disabled={!selectedComponent && !selectedWire} onClick={removeSelectedFromSheet}><Trash2 className="h-3.5 w-3.5" /></EditorToolButton>
            <span className="mx-1 h-5 w-px bg-slate-200" />
            <EditorToolButton label="Zoom out" onClick={() => zoomBy(0.85)}><Minus className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Zoom in" onClick={() => zoomBy(1.15)}><Plus className="h-3.5 w-3.5" /></EditorToolButton>
          </>
        )}
        docks={(
          <>
            <EditorDockButton label="Browser" icon={Boxes} active={browserOpen} count={unplacedComponents.length} onClick={() => setBrowserOpen((value) => !value)} />
            <EditorDockButton label="Inspector" icon={PanelRight} active={inspectorOpen} onClick={() => setInspectorOpen((value) => !value)} />
            <EditorDockButton label="Problems" icon={AlertTriangle} active={problemsOpen} count={ercResults.length} onClick={() => setProblemsOpen((value) => !value)} />
          </>
        )}
        actions={<button type="button" onClick={openPcb} className="inline-flex h-8 items-center gap-1.5 bg-slate-950 px-2.5 text-[10px] font-semibold text-white hover:bg-slate-800"><CircuitBoard className="h-3.5 w-3.5" /> PCB <ArrowRight className="h-3 w-3" /></button>}
      />

      <div ref={canvasHostRef} className="relative min-h-0 flex-1 overflow-hidden bg-white" onWheel={(event) => { if (event.ctrlKey || event.metaKey) { event.preventDefault(); zoomBy(event.deltaY > 0 ? 0.9 : 1.1); } }}>
        <SchematicCanvas viewState={viewState} onViewStateChange={updateView} ercResults={ercResults} />

        {placementOverlay && (
          <div
            className="absolute inset-0 z-20 cursor-crosshair"
            aria-label="Place schematic symbol"
            onClick={placeAtPointer}
          >
            <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 border border-slate-400 bg-slate-950 px-3 py-1.5 text-[10px] font-semibold text-white shadow-lg">
              Place {boardComponents.find((component) => component.id === viewState.placingComponentId)?.referenceDesignator || 'symbol'} · click sheet · Esc cancels
            </div>
          </div>
        )}

        {panOverlay && (
          <div
            className="absolute inset-0 z-20 cursor-grab active:cursor-grabbing"
            aria-label="Pan schematic sheet"
            onMouseDown={(event) => setPanDrag({ x: event.clientX, y: event.clientY, panX: viewState.panX, panY: viewState.panY })}
            onMouseMove={(event) => {
              if (!panDrag) return;
              updateView({ panX: panDrag.panX + event.clientX - panDrag.x, panY: panDrag.panY + event.clientY - panDrag.y });
            }}
            onMouseUp={() => setPanDrag(null)}
            onMouseLeave={() => setPanDrag(null)}
          />
        )}

        {browserOpen && (
          <EngineeringDock side="left" title="Design browser" subtitle="Canonical project components" onClose={() => setBrowserOpen(false)}>
            <div className="border-b border-slate-200 px-3 py-2 text-[9px] text-slate-500">Choose a component, then place it on the sheet. Placement is never automatic.</div>
            <div className="p-2">
              <p className="px-1 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Unplaced · {unplacedComponents.length}</p>
              <div className="space-y-1">
                {unplacedComponents.map((component) => (
                  <div key={component.id} className="flex items-center gap-2 border border-slate-200 bg-white px-2 py-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-semibold text-slate-900">{component.referenceDesignator} · {component.componentName}</p>
                      <p className="truncate font-mono text-[8px] text-slate-400">{component.value || '—'} · {component.footprint || 'footprint unresolved'}</p>
                    </div>
                    <button type="button" onClick={() => armPlacement(component.id)} className="h-7 bg-slate-950 px-2 text-[9px] font-semibold text-white hover:bg-slate-800">Place…</button>
                  </div>
                ))}
                {unplacedComponents.length === 0 && <p className="p-3 text-[10px] text-slate-400">Every project component is already on this sheet.</p>}
              </div>
              <p className="px-1 pb-1.5 pt-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Placed · {placedComponents.length}</p>
              <div className="space-y-0.5">
                {placedComponents.map((component) => (
                  <button key={component.id} type="button" onClick={() => { updateView({ selectedComponentId: component.id, selectedWireId: null, activeTool: 'select' }); setInspectorOpen(true); }} className={`flex w-full items-center gap-2 px-2 py-1.5 text-left ${viewState.selectedComponentId === component.id ? 'bg-slate-950 text-white' : 'hover:bg-slate-100'}`}>
                    <span className="min-w-0 flex-1 truncate text-[10px] font-semibold">{component.referenceDesignator} · {component.componentName}</span>
                    <span className={`font-mono text-[8px] ${viewState.selectedComponentId === component.id ? 'text-white/60' : 'text-slate-400'}`}>{component.schematic?.x},{component.schematic?.y}</span>
                  </button>
                ))}
              </div>
            </div>
          </EngineeringDock>
        )}

        <EngineeringInspector
          open={inspectorOpen}
          subtitle={selectedComponent ? selectedComponent.referenceDesignator : selectedWire ? selectedWire.netName : 'Select a symbol or wire'}
          onClose={() => setInspectorOpen(false)}
          widthClassName="w-[300px]"
        >
          <div className="p-3">
            {selectedComponent ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Component</p>
                  <p className="mt-1 text-[12px] font-semibold text-slate-950">{selectedComponent.referenceDesignator} · {selectedComponent.componentName}</p>
                  <p className="mt-0.5 font-mono text-[9px] text-slate-500">{selectedComponent.partNumber || selectedComponent.libraryId || selectedComponent.id}</p>
                </div>
                <div className="grid grid-cols-2 gap-px overflow-hidden border border-slate-200 bg-slate-200 text-[9px]">
                  {[
                    ['Value', selectedComponent.value || '—'],
                    ['Footprint', selectedComponent.footprint || 'Unresolved'],
                    ['X', selectedComponent.schematic?.x != null ? `${selectedComponent.schematic.x}` : '—'],
                    ['Y', selectedComponent.schematic?.y != null ? `${selectedComponent.schematic.y}` : '—'],
                    ['Rotation', `${selectedComponent.schematic?.rotation || 0}°`],
                    ['Pins', `${selectedComponent.pins?.length || 0}`],
                  ].map(([label, value]) => <div key={label} className="bg-white p-2"><p className="text-slate-400">{label}</p><p className="mt-0.5 truncate font-semibold text-slate-800">{value}</p></div>)}
                </div>
                <div>
                  <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Pins</p>
                  <div className="max-h-48 overflow-y-auto border-y border-slate-200">
                    {(selectedComponent.pins || []).map((pin) => <div key={pin.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)_5rem] gap-2 border-b border-slate-100 px-1 py-1.5 text-[9px] last:border-b-0"><span className="font-mono text-slate-500">{pin.pinNumber}</span><span className="truncate font-semibold text-slate-800">{pin.pinName}</span><span className="truncate text-right text-slate-400">{pin.netName || 'unconnected'}</span></div>)}
                  </div>
                </div>
                <button type="button" onClick={() => unplaceComponentFromSchematic(selectedComponent.id)} className="h-8 w-full border border-slate-300 bg-white text-[10px] font-semibold text-slate-700 hover:bg-slate-100">Remove symbol from sheet</button>
              </div>
            ) : selectedWire ? (
              <div><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Net</p><p className="mt-1 text-[12px] font-semibold text-slate-950">{selectedWire.netName}</p><p className="mt-2 text-[10px] leading-5 text-slate-500">{selectedWire.status || 'Connected'} · {selectedWire.points.length} route points</p></div>
            ) : (
              <p className="text-[10px] leading-5 text-slate-500">Select a symbol or wire. The Inspector describes engineering data; it does not navigate away from the sheet.</p>
            )}
          </div>
        </EngineeringInspector>

        <EngineeringBottomDock
          open={problemsOpen}
          title="ERC findings"
          subtitle={`${ercResults.length} current schematic finding${ercResults.length === 1 ? '' : 's'}`}
          onClose={() => setProblemsOpen(false)}
        >
          <div className="grid gap-1 p-2 sm:grid-cols-2 xl:grid-cols-3">
            {ercResults.slice(0, 12).map((result) => (
              <div key={result.id} className="border-l-2 border-amber-500 bg-amber-50 px-2 py-1.5">
                <p className="text-[9px] font-semibold text-amber-950">{result.title}</p>
                <p className="mt-0.5 text-[9px] leading-4 text-amber-800">{result.description}</p>
              </div>
            ))}
            {ercResults.length === 0 && <p className="p-3 text-[9px] text-emerald-700">No current ERC findings.</p>}
          </div>
        </EngineeringBottomDock>
      </div>

      <EngineeringStatusBar
        left={placementOverlay ? 'Placement: click a grid point to place the armed symbol · Esc cancels' : viewState.activeTool === 'wire' ? 'Wire: click a real pin to start · click corners · finish on another pin · Esc cancels' : viewState.activeTool === 'pan' ? 'Pan: drag the sheet · switch back to Select when finished' : 'Select: click or drag symbols · W wire · R rotate · Delete removes from this sheet'}
        center={viewState.selectedNetName ? `Net ${viewState.selectedNetName}` : selectedComponent ? `${selectedComponent.referenceDesignator} selected` : 'No selection'}
        right={`${Math.round(viewState.zoom * 100)}%`}
      />
    </section>
  );
};
