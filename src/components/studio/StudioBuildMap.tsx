'use client';

import React, { useMemo } from 'react';
import {
  Boxes,
  CircuitBoard,
  Code2,
  Cpu,
  FileCheck2,
  Layers3,
  PackageCheck,
  PenTool,
  Shapes,
  TestTube2,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { getDomainIdForView, type WorkflowDomainId } from '../../lib/workflowProfiles';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import { useWorkflowPreferencesStore } from '../../store/workflowPreferencesStore';

export interface BuildStage {
  id: WorkflowDomainId;
  label: string;
  viewId: string;
  icon: LucideIcon;
}

export const BUILD_STAGES: readonly BuildStage[] = [
  { id: 'product', label: 'Product', viewId: 'requirements', icon: Shapes },
  { id: 'mechanical', label: 'Mechanical', viewId: 'mechanical-studio', icon: Wrench },
  { id: 'electronics', label: 'Electronics', viewId: 'component-library', icon: Cpu },
  { id: 'pcb', label: 'PCB', viewId: 'board-designer', icon: CircuitBoard },
  { id: 'firmware', label: 'Firmware', viewId: 'firmware-studio', icon: Code2 },
  { id: 'validation', label: 'Validation', viewId: 'validation-studio', icon: TestTube2 },
  { id: 'outputs', label: 'Outputs', viewId: 'exports', icon: PackageCheck },
];

export const ELECTRONICS_FLOW = [
  { id: 'component-library', label: 'Components', icon: Boxes },
  { id: 'schematic-editor', label: 'Schematic', icon: PenTool },
  { id: 'board-settings', label: 'Board setup', icon: CircuitBoard },
  { id: 'board-designer', label: 'PCB layout', icon: CircuitBoard },
  { id: 'mechanical-studio', label: 'Assembly / 3D', icon: Layers3 },
  { id: 'pcb-drc', label: 'Checks', icon: FileCheck2 },
] as const;

function countOf(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

export const StudioBuildMap: React.FC = () => {
  const store = useProjectStore();
  const project = store as unknown as Record<string, unknown>;
  const { activeView, setActiveView } = store;
  const requestMechanicalMode = useStudioContextStore((state) => state.requestMechanicalMode);
  const enabledDomains = useWorkflowPreferencesStore((state) => state.enabledDomains);
  const activeDomain = getDomainIdForView(activeView);

  const counts = useMemo(() => ({
    product: Math.max(countOf(project.requirements), countOf(project.architectureNodes)),
    mechanical: countOf(project.mechanicalObjects),
    electronics: countOf(project.boardComponents),
    pcb: countOf(project.boards),
    firmware: countOf(project.firmwareModules),
    validation: countOf(project.validationTests),
    outputs: countOf(project.revisions),
  }), [project]);

  const electronicsCounts = useMemo(() => ({
    'component-library': countOf(project.boardComponents),
    'schematic-editor': countOf(project.schematicWires),
    'board-settings': countOf(project.boards),
    'board-designer': countOf(project.traces),
    'mechanical-studio': countOf(project.mechanicalObjects) + countOf(project.mechanicalBodies),
    'pcb-drc': countOf(project.reviewResults),
  }), [project]);

  const showElectronicsFlow = activeDomain === 'electronics'
    || activeDomain === 'pcb'
    || activeDomain === 'mechanical'
    || ['component-library', 'schematic-editor', 'board-settings', 'board-designer', 'pcb-drc'].includes(activeView);

  const openView = (viewId: string) => {
    requestMechanicalMode(viewId === 'mechanical-studio' ? 'webgl-3d' : null);
    setActiveView(viewId);
  };

  return (
    <div className="shrink-0 border-b border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-1 overflow-x-auto px-3 py-2" aria-label="Complete product build map">
        {BUILD_STAGES.map((stage) => {
          const Icon = stage.icon;
          const active = activeDomain === stage.id;
          const focused = enabledDomains.includes(stage.id);
          return (
            <button
              key={stage.id}
              type="button"
              onClick={() => {
                requestMechanicalMode(stage.id === 'mechanical' ? 'canvas' : null);
                setActiveView(stage.viewId);
              }}
              aria-current={active ? 'step' : undefined}
              className={`group flex min-w-[104px] shrink-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                active
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : focused
                    ? 'border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50'
                    : 'border-dashed border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white'
              }`}
              title={focused ? `${stage.label} is in the active workflow` : `${stage.label} is outside the focused workflow but remains available`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-emerald-300' : focused ? 'text-indigo-600' : 'text-slate-400'}`} aria-hidden="true" />
              <span className="min-w-0">
                <span className="block truncate text-[10px] font-bold uppercase tracking-wide">{stage.label}</span>
                <span className={`mt-0.5 block text-[9px] ${active ? 'text-slate-300' : 'text-slate-500'}`}>{counts[stage.id]} records</span>
              </span>
            </button>
          );
        })}
      </div>

      {showElectronicsFlow && (
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 bg-slate-50 px-3 py-1.5" aria-label="Electronics to PCB connected workflow">
          <span className="mr-1 shrink-0 text-[9px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Connected path</span>
          {ELECTRONICS_FLOW.map((step, index) => {
            const Icon = step.icon;
            const active = activeView === step.id;
            return (
              <React.Fragment key={step.id}>
                {index > 0 && <span className="shrink-0 text-slate-300" aria-hidden="true">→</span>}
                <button
                  type="button"
                  onClick={() => openView(step.id)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[10px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${active ? 'bg-indigo-100 text-indigo-900' : 'text-slate-600 hover:bg-white hover:text-slate-950'}`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {step.label}
                  <span className="rounded bg-white/80 px-1.5 py-0.5 font-mono text-[8px] text-slate-500">{electronicsCounts[step.id]}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
