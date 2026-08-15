'use client';

import React, { useCallback, useState } from 'react';
import {
  ListChecks,
  PanelRight,
  Redo2,
  ShieldAlert,
  Trash2,
  Undo2,
} from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import type { ProductArchitectureNode } from '../../types';
import type { VisualFamilyId } from '../../lib/visual/representationRegistry';
import { ProductDesignSafetyBoundary } from '../product-design/ProductDesignSafetyBoundary';
import { ProductDesignDecisionBar } from '../product-design/ProductDesignDecisionBar';
import { ProductDesignStudio } from '../product-design/ProductDesignStudio';
import { ProductArchitectureCanvas } from './ProductArchitectureCanvas';
import { ProductInspector } from './ProductInspector';
import { ProductRequirementsPanel } from './ProductRequirementsPanel';
import { validateArchitectureGraph } from '../../lib/product/productGraph';
import { EditorDockButton } from '../editor/EditorDockButton';
import { ArchitectureGlyph } from '../visual/DeviceVisual';

interface ProductStudioProps {
  initialMode?: string;
}

type ArchitecturePreset = {
  name: string;
  shortLabel: string;
  category: ProductArchitectureNode['category'];
  description: string;
  familyId: VisualFamilyId;
};

const architecturePresets: readonly ArchitecturePreset[] = [
  { name: 'Main Controller', shortLabel: 'Controller', category: 'Processing', description: 'Microcontroller or compute module coordinating product behavior.', familyId: 'microcontroller' },
  { name: 'Environmental Sensor', shortLabel: 'Sensor', category: 'Input', description: 'Physical sensing function with power, measurement, and interrupt interfaces.', familyId: 'sensor' },
  { name: 'Power Regulation', shortLabel: 'Regulator', category: 'Power', description: 'Power conversion and regulated rail generation.', familyId: 'voltage-regulator' },
  { name: 'Battery Pack', shortLabel: 'Battery', category: 'Power', description: 'Stored-energy source and its physical/electrical interface.', familyId: 'battery' },
  { name: 'USB-C Interface', shortLabel: 'USB-C', category: 'Communication', description: 'External USB-C data and/or power interface.', familyId: 'usb-c' },
  { name: 'User Display', shortLabel: 'Display', category: 'Feedback', description: 'Visual output and user-feedback function.', familyId: 'display' },
  { name: 'Enclosure', shortLabel: 'Enclosure', category: 'Mechanical', description: 'Product housing, access, mounting, and environmental boundary.', familyId: 'enclosure' },
  { name: 'Control Firmware', shortLabel: 'Firmware', category: 'Firmware', description: 'Firmware responsibility coordinating hardware behavior.', familyId: 'firmware-state' },
  { name: 'Safety / Protection', shortLabel: 'Safety', category: 'Safety', description: 'Protection, interlock, or fault-containment responsibility.', familyId: 'protection-device' },
];

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

  const handleAddElement = useCallback((preset: ArchitecturePreset) => {
    const index = architectureNodes.length;
    const column = index % 3;
    const row = Math.floor(index / 3);
    store.executeProjectCommand('ADD_ARCHITECTURE_NODE', `Add ${preset.name}`, () =>
      store.addArchitectureNode({
        name: preset.name,
        category: preset.category,
        description: preset.description,
        status: 'MVP',
        x: 130 + column * 300,
        y: 110 + row * 180,
        width: 236,
        height: 118,
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
      store.executeProjectCommand('DELETE_NODE', 'Delete architecture element', () => {
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
      store.executeProjectCommand('DELETE_CONN', 'Delete architecture connection', () => store.deleteArchitectureConnection(selectedConnectionId));
      setSelectedConnectionId(null);
    }
  }, [selectedConnectionId, selectedNodeId, store]);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f3f0e8]" aria-label="Product workbenches">
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
          <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#fbfaf6]">
            <div className="flex min-h-[58px] shrink-0 items-stretch border-b border-[#cbc7bd] bg-[#f8f6f0]">
              <div className="flex w-[128px] shrink-0 flex-col justify-center border-r border-[#d8d4ca] px-3">
                <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Product</div>
                <div className="mt-0.5 text-[12px] font-semibold tracking-[-0.02em] text-slate-950">Architecture</div>
              </div>

              <div className="min-w-0 flex-1 overflow-x-auto">
                <div className="flex h-full min-w-max items-stretch">
                  <div className="flex shrink-0 items-center border-r border-[#d8d4ca] px-2">
                    <div className="mr-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">Place</div>
                    {architecturePresets.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleAddElement(preset)}
                        className="group flex h-[48px] w-[64px] flex-col items-center justify-center border-l border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-white hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400"
                        title={`${preset.name} — ${preset.description}`}
                        aria-label={`Place ${preset.name}`}
                      >
                        <ArchitectureGlyph familyId={preset.familyId} className="h-5 w-5" />
                        <span className="mt-1 max-w-[58px] truncate text-[7px] font-semibold">{preset.shortLabel}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex shrink-0 items-center gap-px border-r border-[#d8d4ca] px-2">
                    <button type="button" onClick={handleDeleteSelected} disabled={!selectedNodeId && !selectedConnectionId} className="grid h-8 w-8 place-items-center text-rose-700 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-rose-400 disabled:opacity-25" title="Delete selected" aria-label="Delete selected architecture object"><Trash2 className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => store.undoProjectCommand()} className="grid h-8 w-8 place-items-center text-slate-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400" title="Undo" aria-label="Undo architecture change"><Undo2 className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => store.redoProjectCommand()} className="grid h-8 w-8 place-items-center text-slate-600 hover:bg-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400" title="Redo" aria-label="Redo architecture change"><Redo2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1.5 px-2">
                <EditorDockButton label="Requirements" icon={ListChecks} active={showRequirementContext} count={requirements.length} onClick={() => setShowRequirementContext((value) => !value)} />
                <EditorDockButton label="Inspector" icon={PanelRight} active={showInspector} onClick={() => setShowInspector((value) => !value)} />
                <button type="button" onClick={() => setShowWarnings((visible) => !visible)} aria-expanded={showWarnings} className={`inline-flex min-h-8 items-center gap-1.5 border px-2.5 text-[10px] font-semibold focus:outline-none focus:ring-2 focus:ring-slate-400 ${warnings.length > 0 ? 'border-amber-300 bg-amber-50 text-amber-900' : 'border-slate-300 bg-white text-slate-700'}`}><ShieldAlert className="h-3.5 w-3.5" /> {warnings.length}</button>
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
                <aside className="absolute bottom-0 left-0 top-0 z-30 w-64 overflow-y-auto border-r border-slate-300 bg-[#fbfaf6] shadow-[8px_0_24px_rgba(15,23,42,0.08)]" aria-label="Requirement context">
                  <ProductRequirementsPanel mode="compact" />
                </aside>
              )}

              {showInspector && (
                <aside className="absolute bottom-0 right-0 top-0 z-30 w-72 overflow-y-auto border-l border-slate-300 bg-[#fbfaf6] shadow-[-8px_0_24px_rgba(15,23,42,0.08)]" aria-label="Architecture inspector">
                  <ProductInspector selectedNodeId={selectedNodeId} selectedConnectionId={selectedConnectionId} />
                </aside>
              )}

              {showWarnings && warnings.length > 0 && (
                <div className="absolute bottom-0 left-1/2 z-40 max-h-52 w-[min(680px,calc(100%-2rem))] -translate-x-1/2 overflow-y-auto border border-amber-300 bg-[#fbfaf6] p-3 shadow-[0_-10px_28px_rgba(15,23,42,0.12)]" role="status">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-950"><ShieldAlert className="h-4 w-4" /> Architecture findings ({warnings.length})</div>
                  <div className="space-y-1.5">{warnings.map((warning, index) => <div key={`${warning.message}-${index}`} className={`border p-2 text-[10px] leading-5 ${warning.severity === 'Error' ? 'border-red-200 bg-red-50 text-red-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}><strong>[{warning.severity}]</strong> {warning.message}</div>)}</div>
                </div>
              )}
            </div>

            <div className="flex min-h-7 shrink-0 items-center gap-3 border-t border-slate-200 bg-[#fbfaf6] px-3 text-[10px] text-slate-500">
              <span>{architectureNodes.length} elements</span><span>{architectureConnections.length} interfaces</span><span>{requirements.length} requirements</span><span className="ml-auto hidden lg:inline">Place a system role, then drag its typed ports to describe the interface.</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
