'use client';

import React, { useMemo } from 'react';
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  CircuitBoard,
  FileSpreadsheet,
  Link2,
  PackageSearch,
  PenTool,
  Plus,
} from 'lucide-react';
import type { BOMItem } from '../../types';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';

const statusOptions = ['Not Started', 'Sourced', 'Ordered', 'Received', 'Tested'] as const;

export const UnifiedBOMWorkbench: React.FC = () => {
  const store = useProjectStore();
  const {
    bom = [],
    boardComponents = [],
    updateProjectState,
    updateBOMItem,
    updateBoardComponent,
    setActiveView,
  } = store;
  const {
    activeComponentId,
    activeBoardId,
    setActiveComponent,
    beginHandoff,
  } = useStudioContextStore();

  const contextualComponents = useMemo(
    () => boardComponents.filter((component) => !activeBoardId || component.boardId === activeBoardId),
    [activeBoardId, boardComponents],
  );
  const selectedComponent = boardComponents.find((component) => component.id === activeComponentId)
    || contextualComponents[0];
  const selectedBomItem = selectedComponent?.bomItemId
    ? bom.find((item) => item.id === selectedComponent.bomItemId)
    : undefined;
  const orderedBom = useMemo(() => {
    if (!selectedBomItem) return bom;
    return [selectedBomItem, ...bom.filter((item) => item.id !== selectedBomItem.id)];
  }, [bom, selectedBomItem]);

  const ensureLinkedBom = () => {
    if (!selectedComponent || selectedBomItem) return;
    const id = `bom_${Date.now()}`;
    const item: BOMItem = {
      id,
      blockName: selectedComponent.componentName,
      candidateComponent: selectedComponent.value || selectedComponent.componentName,
      partNumber: '',
      stage: 'Prototype',
      quantity: 1,
      voltage: selectedComponent.electrical?.supplyVoltage || '',
      currentEstimate: selectedComponent.electrical?.currentDraw || '',
      interface: selectedComponent.electrical?.interface || '',
      packageSize: selectedComponent.footprint || '',
      dimensions: selectedComponent.packageDimensions
        ? `${selectedComponent.packageDimensions.widthMm} × ${selectedComponent.packageDimensions.heightMm} × ${selectedComponent.packageDimensions.heightZMm} mm`
        : '',
      costEstimate: '0.00',
      supplier: '',
      supplierUrl: '',
      datasheetUrl: '',
      status: 'Not Started',
      risk: '',
      alternative: '',
      notes: `Linked to ${selectedComponent.referenceDesignator} (${selectedComponent.id}).`,
    };
    updateProjectState({ bom: [...bom, item] });
    updateBoardComponent(selectedComponent.id, { bomItemId: id });
  };

  const navigate = (viewId: string) => {
    beginHandoff('bom', 'bom');
    setActiveView(viewId);
  };

  return (
    <section className="h-full overflow-y-auto bg-slate-50 p-4 text-slate-900 sm:p-5 lg:p-6" aria-labelledby="unified-bom-title">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Connected sourcing record</p>
              <h1 id="unified-bom-title" className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Bill of Materials</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">BOM records stay attached to the same component instance used in Schematic, PCB, and 3D. Selecting a component above brings its linked sourcing row to the top.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => navigate('component-library')} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"><Boxes className="h-4 w-4" /> Components</button>
              <button type="button" onClick={() => navigate('schematic-editor')} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"><PenTool className="h-4 w-4" /> Schematic</button>
              <button type="button" onClick={() => navigate('board-designer')} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800"><CircuitBoard className="h-4 w-4" /> PCB <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2"><Link2 className="h-4 w-4 text-indigo-600" /><h2 className="text-sm font-bold text-slate-950">Selected component identity</h2></div>
            {selectedComponent ? (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3"><p className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-700">{selectedComponent.referenceDesignator}</p><p className="mt-1 text-sm font-bold text-slate-950">{selectedComponent.componentName}</p><p className="mt-1 font-mono text-[10px] text-slate-600">{selectedComponent.id}</p></div>
                <dl className="grid grid-cols-2 gap-2 text-xs"><div className="rounded-lg border border-slate-200 bg-slate-50 p-2"><dt className="text-[9px] uppercase text-slate-500">Footprint</dt><dd className="mt-1 font-mono text-slate-800">{selectedComponent.footprint || 'Unresolved'}</dd></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-2"><dt className="text-[9px] uppercase text-slate-500">Pins</dt><dd className="mt-1 font-bold text-slate-800">{selectedComponent.pins?.length || 0}</dd></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-2"><dt className="text-[9px] uppercase text-slate-500">Schematic</dt><dd className="mt-1 text-slate-800">{selectedComponent.schematic?.placed ? 'Placed' : 'Unplaced'}</dd></div><div className="rounded-lg border border-slate-200 bg-slate-50 p-2"><dt className="text-[9px] uppercase text-slate-500">PCB</dt><dd className="mt-1 text-slate-800">{selectedComponent.pcb?.placed || selectedComponent.placementStatus === 'Placed' ? 'Placed' : 'Unplaced'}</dd></div></dl>
                {selectedBomItem ? <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /><p><strong>Linked BOM record:</strong> {selectedBomItem.id}. Editing the highlighted row updates this component’s sourcing record.</p></div> : <button type="button" onClick={ensureLinkedBom} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 text-sm font-semibold text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"><Plus className="h-4 w-4" /> Create linked BOM record</button>}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-dashed border-slate-300 p-4 text-center"><PackageSearch className="mx-auto h-6 w-6 text-slate-400" /><p className="mt-2 text-xs text-slate-500">No canonical component instance exists in this board context.</p><button type="button" onClick={() => setActiveView('component-library')} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">Open Component Library</button></div>
            )}

            {contextualComponents.length > 1 && <div className="mt-4"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Other board components</p><div className="mt-2 max-h-48 space-y-1 overflow-y-auto">{contextualComponents.map((component) => <button key={component.id} type="button" onClick={() => setActiveComponent(component.id)} className={`flex w-full items-center justify-between rounded-lg border px-2.5 py-2 text-left text-xs ${component.id === selectedComponent?.id ? 'border-indigo-300 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}><span className="font-bold text-slate-800">{component.referenceDesignator}</span><span className="max-w-[190px] truncate text-slate-500">{component.componentName}</span></button>)}</div></div>}
          </aside>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3"><div className="flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-slate-600" /><h2 className="text-sm font-bold text-slate-950">Project BOM records</h2></div><span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600">{bom.length} records</span></div>
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full border-collapse text-left text-xs">
                <thead className="bg-white text-[9px] font-bold uppercase tracking-wide text-slate-500"><tr className="border-b border-slate-200"><th className="px-3 py-2.5">Component</th><th className="px-3 py-2.5">Part number</th><th className="px-3 py-2.5">Package</th><th className="px-3 py-2.5">Qty</th><th className="px-3 py-2.5">Supplier</th><th className="px-3 py-2.5">Unit cost</th><th className="px-3 py-2.5">Status</th></tr></thead>
                <tbody className="divide-y divide-slate-100">{orderedBom.map((item) => {
                  const highlighted = item.id === selectedBomItem?.id;
                  return <tr key={item.id} className={highlighted ? 'bg-indigo-50' : 'hover:bg-slate-50'}><td className="px-3 py-2"><input value={item.blockName} onChange={(event) => updateBOMItem(item.id, { blockName: event.target.value })} className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 font-semibold text-slate-900 hover:border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none" /></td><td className="px-3 py-2"><input value={item.partNumber || ''} onChange={(event) => updateBOMItem(item.id, { partNumber: event.target.value })} className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 font-mono text-slate-700 hover:border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none" placeholder="Manufacturer PN" /></td><td className="px-3 py-2"><input value={item.packageSize || ''} onChange={(event) => updateBOMItem(item.id, { packageSize: event.target.value })} className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 font-mono text-slate-700 hover:border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none" placeholder="Footprint/package" /></td><td className="px-3 py-2"><input type="number" min={1} value={item.quantity} onChange={(event) => updateBOMItem(item.id, { quantity: Math.max(1, Number(event.target.value) || 1) })} className="w-16 rounded border border-slate-200 bg-white px-2 py-1 text-center" /></td><td className="px-3 py-2"><input value={item.supplier || ''} onChange={(event) => updateBOMItem(item.id, { supplier: event.target.value })} className="w-full rounded border border-transparent bg-transparent px-1.5 py-1 text-slate-700 hover:border-slate-200 focus:border-indigo-400 focus:bg-white focus:outline-none" placeholder="Supplier" /></td><td className="px-3 py-2"><input value={item.costEstimate || ''} onChange={(event) => updateBOMItem(item.id, { costEstimate: event.target.value })} className="w-24 rounded border border-slate-200 bg-white px-2 py-1 text-right font-mono" placeholder="0.00" /></td><td className="px-3 py-2"><select value={item.status} onChange={(event) => updateBOMItem(item.id, { status: event.target.value })} className="rounded border border-slate-200 bg-white px-2 py-1">{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></td></tr>;
                })}</tbody>
              </table>
              {bom.length === 0 && <div className="p-10 text-center"><FileSpreadsheet className="mx-auto h-7 w-7 text-slate-400" /><p className="mt-2 text-sm font-bold text-slate-800">No BOM records yet</p><p className="mt-1 text-xs text-slate-500">Select a project component and create its linked sourcing record. Generic architecture blocks are not silently converted into purchasable parts.</p></div>}
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};
