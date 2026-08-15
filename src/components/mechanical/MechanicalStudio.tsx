'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Circle,
  EyeOff,
  Layers,
  Lock,
  MousePointer,
  Move,
  PanelRight,
  Redo2,
  RefreshCw,
  ShieldCheck,
  Square,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { useFeedback } from '../feedback/FeedbackProvider';
import { MechanicalCanvas } from './MechanicalCanvas';
import { MechanicalInspector } from './MechanicalInspector';
import { UnifiedBoard3DView } from './UnifiedBoard3DView';
import { validateMechanicalLayout } from '../../lib/mechanical/mechanicalValidation';
import {
  buildMechanicalBoardEnvelope,
  evaluateMechanicalBoardContext,
} from '../../lib/mechanical/boardMechanicalContext';
import { EditorDockButton } from '../editor/EditorDockButton';

type ToolMode = 'select' | 'pan' | 'rect' | 'circle' | 'polygon';
type StudioMode = 'canvas' | 'assembly' | '3d';

interface MechanicalStudioProps {
  initialMode?: string;
}

const tools: { mode: ToolMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'select', label: 'Select', icon: <MousePointer className="h-4 w-4" /> },
  { mode: 'pan', label: 'Pan', icon: <Move className="h-4 w-4" /> },
  { mode: 'rect', label: 'Rectangle', icon: <Square className="h-4 w-4" /> },
  { mode: 'circle', label: 'Circle', icon: <Circle className="h-4 w-4" /> },
];

export const MechanicalStudio: React.FC<MechanicalStudioProps> = ({ initialMode }) => {
  const store = useProjectStore();
  const { notify } = useFeedback();
  const contextBoardId = useStudioContextStore((state) => state.activeBoardId);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolMode>('select');
  const [showWarnings, setShowWarnings] = useState(false);
  const [objectsOpen, setObjectsOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [studioMode, setStudioMode] = useState<StudioMode>(
    initialMode === 'assembly' ? 'assembly' : initialMode === '3d-preview' || initialMode === 'webgl-3d' ? '3d' : 'canvas',
  );

  const mechanicalObjects = store.mechanicalObjects || [];
  const assemblyLayers = store.assemblyLayers || [];
  const warnings = useMemo(() => validateMechanicalLayout(mechanicalObjects), [mechanicalObjects]);
  const preferredBoardId = contextBoardId || store.activeBoardId || null;
  const boardContext = useMemo(
    () => evaluateMechanicalBoardContext(store, preferredBoardId),
    [store, preferredBoardId],
  );
  const activeBoardComponents = useMemo(
    () => (store.boardComponents || []).filter((component) => component.boardId === boardContext.boardId),
    [boardContext.boardId, store.boardComponents],
  );
  const orderedLayers = useMemo(
    () => [...assemblyLayers].sort((left, right) => left.order - right.order),
    [assemblyLayers],
  );
  const totalThickness = orderedLayers.reduce((sum, layer) => {
    const match = layer.notes?.match(/Thickness\s*([\d.]+)/i);
    return sum + (match ? Number.parseFloat(match[1]) : 0);
  }, 0);

  const syncBoardEnvelope = () => {
    const currentProject = useProjectStore.getState();
    const envelope = buildMechanicalBoardEnvelope(currentProject, preferredBoardId);
    const context = evaluateMechanicalBoardContext(currentProject, preferredBoardId);
    if (!envelope || !context.boardId) {
      notify({
        tone: 'warning',
        title: 'PCB outline required',
        detail: context.blockers[0] || 'Mechanical board context needs an explicit PCB outline.',
      });
      return;
    }

    currentProject.executeProjectCommand('SYNC_BOARD_ENVELOPE', 'Sync PCB envelope into mechanical workspace', () => {
      const existing = (useProjectStore.getState().mechanicalObjects || []).find(
        (object) => object.type === 'Board Zone' && object.linkedBoardId === context.boardId,
      );
      if (existing) {
        useProjectStore.getState().updateMechanicalObject(existing.id, envelope);
      } else {
        useProjectStore.getState().addMechanicalObject(envelope);
      }
    });

    const synced = evaluateMechanicalBoardContext(useProjectStore.getState(), context.boardId);
    if (synced.linkedObjectId) setSelectedObjectId(synced.linkedObjectId);
    notify({
      tone: 'success',
      title: context.syncState === 'stale' ? 'PCB envelope refreshed' : 'PCB envelope linked',
      detail: `${context.boardName} now uses the current explicit board outline in Mechanical.`,
    });
  };

  const deleteSelected = () => {
    if (!selectedObjectId) return;
    const selected = mechanicalObjects.find((object) => object.id === selectedObjectId);
    const isDerivedBoardEnvelope = Boolean(
      selected?.linkedBoardId
      && selected.type === 'Board Zone'
      && selected.notes?.includes('Derived from authoritative board outline'),
    );
    if (isDerivedBoardEnvelope) {
      notify({
        tone: 'warning',
        title: 'PCB envelope is derived evidence',
        detail: 'Keep it linked to the PCB outline. Hide it if needed, or change the board outline and re-sync.',
      });
      return;
    }
    store.executeProjectCommand('DEL_OBJ', 'Delete mechanical object', () => {
      store.deleteMechanicalObject(selectedObjectId);
      setSelectedObjectId(null);
    });
  };

  const addAssemblyLayer = () => {
    store.executeProjectCommand('ADD_LAYER', 'Add assembly layer', () => {
      store.addAssemblyLayer({
        name: `Layer ${assemblyLayers.length + 1}`,
        order: assemblyLayers.length + 1,
        layerType: 'Casing',
        material: '',
        fasteningMethod: 'Screw Thread',
        inspectionNote: '',
        notes: '',
      });
    });
  };

  const syncLabel = boardContext.syncState === 'synced'
    ? 'PCB envelope synced'
    : boardContext.syncState === 'stale'
      ? 'PCB envelope stale'
      : boardContext.syncState === 'not-synced'
        ? 'PCB envelope not linked'
        : 'PCB geometry unresolved';

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-50 text-slate-900" aria-label="Mechanical and enclosure workspace">
      <header className="shrink-0 border-b border-slate-300 bg-white">
        <div className="flex flex-wrap items-center gap-3 px-3 py-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <span className="font-semibold text-slate-900">Mechanical</span>
              <span className={boardContext.syncState === 'synced' ? 'text-emerald-700' : boardContext.syncState === 'stale' ? 'text-amber-700' : 'text-slate-500'}>{syncLabel}</span>
            </div>
            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              {boardContext.boardName || 'No board context'}
              {boardContext.widthMm != null && boardContext.heightMm != null ? ` · ${boardContext.widthMm.toFixed(2)} × ${boardContext.heightMm.toFixed(2)} mm outline` : ''}
              {boardContext.boardId ? ` · ${activeBoardComponents.length} board components` : ''}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-md border border-slate-300 bg-slate-50 p-0.5" role="tablist" aria-label="Mechanical workspace modes">
            {([
              ['canvas', '2D'],
              ['assembly', 'Assembly'],
              ['3d', '3D'],
            ] as const).map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={studioMode === id} onClick={() => setStudioMode(id)} className={`min-h-7 rounded-md px-2.5 text-[10px] font-semibold ${studioMode === id ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>{label}</button>
            ))}
          </div>

          <button type="button" onClick={syncBoardEnvelope} disabled={boardContext.syncState === 'missing-board' || boardContext.syncState === 'missing-outline'} className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-slate-950 px-2.5 text-[10px] font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35">
            {boardContext.syncState === 'synced' ? <ShieldCheck className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {boardContext.syncState === 'synced' ? 'Re-sync PCB' : 'Sync PCB envelope'}
          </button>
        </div>
        {boardContext.blockers.length > 0 && <div className="border-t border-amber-200 bg-amber-50 px-3 py-1.5 text-[10px] text-amber-900"><AlertTriangle className="mr-1.5 inline h-3.5 w-3.5" />{boardContext.blockers[0]}</div>}
      </header>

      {studioMode === '3d' ? (
        <div className="min-h-0 flex-1 bg-slate-950"><UnifiedBoard3DView /></div>
      ) : studioMode === 'assembly' ? (
        <section className="min-h-0 flex-1 overflow-y-auto bg-white" aria-label="Assembly stack editor">
          <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b border-slate-300 bg-white px-4 py-2.5">
            <div className="min-w-0 flex-1"><h2 className="text-sm font-semibold text-slate-950">Assembly stack</h2><p className="mt-0.5 text-[10px] text-slate-500">Ordered physical layers. Missing material, thickness, or inspection evidence stays unresolved.</p></div>
            <div className="hidden items-center gap-3 text-[10px] text-slate-500 lg:flex"><span><strong className="text-slate-800">{orderedLayers.length}</strong> layers</span><span><strong className="text-slate-800">{totalThickness > 0 ? `${totalThickness.toFixed(2)} mm` : '—'}</strong> parsed thickness</span><span><strong className="text-slate-800">{syncLabel}</strong></span></div>
            <button type="button" onClick={addAssemblyLayer} className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-[10px] font-semibold text-white hover:bg-slate-800"><Layers className="h-3.5 w-3.5" /> Add layer</button>
          </div>

          {orderedLayers.length === 0 ? (
            <div className="grid min-h-[24rem] place-items-center p-8 text-center"><div className="max-w-sm"><Layers className="mx-auto h-8 w-8 text-slate-300" /><h3 className="mt-3 text-sm font-semibold text-slate-800">No assembly layers recorded</h3><p className="mt-1 text-xs leading-5 text-slate-500">Add only layers, materials, fastening methods, and thickness notes you actually know.</p></div></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orderedLayers.map((layer, index) => (
                <div key={layer.id} className="grid gap-3 px-4 py-3 md:grid-cols-[2.5rem_minmax(12rem,1.3fr)_minmax(9rem,1fr)_minmax(10rem,1fr)_auto] md:items-center">
                  <div className="font-mono text-xs font-semibold text-slate-400">{String(index + 1).padStart(2, '0')}</div>
                  <div className="min-w-0">
                    <input value={layer.name} onChange={(event) => store.updateAssemblyLayer(layer.id, { name: event.target.value })} className="h-8 w-full rounded-md border border-transparent bg-transparent px-2 text-xs font-semibold text-slate-900 hover:border-slate-200 focus:border-slate-500 focus:bg-white focus:outline-none" />
                    <input value={layer.inspectionNote} onChange={(event) => store.updateAssemblyLayer(layer.id, { inspectionNote: event.target.value })} placeholder="Inspection note" className="mt-1 h-7 w-full rounded-md border border-transparent bg-transparent px-2 text-[10px] text-slate-500 hover:border-slate-200 focus:border-slate-500 focus:bg-white focus:outline-none" />
                  </div>
                  <input value={layer.material} onChange={(event) => store.updateAssemblyLayer(layer.id, { material: event.target.value })} placeholder="Material unresolved" className="h-8 rounded-md border border-slate-300 bg-white px-2 text-[10px] text-slate-700 focus:border-slate-500 focus:outline-none" />
                  <select value={layer.fasteningMethod} onChange={(event) => store.updateAssemblyLayer(layer.id, { fasteningMethod: event.target.value })} className="h-8 rounded-md border border-slate-300 bg-white px-2 text-[10px] text-slate-700 focus:border-slate-500 focus:outline-none">
                    {['Screw Thread', 'Snap Fit', 'Adhesive', 'Press Fit', 'Gasket', 'Welded', 'Soldered'].map((method) => <option key={method} value={method}>{method}</option>)}
                  </select>
                  <div className="flex items-center justify-end gap-1">
                    <button type="button" disabled={index === 0} onClick={() => {
                      const previous = orderedLayers[index - 1];
                      store.executeProjectCommand('MOVE_LAYER', 'Move assembly layer up', () => {
                        store.updateAssemblyLayer(layer.id, { order: previous.order });
                        store.updateAssemblyLayer(previous.id, { order: layer.order });
                      });
                    }} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-25" aria-label={`Move ${layer.name} up`}>↑</button>
                    <button type="button" disabled={index === orderedLayers.length - 1} onClick={() => {
                      const next = orderedLayers[index + 1];
                      store.executeProjectCommand('MOVE_LAYER', 'Move assembly layer down', () => {
                        store.updateAssemblyLayer(layer.id, { order: next.order });
                        store.updateAssemblyLayer(next.id, { order: layer.order });
                      });
                    }} className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-25" aria-label={`Move ${layer.name} down`}>↓</button>
                    <button type="button" onClick={() => store.executeProjectCommand('DEL_LAYER', 'Delete assembly layer', () => store.deleteAssemblyLayer(layer.id))} className="grid h-7 w-7 place-items-center rounded-md text-rose-600 hover:bg-rose-50" aria-label={`Delete ${layer.name}`}><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-10 shrink-0 flex-wrap items-center gap-1 border-b border-slate-300 bg-white px-3 py-1.5">
            {tools.map((item) => (
              <button key={item.mode} type="button" onClick={() => setTool(item.mode)} aria-pressed={tool === item.mode} title={item.label} className={`grid h-8 w-8 place-items-center rounded-md focus:outline-none focus:ring-2 focus:ring-slate-400 ${tool === item.mode ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100'}`}>{item.icon}</button>
            ))}
            <span className="mx-1 h-5 w-px bg-slate-200" />
            <button type="button" onClick={deleteSelected} disabled={!selectedObjectId} className="grid h-8 w-8 place-items-center rounded-md text-rose-600 hover:bg-rose-50 disabled:opacity-25" title="Delete selected"><Trash2 className="h-4 w-4" /></button>
            <button type="button" onClick={() => store.undoProjectCommand()} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100" title="Undo"><Undo2 className="h-4 w-4" /></button>
            <button type="button" onClick={() => store.redoProjectCommand()} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100" title="Redo"><Redo2 className="h-4 w-4" /></button>
            <div className="ml-auto flex items-center gap-1.5">
              <EditorDockButton label="Objects" icon={Boxes} active={objectsOpen} count={mechanicalObjects.length} onClick={() => setObjectsOpen((value) => !value)} />
              <EditorDockButton label="Inspector" icon={PanelRight} active={inspectorOpen} onClick={() => setInspectorOpen((value) => !value)} />
              <button type="button" onClick={() => setShowWarnings((current) => !current)} aria-pressed={showWarnings} className={`inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-[10px] font-semibold ${warnings.length > 0 ? 'border-amber-300 bg-amber-50 text-amber-800' : 'border-slate-300 bg-white text-slate-600'}`}><AlertTriangle className="h-3.5 w-3.5" /> {warnings.length}</button>
            </div>
          </div>

          <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
            <MechanicalCanvas selectedObjectId={selectedObjectId} onSelectObject={setSelectedObjectId} tool={tool} />

            {objectsOpen && (
              <aside className="absolute bottom-3 left-3 top-3 z-30 w-52 overflow-y-auto rounded-lg border border-slate-300 bg-white p-2 shadow-xl" aria-label="Mechanical objects">
                <div className="px-1 py-1.5"><p className="text-[10px] font-semibold text-slate-700">Objects</p><p className="mt-0.5 text-[9px] text-slate-400">Select an object to edit it; selecting does not change workspaces.</p></div>
                <div className="space-y-1">
                  {mechanicalObjects.map((object) => (
                    <button key={object.id} type="button" onClick={() => setSelectedObjectId(object.id)} aria-pressed={object.id === selectedObjectId} className={`flex min-h-9 w-full items-center gap-1.5 rounded-md border px-2 text-left ${object.id === selectedObjectId ? 'border-slate-950 bg-slate-100' : 'border-transparent hover:border-slate-200 hover:bg-slate-50'}`}>
                      <span className="min-w-0 flex-1"><span className="block truncate text-[10px] font-semibold text-slate-800">{object.name}</span><span className="block truncate text-[9px] text-slate-400">{object.type}</span></span>
                      {object.locked && <Lock className="h-3 w-3 text-slate-400" />}{!object.visible && <EyeOff className="h-3 w-3 text-slate-400" />}
                    </button>
                  ))}
                  {mechanicalObjects.length === 0 && <p className="px-2 py-5 text-center text-[10px] leading-4 text-slate-400">Draw an enclosure/profile object, or sync the real PCB outline.</p>}
                </div>
              </aside>
            )}

            {inspectorOpen && (
              <aside className="absolute bottom-3 right-3 top-3 z-30 w-72 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl" aria-label="Mechanical inspector"><MechanicalInspector selectedObjectId={selectedObjectId} /></aside>
            )}

            {showWarnings && warnings.length > 0 && (
              <div className="absolute bottom-3 left-1/2 z-40 max-h-44 w-[min(680px,calc(100%-2rem))] -translate-x-1/2 overflow-y-auto rounded-lg border border-amber-300 bg-white p-3 shadow-xl">
                <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold text-amber-800"><AlertTriangle className="h-3.5 w-3.5" /> Mechanical findings</div>
                <div className="space-y-1">{warnings.map((warning, index) => <p key={`${warning.message}-${index}`} className={`text-[10px] leading-4 ${warning.severity === 'Error' ? 'text-rose-700' : 'text-amber-700'}`}>[{warning.severity}] {warning.message}</p>)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};