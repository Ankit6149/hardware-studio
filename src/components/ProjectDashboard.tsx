'use client';

import React from 'react';
import {
  ArrowRight,
  Binary,
  Box,
  Boxes,
  CheckCircle2,
  CircuitBoard,
  FileCheck2,
  Network,
  Package,
  TestTube2,
} from 'lucide-react';
import { useProjectStore } from '../store/projectStore';

function count(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

type ProjectSnapshot = {
  requirements: number;
  architecture: number;
  components: number;
  schematic: number;
  nets: number;
  boards: number;
  traces: number;
  mechanical: number;
  firmware: number;
  tests: number;
  revisions: number;
};

type LifecycleArea = {
  id: string;
  label: string;
  description: string;
  viewId: string;
  evidence: string;
  ready: boolean;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
};

function deriveSnapshot(project: Record<string, unknown>): ProjectSnapshot {
  const editorLayouts = project.editorLayouts as Record<string, unknown> | undefined;
  return {
    requirements: count(project.requirements),
    architecture: Math.max(count(project.architectureNodes), count(project.nodes)),
    components: count(project.boardComponents),
    schematic: count(project.schematicSymbols),
    nets: count(project.nets),
    boards: count(project.boards),
    traces: count(project.traces),
    mechanical: Math.max(count(project.mechanicalObjects), count(editorLayouts?.mechanical)),
    firmware: Math.max(count(project.firmwareModules), count(project.firmwareTasks)),
    tests: Math.max(count(project.validationTests), count(project.testing)),
    revisions: count(project.revisions),
  };
}

function deriveNextAction(snapshot: ProjectSnapshot) {
  if (snapshot.requirements === 0) {
    return { eyebrow: 'Start with intent', title: 'Write the first measurable requirement', detail: 'Define what the product must achieve before choosing parts or drawing geometry.', viewId: 'requirements', label: 'Define requirements' };
  }
  if (snapshot.architecture === 0) {
    return { eyebrow: 'Define the system', title: 'Turn requirements into a simple product architecture', detail: 'Describe the major functions, devices, and interfaces that will satisfy the requirements.', viewId: 'product-architecture', label: 'Build architecture' };
  }
  if (snapshot.components === 0) {
    return { eyebrow: 'Begin electronics', title: 'Choose the first canonical project component', detail: 'Select a real component definition once, then reuse the same identity in schematic, PCB, BOM, firmware, and validation.', viewId: 'component-library', label: 'Choose components' };
  }
  if (snapshot.schematic === 0 || snapshot.nets === 0) {
    return { eyebrow: 'Connect electronics', title: 'Describe the electrical design in the schematic', detail: 'Place the existing project components and connect explicit pins and nets before physical board layout.', viewId: 'schematic-editor', label: 'Open schematic' };
  }
  if (snapshot.boards === 0 || snapshot.traces === 0) {
    return { eyebrow: 'Make it physical', title: 'Define and lay out the PCB', detail: 'Create the real board context, place canonical footprints, route explicit nets, and review DRC in one PCB workspace.', viewId: 'board-designer', label: 'Open PCB' };
  }
  if (snapshot.mechanical === 0) {
    return { eyebrow: 'Package the product', title: 'Create the first mechanical envelope', detail: 'Define enclosure and assembly intent around the real board instead of inventing a separate product model.', viewId: 'mechanical-studio', label: 'Open mechanical' };
  }
  if (snapshot.firmware === 0) {
    return { eyebrow: 'Bring behavior to hardware', title: 'Map firmware responsibility to the product', detail: 'Define software behavior against the same canonical components, pins, and hardware context.', viewId: 'firmware-studio', label: 'Open firmware' };
  }
  if (snapshot.tests === 0) {
    return { eyebrow: 'Prove the design', title: 'Create validation work linked to real requirements', detail: 'Plan tests and evidence against the exact product state rather than marking readiness manually.', viewId: 'validation-studio', label: 'Plan validation' };
  }
  if (snapshot.revisions === 0) {
    return { eyebrow: 'Preserve the state', title: 'Capture a controlled engineering revision', detail: 'Record a meaningful project state before preparing outputs or release evidence.', viewId: 'revisions', label: 'Open revisions' };
  }
  return { eyebrow: 'Review before handoff', title: 'Inspect release readiness and unresolved evidence', detail: 'Use the release area to review blockers and supported outputs. Existing evidence—not a progress percentage—decides what can move forward.', viewId: 'readiness', label: 'Review readiness' };
}

export const ProjectDashboard: React.FC = () => {
  const store = useProjectStore();
  const { projectName, description, setActiveView } = store;
  const project = store as unknown as Record<string, unknown>;
  const snapshot = deriveSnapshot(project);
  const nextAction = deriveNextAction(snapshot);

  const areas: LifecycleArea[] = [
    {
      id: 'define',
      label: 'Define',
      description: 'Requirements and architecture',
      viewId: snapshot.requirements === 0 ? 'requirements' : 'product-architecture',
      evidence: `${snapshot.requirements} requirements · ${snapshot.architecture} architecture items`,
      ready: snapshot.requirements > 0 && snapshot.architecture > 0,
      icon: Network,
    },
    {
      id: 'electronics',
      label: 'Electronics',
      description: 'Components, schematic, PCB, BOM',
      viewId: snapshot.components === 0 ? 'component-library' : snapshot.schematic === 0 || snapshot.nets === 0 ? 'schematic-editor' : 'board-designer',
      evidence: `${snapshot.components} components · ${snapshot.nets} nets · ${snapshot.boards} boards`,
      ready: snapshot.components > 0 && snapshot.schematic > 0 && snapshot.nets > 0 && snapshot.boards > 0,
      icon: CircuitBoard,
    },
    {
      id: 'mechanical',
      label: 'Mechanical',
      description: 'Envelope and assembly intent',
      viewId: 'mechanical-studio',
      evidence: `${snapshot.mechanical} mechanical objects`,
      ready: snapshot.mechanical > 0,
      icon: Box,
    },
    {
      id: 'firmware',
      label: 'Firmware',
      description: 'Behavior, mapping, source',
      viewId: 'firmware-studio',
      evidence: `${snapshot.firmware} firmware items`,
      ready: snapshot.firmware > 0,
      icon: Binary,
    },
    {
      id: 'validation',
      label: 'Validate',
      description: 'Tests, evidence, coverage',
      viewId: 'validation-studio',
      evidence: `${snapshot.tests} validation items`,
      ready: snapshot.tests > 0,
      icon: TestTube2,
    },
    {
      id: 'release',
      label: 'Release',
      description: 'Readiness, outputs, revisions',
      viewId: 'readiness',
      evidence: `${snapshot.revisions} revisions`,
      ready: snapshot.revisions > 0,
      icon: Package,
    },
  ];

  const completedAreas = areas.filter((area) => area.ready).length;

  return (
    <div className="h-full overflow-y-auto bg-[#f7f5ef] px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="border-b border-[#d8d2c7] pb-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Project</p>
              <h1 className="mt-1 truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{projectName}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description || 'Build one connected product from intent to reviewed release evidence.'}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2 text-[10px] text-slate-500">
              <FileCheck2 className="h-4 w-4" aria-hidden="true" />
              <span>{completedAreas}/{areas.length} lifecycle areas contain evidence</span>
            </div>
          </div>
        </header>

        <section className="mt-5 border border-[#d7d1c6] bg-white" aria-labelledby="next-action-title">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="p-5 sm:p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{nextAction.eyebrow}</p>
              <h2 id="next-action-title" className="mt-2 max-w-3xl text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{nextAction.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{nextAction.detail}</p>
              <button
                type="button"
                onClick={() => setActiveView(nextAction.viewId)}
                className="mt-5 inline-flex min-h-10 items-center gap-2 bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                {nextAction.label}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="border-t border-[#e2ddd3] bg-[#f4f1ea] p-5 lg:border-l lg:border-t-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">V1 rule</p>
              <p className="mt-2 text-sm font-semibold leading-5 text-slate-900">One product. One identity. One path forward.</p>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">Supporting tools stay inside the workbench that owns the decision instead of becoming extra places to navigate.</p>
            </div>
          </div>
        </section>

        <section className="mt-5" aria-labelledby="lifecycle-title">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Lifecycle</p>
              <h2 id="lifecycle-title" className="mt-1 text-base font-semibold text-slate-950">The complete product path</h2>
            </div>
            <p className="hidden text-[10px] text-slate-400 sm:block">Open an area only when that is the work you need.</p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {areas.map((area) => {
              const Icon = area.icon;
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => setActiveView(area.viewId)}
                  className="group flex min-h-[112px] items-start gap-3 border border-[#d7d1c6] bg-white p-4 text-left transition hover:border-slate-400 hover:bg-[#fbfaf6] focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center border ${area.ready ? 'border-slate-950 bg-slate-950 text-white' : 'border-[#d7d1c6] bg-[#f4f1ea] text-slate-500'}`}>
                    {area.ready ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-slate-950">{area.label}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600" aria-hidden="true" />
                    </span>
                    <span className="mt-1 block text-[11px] leading-5 text-slate-500">{area.description}</span>
                    <span className="mt-2 block text-[9px] font-medium text-slate-400">{area.evidence}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-5 border-t border-[#d8d2c7] pt-4" aria-label="Project inventory">
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-slate-500">
            <span className="inline-flex items-center gap-1.5"><Boxes className="h-3.5 w-3.5" aria-hidden="true" /> {snapshot.components} components</span>
            <span>{snapshot.nets} nets</span>
            <span>{snapshot.traces} traces</span>
            <span>{snapshot.tests} tests</span>
            <span>{snapshot.revisions} revisions</span>
          </div>
        </section>
      </div>
    </div>
  );
};
