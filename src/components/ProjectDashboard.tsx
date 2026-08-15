'use client';

import React, { useMemo } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
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
      }
    : readiness.canMoveToFabrication
      ? {
          eyebrow: 'Release decision available',
          title: 'Review the frozen release candidate before fabrication handoff',
          detail: 'Recorded lifecycle gates currently permit the fabrication decision. The final act is a human review of the immutable candidate and its evidence.',
          consequence: 'Approval creates a release record; it must not mutate the working design.',
          viewId: 'releases',
          label: 'Review release candidate',
        }
      : readiness.canMoveToPrototype
        ? {
            eyebrow: 'Prototype decision available',
            title: 'Review validation evidence before committing to prototype preparation',
            detail: 'Planning gates are satisfied, but prototype work should start only after the current evidence has been reviewed as a coherent decision set.',
            consequence: 'Advancing begins prototype preparation; factory readiness remains a later gate.',
            viewId: 'validation-studio',
            label: 'Review validation',
          }
        : guidedActions[0]
          ? {
              eyebrow: 'Next engineering decision',
              title: guidedActions[0].title,
              detail: guidedActions[0].description,
              consequence: guidedActions[0].evidence,
              viewId: guidedActions[0].viewId,
              label: 'Open decision workspace',
            }
          : {
              eyebrow: 'Choose the work',
              title: 'Configure the engineering domains this project actually needs',
              detail: 'The overview should guide real work rather than expose every possible module. Choose the active domains, then Hardware Studio derives the next decision from canonical project state.',
              consequence: 'Changing workflow visibility does not delete project data.',
              viewId: 'dashboard',
              label: 'Configure workflow',
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

  return (
    <div className="h-full overflow-y-auto bg-slate-50 px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 border-b border-slate-300 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500">
              <span className="font-semibold text-slate-800">{profile.name}</span>
              <span>·</span><span>{enabledDomains.length} active domains</span>
              {hiddenDomainCount > 0 && <><span>·</span><span className="inline-flex items-center gap-1"><EyeOff className="h-3 w-3" aria-hidden="true" /> {hiddenDomainCount} hidden</span></>}
            </div>
            <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{projectName}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description || 'A connected engineering project where each workspace exists to make, execute, or verify a decision.'}</p>
          </div>
          <button type="button" onClick={openSetup} className="inline-flex min-h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
            <Settings2 className="h-4 w-4" aria-hidden="true" /> Configure workflow
          </button>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <main className="min-w-0 space-y-5">
            <section className="border-l-4 border-slate-950 bg-white px-5 py-5" aria-labelledby="project-next-decision">
              <p className="text-[10px] font-semibold text-slate-500">{primaryAction.eyebrow}</p>
              <h2 id="project-next-decision" className="mt-1 max-w-3xl text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{primaryAction.title}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{primaryAction.detail}</p>
              <div className="mt-4 max-w-3xl border-t border-slate-200 pt-3"><p className="text-[10px] font-semibold text-slate-500">Why this matters / consequence</p><p className="mt-1 text-xs leading-5 text-slate-700">{primaryAction.consequence}</p></div>
              <button type="button" onClick={() => primaryAction.label === 'Configure workflow' ? openSetup() : setActiveView(primaryAction.viewId)} className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
                {primaryAction.label}<ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </section>

            <section className="overflow-hidden border-y border-slate-300 bg-white" aria-labelledby="work-queue-title">
              <div className="border-b border-slate-200 px-4 py-3">
                <p className="text-[10px] font-semibold text-slate-500">Decision queue</p>
                <h2 id="work-queue-title" className="mt-0.5 text-base font-semibold text-slate-950">What deserves attention after the primary decision</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">Rows are information. Only the Open button changes workspaces.</p>
              </div>

              {guidedActions.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {guidedActions.map((action, index) => {
                    const domain = domainById.get(action.domainId);
                    return (
                      <div key={`${action.domainId}-${action.viewId}`} className="flex min-h-16 items-center gap-3 px-4 py-3">
                        <span className="w-5 shrink-0 text-center text-[10px] font-semibold tabular-nums text-slate-400" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-[9px] text-slate-500"><span className="font-semibold">{domain?.label ?? action.domainId}</span><span>·</span><span>{action.status}</span></div>
                          <p className="mt-0.5 text-sm font-semibold leading-5 text-slate-950">{action.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{action.evidence}</p>
                        </div>
                        <button type="button" onClick={() => setActiveView(action.viewId)} className="inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">
                          Open<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center"><CheckCircle2 className="mx-auto h-6 w-6 text-slate-400" aria-hidden="true" /><p className="mt-2 text-sm font-semibold text-slate-900">No active domain queue yet</p><p className="mt-1 text-xs text-slate-500">Choose the domains you are actually working on. Existing project data stays intact.</p></div>
              )}
            </section>

            <details className="group overflow-hidden border-y border-slate-300 bg-white">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 [&::-webkit-details-marker]:hidden"><span>Supporting project inventory</span><span className="text-xs font-normal text-slate-500">Counts, not decisions</span></summary>
              <div className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
                {dataSummary.map(([label, count]) => <div key={label} className="bg-white p-3"><p className="text-xl font-semibold tabular-nums text-slate-950">{count}</p><p className="mt-1 text-[10px] text-slate-500">{label}</p></div>)}
              </div>
            </details>
          </main>

          <aside className="h-fit space-y-4 xl:sticky xl:top-4" aria-label="Project decision evidence">
            <section className="border border-slate-300 bg-white p-4">
              <div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-slate-500" aria-hidden="true" /><h2 className="text-sm font-semibold text-slate-950">Lifecycle evidence</h2></div><span className="text-xl font-semibold tabular-nums text-slate-950">{readiness.overallScore}</span></div>
              <p className="mt-1 text-xs leading-5 text-slate-500">The score summarizes evidence; blockers and gates decide what the project may do next.</p>
              <div className="mt-4 border-t border-slate-200 pt-3"><div className="flex gap-2">{readiness.blockers.length ? <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-700" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />}<div><p className="text-xs font-semibold text-slate-950">{readiness.blockers.length ? `${readiness.blockers.length} blocker${readiness.blockers.length === 1 ? '' : 's'} recorded` : 'No hard blocker recorded'}</p><p className="mt-1 text-[10px] leading-4 text-slate-600">{readiness.blockers[0] || 'Open readiness to review the complete lifecycle gate evidence.'}</p></div></div></div>
              <button type="button" onClick={() => setActiveView('readiness')} className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">Review lifecycle gates<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></button>
            </section>

            <section className="border border-slate-300 bg-white p-4" aria-labelledby="connections-title">
              <div className="flex items-center gap-2">{connectionNotices.some((notice) => notice.tone === 'warning') ? <Unlink className="h-4 w-4 text-amber-700" aria-hidden="true" /> : <Link2 className="h-4 w-4 text-emerald-700" aria-hidden="true" />}<h2 id="connections-title" className="text-sm font-semibold text-slate-950">Cross-domain context</h2></div>
              {connectionNotices.length > 0 ? <div className="mt-3 space-y-3">{connectionNotices.slice(0, 3).map((notice) => <div key={notice.id} className="border-t border-slate-200 pt-2.5">{notice.tone === 'warning' && <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5 text-amber-700" aria-hidden="true" />}<span className="text-xs font-semibold text-slate-900">{notice.title}</span><p className="mt-1 text-[10px] leading-4 text-slate-600">{notice.description}</p></div>)}</div> : <p className="mt-3 text-xs leading-5 text-slate-600">Visible domains can share canonical product context. Hiding a domain changes navigation, not engineering data.</p>}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};