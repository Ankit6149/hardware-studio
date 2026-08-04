'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
  ArrowRight,
  Box,
  BringToFront,
  Check,
  ChevronDown,
  ChevronRight,
  Circle,
  Download,
  Eye,
  EyeOff,
  FileImage,
  Focus,
  Group,
  ImagePlus,
  Import,
  Layers3,
  Lock,
  MousePointer2,
  Move,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  Redo2,
  RectangleHorizontal,
  Ruler,
  Save,
  SendToBack,
  Shapes,
  SquareMousePointer,
  StickyNote,
  TextCursorInput,
  Trash2,
  Undo2,
  Ungroup,
  Unlock,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { useProductDesignStore } from '../../store/productDesignStore';
import type {
  ProductDesignConceptPart,
  ProductDesignDimension,
  ProductDesignObject,
  ProductDesignReferenceImage,
  ProductDesignText,
  ProductDesignTool,
} from '../../lib/product-design/types';
import { ProductDesignCanvas } from './ProductDesignCanvas';
import { ProductDesign3DPreview } from './ProductDesign3DPreview';

const toolItems: Array<{
  id: ProductDesignTool;
  label: string;
  shortcut: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'select', label: 'Select', shortcut: 'V', icon: MousePointer2 },
  { id: 'pan', label: 'Pan', shortcut: 'H / Alt', icon: Move },
  { id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: RectangleHorizontal },
  { id: 'ellipse', label: 'Ellipse', shortcut: 'O', icon: Circle },
  { id: 'line', label: 'Line', shortcut: 'L', icon: Shapes },
  { id: 'arrow', label: 'Arrow', shortcut: 'A', icon: ArrowRight },
  { id: 'text', label: 'Text', shortcut: 'T', icon: TextCursorInput },
  { id: 'note', label: 'Note', shortcut: 'N', icon: StickyNote },
  { id: 'dimension', label: 'Dimension', shortcut: 'D', icon: Ruler },
  { id: 'reference-image', label: 'Reference image', shortcut: 'I', icon: ImagePlus },
];

function downloadTextFile(fileName: string, content: string, type = 'application/json'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function NumberField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <label className="block min-w-0">
      <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
      <input
        type="number"
        min={min}
        value={Number.isFinite(value) ? Math.round(value * 100) / 100 : 0}
        onChange={(event) => onChange(Number(event.target.value) || 0)}
        className="mt-1 h-8 w-full rounded-lg border border-slate-300 bg-white px-2 font-mono text-[11px] text-slate-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
      />
    </label>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">{children}</h3>;
}

export const ProductDesignStudio: React.FC = () => {
  const project = useProjectStore();
  const initialize = useProductDesignStore((state) => state.initialize);
  const documents = useProductDesignStore((state) => state.documents);
  const document = useProductDesignStore((state) => state.document);
  const checkpoints = useProductDesignStore((state) => state.checkpoints);
  const activeLayerId = useProductDesignStore((state) => state.activeLayerId);
  const selectedObjectIds = useProductDesignStore((state) => state.selectedObjectIds);
  const activeTool = useProductDesignStore((state) => state.activeTool);
  const zoom = useProductDesignStore((state) => state.zoom);
  const persistenceStatus = useProductDesignStore((state) => state.persistenceStatus);
  const persistenceMessage = useProductDesignStore((state) => state.persistenceMessage);
  const undoStack = useProductDesignStore((state) => state.undoStack);
  const redoStack = useProductDesignStore((state) => state.redoStack);
  const missingAssetIds = useProductDesignStore((state) => state.missingAssetIds);
  const createDocument = useProductDesignStore((state) => state.createDocument);
  const openDocument = useProductDesignStore((state) => state.openDocument);
  const updateDocument = useProductDesignStore((state) => state.updateDocument);
  const addLayer = useProductDesignStore((state) => state.addLayer);
  const updateLayer = useProductDesignStore((state) => state.updateLayer);
  const deleteLayer = useProductDesignStore((state) => state.deleteLayer);
  const setActiveLayer = useProductDesignStore((state) => state.setActiveLayer);
  const selectObject = useProductDesignStore((state) => state.selectObject);
  const updateObjectById = useProductDesignStore((state) => state.updateObjectById);
  const deleteSelected = useProductDesignStore((state) => state.deleteSelected);
  const duplicateSelected = useProductDesignStore((state) => state.duplicateSelected);
  const groupSelected = useProductDesignStore((state) => state.groupSelected);
  const ungroupSelected = useProductDesignStore((state) => state.ungroupSelected);
  const bringSelectedForward = useProductDesignStore((state) => state.bringSelectedForward);
  const sendSelectedBackward = useProductDesignStore((state) => state.sendSelectedBackward);
  const alignSelected = useProductDesignStore((state) => state.alignSelected);
  const createConceptPartFromSelection = useProductDesignStore((state) => state.createConceptPartFromSelection);
  const addReferenceImage = useProductDesignStore((state) => state.addReferenceImage);
  const createCheckpoint = useProductDesignStore((state) => state.createCheckpoint);
  const restoreCheckpoint = useProductDesignStore((state) => state.restoreCheckpoint);
  const deleteCheckpoint = useProductDesignStore((state) => state.deleteCheckpoint);
  const undo = useProductDesignStore((state) => state.undo);
  const redo = useProductDesignStore((state) => state.redo);
  const setActiveTool = useProductDesignStore((state) => state.setActiveTool);
  const setViewport = useProductDesignStore((state) => state.setViewport);
  const fitDocument = useProductDesignStore((state) => state.fitDocument);
  const set3DOpen = useProductDesignStore((state) => state.set3DOpen);
  const exportDocument = useProductDesignStore((state) => state.exportDocument);
  const importDocument = useProductDesignStore((state) => state.importDocument);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [checkpointName, setCheckpointName] = useState('');
  const [newLayerName, setNewLayerName] = useState('');
  const [expandedLayers, setExpandedLayers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    void initialize(project.id || 'local-project');
  }, [initialize, project.id]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return;
      const key = event.key.toLowerCase();
      const tool = toolItems.find((item) => item.shortcut.toLowerCase().startsWith(key));
      if (tool && !event.ctrlKey && !event.metaKey && !event.altKey) setActiveTool(tool.id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setActiveTool]);

  useEffect(() => {
    if (!document) return;
    setExpandedLayers((current) => {
      const next = { ...current };
      document.layers.forEach((layer) => {
        if (next[layer.id] === undefined) next[layer.id] = true;
      });
      return next;
    });
  }, [document]);

  const selectedObjects = useMemo(
    () => document?.objects.filter((object) => selectedObjectIds.includes(object.id)) || [],
    [document, selectedObjectIds],
  );
  const selectedObject = selectedObjects.length === 1 ? selectedObjects[0] : null;
  const selectedConceptPart = selectedObject?.type === 'concept-part' ? selectedObject : null;

  const objectByLayer = useMemo(() => {
    const result = new Map<string, ProductDesignObject[]>();
    document?.layers.forEach((layer) => result.set(layer.id, []));
    document?.objects
      .slice()
      .sort((a, b) => b.order - a.order)
      .forEach((object) => result.get(object.layerId)?.push(object));
    return result;
  }, [document]);

  const updateSelected = (patch: Partial<ProductDesignObject>, label: string) => {
    if (!selectedObject) return;
    updateObjectById(selectedObject.id, { ...selectedObject, ...patch }, label);
  };

  const handleTool = (tool: ProductDesignTool) => {
    if (tool === 'reference-image') {
      imageInputRef.current?.click();
      return;
    }
    setActiveTool(tool);
  };

  const handleReferenceFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    await addReferenceImage(file, { altText: file.name });
  };

  const handleExport = async () => {
    const content = await exportDocument();
    if (!content || !document) return;
    downloadTextFile(`${document.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'product-design'}.hardware-design.json`, content);
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    await importDocument(await file.text());
    if (importInputRef.current) importInputRef.current.value = '';
  };

  const handleCreateCheckpoint = async () => {
    if (!checkpointName.trim()) return;
    await createCheckpoint(checkpointName.trim());
    setCheckpointName('');
  };

  if (!document) {
    return (
      <section className="grid h-full min-h-0 place-items-center bg-slate-100 p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-700"><Shapes className="h-5 w-5" /></div>
          <p className="mt-3 text-sm font-bold text-slate-900">Opening Product Design</p>
          <p className="mt-1 text-xs text-slate-500">{persistenceMessage}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-100 text-slate-900" aria-label="Product Design Studio">
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleReferenceFile(event.target.files?.[0])} />
      <input ref={importInputRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => void handleImportFile(event.target.files?.[0])} />

      <header className="shrink-0 border-b border-slate-200 bg-white">
        <div className="flex min-h-12 flex-wrap items-center gap-2 px-3 py-2">
          <button type="button" onClick={() => setLeftPanelOpen((open) => !open)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label={leftPanelOpen ? 'Hide layer panel' : 'Show layer panel'}>{leftPanelOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}</button>

          <div className="min-w-[180px] max-w-[280px] flex-1 sm:flex-none">
            <input value={document.name} onChange={(event) => updateDocument({ name: event.target.value })} aria-label="Product Design document name" className="h-8 w-full rounded-lg border border-transparent px-2 text-sm font-bold text-slate-950 outline-none hover:border-slate-200 focus:border-indigo-400 focus:bg-white" />
            <p className="truncate px-2 text-[9px] font-semibold text-slate-500">Product Design · revision {document.revision}</p>
          </div>

          <select value={document.id} onChange={(event) => void openDocument(event.target.value)} aria-label="Open Product Design document" className="h-8 max-w-48 rounded-lg border border-slate-300 bg-white px-2 text-[10px] font-semibold text-slate-700 outline-none focus:border-indigo-500">
            {documents.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name}</option>)}
          </select>
          <button type="button" onClick={() => void createDocument(`Product concept ${documents.length + 1}`, document.units)} className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] font-bold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"><Plus className="h-3.5 w-3.5" /> New</button>

          <div className="hidden h-5 w-px bg-slate-200 md:block" />
          <button type="button" onClick={undo} disabled={undoStack.length === 0} title="Undo · Ctrl/Cmd+Z" className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"><Undo2 className="h-4 w-4" /></button>
          <button type="button" onClick={redo} disabled={redoStack.length === 0} title="Redo · Ctrl/Cmd+Shift+Z" className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30"><Redo2 className="h-4 w-4" /></button>

          <div className="ml-auto flex items-center gap-1.5">
            <span className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold sm:inline-flex ${persistenceStatus === 'error' ? 'border-red-200 bg-red-50 text-red-800' : persistenceStatus === 'saving' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`} title={persistenceMessage}>
              {persistenceStatus === 'saved' ? <Check className="h-3 w-3" /> : <Save className="h-3 w-3" />}{persistenceStatus === 'error' ? 'Save error' : persistenceStatus === 'saving' ? 'Saving' : 'Local'}
            </span>
            <button type="button" onClick={() => importInputRef.current?.click()} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100" title="Import Product Design"><Import className="h-4 w-4" /></button>
            <button type="button" onClick={() => void handleExport()} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100" title="Export Product Design"><Download className="h-4 w-4" /></button>
            <button type="button" onClick={() => setRightPanelOpen((open) => !open)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500" aria-label={rightPanelOpen ? 'Hide inspector' : 'Show inspector'}>{rightPanelOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}</button>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 bg-slate-50 px-3 py-1.5">
          {toolItems.map(({ id, label, shortcut, icon: Icon }) => (
            <button key={id} type="button" onClick={() => handleTool(id)} aria-pressed={activeTool === id} title={`${label} · ${shortcut}`} className={`inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-bold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${activeTool === id ? 'bg-slate-950 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-950'}`}><Icon className="h-3.5 w-3.5" /><span className="hidden xl:inline">{label}</span></button>
          ))}
          <div className="mx-1 h-5 w-px shrink-0 bg-slate-200" />
          <button type="button" onClick={duplicateSelected} disabled={selectedObjectIds.length === 0} className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg px-2.5 text-[10px] font-bold text-slate-600 hover:bg-white disabled:opacity-30" title="Duplicate · Ctrl/Cmd+D"><SquareMousePointer className="h-3.5 w-3.5" /> Duplicate</button>
          <button type="button" onClick={groupSelected} disabled={selectedObjectIds.length < 2} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-white disabled:opacity-30" title="Group · Ctrl/Cmd+G"><Group className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={ungroupSelected} disabled={selectedObjectIds.length === 0} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-slate-600 hover:bg-white disabled:opacity-30" title="Ungroup · Ctrl/Cmd+Shift+G"><Ungroup className="h-3.5 w-3.5" /></button>
          <button type="button" onClick={deleteSelected} disabled={selectedObjectIds.length === 0} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30" title="Delete selected"><Trash2 className="h-3.5 w-3.5" /></button>
          <div className="ml-auto flex shrink-0 items-center gap-1">
            <button type="button" onClick={() => setViewport({ zoom: Math.max(0.2, zoom - 0.1) })} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-white" title="Zoom out"><ZoomOut className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={fitDocument} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-white" title="Fit document"><Focus className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => setViewport({ zoom: Math.min(3, zoom + 0.1) })} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-white" title="Zoom in"><ZoomIn className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {leftPanelOpen && (
          <aside className="flex w-64 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white max-lg:absolute max-lg:bottom-0 max-lg:left-0 max-lg:top-[96px] max-lg:z-30 max-lg:shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5">
              <div><SectionTitle>Layers & objects</SectionTitle><p className="mt-1 text-[10px] text-slate-500">Organise intent without changing identity.</p></div>
              <button type="button" onClick={() => addLayer(newLayerName.trim() || undefined)} className="grid h-8 w-8 place-items-center rounded-lg text-indigo-700 hover:bg-indigo-50" title="Add layer"><Plus className="h-4 w-4" /></button>
            </div>
            <div className="border-b border-slate-100 p-2">
              <input value={newLayerName} onChange={(event) => setNewLayerName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { addLayer(newLayerName.trim() || undefined); setNewLayerName(''); } }} placeholder="New layer name" className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-[11px] outline-none focus:border-indigo-500 focus:bg-white" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {document.layers.slice().sort((a, b) => a.order - b.order).map((layer) => {
                const objects = objectByLayer.get(layer.id) || [];
                const expanded = expandedLayers[layer.id] !== false;
                return (
                  <div key={layer.id} className={`mb-1 rounded-xl border ${activeLayerId === layer.id ? 'border-indigo-200 bg-indigo-50/50' : 'border-transparent'}`}>
                    <div className="flex items-center gap-1 p-1">
                      <button type="button" onClick={() => setExpandedLayers((current) => ({ ...current, [layer.id]: !expanded }))} className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-white">{expanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</button>
                      <button type="button" onClick={() => setActiveLayer(layer.id)} className="min-w-0 flex-1 truncate text-left text-[11px] font-bold text-slate-800">{layer.name}</button>
                      <button type="button" onClick={() => updateLayer(layer.id, { visible: !layer.visible })} className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-white" title={layer.visible ? 'Hide layer' : 'Show layer'}>{layer.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                      <button type="button" onClick={() => updateLayer(layer.id, { locked: !layer.locked })} className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-white" title={layer.locked ? 'Unlock layer' : 'Lock layer'}>{layer.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}</button>
                    </div>
                    {expanded && (
                      <div className="space-y-0.5 px-1 pb-1 pl-8">
                        {objects.map((object) => (
                          <button key={object.id} type="button" onClick={(event) => selectObject(object.id, event.shiftKey)} className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[10px] ${selectedObjectIds.includes(object.id) ? 'bg-indigo-100 text-indigo-950' : 'text-slate-600 hover:bg-white hover:text-slate-950'}`}>
                            {object.type === 'reference-image' ? <FileImage className="h-3.5 w-3.5 shrink-0" /> : object.type === 'concept-part' ? <Box className="h-3.5 w-3.5 shrink-0" /> : <Shapes className="h-3.5 w-3.5 shrink-0" />}
                            <span className="min-w-0 flex-1 truncate">{object.name}</span>
                            {object.locked && <Lock className="h-3 w-3 shrink-0 text-slate-400" />}
                          </button>
                        ))}
                        {objects.length === 0 && <p className="px-2 py-2 text-[9px] text-slate-400">Empty layer</p>}
                      </div>
                    )}
                    {document.layers.length > 1 && activeLayerId === layer.id && (
                      <button type="button" onClick={() => deleteLayer(layer.id)} className="mx-2 mb-2 text-[9px] font-semibold text-red-600 hover:text-red-800">Delete layer · objects move safely</button>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        <div className="relative min-w-0 flex-1">
          <ProductDesignCanvas />
          {missingAssetIds.length > 0 && (
            <div className="absolute right-3 top-3 max-w-xs rounded-xl border border-amber-300 bg-amber-50 p-3 text-[10px] leading-5 text-amber-900 shadow-lg">
              <strong>{missingAssetIds.length} reference asset{missingAssetIds.length === 1 ? '' : 's'} missing.</strong> The design objects remain intact. Relink local files through Reference image.
            </div>
          )}
        </div>

        {rightPanelOpen && (
          <aside className="flex w-72 shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white max-xl:absolute max-xl:bottom-0 max-xl:right-0 max-xl:top-[96px] max-xl:z-30 max-xl:shadow-xl">
            <div className="border-b border-slate-200 px-3 py-2.5"><SectionTitle>Inspector</SectionTitle><p className="mt-1 text-[10px] text-slate-500">{selectedObject ? selectedObject.type.replace('-', ' ') : selectedObjects.length > 1 ? `${selectedObjects.length} objects selected` : 'Select an object to edit it.'}</p></div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {!selectedObject && selectedObjects.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center"><MousePointer2 className="mx-auto h-6 w-6 text-slate-400" /><p className="mt-2 text-[11px] font-bold text-slate-700">Nothing selected</p><p className="mt-1 text-[10px] leading-5 text-slate-500">Draw a shape or choose an object from the layer tree. Only relevant properties appear here.</p></div>
              )}

              {selectedObjects.length > 1 && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-[10px] leading-5 text-indigo-900">Edit shared position through alignment or group these objects into one movable set.</div>
                  <SectionTitle>Align</SectionTitle>
                  <div className="grid grid-cols-3 gap-1.5">
                    <button type="button" onClick={() => alignSelected('left')} className="grid h-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Align left"><AlignStartVertical className="h-4 w-4" /></button>
                    <button type="button" onClick={() => alignSelected('center-x')} className="grid h-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Align horizontal centre"><AlignCenterVertical className="h-4 w-4" /></button>
                    <button type="button" onClick={() => alignSelected('right')} className="grid h-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Align right"><AlignEndVertical className="h-4 w-4" /></button>
                    <button type="button" onClick={() => alignSelected('top')} className="grid h-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Align top"><AlignStartHorizontal className="h-4 w-4" /></button>
                    <button type="button" onClick={() => alignSelected('center-y')} className="grid h-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Align vertical centre"><AlignCenterHorizontal className="h-4 w-4" /></button>
                    <button type="button" onClick={() => alignSelected('bottom')} className="grid h-9 place-items-center rounded-lg border border-slate-200 hover:bg-slate-50" title="Align bottom"><AlignEndHorizontal className="h-4 w-4" /></button>
                  </div>
                  <button type="button" onClick={groupSelected} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 text-[11px] font-bold text-white hover:bg-slate-800"><Group className="h-4 w-4" /> Group selection</button>
                  <button type="button" onClick={createConceptPartFromSelection} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-[11px] font-bold text-white hover:bg-indigo-500"><Box className="h-4 w-4" /> Create concept part</button>
                </div>
              )}

              {selectedObject && (
                <div className="space-y-4">
                  <div>
                    <SectionTitle>Identity</SectionTitle>
                    <label className="mt-2 block text-[9px] font-bold uppercase tracking-wide text-slate-500">Name</label>
                    <input value={selectedObject.name} onChange={(event) => updateSelected({ name: event.target.value }, 'Rename design object')} className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-2.5 text-[11px] outline-none focus:border-indigo-500" />
                    <div className="mt-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[9px]"><span className="font-mono text-slate-500">{selectedObject.id}</span><span className={`rounded-full px-2 py-0.5 font-bold uppercase ${selectedObject.authority === 'qualified' ? 'bg-emerald-100 text-emerald-800' : selectedObject.authority === 'reference' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>{selectedObject.authority}</span></div>
                  </div>

                  <div>
                    <SectionTitle>Transform</SectionTitle>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <NumberField label="X" value={selectedObject.x} onChange={(x) => updateSelected({ x }, 'Update object X')} />
                      <NumberField label="Y" value={selectedObject.y} onChange={(y) => updateSelected({ y }, 'Update object Y')} />
                      <NumberField label="Width" value={selectedObject.width} min={1} onChange={(width) => updateSelected({ width: Math.max(1, width) }, 'Update object width')} />
                      <NumberField label="Height" value={selectedObject.height} min={1} onChange={(height) => updateSelected({ height: Math.max(1, height) }, 'Update object height')} />
                      <NumberField label="Rotation" value={selectedObject.rotation} onChange={(rotation) => updateSelected({ rotation }, 'Rotate design object')} />
                      <label className="block"><span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Layer</span><select value={selectedObject.layerId} onChange={(event) => updateSelected({ layerId: event.target.value }, 'Move object to layer')} className="mt-1 h-8 w-full rounded-lg border border-slate-300 bg-white px-2 text-[10px] outline-none focus:border-indigo-500">{document.layers.map((layer) => <option key={layer.id} value={layer.id}>{layer.name}</option>)}</select></label>
                    </div>
                  </div>

                  <div>
                    <SectionTitle>Appearance</SectionTitle>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <label><span className="text-[9px] font-bold uppercase text-slate-500">Fill</span><input type="color" value={selectedObject.fill === 'transparent' ? '#ffffff' : selectedObject.fill} onChange={(event) => updateSelected({ fill: event.target.value }, 'Update fill')} className="mt-1 h-8 w-full rounded-lg border border-slate-300 bg-white p-1" /></label>
                      <label><span className="text-[9px] font-bold uppercase text-slate-500">Stroke</span><input type="color" value={selectedObject.stroke === 'transparent' ? '#ffffff' : selectedObject.stroke} onChange={(event) => updateSelected({ stroke: event.target.value }, 'Update stroke')} className="mt-1 h-8 w-full rounded-lg border border-slate-300 bg-white p-1" /></label>
                      <NumberField label="Stroke" value={selectedObject.strokeWidth} min={0} onChange={(strokeWidth) => updateSelected({ strokeWidth: Math.max(0, strokeWidth) }, 'Update stroke width')} />
                      <NumberField label="Opacity %" value={selectedObject.opacity * 100} min={0} onChange={(opacity) => updateSelected({ opacity: Math.min(1, Math.max(0, opacity / 100)) }, 'Update opacity')} />
                    </div>
                  </div>

                  {selectedObject.type === 'rectangle' && (
                    <div><SectionTitle>Rectangle</SectionTitle><div className="mt-2"><NumberField label="Corner radius" value={selectedObject.cornerRadius} min={0} onChange={(cornerRadius) => updateObjectById(selectedObject.id, { ...selectedObject, cornerRadius: Math.max(0, cornerRadius) }, 'Update corner radius')} /></div></div>
                  )}

                  {(selectedObject.type === 'text' || selectedObject.type === 'note') && (() => {
                    const textObject = selectedObject as ProductDesignText;
                    return <div><SectionTitle>Text</SectionTitle><textarea value={textObject.text} onChange={(event) => updateObjectById(textObject.id, { ...textObject, text: event.target.value }, 'Update text')} rows={4} className="mt-2 w-full rounded-lg border border-slate-300 p-2 text-[11px] outline-none focus:border-indigo-500" /><div className="mt-2 grid grid-cols-2 gap-2"><NumberField label="Font size" value={textObject.fontSize} min={6} onChange={(fontSize) => updateObjectById(textObject.id, { ...textObject, fontSize: Math.max(6, fontSize) }, 'Update font size')} /><label><span className="text-[9px] font-bold uppercase text-slate-500">Align</span><select value={textObject.textAlign} onChange={(event) => updateObjectById(textObject.id, { ...textObject, textAlign: event.target.value as ProductDesignText['textAlign'] }, 'Update text alignment')} className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-2 text-[10px]"><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></label></div></div>;
                  })()}

                  {selectedObject.type === 'dimension' && (() => {
                    const dimension = selectedObject as ProductDesignDimension;
                    return <div><SectionTitle>Dimension intent</SectionTitle><div className="mt-2 grid grid-cols-2 gap-2"><NumberField label="Value" value={dimension.value} min={0} onChange={(value) => updateObjectById(dimension.id, { ...dimension, value: Math.max(0, value) }, 'Update dimension intent')} /><label><span className="text-[9px] font-bold uppercase text-slate-500">Units</span><select value={dimension.units} onChange={(event) => updateObjectById(dimension.id, { ...dimension, units: event.target.value as ProductDesignDimension['units'] }, 'Update dimension units')} className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-2 text-[10px]"><option value="mm">mm</option><option value="cm">cm</option><option value="in">in</option></select></label></div><p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[9px] leading-4 text-amber-800">This records product intent. It is not a solved CAD constraint.</p></div>;
                  })()}

                  {selectedObject.type === 'reference-image' && (() => {
                    const reference = selectedObject as ProductDesignReferenceImage;
                    return <div><SectionTitle>Reference provenance</SectionTitle><label className="mt-2 block text-[9px] font-bold uppercase text-slate-500">Fit</label><select value={reference.fit} onChange={(event) => updateObjectById(reference.id, { ...reference, fit: event.target.value as ProductDesignReferenceImage['fit'] }, 'Update image fit')} className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-2 text-[10px]"><option value="contain">Contain</option><option value="cover">Cover</option></select><label className="mt-2 block text-[9px] font-bold uppercase text-slate-500">Attribution</label><input value={reference.attribution} onChange={(event) => updateObjectById(reference.id, { ...reference, attribution: event.target.value }, 'Update image attribution')} className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-2 text-[10px]" /><label className="mt-2 block text-[9px] font-bold uppercase text-slate-500">License</label><input value={reference.license} onChange={(event) => updateObjectById(reference.id, { ...reference, license: event.target.value }, 'Update image license')} className="mt-1 h-8 w-full rounded-lg border border-slate-300 px-2 text-[10px]" /><label className="mt-2 block text-[9px] font-bold uppercase text-slate-500">Alt text</label><textarea value={reference.altText} onChange={(event) => updateObjectById(reference.id, { ...reference, altText: event.target.value }, 'Update image alt text')} rows={2} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-[10px]" /></div>;
                  })()}

                  {selectedObject.type === 'concept-part' && (() => {
                    const concept = selectedObject as ProductDesignConceptPart;
                    return <div className="space-y-2"><SectionTitle>Concept part</SectionTitle><NumberField label="Depth intent" value={concept.depth} min={1} onChange={(depth) => updateObjectById(concept.id, { ...concept, depth: Math.max(1, depth) }, 'Update concept depth')} /><label className="block text-[9px] font-bold uppercase text-slate-500">Material</label><input value={concept.material} onChange={(event) => updateObjectById(concept.id, { ...concept, material: event.target.value }, 'Update concept material')} className="h-8 w-full rounded-lg border border-slate-300 px-2 text-[10px]" /><label className="block text-[9px] font-bold uppercase text-slate-500">Finish</label><input value={concept.finish} onChange={(event) => updateObjectById(concept.id, { ...concept, finish: event.target.value }, 'Update concept finish')} className="h-8 w-full rounded-lg border border-slate-300 px-2 text-[10px]" /><button type="button" onClick={() => set3DOpen(true)} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 text-[11px] font-bold text-white hover:bg-indigo-500"><Layers3 className="h-4 w-4" /> Inspect same part in 3D</button></div>;
                  })()}

                  <div>
                    <SectionTitle>Object state</SectionTitle>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => updateSelected({ visible: !selectedObject.visible }, 'Toggle object visibility')} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-300 text-[10px] font-bold text-slate-700 hover:bg-slate-50">{selectedObject.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}{selectedObject.visible ? 'Visible' : 'Hidden'}</button>
                      <button type="button" onClick={() => updateSelected({ locked: !selectedObject.locked }, 'Toggle object lock')} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-300 text-[10px] font-bold text-slate-700 hover:bg-slate-50">{selectedObject.locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}{selectedObject.locked ? 'Locked' : 'Editable'}</button>
                      <button type="button" onClick={bringSelectedForward} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-300 text-[10px] font-bold text-slate-700 hover:bg-slate-50"><BringToFront className="h-3.5 w-3.5" /> Forward</button>
                      <button type="button" onClick={sendSelectedBackward} className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-300 text-[10px] font-bold text-slate-700 hover:bg-slate-50"><SendToBack className="h-3.5 w-3.5" /> Backward</button>
                    </div>
                    <label className="mt-2 block text-[9px] font-bold uppercase text-slate-500">Notes</label><textarea value={selectedObject.notes} onChange={(event) => updateSelected({ notes: event.target.value }, 'Update design notes')} rows={3} className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-[10px] outline-none focus:border-indigo-500" />
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      <footer className="shrink-0 border-t border-slate-200 bg-white">
        <button type="button" onClick={() => setHistoryOpen((open) => !open)} className="flex h-8 w-full items-center justify-between px-3 text-[10px] font-bold text-slate-600 hover:bg-slate-50"><span>History & checkpoints · {undoStack.length} local commands · {checkpoints.length} checkpoints</span>{historyOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}</button>
        {historyOpen && (
          <div className="flex max-h-36 flex-col gap-2 overflow-y-auto border-t border-slate-100 bg-slate-50 p-2 md:flex-row md:items-start">
            <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto">
              {undoStack.slice(-8).reverse().map((command) => <button key={command.id} type="button" className="min-w-40 rounded-lg border border-slate-200 bg-white p-2 text-left"><span className="block truncate text-[10px] font-bold text-slate-700">{command.label}</span><span className="mt-1 block text-[8px] text-slate-400">{new Date(command.timestamp).toLocaleTimeString()}</span></button>)}
              {undoStack.length === 0 && <p className="p-2 text-[10px] text-slate-400">Actions appear here after the first edit.</p>}
            </div>
            <div className="flex shrink-0 gap-1.5">
              <input value={checkpointName} onChange={(event) => setCheckpointName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void handleCreateCheckpoint(); }} placeholder="Checkpoint name" className="h-8 w-40 rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] outline-none focus:border-indigo-500" />
              <button type="button" onClick={() => void handleCreateCheckpoint()} disabled={!checkpointName.trim()} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-950 px-2.5 text-[10px] font-bold text-white hover:bg-slate-800 disabled:opacity-40"><Save className="h-3.5 w-3.5" /> Checkpoint</button>
            </div>
            <div className="flex shrink-0 gap-1.5 overflow-x-auto">
              {checkpoints.slice(0, 4).map((checkpoint) => <div key={checkpoint.id} className="flex min-w-40 items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 p-1"><button type="button" onClick={() => restoreCheckpoint(checkpoint.id)} className="min-w-0 flex-1 px-1.5 py-1 text-left"><span className="block truncate text-[9px] font-bold text-emerald-900">{checkpoint.name}</span><span className="block text-[8px] text-emerald-700">rev {checkpoint.document.revision}</span></button><button type="button" onClick={() => void deleteCheckpoint(checkpoint.id)} className="grid h-6 w-6 place-items-center rounded-md text-emerald-700 hover:bg-emerald-100" title="Delete checkpoint"><Trash2 className="h-3 w-3" /></button></div>)}
            </div>
          </div>
        )}
        <div className="flex h-7 items-center gap-3 border-t border-slate-100 px-3 text-[9px] font-semibold text-slate-500">
          <span className="truncate">{persistenceMessage}</span><span>{document.objects.length} objects</span><span>{document.layers.length} layers</span><span>{selectedObjectIds.length} selected</span><span className="ml-auto hidden text-amber-700 sm:inline">Concept design · exact engineering continues in Mechanical</span><button type="button" onClick={() => project.setActiveView('mechanical-studio')} className="inline-flex items-center gap-1 font-bold text-indigo-700 hover:text-indigo-900">Mechanical <ArrowRight className="h-3 w-3" /></button>
        </div>
      </footer>

      <ProductDesign3DPreview />
    </section>
  );
};
