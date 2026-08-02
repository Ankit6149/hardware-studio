'use client';

import React, { useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import {
  ArrowRight,
  BookOpen,
  Box,
  CheckCircle2,
  CircuitBoard,
  Cpu,
  ExternalLink,
  FileCode2,
  Image,
  Layers3,
  PackageSearch,
  ShieldAlert,
  TriangleAlert,
  X,
} from 'lucide-react';
import type { NodeData } from '../../types';
import {
  getVisualFamily,
  REPRESENTATION_KINDS,
  RepresentationKind,
  representationStatusCounts,
  resolveVisualFamilyId,
} from '../../lib/visual/representationRegistry';
import { useProjectStore } from '../../store/projectStore';
import { useKnowledge } from '../knowledge/KnowledgeProvider';
import { DeviceVisual } from './DeviceVisual';
import type { VisualQualityProfile } from './Lightweight3DPreview';

interface RepresentationInspectorProps {
  nodeData: NodeData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const representationIcon: Record<RepresentationKind, React.ComponentType<{ className?: string }>> = {
  architecture: Cpu,
  schematic: FileCode2,
  pictorial: Image,
  footprint: CircuitBoard,
  package: Box,
  render3d: Layers3,
  exact3d: PackageSearch,
  photo: ExternalLink,
};

const statusClasses = {
  available: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  provisional: 'border-sky-200 bg-sky-50 text-sky-800',
  unresolved: 'border-amber-200 bg-amber-50 text-amber-900',
  unavailable: 'border-slate-200 bg-slate-100 text-slate-600',
};

const trustClasses = {
  semantic: 'bg-violet-50 text-violet-700 border-violet-200',
  educational: 'bg-blue-50 text-blue-700 border-blue-200',
  preview: 'bg-amber-50 text-amber-800 border-amber-200',
  authoritative: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

export const RepresentationInspector: React.FC<RepresentationInspectorProps> = ({ nodeData, open, onOpenChange }) => {
  const familyId = useMemo(() => resolveVisualFamilyId(nodeData ?? {}), [nodeData]);
  const family = getVisualFamily(familyId);
  const [activeKind, setActiveKind] = useState<RepresentationKind>('architecture');
  const [quality, setQuality] = useState<VisualQualityProfile>('balanced');
  const setActiveView = useProjectStore((state) => state.setActiveView);
  const { openKnowledge } = useKnowledge();
  const statusCounts = representationStatusCounts(family);
  const current = family.representations[activeKind];

  const openWorkbench = (viewId: string) => {
    setActiveView(viewId);
    onOpenChange(false);
  };

  const openGuide = () => {
    if (!family.knowledgeId) return;
    onOpenChange(false);
    openKnowledge(family.knowledgeId);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-950/45 backdrop-blur-[2px]" />
        <Dialog.Content
          aria-describedby="representation-inspector-description"
          className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-[1120px] flex-col overflow-hidden border-l border-slate-200 bg-slate-50 shadow-2xl outline-none sm:w-[94vw]"
        >
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <DeviceVisual familyId={familyId} kind="architecture" compact />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-700">Multi-representation inspector</p>
                <Dialog.Title className="mt-0.5 truncate text-lg font-bold text-slate-950">{nodeData?.name || family.label}</Dialog.Title>
                <Dialog.Description id="representation-inspector-description" className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  One project identity can expose different visuals for architecture, learning, electrical, PCB, mechanical, and 3D work. Their trust levels remain separate.
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button type="button" aria-label="Close representation inspector" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </header>

          <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside className="min-h-0 overflow-y-auto border-b border-slate-200 bg-white p-4 lg:border-b-0 lg:border-r">
              <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-900">{family.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">{family.description}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-[10px] font-bold uppercase tracking-wide">
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2 text-emerald-800"><span className="block text-lg">{statusCounts.available}</span>Available</div>
                  <div className="rounded-lg border border-sky-200 bg-sky-50 px-2 py-2 text-sky-800"><span className="block text-lg">{statusCounts.provisional}</span>Preview</div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-2 text-amber-900"><span className="block text-lg">{statusCounts.unresolved}</span>Unresolved</div>
                  <div className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-slate-600"><span className="block text-lg">{statusCounts.unavailable}</span>N/A</div>
                </div>
              </section>

              <section className="mt-4">
                <h2 className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Typed architecture ports</h2>
                <div className="mt-2 space-y-2">
                  {family.ports.map((port) => (
                    <div key={port.id} className="rounded-lg border border-slate-200 bg-white p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-900">{port.label}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-600">{port.kind} · {port.direction}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-slate-500">{port.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
                <div className="flex gap-2"><TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><p><strong>Recognition is not qualification.</strong> A recognizable visual never supplies missing pin, package, dimensional, or CAD data.</p></div>
              </section>
            </aside>

            <main className="min-h-0 overflow-y-auto p-4 sm:p-6">
              <Tabs.Root value={activeKind} onValueChange={(value) => setActiveKind(value as RepresentationKind)}>
                <Tabs.List aria-label="Representations" className="flex gap-1.5 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
                  {REPRESENTATION_KINDS.map((kind) => {
                    const entry = family.representations[kind];
                    const Icon = representationIcon[kind];
                    return (
                      <Tabs.Trigger key={kind} value={kind} className="group flex min-w-[110px] shrink-0 items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-left text-xs font-semibold text-slate-600 outline-none transition hover:bg-slate-50 data-[state=active]:border-indigo-200 data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-800 focus-visible:ring-2 focus-visible:ring-indigo-500">
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="min-w-0"><span className="block capitalize">{kind === 'render3d' ? 'Light 3D' : kind === 'exact3d' ? 'Exact 3D' : kind}</span><span className={`mt-0.5 block text-[8px] font-bold uppercase tracking-wide ${entry.status === 'available' ? 'text-emerald-700' : entry.status === 'provisional' ? 'text-sky-700' : entry.status === 'unresolved' ? 'text-amber-700' : 'text-slate-400'}`}>{entry.status}</span></span>
                      </Tabs.Trigger>
                    );
                  })}
                </Tabs.List>

                <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusClasses[current.status]}`}>{current.status}</span>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${trustClasses[current.trust]}`}>{current.trust}</span>
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-slate-950">{current.label}</h2>
                      <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">{current.description}</p>
                    </div>
                    {activeKind === 'render3d' && current.status !== 'unavailable' && (
                      <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
                        Quality
                        <select value={quality} onChange={(event) => setQuality(event.target.value as VisualQualityProfile)} className="rounded border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-indigo-500">
                          <option value="low">Low power</option><option value="balanced">Balanced</option><option value="high">High detail</option>
                        </select>
                      </label>
                    )}
                  </div>

                  <div className="mt-4">
                    <DeviceVisual familyId={familyId} kind={activeKind} quality={quality} />
                  </div>

                  <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Source</p><p className="mt-1 text-xs leading-5 text-slate-700">{current.source}</p></div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">License</p><p className="mt-1 text-xs leading-5 text-slate-700">{current.license}</p></div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Qualification</p><p className="mt-1 text-xs leading-5 text-slate-700">{current.qualification}</p></div>
                  </div>

                  {current.authoritativeFor.length > 0 && (
                    <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900"><div className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" /><p><strong>Authoritative only for:</strong> {current.authoritativeFor.join(', ')}.</p></div></div>
                  )}
                </section>
              </Tabs.Root>

              <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-slate-500" aria-hidden="true" /><h2 className="text-xs font-extrabold uppercase tracking-[0.13em] text-slate-600">Continue with the correct workbench</h2></div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {family.knowledgeId && <button type="button" onClick={openGuide} className="group rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"><span className="flex items-center justify-between text-sm font-bold text-slate-900"><span className="flex items-center gap-2"><BookOpen className="h-4 w-4 text-indigo-600" />Learn</span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" /></span><span className="mt-1 block text-xs leading-5 text-slate-500">Understand use, connections, mistakes, and validation.</span></button>}
                  <button type="button" onClick={() => openWorkbench('component-library')} className="group rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"><span className="flex items-center justify-between text-sm font-bold text-slate-900"><span className="flex items-center gap-2"><PackageSearch className="h-4 w-4 text-indigo-600" />Component</span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" /></span><span className="mt-1 block text-xs leading-5 text-slate-500">Choose a real definition, package, pins, and footprint.</span></button>
                  <button type="button" onClick={() => openWorkbench('schematic-editor')} className="group rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"><span className="flex items-center justify-between text-sm font-bold text-slate-900"><span className="flex items-center gap-2"><FileCode2 className="h-4 w-4 text-indigo-600" />Schematic</span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" /></span><span className="mt-1 block text-xs leading-5 text-slate-500">Use exact symbols and electrical connectivity.</span></button>
                  <button type="button" onClick={() => openWorkbench('board-designer')} className="group rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-indigo-200 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"><span className="flex items-center justify-between text-sm font-bold text-slate-900"><span className="flex items-center gap-2"><CircuitBoard className="h-4 w-4 text-indigo-600" />PCB</span><ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-700" /></span><span className="mt-1 block text-xs leading-5 text-slate-500">Place only the selected exact footprint revision.</span></button>
                </div>
              </section>
            </main>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
