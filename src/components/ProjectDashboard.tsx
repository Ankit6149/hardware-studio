'use client';

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleHelp,
  EyeOff,
  Link2,
  Settings2,
  Unlink,
} from 'lucide-react';
import { navigationDomains } from '../lib/navigationRegistry';
import {
  deriveGuidedWorkflowActions,
  getHiddenDomainCount,
  getWorkflowConnectionNotices,
  getWorkflowProfile,
  type WorkflowDomainId,
  type WorkflowProjectSnapshot,
} from '../lib/workflowProfiles';
import { useProjectStore } from '../store/projectStore';
import { useWorkflowPreferencesStore } from '../store/workflowPreferencesStore';

function arrayLength(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

const domainById = new Map(
  navigationDomains
    .filter((domain) => domain.id !== 'overview')
    .map((domain) => [domain.id as WorkflowDomainId, domain]),
);

const statusStyles = {
  start: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  continue: 'border-sky-200 bg-sky-50 text-sky-800',
  review: 'border-emerald-200 bg-emerald-50 text-emerald-800',
} as const;

export const ProjectDashboard: React.FC = () => {
  const store = useProjectStore();
  const { projectName, description, setActiveView } = store;
  const project = store as unknown as Record<string, unknown>;
  const { enabledDomains, profileId, openSetup } = useWorkflowPreferencesStore();

  const profile = getWorkflowProfile(profileId);
  const hiddenDomainCount = getHiddenDomainCount(enabledDomains);

  const snapshot = useMemo<WorkflowProjectSnapshot>(() => ({
    requirements: arrayLength(project.requirements),
    architectureNodes: Math.max(arrayLength(project.architectureNodes), arrayLength(project.nodes)),
    risks: Math.max(arrayLength(project.productRisks), arrayLength(project.risks)),
    mechanicalObjects: arrayLength(project.mechanicalObjects),
    assemblyLayers: arrayLength(project.assemblyLayers),
    components: arrayLength(project.boardComponents),
    circuitBlocks: arrayLength(project.circuitBlocks),
    nets: arrayLength(project.nets),
    boards: arrayLength(project.boards),
    traces: arrayLength(project.traces),
    firmwareModules: arrayLength(project.firmwareModules),
    firmwareStates: arrayLength(project.firmwareStates),
    validationTests: arrayLength(project.validationTests),
    validationRuns: arrayLength(project.validationRuns),
    revisions: arrayLength(project.revisions),
    factoryPackageStatus: stringValue(project.factoryPackageStatus, 'Draft'),
  }), [project]);

  const guidedActions = useMemo(
    () => deriveGuidedWorkflowActions(enabledDomains, snapshot),
    [enabledDomains, snapshot],
  );
  const connectionNotices = useMemo(
    () => getWorkflowConnectionNotices(enabledDomains),
    [enabledDomains],
  );

  const dataSummary = [
    ['Requirements', snapshot.requirements],
    ['Architecture', snapshot.architectureNodes],
    ['Mechanical objects', snapshot.mechanicalObjects],
    ['Components', snapshot.components],
    ['Boards', snapshot.boards],
    ['Firmware modules', snapshot.firmwareModules],
    ['Validation tests', snapshot.validationTests],
    ['Revisions', snapshot.revisions],
  ] as const;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 text-slate-900 sm:p-5 lg:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:p-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-indigo-700">{profile.name}</span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">{enabledDomains.length} domains visible</span>
                {hiddenDomainCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                    <EyeOff className="h-3 w-3" aria-hidden="true" /> {hiddenDomainCount} hidden
                  </span>
                )}
              </div>
              <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{projectName}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description || 'Build only the parts of the product you need, while keeping shared engineering data connected when multiple domains are enabled.'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {enabledDomains.map((domainId) => {
                  const domain = domainById.get(domainId);
                  return domain ? (
                    <span key={domainId} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">{domain.label}</span>
                  ) : null;
                })}
                {enabledDomains.length === 0 && (
                  <span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-800">Overview-only workflow</span>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-indigo-700 shadow-sm"><Settings2 className="h-4 w-4" aria-hidden="true" /></span>
                <div>
                  <h2 className="text-sm font-bold text-slate-950">Your studio adapts to the work</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-600">Hiding a domain changes navigation only. Existing project data remains untouched and can be shown again at any time.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={openSetup}
                className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Configure workflow
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        <section aria-labelledby="next-actions-title">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Guided next actions</p>
            <h2 id="next-actions-title" className="mt-1 text-xl font-bold tracking-tight text-slate-950">What should happen next</h2>
            <p className="mt-1 text-sm text-slate-600">One honest action per visible domain, derived from the project data that actually exists.</p>
          </div>

          {guidedActions.length > 0 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {guidedActions.map((action) => {
                const domain = domainById.get(action.domainId);
                return (
                  <button
                    key={action.domainId}
                    type="button"
                    onClick={() => setActiveView(action.viewId)}
                    className="group rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">{domain?.label ?? action.domainId}</p>
                        <h3 className="mt-1 text-sm font-bold leading-5 text-slate-950">{action.title}</h3>
                      </div>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${statusStyles[action.status]}`}>{action.status}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-600">{action.description}</p>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-semibold text-slate-500">{action.evidence}</span>
                      <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-700" aria-hidden="true" />
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <CheckCircle2 className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-bold text-slate-900">Overview-only workspace</h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">Enable a domain to receive a guided next action. No project data has been deleted.</p>
              <button type="button" onClick={openSetup} className="mt-4 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500">Choose domains</button>
            </div>
          )}
        </section>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="project-data-title">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Current project data</p>
              <h2 id="project-data-title" className="mt-1 text-lg font-bold text-slate-950">What already exists</h2>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {dataSummary.map(([label, count]) => (
                <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-2xl font-bold tracking-tight text-slate-950">{count}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">These counts come from canonical project state. Workflow preferences are stored separately and cannot erase these records.</p>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5" aria-labelledby="connection-notices-title">
            <div className="flex items-center gap-2">
              {connectionNotices.some((notice) => notice.tone === 'warning') ? <Unlink className="h-4 w-4 text-amber-700" aria-hidden="true" /> : <Link2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />}
              <h2 id="connection-notices-title" className="text-sm font-bold text-slate-950">Connected and standalone behavior</h2>
            </div>

            {connectionNotices.length > 0 ? (
              <div className="mt-3 space-y-2">
                {connectionNotices.map((notice) => (
                  <div key={notice.id} className={`rounded-xl border p-3 ${notice.tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-sky-200 bg-sky-50 text-sky-950'}`}>
                    <div className="flex gap-2">
                      {notice.tone === 'warning' ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <CircleHelp className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
                      <div>
                        <p className="text-xs font-bold">{notice.title}</p>
                        <p className="mt-1 text-xs leading-5 opacity-80">{notice.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-950">
                <div className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <p className="text-xs leading-5">The visible domains can share project context without a special standalone limitation. Workbench-specific engineering boundaries still apply.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
