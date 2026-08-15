'use client';

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  EyeOff,
  FileCheck2,
  Link2,
  Settings2,
  ShieldAlert,
  Unlink,
} from 'lucide-react';
import { navigationDomains } from '../lib/navigationRegistry';
import { calculateReadinessScore } from '../lib/readinessScore';
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

function routeForProblem(problem: string): string {
  const text = problem.toLowerCase();
  if (text.includes('architecture')) return 'product-architecture';
  if (text.includes('mechanical') || text.includes('shell')) return 'mechanical-studio';
  if (text.includes('board') && text.includes('dimension')) return 'board-settings';
  if (text.includes('pcb') || text.includes('footprint') || text.includes('placement') || text.includes('routing')) return 'board-designer';
  if (text.includes('schematic') || text.includes('erc') || text.includes('circuit') || text.includes('gnd')) return 'schematic-editor';
  if (text.includes('power') || text.includes('battery')) return 'power-tree';
  if (text.includes('pin')) return 'pin-map';
  if (text.includes('firmware') || text.includes('driver')) return 'firmware-studio';
  if (text.includes('test') || text.includes('validation')) return 'validation-studio';
  if (text.includes('factory') || text.includes('handoff')) return 'factory-builder';
  return 'readiness';
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
  const readiness = calculateReadinessScore(store);

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

  const firstBlocker = readiness.blockers[0];
  const primaryAction = firstBlocker
    ? {
        eyebrow: 'Blocked decision',
        title: firstBlocker,
        detail: 'Resolve this evidence before advancing the project lifecycle. The numerical readiness score cannot override a blocking engineering condition.',
        consequence: 'Prototype, factory, and release decisions remain locked until this blocker is cleared.',
        viewId: routeForProblem(firstBlocker),
        label: 'Resolve blocker',
        tone: 'rose',
      }
    : readiness.canMoveToFabrication
      ? {
          eyebrow: 'Release decision available',
          title: 'Review the frozen release candidate before fabrication handoff',
          detail: 'Recorded lifecycle gates currently permit the fabrication decision. The final act is a human review of the immutable candidate and its evidence.',
          consequence: 'Approval creates a release record; it must not mutate the working design.',
          viewId: 'releases',
          label: 'Review release candidate',
          tone: 'emerald',
        }
      : readiness.canMoveToPrototype
        ? {
            eyebrow: 'Prototype decision available',
            title: 'Review validation evidence before committing to prototype preparation',
            detail: 'Planning gates are satisfied, but prototype work should start only after the current evidence has been reviewed as a coherent decision set.',
            consequence: 'Advancing begins prototype preparation; factory readiness remains a later gate.',
            viewId: 'validation-studio',
            label: 'Review validation',
            tone: 'sky',
          }
        : guidedActions[0]
          ? {
              eyebrow: 'Next engineering decision',
              title: guidedActions[0].title,
              detail: guidedActions[0].description,
              consequence: guidedActions[0].evidence,
              viewId: guidedActions[0].viewId,
              label: 'Open decision workspace',
              tone: 'indigo',
            }
          : {
              eyebrow: 'Choose the work',
              title: 'Configure the engineering domains this project actually needs',
              detail: 'The overview should guide real work rather than expose every possible module. Choose the active domains, then Hardware Studio will derive the next decision from canonical project state.',
              consequence: 'Changing workflow visibility does not delete project data.',
              viewId: 'dashboard',
              label: 'Configure workflow',
              tone: 'slate',
            };

  const dataSummary = [
    ['Requirements', snapshot.requirements],
    ['Architecture blocks', snapshot.architectureNodes],
    ['Mechanical objects', snapshot.mechanicalObjects],
    ['Components', snapshot.components],
    ['Boards', snapshot.boards],
    ['Firmware modules', snapshot.firmwareModules],
    ['Validation tests', snapshot.validationTests],
    ['Validation runs', snapshot.validationRuns],
  ] as const;

  const toneClass = primaryAction.tone === 'rose'
    ? 'border-rose-200 bg-rose-50/70'
    : primaryAction.tone === 'emerald'
      ? 'border-emerald-200 bg-emerald-50/70'
      : primaryAction.tone === 'sky'
        ? 'border-sky-200 bg-sky-50/70'
        : primaryAction.tone === 'indigo'
          ? 'border-indigo-200 bg-indigo-50/70'
          : 'border-slate-200 bg-white';

  return (
    <div className="h-full overflow-y-auto bg-slate-50 px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-indigo-700">{profile.name}</span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600">{enabledDomains.length} active domains</span>
              {hiddenDomainCount > 0 && <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-bold text-slate-500"><EyeOff className="h-3 w-3" aria-hidden="true" /> {hiddenDomainCount} hidden</span>}
            </div>
            <h1 className="mt-3 truncate text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{projectName}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description || 'A connected engineering project where every workspace should help you make and verify a decision, not merely store another record.'}</p>
          </div>
          <button type="button" onClick={openSetup} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <Settings2 className="h-4 w-4" aria-hidden="true" /> Configure workflow
          </button>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
          <main className="min-w-0 space-y-5">
            <section className={`rounded-2xl border p-5 shadow-sm sm:p-6 ${toneClass}`} aria-labelledby="project-next-decision">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-slate-600">{primaryAction.eyebrow}</p>
              <h2 id="project-next-decision" className="mt-1 max-w-3xl text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{primaryAction.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-700">{primaryAction.detail}</p>
              <div className="mt-4 max-w-3xl rounded-xl border border-white/80 bg-white/70 p-3">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">Why this matters / consequence</p>
                <p className="mt-1 text-xs leading-5 text-slate-700">{primaryAction.consequence}</p>
              </div>
              <button
                type="button"
                onClick={() => primaryAction.label === 'Configure workflow' ? openSetup() : setActiveView(primaryAction.viewId)}
                className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {primaryAction.label}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="work-queue-title">
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">Decision queue</p>
                <h2 id="work-queue-title" className="mt-1 text-lg font-bold text-slate-950">What deserves attention after the primary decision</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">One evidence-based action per visible domain. No equal-weight wall of modules.</p>
              </div>

              {guidedActions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {guidedActions.map((action, index) => {
                    const domain = domainById.get(action.domainId);
                    return (
                      <button
                        key={`${action.domainId}-${action.viewId}`}
                        type="button"
                        onClick={() => setActiveView(action.viewId)}
                        className="group flex min-h-16 w-full items-center gap-3 px-5 py-3 text-left hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600" aria-hidden="true">{index + 1}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex flex-wrap items-center gap-2">
                            <span className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">{domain?.label ?? action.domainId}</span>
                            <span className={`rounded-full border px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide ${statusStyles[action.status]}`}>{action.status}</span>
                          </span>
                          <span className="mt-1 block text-sm font-semibold leading-5 text-slate-950">{action.title}</span>
                          <span className="mt-1 block text-xs leading-5 text-slate-500">{action.evidence}</span>
                        </span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-indigo-700" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <CheckCircle2 className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" />
                  <p className="mt-2 text-sm font-bold text-slate-900">No active domain queue yet</p>
                  <p className="mt-1 text-xs text-slate-500">Choose the domains you are actually working on. Existing project data stays intact.</p>
                </div>
              )}
            </section>

            <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 [&::-webkit-details-marker]:hidden">
                <span>Supporting project inventory</span>
                <span className="text-xs font-medium text-slate-500">Counts, not decisions</span>
              </summary>
              <div className="grid gap-2 border-t border-slate-200 p-5 sm:grid-cols-2 lg:grid-cols-4">
                {dataSummary.map(([label, count]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xl font-bold tabular-nums text-slate-950">{count}</p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
                  </div>
                ))}
              </div>
            </details>
          </main>

          <aside className="h-fit space-y-4 xl:sticky xl:top-4" aria-label="Project decision evidence">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-indigo-700" aria-hidden="true" />
                  <h2 className="text-sm font-bold text-slate-950">Lifecycle evidence</h2>
                </div>
                <span className="text-xl font-bold tabular-nums text-slate-950">{readiness.overallScore}</span>
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-500">The score summarizes evidence; blockers and gates decide what the project may do next.</p>

              <div className={`mt-4 rounded-xl border p-3 ${readiness.blockers.length ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <div className="flex gap-2">
                  {readiness.blockers.length ? <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />}
                  <div>
                    <p className="text-xs font-bold text-slate-950">{readiness.blockers.length ? `${readiness.blockers.length} blocker${readiness.blockers.length === 1 ? '' : 's'} recorded` : 'No hard blocker recorded'}</p>
                    <p className="mt-1 text-[10px] leading-4 text-slate-600">{readiness.blockers[0] || 'Open readiness to review the complete lifecycle gate evidence.'}</p>
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setActiveView('readiness')} className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                Review lifecycle gates<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" aria-labelledby="connections-title">
              <div className="flex items-center gap-2">
                {connectionNotices.some((notice) => notice.tone === 'warning') ? <Unlink className="h-4 w-4 text-amber-700" aria-hidden="true" /> : <Link2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />}
                <h2 id="connections-title" className="text-sm font-bold text-slate-950">Cross-domain context</h2>
              </div>
              {connectionNotices.length > 0 ? (
                <div className="mt-3 space-y-2">
                  {connectionNotices.slice(0, 3).map((notice) => (
                    <div key={notice.id} className={`rounded-xl border p-3 ${notice.tone === 'warning' ? 'border-amber-200 bg-amber-50' : 'border-sky-200 bg-sky-50'}`}>
                      <div className="flex gap-2">
                        {notice.tone === 'warning' && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />}
                        <div>
                          <p className="text-xs font-bold text-slate-900">{notice.title}</p>
                          <p className="mt-1 text-[10px] leading-4 text-slate-600">{notice.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs leading-5 text-slate-600">Visible domains can share canonical product context. Hiding a domain changes navigation, not engineering data.</p>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
