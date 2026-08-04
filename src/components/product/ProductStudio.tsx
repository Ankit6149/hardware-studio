'use client';

import React, { useCallback, useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  Plus,
  Redo2,
  ShieldAlert,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { ProductDesignStudio } from '../product-design/ProductDesignStudio';
import { ProductArchitectureCanvas } from './ProductArchitectureCanvas';
import { ProductInspector } from './ProductInspector';
import { ProductRequirementsPanel } from './ProductRequirementsPanel';
import { validateArchitectureGraph } from '../../lib/product/productGraph';

interface ProductStudioProps {
  initialMode?: string;
}

const productViews = [
  { id: 'product-design', label: 'Product Design', description: 'Explore form, references, dimensions, concept parts, and appearance.' },
  { id: 'requirements', label: 'Requirements', description: 'Define measurable product needs and acceptance intent.' },
  { id: 'product-architecture', label: 'Architecture', description: 'Connect functions, interfaces, and downstream engineering objects.' },
] as const;

export const ProductStudio: React.FC<ProductStudioProps> = ({ initialMode = 'product-design' }) => {
  const store = useProjectStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [showWarnings, setShowWarnings] = useState(false);

  const activeMode = initialMode === 'requirements'
    ? 'requirements'
    : initialMode === 'product-architecture' || initialMode === 'risks-interfaces'
      ? 'product-architecture'
      : 'product-design';

  const architectureNodes = store.architectureNodes || [];
  const architectureConnections = store.architectureConnections || [];
  const requirements = store.requirements || [];
  const warnings = validateArchitectureGraph(architectureNodes, architectureConnections, requirements);

  const handleAddBlock = useCallback(() => {
    store.executeProjectCommand('ADD_ARCHITECTURE_NODE', 'Add architecture block', () =>
      store.addArchitectureNode({
        name: `Block ${architectureNodes.length + 1}`,
        category: 'Processing',
        description: '',
        status: 'MVP',
        x: 150 + Math.random() * 300,
        y: 100 + Math.random() * 200,
        width: 120,
        height: 60,
        linkedRequirementIds: [],
        linkedCircuitIds: [],
        linkedComponentIds: [],
        linkedFirmwareModuleIds: [],
        linkedTestIds: [],
      })
    );
  }, [architectureNodes.length, store]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedNodeId) {
      store.executeProjectCommand('DELETE_NODE', 'Delete architecture block', () => {
        const connections = store.architectureConnections || [];
        connections
          .filter((connection) => connection.sourceNodeId === selectedNodeId || connection.targetNodeId === selectedNodeId)
          .forEach((connection) => store.deleteArchitectureConnection(connection.id));
        store.deleteArchitectureNode(selectedNodeId);
      });
      setSelectedNodeId(null);
      return;
    }
    if (selectedConnectionId) {
      store.executeProjectCommand('DELETE_CONN', 'Delete architecture connection', () =>
        store.deleteArchitectureConnection(selectedConnectionId)
      );
      setSelectedConnectionId(null);
    }
  }, [selectedConnectionId, selectedNodeId, store]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-100" aria-label="Product workbenches">
      <nav className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-1.5" aria-label="Product workbench views">
        <span className="mr-2 shrink-0 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Product</span>
        {productViews.map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => store.setActiveView(view.id)}
            aria-current={activeMode === view.id ? 'page' : undefined}
            title={view.description}
            className={`h-8 shrink-0 rounded-lg px-3 text-[10px] font-bold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${activeMode === view.id ? 'bg-slate-950 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'}`}
          >
            {view.label}
          </button>
        ))}
        <p className="ml-auto hidden truncate text-[9px] text-slate-500 xl:block">{productViews.find((view) => view.id === activeMode)?.description}</p>
      </nav>

      <div className="min-h-0 flex-1">
        {activeMode === 'product-design' && <ProductDesignStudio />}

        {activeMode === 'requirements' && (
          <div className="flex h-full min-h-0 overflow-hidden bg-slate-50">
            <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-5 py-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Product intent</p>
                  <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950">Requirements</h1>
                  <p className="mt-1 text-sm leading-6 text-slate-600">Define measurable needs here, then link them to architecture, concept parts, engineering objects, and validation evidence.</p>
                </div>
                <ProductRequirementsPanel />
              </div>
            </div>
            <aside className="hidden w-72 shrink-0 border-l border-slate-200 bg-white p-4 xl:block">
              <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /><h2 className="text-xs font-bold text-slate-900">Requirement quality</h2></div>
              <p className="mt-2 text-[10px] leading-5 text-slate-600">A useful requirement states what must be true, how it will be measured, and what evidence will verify it. Avoid hiding design solutions inside needs unless the constraint is deliberate.</p>
              <dl className="mt-4 space-y-2 text-[10px]"><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><dt className="font-bold text-slate-800">Current records</dt><dd className="mt-1 text-slate-500">{requirements.length} requirements</dd></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><dt className="font-bold text-slate-800">Next connection</dt><dd className="mt-1 text-slate-500">Link requirements to Product Design concept parts or Architecture blocks rather than copying their text.</dd></div></dl>
            </aside>
          </div>
        )}

        {activeMode === 'product-architecture' && (
          <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
            <div className="flex min-h-11 shrink-0 items-center gap-1.5 border-b border-slate-200 px-3 py-2">
              <button type="button" onClick={handleAddBlock} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-slate-950 px-3 text-[10px] font-bold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"><Plus className="h-3.5 w-3.5" /> Add block</button>
              <button type="button" onClick={handleDeleteSelected} disabled={!selectedNodeId && !selectedConnectionId} className="grid h-8 w-8 place-items-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-30" title="Delete selected"><Trash2 className="h-3.5 w-3.5" /></button>
              <div className="mx-1 h-5 w-px bg-slate-200" />
              <button type="button" onClick={() => store.undoProjectCommand()} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100" title="Undo"><Undo2 className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => store.redoProjectCommand()} className="grid h-8 w-8 place-items-center rounded-lg text-slate-600 hover:bg-slate-100" title="Redo"><Redo2 className="h-3.5 w-3.5" /></button>
              <div className="ml-auto" />
              <button type="button" onClick={() => setShowWarnings((visible) => !visible)} className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-[10px] font-bold ${warnings.length > 0 ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-emerald-200 bg-emerald-50 text-emerald-800'}`}><ShieldAlert className="h-3.5 w-3.5" /> {warnings.length} findings</button>
            </div>

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-slate-200 bg-slate-50 lg:block"><ProductRequirementsPanel /></aside>
              <div className="relative min-w-0 flex-1">
                <ProductArchitectureCanvas
                  onNodeSelect={setSelectedNodeId}
                  onConnectionSelect={setSelectedConnectionId}
                  selectedNodeId={selectedNodeId}
                />
                {showWarnings && warnings.length > 0 && (
                  <div className="absolute bottom-3 left-3 right-3 z-20 max-h-52 overflow-y-auto rounded-xl border border-amber-300 bg-white p-3 shadow-xl">
                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-amber-900"><ShieldAlert className="h-4 w-4" /> Architecture findings ({warnings.length})</div>
                    <div className="space-y-1.5">{warnings.map((warning, index) => <div key={`${warning.message}-${index}`} className={`rounded-lg border p-2 text-[10px] leading-5 ${warning.severity === 'Error' ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}><strong>[{warning.severity}]</strong> {warning.message}</div>)}</div>
                  </div>
                )}
              </div>
              <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-slate-200 bg-slate-50 xl:block"><ProductInspector selectedNodeId={selectedNodeId} selectedConnectionId={selectedConnectionId} /></aside>
            </div>

            <div className="flex h-7 shrink-0 items-center gap-3 border-t border-slate-200 bg-white px-3 text-[9px] font-semibold text-slate-500"><Boxes className="h-3.5 w-3.5" /><span>{architectureNodes.length} architecture blocks</span><span>{architectureConnections.length} connections</span><span>{requirements.length} requirements</span><span className="ml-auto">Architecture describes function and interfaces—not visual product form.</span></div>
          </div>
        )}
      </div>
    </section>
  );
};
