'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Binary,
  Box,
  CircuitBoard,
  FileCheck2,
  Network,
  Package,
  TestTube2,
  type LucideIcon,
} from 'lucide-react';
import { buildProjectHomeModel, type ProjectHomeArea } from '../lib/projectHome';
import { storageHealthLabel } from '../lib/reliability';
import { useProjectStore } from '../store/projectStore';
import { useStorageHealthStore } from '../store/storageHealthStore';

const areaIcons: Record<ProjectHomeArea['id'], LucideIcon> = {
  define: Network,
  electronics: CircuitBoard,
  mechanical: Box,
  firmware: Binary,
  validation: TestTube2,
  release: Package,
};

function stateTone(state: ProjectHomeArea['state']): string {
  if (state === 'Ready for review') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (state === 'Evidence present') return 'border-slate-300 bg-slate-100 text-slate-700';
  if (state === 'In progress') return 'border-amber-200 bg-amber-50 text-amber-800';
  return 'border-slate-200 bg-white text-slate-500';
}

export const ProjectDashboard: React.FC = () => {
  const project = useProjectStore();
  const setActiveView = useProjectStore((state) => state.setActiveView);
  const storageHealth = useStorageHealthStore((state) => state.health);
  const model = buildProjectHomeModel(project);
  const { nextAction, areas, attention, inventory } = model;
  const storageNeedsAttention = ['failed', 'unavailable', 'memory-fallback'].includes(storageHealth.status);

  return (
    <div className="h-full overflow-y-auto bg-[#f7f5ef] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[#d8d2c7] pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Project home</p>
          <div className="mt-1 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{project.projectName}</h1>
              <p className="mt-1 max-w-3xl text-[12px] leading-5 text-slate-500">
                {project.description || 'One connected product from measurable intent to reviewed release evidence.'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-[10px] text-slate-500">
              <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Evidence drives state; counts are inventory only.</span>
            </div>
          </div>
        </header>

        {storageNeedsAttention && (
          <section className="mt-4 flex items-start gap-3 border border-amber-300 bg-amber-50 px-4 py-3" aria-label="Project storage warning">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-amber-900">{storageHealthLabel(storageHealth)}</p>
              <p className="mt-0.5 text-[10px] leading-4 text-amber-800">{[storageHealth.message, storageHealth.guidance].filter(Boolean).join(' ')}</p>
            </div>
          </section>
        )}

        <section className="mt-4 border border-[#d7d1c6] bg-white" aria-labelledby="next-action-title">
          <div className="p-5 sm:p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{nextAction.eyebrow}</p>
            <h2 id="next-action-title" className="mt-2 max-w-4xl text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{nextAction.title}</h2>
            <p className="mt-2 max-w-3xl text-[12px] leading-5 text-slate-600">{nextAction.detail}</p>
            <button
              type="button"
              onClick={() => setActiveView(nextAction.viewId)}
              className="mt-4 inline-flex min-h-9 items-center gap-2 bg-slate-950 px-3.5 text-[11px] font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              {nextAction.label}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </section>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
          <section className="border border-[#d7d1c6] bg-white" aria-labelledby="lifecycle-title">
            <div className="border-b border-[#e0dbd1] px-4 py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Lifecycle</p>
              <h2 id="lifecycle-title" className="mt-0.5 text-sm font-semibold text-slate-950">Product state</h2>
            </div>
            <div className="divide-y divide-[#ece7de]">
              {areas.map((area) => {
                const Icon = areaIcons[area.id];
                return (
                  <button
                    key={area.id}
                    type="button"
                    onClick={() => setActiveView(area.viewId)}
                    className="group grid w-full grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left hover:bg-[#fbfaf6] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400"
                  >
                    <span className="grid h-7 w-7 place-items-center border border-[#d7d1c6] bg-[#f7f5ef] text-slate-500">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-950">{area.label}</span>
                        <span className={`border px-1.5 py-0.5 text-[8px] font-semibold ${stateTone(area.state)}`}>{area.state}</span>
                      </span>
                      <span className="mt-0.5 block text-[9px] leading-4 text-slate-500">{area.description}</span>
                      <span className="mt-0.5 block truncate text-[8px] text-slate-400">{area.evidence}</span>
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="border border-[#d7d1c6] bg-white" aria-labelledby="attention-title">
            <div className="border-b border-[#e0dbd1] px-4 py-3">
              <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Review queue</p>
              <h2 id="attention-title" className="mt-0.5 text-sm font-semibold text-slate-950">Needs attention</h2>
            </div>
            {attention.length > 0 ? (
              <div className="divide-y divide-[#ece7de]">
                {attention.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveView(item.viewId)}
                    className="group flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-[#fbfaf6] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400"
                  >
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-semibold text-slate-900">{item.label}</span>
                      <span className="mt-0.5 block text-[9px] leading-4 text-slate-500">{item.detail}</span>
                    </span>
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" aria-hidden="true" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-5">
                <p className="text-[11px] font-semibold text-slate-900">No immediate blocker surfaced here.</p>
                <p className="mt-1 text-[9px] leading-4 text-slate-500">This is not a release approval. Use Validation and Release for explicit evidence and gate review.</p>
              </div>
            )}
          </section>
        </div>

        <section className="mt-4 border-t border-[#d8d2c7] pt-3" aria-label="Project inventory">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[9px] text-slate-400">
            <span>{inventory.requirements} requirements</span>
            <span>{inventory.architecture} architecture items</span>
            <span>{inventory.components} components</span>
            <span>{inventory.nets} nets</span>
            <span>{inventory.traces} traces</span>
            <span>{inventory.mechanicalObjects} mechanical objects</span>
            <span>{inventory.firmwareModules} firmware modules</span>
            <span>{inventory.validationTests} tests</span>
            <span>{inventory.validationRuns} runs</span>
            <span>{inventory.revisions} revisions</span>
          </div>
        </section>
      </div>
    </div>
  );
};
