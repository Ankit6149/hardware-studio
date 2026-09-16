'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, FileCheck2, ShieldAlert } from 'lucide-react';
import { useProjectStore } from '../store/projectStore';
import { calculateReadinessScore } from '../lib/readinessScore';

interface IssueRoute {
  viewId: string;
  label: string;
}

function routeForIssue(issue: string): IssueRoute {
  const text = issue.toLowerCase();
  if (text.includes('architecture')) return { viewId: 'product-architecture', label: 'Open architecture' };
  if (text.includes('mechanical') || text.includes('shell') || text.includes('casing')) return { viewId: 'mechanical-studio', label: 'Open mechanical' };
  if (text.includes('assembly')) return { viewId: 'assembly-stack', label: 'Open assembly' };
  if (text.includes('board') && text.includes('dimension')) return { viewId: 'board-settings', label: 'Open board settings' };
  if (text.includes('pcb drc') || text.includes('footprint') || text.includes('placement')) return { viewId: 'pcb-drc', label: 'Open board review' };
  if (text.includes('schematic') || text.includes('erc') || text.includes('circuit')) return { viewId: 'schematic-editor', label: 'Open schematic' };
  if (text.includes('gnd') || text.includes('net') || text.includes('routing')) return { viewId: 'board-designer', label: 'Open routing' };
  if (text.includes('battery') || text.includes('power')) return { viewId: 'power-tree', label: 'Open power' };
  if (text.includes('pin')) return { viewId: 'pin-map', label: 'Open pin map' };
  if (text.includes('firmware') || text.includes('driver')) return { viewId: 'firmware-studio', label: 'Open firmware' };
  if (text.includes('test') || text.includes('validation')) return { viewId: 'validation-studio', label: 'Open validation' };
  if (text.includes('factory') || text.includes('handoff') || text.includes('production')) return { viewId: 'factory-builder', label: 'Open factory preflight' };
  if (text.includes('export') || text.includes('drawing')) return { viewId: 'exports', label: 'Open draft outputs' };
  return { viewId: 'dashboard', label: 'Open project overview' };
}

export const ReadinessDashboard: React.FC = () => {
  const project = useProjectStore();
  const { setActiveView } = project;
  const report = calculateReadinessScore(project);
  const firstBlocker = report.blockers[0];
  const firstRoute = firstBlocker ? routeForIssue(firstBlocker) : null;

  const nextAction = firstBlocker && firstRoute
    ? {
        eyebrow: `${report.blockers.length} local preflight blocker${report.blockers.length === 1 ? '' : 's'}`,
        title: firstBlocker,
        detail: 'Resolve this engineering evidence before the current local preflight can advance.',
        action: firstRoute,
      }
    : report.canMoveToFabrication
      ? {
          eyebrow: 'Local helper preflight has no fabrication blocker',
          title: 'Review provisional release context and outstanding qualification',
          detail: 'The current helper checks report no blocker. This is not fabrication or release authorization: #20 immutable version/release guarantees and #21 qualified artifact checks are still required.',
          action: { viewId: 'revisions', label: 'Review snapshots & candidates' },
        }
      : report.canMoveToFactoryHandoff
        ? {
            eyebrow: 'Local prototype evidence preflight satisfied',
            title: 'Review the draft factory package',
            detail: 'Current project evidence is sufficient to prepare draft outputs for independent review. It does not authorize fabrication.',
            action: { viewId: 'factory-builder', label: 'Open factory preflight' },
          }
        : report.canMoveToPrototype
          ? {
              eyebrow: 'Local planning preflight satisfied',
              title: 'Review validation evidence before prototype preparation',
              detail: 'Planning helpers have no current blocker. Validation and physical evidence still control the engineering decision.',
              action: { viewId: 'validation-studio', label: 'Review validation' },
            }
          : {
              eyebrow: 'Verification work remains',
              title: report.warnings[0] || 'Review the next incomplete engineering gate',
              detail: 'There is no hard blocker recorded, but the current evidence set is incomplete.',
              action: routeForIssue(report.warnings[0] || ''),
            };

  const gates = [
    { label: 'Planning', passed: report.isPlanningReady, viewId: 'dashboard' },
    { label: 'Drawing preflight', passed: report.isBlueprintPackReady, viewId: 'blueprint-sheets' },
    { label: 'Mechanical evidence', passed: report.isEditorLayoutReady, viewId: 'mechanical-studio' },
    { label: 'Schematic evidence', passed: report.isSchematicDraftReady, viewId: 'schematic-editor' },
    { label: 'PCB layout evidence', passed: report.isPcbLayoutDraftReady, viewId: 'board-designer' },
    { label: 'Routing evidence', passed: report.isRoutingDraftReady, viewId: 'board-designer' },
    { label: 'Prototype preflight', passed: report.canMoveToPrototype, viewId: 'validation-studio' },
    { label: 'Factory-draft preflight', passed: report.canMoveToFactoryHandoff, viewId: 'factory-builder' },
    { label: 'Fabrication helper preflight', passed: report.canMoveToFabrication, viewId: 'revisions' },
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-50 px-4 py-4 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
          <div className="border-l-4 border-slate-950 bg-white p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">{nextAction.eyebrow}</p>
            <h1 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{nextAction.title}</h1>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-600">{nextAction.detail}</p>
            <button type="button" onClick={() => setActiveView(nextAction.action.viewId)} className="mt-3 inline-flex min-h-8 items-center gap-2 bg-slate-950 px-3 text-[10px] font-semibold text-white hover:bg-slate-800">{nextAction.action.label}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></button>
          </div>

          <div className="border border-slate-200 bg-white p-4">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Local evidence index</p>
            <div className="mt-1 flex items-baseline gap-2"><strong className="text-3xl font-semibold tabular-nums text-slate-950">{report.overallScore}</strong><span className="text-[10px] text-slate-400">/ 100</span></div>
            <p className="mt-2 text-[10px] leading-4 text-slate-500">Supporting signal only. It is not a release score, approval, fabrication authorization, or artifact qualification.</p>
          </div>
        </section>

        <section className="border border-amber-200 bg-amber-50 p-3 text-[10px] leading-5 text-amber-950">
          <strong>Release boundary:</strong> current readiness helpers are local preflight evidence. Trusted immutable versions/releases remain #20; qualified reproducible manufacturing/drawing artifacts remain #21.
        </section>

        <section className="border-y border-slate-300 bg-white">
          <div className="flex items-start gap-2 border-b border-slate-200 px-4 py-3">
            <ShieldAlert className={`mt-0.5 h-4 w-4 ${report.blockers.length ? 'text-rose-600' : 'text-emerald-600'}`} aria-hidden="true" />
            <div><h2 className="text-sm font-semibold text-slate-950">Blocking evidence</h2><p className="mt-0.5 text-[10px] text-slate-500">Evidence text is inert. Use the explicit Resolve button to change workspaces.</p></div>
          </div>
          {report.blockers.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {report.blockers.map((blocker, index) => {
                const route = routeForIssue(blocker);
                return (
                  <div key={`${blocker}-${index}`} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                    <p className="min-w-0 flex-1 text-xs font-medium leading-5 text-slate-800">{blocker}</p>
                    <button type="button" onClick={() => setActiveView(route.viewId)} className="min-h-8 shrink-0 border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100">{route.label}</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex gap-2 px-4 py-4 text-[10px] leading-5 text-slate-600"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />No blocker is reported by the current helper. This does not authorize fabrication or publication.</div>
          )}
        </section>

        <section className="border border-slate-200 bg-white p-4" aria-label="Lifecycle gate evidence">
          <div className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-slate-500" aria-hidden="true" /><h2 className="text-sm font-semibold text-slate-950">Local gate evidence</h2></div>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">Gate rows show state. Only Review changes the workspace. Passing these helper rows does not replace #20/#21 qualification.</p>
          <div className="mt-3 grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {gates.map((gate) => (
              <button key={gate.label} type="button" onClick={() => setActiveView(gate.viewId)} className="flex min-h-14 items-center justify-between gap-3 bg-white px-3 py-2 text-left hover:bg-slate-50">
                <span className="text-[10px] font-semibold text-slate-700">{gate.label}</span>
                <span className={`text-[9px] font-semibold ${gate.passed ? 'text-emerald-700' : 'text-slate-400'}`}>{gate.passed ? 'local pass' : 'open'}</span>
              </button>
            ))}
          </div>
        </section>

        {(report.warnings.length > 0 || report.suggestions.length > 0) && (
          <details className="border border-slate-200 bg-white">
            <summary className="cursor-pointer px-4 py-3 text-xs font-semibold text-slate-800">Warnings & improvement evidence ({report.warnings.length + report.suggestions.length})</summary>
            <div className="divide-y divide-slate-100 border-t border-slate-200">
              {report.warnings.map((warning, index) => <div key={`${warning}-${index}`} className="flex gap-2 px-4 py-2.5 text-[10px] leading-5 text-amber-900"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{warning}</div>)}
              {report.suggestions.map((suggestion, index) => <div key={`${suggestion}-${index}`} className="px-4 py-2.5 text-[10px] leading-5 text-slate-600">{suggestion}</div>)}
            </div>
          </details>
        )}
      </div>
    </div>
  );
};
