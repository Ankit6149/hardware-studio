'use client';

import React, { useMemo, useState } from 'react';
import { AlertTriangle, Box, Move, PanelRight, Plus, Ruler, ShieldCheck, Trash2 } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { useMechanicalWorkspaceUiStore } from '../../store/mechanicalWorkspaceUiStore';
import type { MechanicalObject } from '../../types';
import { buildMechanicalBoardEnvelope, evaluateMechanicalBoardContext } from '../../lib/mechanical/boardMechanicalContext';
import { validateMechanicalLayout } from '../../lib/mechanical/mechanicalValidation';
import { EditorDockButton } from '../editor/EditorDockButton';
import {
  EditorToolButton,
  EngineeringBottomDock,
  EngineeringEditorBar,
  EngineeringInspector,
  EngineeringStatusBar,
} from '../editor/EngineeringEditorShell';
import { EngineeringMechanicalCanvas, type MechanicalCanvasView } from './EngineeringMechanicalCanvas';

interface Props {
  initialMode?: string;
}

type FeatureType = MechanicalObject['type'];
type DimensionKind = 'Width' | 'Height' | 'Radius';

const FEATURE_TYPES: FeatureType[] = [
  'Outer Profile',
  'Inner Profile',
  'Battery Cavity',
  'Connector Opening',
  'Button Opening',
  'Sensor Window',
  'Mounting Point',
  'Antenna Keepout',
  'Thermal Zone',
  'Seal Zone',
  'Flex Bend Zone',
  'Mechanical Keepout',
];

function defaultShape(type: FeatureType): MechanicalObject['shape'] {
  return type === 'Mounting Point' || type === 'Button Opening' ? 'circle' : 'rect';
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[9px] font-medium text-slate-500">{children}</span>;
}

function parsePositive(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function parseNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export const EngineeringMechanicalWorkbench: React.FC<Props> = ({ initialMode }) => {
  const store = useProjectStore();
  const selected = useStudioContextStore((state) => state.selected);
  const select = useStudioContextStore((state) => state.select);
  const contextBoardId = useStudioContextStore((state) => state.activeBoardId);
  const requestedAssembly = initialMode === 'assembly';
  const objects = store.mechanicalObjects || [];
  const dimensions = store.mechanicalDimensions || [];
  const assemblyLayers = store.assemblyLayers || [];
  const preferredBoardId = contextBoardId || store.activeBoardId || null;
  const boardContext = useMemo(() => evaluateMechanicalBoardContext(store, preferredBoardId), [store, preferredBoardId]);
  const warnings = useMemo(() => validateMechanicalLayout(objects), [objects]);

  const inspectorOpen = useMechanicalWorkspaceUiStore((state) => state.inspectorOpen);
  const problemsOpen = useMechanicalWorkspaceUiStore((state) => state.problemsOpen);
  const panMode = useMechanicalWorkspaceUiStore((state) => state.panMode);
  const drawerSection = useMechanicalWorkspaceUiStore((state) => state.drawerSection);
  const setInspectorOpen = useMechanicalWorkspaceUiStore((state) => state.setInspectorOpen);
  const setProblemsOpen = useMechanicalWorkspaceUiStore((state) => state.setProblemsOpen);
  const setPanMode = useMechanicalWorkspaceUiStore((state) => state.setPanMode);
  const setDrawerSection = useMechanicalWorkspaceUiStore((state) => state.setDrawerSection);

  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState<MechanicalCanvasView>({ offsetX: 70, offsetY: 70, scale: 6, mouseXmm: 0, mouseYmm: 0 });
  const [featureType, setFeatureType] = useState<FeatureType>('Outer Profile');
  const [featureName, setFeatureName] = useState('');
  const [featureX, setFeatureX] = useState('');
  const [featureY, setFeatureY] = useState('');
  const [featureWidth, setFeatureWidth] = useState('');
  const [featureHeight, setFeatureHeight] = useState('');
  const [featureRadius, setFeatureRadius] = useState('');
  const [featureDepth, setFeatureDepth] = useState('');
  const [featureMaterial, setFeatureMaterial] = useState('');
  const [featureClearance, setFeatureClearance] = useState('');
  const [dimensionKind, setDimensionKind] = useState<DimensionKind>('Width');
  const [tolPlus, setTolPlus] = useState('');
  const [tolMinus, setTolMinus] = useState('');

  const selectedObjectId = selected?.entity === 'mechanical-object' ? selected.id : null;
  const selectedObject = objects.find((object) => object.id === selectedObjectId) || null;
  const orderedLayers = useMemo(() => [...assemblyLayers].sort((a, b) => a.order - b.order), [assemblyLayers]);

  const selectObject = (id: string | null) => {
    if (!id) {
      select(null);
      return;
    }
    const object = objects.find((candidate) => candidate.id === id);
    if (!object) return;
    select({ entity: 'mechanical-object', id: object.id, label: object.name, boardId: object.linkedBoardId || null });
    setInspectorOpen(true);
  };

  const createFeature = () => {
    const shape = defaultShape(featureType);
    const xMm = parseNumber(featureX);
    const yMm = parseNumber(featureY);
    const widthMm = parsePositive(featureWidth);
    const heightMm = parsePositive(featureHeight);
    const radiusMm = parsePositive(featureRadius);
    const depthMm = parsePositive(featureDepth);
    const clearanceMm = parsePositive(featureClearance);

    if (!featureName.trim() || xMm == null || yMm == null) return;
    if (shape === 'rect' && (widthMm == null || heightMm == null)) return;
    if (shape === 'circle' && radiusMm == null) return;

    const id = `mech_${Date.now().toString(36)}`;
    store.addMechanicalObject({
      id,
      name: featureName.trim(),
      type: featureType,
      shape,
      xMm,
      yMm,
      widthMm: shape === 'rect' ? widthMm : undefined,
      heightMm: shape === 'rect' ? heightMm : undefined,
      radiusMm: shape === 'circle' ? radiusMm : undefined,
      depthMm,
      material: featureMaterial.trim() || undefined,
      clearanceMm,
      rotationDeg: 0,
      locked: false,
      visible: true,
    });
    select({ entity: 'mechanical-object', id, label: featureName.trim() });
    setShowCreate(false);
    setInspectorOpen(true);
    setFeatureName('');
    setFeatureX('');
    setFeatureY('');
    setFeatureWidth('');
    setFeatureHeight('');
    setFeatureRadius('');
    setFeatureDepth('');
    setFeatureMaterial('');
    setFeatureClearance('');
  };

  const addDimension = () => {
    if (!selectedObject) return;
    let from = { xMm: selectedObject.xMm, yMm: selectedObject.yMm };
    let to = { xMm: selectedObject.xMm, yMm: selectedObject.yMm };
    let valueMm = 0;

    if (dimensionKind === 'Width' && selectedObject.widthMm != null) {
      const offset = (selectedObject.heightMm ?? 0) + 3;
      from = { xMm: selectedObject.xMm, yMm: selectedObject.yMm + offset };
      to = { xMm: selectedObject.xMm + selectedObject.widthMm, yMm: selectedObject.yMm + offset };
      valueMm = selectedObject.widthMm;
    } else if (dimensionKind === 'Height' && selectedObject.heightMm != null) {
      const offset = (selectedObject.widthMm ?? 0) + 3;
      from = { xMm: selectedObject.xMm + offset, yMm: selectedObject.yMm };
      to = { xMm: selectedObject.xMm + offset, yMm: selectedObject.yMm + selectedObject.heightMm };
      valueMm = selectedObject.heightMm;
    } else if (dimensionKind === 'Radius' && selectedObject.radiusMm != null) {
      from = { xMm: selectedObject.xMm, yMm: selectedObject.yMm };
      to = { xMm: selectedObject.xMm + selectedObject.radiusMm, yMm: selectedObject.yMm };
      valueMm = selectedObject.radiusMm;
    } else {
      return;
    }

    store.addMechanicalDimension({
      name: `${selectedObject.name} ${dimensionKind.toLowerCase()}`,
      from,
      to,
      valueMm,
      tolerancePlusMm: parsePositive(tolPlus),
      toleranceMinusMm: parsePositive(tolMinus),
      linkedObjectIds: [selectedObject.id],
    });
    setDrawerSection('dimensions');
  };

  const syncBoardEnvelope = () => {
    const current = useProjectStore.getState();
    const envelope = buildMechanicalBoardEnvelope(current, preferredBoardId);
    const context = evaluateMechanicalBoardContext(current, preferredBoardId);
    if (!envelope || !context.boardId) return;
    current.executeProjectCommand('SYNC_BOARD_ENVELOPE', 'Sync PCB outline into mechanical workspace', () => {
      const existing = (useProjectStore.getState().mechanicalObjects || []).find(
        (object) => object.type === 'Board Zone' && object.linkedBoardId === context.boardId,
      );
      if (existing) useProjectStore.getState().updateMechanicalObject(existing.id, envelope);
      else useProjectStore.getState().addMechanicalObject(envelope);
    });
  };

  const assemblyMode = requestedAssembly || drawerSection === 'assembly';

  if (assemblyMode) {
    return (
      <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f5ef]" aria-label="Assembly engineering workbench">
        <EngineeringEditorBar
          domain="Mechanical"
          title="Assembly"
          meta={`${orderedLayers.length} physical layers · ${boardContext.boardName || 'no PCB context'}`}
          actions={(
            <button
              type="button"
              onClick={() => store.addAssemblyLayer({
                name: `Layer ${orderedLayers.length + 1}`,
                order: orderedLayers.length + 1,
                layerType: 'Casing',
                material: '',
                fasteningMethod: '',
                inspectionNote: '',
                notes: '',
              })}
              className="inline-flex h-8 items-center gap-1.5 bg-slate-950 px-2.5 text-[10px] font-semibold text-white"
            >
              <Plus className="h-3.5 w-3.5" /> Add assembly layer
            </button>
          )}
        />
        <div className="min-h-0 flex-1 overflow-auto bg-white">
          <div className="sticky top-0 z-10 grid min-w-[760px] grid-cols-[3rem_minmax(12rem,1.3fr)_10rem_11rem_minmax(14rem,1fr)_4rem] border-b border-slate-300 bg-[#f1efe8] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500">
            <span>#</span><span>Layer / inspection</span><span>Material</span><span>Fastening</span><span>Notes</span><span />
          </div>
          {orderedLayers.map((layer, index) => (
            <div key={layer.id} className="grid min-w-[760px] grid-cols-[3rem_minmax(12rem,1.3fr)_10rem_11rem_minmax(14rem,1fr)_4rem] items-center border-b border-slate-100 px-3 py-2 text-[10px]">
              <span className="font-mono text-slate-400">{String(index + 1).padStart(2, '0')}</span>
              <div className="pr-2">
                <input value={layer.name} onChange={(event) => store.updateAssemblyLayer(layer.id, { name: event.target.value })} className="h-7 w-full border-0 bg-transparent px-1 font-semibold text-slate-900 outline-none focus:bg-slate-50" />
                <input value={layer.inspectionNote} onChange={(event) => store.updateAssemblyLayer(layer.id, { inspectionNote: event.target.value })} placeholder="Inspection criterion" className="h-6 w-full border-0 bg-transparent px-1 text-[9px] text-slate-500 outline-none focus:bg-slate-50" />
              </div>
              <input value={layer.material} onChange={(event) => store.updateAssemblyLayer(layer.id, { material: event.target.value })} placeholder="Unresolved" className="h-8 border border-slate-300 bg-white px-2 text-[10px]" />
              <input value={layer.fasteningMethod} onChange={(event) => store.updateAssemblyLayer(layer.id, { fasteningMethod: event.target.value })} placeholder="Unresolved" className="h-8 border border-slate-300 bg-white px-2 text-[10px]" />
              <input value={layer.notes || ''} onChange={(event) => store.updateAssemblyLayer(layer.id, { notes: event.target.value })} placeholder="Thickness, finish, process…" className="h-8 border border-slate-300 bg-white px-2 text-[10px]" />
              <button type="button" onClick={() => store.deleteAssemblyLayer(layer.id)} className="grid h-8 w-8 place-items-center text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          {orderedLayers.length === 0 && (
            <div className="grid min-h-[22rem] place-items-center text-center">
              <div><p className="text-xs font-semibold text-slate-800">No assembly definition</p><p className="mt-1 text-[10px] text-slate-500">Add physical layers only when their identity, material and fastening intent are known.</p></div>
            </div>
          )}
        </div>
        <EngineeringStatusBar left="Assembly entries are explicit physical intent, not decorative layers." center={boardContext.syncState === 'synced' ? 'PCB envelope linked' : 'PCB envelope not synchronized'} right={`${orderedLayers.length} layers`} />
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7f5ef] text-slate-900" aria-label="Mechanical engineering workbench">
      <EngineeringEditorBar
        domain="Mechanical"
        title="2D Layout"
        meta={`${objects.length} physical features · ${dimensions.length} dimensions · ${warnings.length} findings`}
        tools={(
          <>
            <EditorToolButton label="Select" active={!panMode} onClick={() => setPanMode(false)}><Box className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Pan" active={panMode} onClick={() => setPanMode(true)}><Move className="h-3.5 w-3.5" /></EditorToolButton>
            <EditorToolButton label="Dimension" disabled={!selectedObject} onClick={() => setInspectorOpen(true)}><Ruler className="h-3.5 w-3.5" /></EditorToolButton>
          </>
        )}
        docks={(
          <>
            <EditorDockButton label="Inspector" icon={PanelRight} active={inspectorOpen} onClick={() => setInspectorOpen(!inspectorOpen)} />
            <EditorDockButton label="Problems" icon={AlertTriangle} active={problemsOpen} count={warnings.length} onClick={() => setProblemsOpen(!problemsOpen)} />
          </>
        )}
        actions={(
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setShowCreate((value) => !value)} className="inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700"><Plus className="h-3.5 w-3.5" /> Feature</button>
            <button
              type="button"
              onClick={syncBoardEnvelope}
              disabled={boardContext.syncState === 'missing-board' || boardContext.syncState === 'missing-outline'}
              className="inline-flex h-8 items-center gap-1.5 bg-slate-950 px-2.5 text-[10px] font-semibold text-white disabled:opacity-30"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> {boardContext.syncState === 'synced' ? 'Refresh PCB reference' : 'Link PCB reference'}
            </button>
          </div>
        )}
      />

      {showCreate && (
        <div className="shrink-0 border-b border-slate-300 bg-[#f1efe8] px-3 py-2">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-5 xl:grid-cols-8">
            <label><FieldLabel>Feature type</FieldLabel><select value={featureType} onChange={(event) => setFeatureType(event.target.value as FeatureType)} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 text-[10px]">{FEATURE_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label><FieldLabel>Name</FieldLabel><input value={featureName} onChange={(event) => setFeatureName(event.target.value)} placeholder="Required" className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 text-[10px]" /></label>
            <label><FieldLabel>X mm</FieldLabel><input type="number" value={featureX} onChange={(event) => setFeatureX(event.target.value)} placeholder="Required" className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>
            <label><FieldLabel>Y mm</FieldLabel><input type="number" value={featureY} onChange={(event) => setFeatureY(event.target.value)} placeholder="Required" className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>
            {defaultShape(featureType) === 'rect' ? (
              <>
                <label><FieldLabel>Width mm</FieldLabel><input type="number" value={featureWidth} onChange={(event) => setFeatureWidth(event.target.value)} placeholder="Required" className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>
                <label><FieldLabel>Height mm</FieldLabel><input type="number" value={featureHeight} onChange={(event) => setFeatureHeight(event.target.value)} placeholder="Required" className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>
              </>
            ) : (
              <label><FieldLabel>Radius mm</FieldLabel><input type="number" value={featureRadius} onChange={(event) => setFeatureRadius(event.target.value)} placeholder="Required" className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>
            )}
            <label><FieldLabel>Depth mm</FieldLabel><input type="number" value={featureDepth} onChange={(event) => setFeatureDepth(event.target.value)} placeholder="Optional" className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>
            <label><FieldLabel>Clearance mm</FieldLabel><input type="number" value={featureClearance} onChange={(event) => setFeatureClearance(event.target.value)} placeholder="Optional" className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>
            <label><FieldLabel>Material</FieldLabel><input value={featureMaterial} onChange={(event) => setFeatureMaterial(event.target.value)} placeholder="Optional" className="mt-1 h-8 w-full border border-slate-300 px-2 text-[10px]" /></label>
          </div>
          <div className="mt-2 flex justify-end gap-1.5">
            <button type="button" onClick={() => setShowCreate(false)} className="h-8 border border-slate-300 bg-white px-3 text-[9px] font-semibold text-slate-600">Cancel</button>
            <button type="button" onClick={createFeature} className="h-8 bg-slate-950 px-3 text-[9px] font-semibold text-white">Create explicit feature</button>
          </div>
        </div>
      )}

      <div className="relative min-h-0 flex-1 overflow-hidden bg-white">
        <EngineeringMechanicalCanvas
          selectedObjectId={selectedObjectId}
          onSelectObject={selectObject}
          panMode={panMode}
          view={view}
          onViewChange={(patch) => setView((previous) => ({ ...previous, ...patch }))}
        />

        <EngineeringInspector open={inspectorOpen} subtitle={selectedObject?.name || 'No selection'} onClose={() => setInspectorOpen(false)} widthClassName="w-[320px]">
          <div className="p-3">
            {selectedObject ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Physical feature</p>
                  <input value={selectedObject.name} onChange={(event) => store.updateMechanicalObject(selectedObject.id, { name: event.target.value })} className="mt-1 h-8 w-full border border-slate-300 bg-white px-2 text-[11px] font-semibold" />
                  <p className="mt-1 text-[9px] text-slate-500">{selectedObject.type} · {selectedObject.shape}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <label><FieldLabel>X mm</FieldLabel><input type="number" step="0.1" value={selectedObject.xMm} onChange={(event) => { const value = parseNumber(event.target.value); if (value != null) store.updateMechanicalObject(selectedObject.id, { xMm: value }); }} className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>
                  <label><FieldLabel>Y mm</FieldLabel><input type="number" step="0.1" value={selectedObject.yMm} onChange={(event) => { const value = parseNumber(event.target.value); if (value != null) store.updateMechanicalObject(selectedObject.id, { yMm: value }); }} className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>
                  {selectedObject.widthMm != null && <label><FieldLabel>Width mm</FieldLabel><input type="number" step="0.1" value={selectedObject.widthMm} onChange={(event) => { const value = parsePositive(event.target.value); if (value != null) store.updateMechanicalObject(selectedObject.id, { widthMm: value }); }} className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>}
                  {selectedObject.heightMm != null && <label><FieldLabel>Height mm</FieldLabel><input type="number" step="0.1" value={selectedObject.heightMm} onChange={(event) => { const value = parsePositive(event.target.value); if (value != null) store.updateMechanicalObject(selectedObject.id, { heightMm: value }); }} className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>}
                  {selectedObject.radiusMm != null && <label><FieldLabel>Radius mm</FieldLabel><input type="number" step="0.1" value={selectedObject.radiusMm} onChange={(event) => { const value = parsePositive(event.target.value); if (value != null) store.updateMechanicalObject(selectedObject.id, { radiusMm: value }); }} className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>}
                  <label><FieldLabel>Depth mm</FieldLabel><input type="number" step="0.1" value={selectedObject.depthMm ?? ''} onChange={(event) => store.updateMechanicalObject(selectedObject.id, { depthMm: parsePositive(event.target.value) })} className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>
                </div>
                <label className="block"><FieldLabel>Material</FieldLabel><input value={selectedObject.material || ''} onChange={(event) => store.updateMechanicalObject(selectedObject.id, { material: event.target.value || undefined })} className="mt-1 h-8 w-full border border-slate-300 px-2 text-[10px]" /></label>
                <label className="block"><FieldLabel>Clearance mm</FieldLabel><input type="number" step="0.1" value={selectedObject.clearanceMm ?? ''} onChange={(event) => store.updateMechanicalObject(selectedObject.id, { clearanceMm: parsePositive(event.target.value) })} className="mt-1 h-8 w-full border border-slate-300 px-2 font-mono text-[10px]" /></label>

                <div className="border-t border-slate-200 pt-3">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Dimensional evidence</p>
                  <div className="mt-2 grid grid-cols-3 gap-1">
                    <select value={dimensionKind} onChange={(event) => setDimensionKind(event.target.value as DimensionKind)} className="h-8 border border-slate-300 bg-white px-1 text-[9px]"><option>Width</option><option>Height</option><option>Radius</option></select>
                    <input value={tolPlus} onChange={(event) => setTolPlus(event.target.value)} title="Positive tolerance" className="h-8 border border-slate-300 px-2 font-mono text-[9px]" placeholder="+ tolerance" />
                    <input value={tolMinus} onChange={(event) => setTolMinus(event.target.value)} title="Negative tolerance" className="h-8 border border-slate-300 px-2 font-mono text-[9px]" placeholder="- tolerance" />
                  </div>
                  <button type="button" onClick={addDimension} className="mt-1.5 inline-flex h-8 w-full items-center justify-center gap-1.5 bg-slate-950 text-[9px] font-semibold text-white"><Ruler className="h-3.5 w-3.5" /> Capture dimension</button>
                  <div className="mt-2 space-y-1">
                    {dimensions.filter((dimension) => dimension.linkedObjectIds.includes(selectedObject.id)).map((dimension) => (
                      <div key={dimension.id} className="flex items-center gap-2 border border-slate-200 bg-white px-2 py-1.5">
                        <span className="min-w-0 flex-1 truncate font-mono text-[9px] text-slate-700">{dimension.name} · {dimension.valueMm.toFixed(2)} mm {dimension.tolerancePlusMm != null || dimension.toleranceMinusMm != null ? `+${dimension.tolerancePlusMm ?? 0}/-${dimension.toleranceMinusMm ?? 0}` : '· tolerance unresolved'}</span>
                        <button type="button" onClick={() => store.deleteMechanicalDimension(dimension.id)} className="text-red-600"><Trash2 className="h-3 w-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>

                <button type="button" onClick={() => { store.deleteMechanicalObject(selectedObject.id); select(null); }} className="inline-flex h-8 w-full items-center justify-center gap-1.5 border border-red-300 bg-white text-[9px] font-semibold text-red-700"><Trash2 className="h-3.5 w-3.5" /> Delete feature</button>
              </div>
            ) : (
              <div className="py-5 text-center"><Box className="mx-auto h-6 w-6 text-slate-300" /><p className="mt-2 text-[10px] font-semibold text-slate-700">No feature selected</p><p className="mt-1 text-[9px] leading-4 text-slate-400">Choose a feature in the Project Drawer or viewport to inspect its exact physical properties.</p></div>
            )}
          </div>
        </EngineeringInspector>

        <EngineeringBottomDock
          open={problemsOpen}
          title="Mechanical checks"
          subtitle={`${warnings.length} current finding${warnings.length === 1 ? '' : 's'}`}
          onClose={() => setProblemsOpen(false)}
        >
          <div className="grid gap-1 p-2 sm:grid-cols-2 xl:grid-cols-3">
            {warnings.slice(0, 12).map((warning, index) => (
              <div key={`${warning.message}-${index}`} className="border-l-2 border-amber-500 bg-amber-50 px-2 py-1.5 text-[9px] leading-4 text-amber-900">{warning.message}</div>
            ))}
            {warnings.length === 0 && <p className="p-3 text-[9px] text-emerald-700">No current 2D mechanical findings.</p>}
          </div>
        </EngineeringBottomDock>
      </div>

      <EngineeringStatusBar
        left={panMode ? 'Pan mode · drag viewport' : 'Select a feature in the Project Drawer or viewport'}
        center={boardContext.boardName ? `PCB context · ${boardContext.boardName} · ${boardContext.syncState}` : 'PCB context unresolved'}
        right={`${view.mouseXmm.toFixed(2)}, ${view.mouseYmm.toFixed(2)} mm`}
      />
    </section>
  );
};
