'use client';

import React, { useCallback, useState } from 'react';
import {
  Boxes,
  ListChecks,
  PanelRight,
  Plus,
  Redo2,
  ShieldAlert,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { ProductDesignSafetyBoundary } from '../product-design/ProductDesignSafetyBoundary';
import { ProductDesignDecisionBar } from '../product-design/ProductDesignDecisionBar';
import { ProductDesignStudio } from '../product-design/ProductDesignStudio';
import { ProductArchitectureCanvas } from './ProductArchitectureCanvas';
import { ProductInspector } from './ProductInspector';
import { ProductRequirementsPanel } from './ProductRequirementsPanel';
import { validateArchitectureGraph } from '../../lib/product/productGraph';
import { EditorDockButton } from '../editor/EditorDockButton';

interface ProductStudioProps {
  initialMode?: string;
}

export const ProductStudio: React.FC<ProductStudioProps> = ({ initialMode = 'product-design' }) => {
  const store = useProjectStore();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [showWarnings, setShowWarnings] = useState(false);
  const [showRequirementContext, setShowRequirementContext] = useState(false);
  const [showInspector, setShowInspector] = useState(false);

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
      <div className="min-h-0 flex-1">
        {activeMode === 'product-design' && (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <ProductDesignSafetyBoundary />
            <ProductDesignDecisionBar />
            <div className="min-h-0 flex-1"><ProductDesignStudio /></div>
          </div>
        )}

        {activeMode === 'requirements' && <ProductRequirementsPanel mode="full" />}

        {activeMode === 'product-architecture' && (
          <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
            <div className="flex min-h-11 shrink-0 items-center gap-1.5 border-b border-slate-300 bg-white px-3 py-1.5">
              <button type="button" onClick={handleAddBlock} className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-[11px] font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500"><Plus className="h-3.5 w-3.5" /> Add block</button>
              <button type="button" onClick={handleDeleteSelected} disabled={!selectedNodeId && !selectedConnectionId} className="grid h-8 w-8 place-items-center rounded-md text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-30" title="Delete selected" aria-label="Delete selected architecture object"><Trash2 className="h-3.5 w-3.5" /></button>
              <div className="mx-1 h-5 w-px bg-slate-200" />
              <button type="button" onClick={() => store.undoProjectCommand()} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400" title="Undo" aria-label="Undo architecture change"><Undo2 className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => store.redoProjectCommand()} className="grid h-8 w-8 place-items-center rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400" title="Redo" aria-label="Redo architecture change"><Redo2 className="h-3.5 w-3.5" /></button>

              <div className="ml-auto flex items-center gap-1.5">
                <EditorDockButton label="Requirements" icon={ListChecks} active={showRequirementContext} count={requirements.length} onClick={() => setShowRequirementContext((value) => !value)} />
                <EditorDockButton label="Inspector" icon={PanelRight} active={showInspector} onClick={() => setShowInspector((value) => !value)} />
                <button type="button" onClick={() => setShowWarnings((visible) => !visible)} aria-expanded={showWarnings} className={`inline-flex min-h-8 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 ${warnings.length > 0 ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-slate-300 bg-white text-slate-700'}`}><ShieldAlert className="h-3.5 w-3.5" /> {warnings.length} findings</button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-hidden">
              <ProductArchitectureCanvas
                onNodeSelect={(id) => {
                  setSelectedNodeId(id);
                  setSelectedConnectionId(null);
                }}
                onConnectionSelect={(id) => {
                  setSelectedConnectionId(id);
                  setSelectedNodeId(null);
                }}
                selectedNodeId={selectedNodeId}
              />

              {showRequirementContext && (
                <aside className="absolute bottom-3 left-3 top-3 z-30 w-64 overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-lg" aria-label="Requirement context">
                  <ProductRequirementsPanel mode="compact" />
                </aside>
              )}

              {showInspector && (
                <aside className="absolute bottom-3 right-3 top-3 z-30 w-72 overflow-y-auto rounded-lg border border-slate-300 bg-white shadow-lg" aria-label="Architecture inspector">
                  <ProductInspector selectedNodeId={selectedNodeId} selectedConnectionId={selectedConnectionId} />
                </aside>
              )}

              {showWarnings && warnings.length > 0 && (
                <div className="absolute bottom-3 left-1/2 z-40 max-h-52 w-[min(680px,calc(100%-2rem))] -translate-x-1/2 overflow-y-auto rounded-lg border border-amber-300 bg-white p-3 shadow-xl" role="status">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-950"><ShieldAlert className="h-4 w-4" /> Architecture findings ({warnings.length})</div>
                  <div className="space-y-1.5">{warnings.map((warning, index) => <div key={`${warning.message}-${index}`} className={`rounded-md border p-2 text-[10px] leading-5 ${warning.severity === 'Error' ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}><strong>[{warning.severity}]</strong> {warning.message}</div>)}</div>
                </div>
              )}
            </div>

            <div className="flex min-h-7 shrink-0 items-center gap-3 border-t border-slate-200 bg-white px-3 text-[10px] text-slate-500"><Boxes className="h-3.5 w-3.5" /><span>{architectureNodes.length} blocks</span><span>{architectureConnections.length} connections</span><span>{requirements.length} requirements</span><span className="ml-auto hidden lg:inline">Selection edits the current diagram. Navigation stays in the contextual sidebar.</span></div>
          </div>
        )}
      </div>
    </section>
  );
};