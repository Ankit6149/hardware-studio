'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  FileCheck2,
  LockKeyhole,
  ShieldAlert,
} from 'lucide-react';
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
  if (text.includes('battery') || text.includes('power')) return { viewId: 'power-tree', label: 'Open power tree' };
  if (text.includes('pin')) return { viewId: 'pin-map', label: 'Open pin map' };
  if (text.includes('firmware') || text.includes('driver')) return { viewId: 'firmware-studio', label: 'Open firmware' };
  if (text.includes('test') || text.includes('validation')) return { viewId: 'validation-studio', label: 'Open validation' };
  if (text.includes('factory') || text.includes('handoff') || text.includes('production')) return { viewId: 'factory-builder', label: 'Open factory package' };
  if (text.includes('export') || text.includes('drawing')) return { viewId: 'exports', label: 'Open outputs' };
  return { viewId: 'dashboard', label: 'Open project overview' };
}

export const ReadinessDashboard: React.FC = () => {
  const project = useProjectStore();
  const { setActiveView } = project;
  const report = calculateReadinessScore(project);

  const firstBlocker = report.blockers[0];
  const blockerRoute = firstBlocker ? routeForIssue(firstBlocker) : null;

  const currentDecision = report.canMoveToFabrication
    ? {
        eyebrow: 'Fabrication evidence satisfied',
        title: 'Review and publish the frozen release candidate',
        detail: 'Automated lifecycle gates no longer report a blocker. The remaining act is a human release decision against the frozen candidate and its evidence.',
        consequence: 'Publishing creates a release record. It must not silently change the working design.',
        action: { viewId: 'releases', label: 'Review release candidate' },
        tone: 'emerald',
      }
    : report.canMoveToFactoryHandoff
      ? {
          eyebrow: 'Prototype gate satisfied',
          title: 'Decide whether the factory package is ready for independent review',
          detail: 'Prototype evidence is sufficient, but fabrication still depends on the manufacturing package and explicit review evidence.',
          consequence: 'Moving forward opens factory review; it does not authorize fabrication by itself.',
          action: { viewId: 'factory-builder', label: 'Review factory package' },
          tone: 'sky',
        }
      : report.canMoveToPrototype
        ? {
            eyebrow: 'Planning evidence satisfied',
            title: 'Decide whether the design is ready for prototype preparation',
            detail: 'Planning gates are satisfied. Review physical, electrical, firmware, and validation evidence before spending money on a prototype.',
            consequence: 'Advancing means prototype preparation can begin; unresolved factory requirements remain separate.',
            action: { viewId: 'validation-studio', label: 'Review validation evidence' },
            tone: 'sky',
          }
        : firstBlocker && blockerRoute
          ? {
              eyebrow: `${report.blockers.length} blocking decision${report.blockers.length === 1 ? '' : 's'}`,
              title: firstBlocker,
              detail: 'This is the first unresolved condition preventing the next lifecycle decision. Resolve the responsible engineering evidence before advancing.',
              consequence: 'Until it is resolved, prototype/release readiness must remain blocked regardless of the numerical score.',
              action: blockerRoute,
              tone: 'rose',
            }
          : {
              eyebrow: 'Verification work remains',
              title: report.warnings[0] || 'Review the next incomplete engineering gate',
              detail: 'There is no hard blocker recorded, but evidence is still incomplete. Close the highest-value verification gap rather than adding more project records.',
              consequence: 'The lifecycle stays at its current gate until the missing evidence is recorded.',
              action: routeForIssue(report.warnings[0] || ''),
              tone: 'amber',
            };

  const gates = [
    { label: 'Planning', passed: report.isPlanningReady, viewId: 'dashboard' },
    { label: 'Blueprint', passed: report.isBlueprintPackReady, viewId: 'blueprint-sheets' },
    { label: 'Editor geometry', passed: report.isEditorLayoutReady, viewId: 'mechanical-studio' },
    { label: 'Schematic', passed: report.isSchematicDraftReady, viewId: 'schematic-editor' },
    { label: 'PCB layout', passed: report.isPcbLayoutDraftReady, viewId: 'board-designer' },
    { label: 'Routing', passed: report.isRoutingDraftReady, viewId: 'board-designer' },
    { label: 'Prototype', passed: report.canMoveToPrototype, viewId: 'validation-studio' },
    { label: 'Factory handoff', passed: report.canMoveToFactoryHandoff, viewId: 'factory-builder' },
    { label: 'Fabrication', passed: report.canMoveToFabrication, viewId: 'releases' },
  ];

  const categories = [
    ['Product architecture', report.categories.architecture],
    ['Mechanical', report.categories.mechanical],
    ['Assembly', report.categories.assembly],
    ['Board preparation', report.categories.boardPrep],
    ['Component placement', report.categories.components],
    ['Schematic / electronics', report.categories.electronics],
    ['Nets / routing', report.categories.nets],
    ['Pin map', report.categories.pinMap],
    ['Power', report.categories.power],
    ['Firmware', report.categories.firmware],
    ['Validation', report.categories.testing],
    ['Manufacturing', report.categories.manufacturing],
    ['Native exports', report.categories.nativeExports],
    ['Factory files', report.categories.factoryFiles],
    ['Safety', report.categories.safety],
  ] as const;

  return (
    <div className="h-full overflow-y-auto bg-slate-50 px-4 py-5 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-3 border-b border-slate-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold text-slate-500">Lifecycle decision review</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">What can this project safely do next?</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Scores are supporting evidence only. Explicit gates, blockers, and recorded engineering evidence control lifecycle decisions.</p>
          </div>
          <div className="flex items-baseline gap-2 border-l border-slate-300 pl-3" aria-label={`Readiness score ${report.overallScore} out of 100`}><span className="text-2xl font-semibold tabular-nums text-slate-950">{report.overallScore}</span><span className="text-[10px] text-slate-500">evidence index / 100</span></div>
        </header>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <main className="min-w-0 space-y-5">
            <section className="border-l-4 border-slate-950 bg-white px-5 py-5" aria-labelledby="current-decision-title">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-slate-100">{currentDecision.tone === 'rose' ? <LockKeyhole className="h-4 w-4 text-rose-700" aria-hidden="true" /> : currentDecision.tone === 'emerald' ? <CheckCircle2 className="h-4 w-4 text-emerald-700" aria-hidden="true" /> : <CircleDot className="h-4 w-4 text-slate-700" aria-hidden="true" />}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-slate-500">{currentDecision.eyebrow}</p>
                  <h2 id="current-decision-title" className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{currentDecision.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{currentDecision.detail}</p>
                  <div className="mt-4 border-t border-slate-200 pt-3"><p className="text-[10px] font-semibold text-slate-500">Consequence</p><p className="mt-1 text-xs leading-5 text-slate-700">{currentDecision.consequence}</p></div>
                  <button type="button" onClick={() => setActiveView(currentDecision.action.viewId)} className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">{currentDecision.action.label}<ArrowRight className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              </div>
            </section>

            <section aria-labelledby="blocking-evidence-title" className="overflow-hidden border-y border-slate-300 bg-white">
              <div className="border-b border-slate-200 px-4 py-3"><div className="flex items-center gap-2"><ShieldAlert className={`h-4 w-4 ${report.blockers.length ? 'text-rose-600' : 'text-emerald-600'}`} aria-hidden="true" /><h2 id="blocking-evidence-title" className="text-sm font-semibold text-slate-950">Blocking evidence</h2></div><p className="mt-1 text-xs leading-5 text-slate-500">Evidence text is inert. Use the explicit Resolve button to change workspaces.</p></div>
              {report.blockers.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {report.blockers.map((blocker, index) => {
                    const route = routeForIssue(blocker);
                    return <div key={`${blocker}-${index}`} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><p className="text-sm font-semibold leading-5 text-slate-900">{blocker}</p><p className="mt-1 text-xs leading-5 text-slate-500">Must be resolved before the next lifecycle gate can pass.</p></div><button type="button" onClick={() => setActiveView(route.viewId)} className="inline-flex min-h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400">{route.label}</button></div>;
                  })}
                </div>
              ) : <div className="flex items-start gap-3 px-4 py-4 text-emerald-900"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden="true" /><div><p className="text-sm font-semibold">No hard blockers are currently recorded.</p><p className="mt-1 text-xs leading-5 text-slate-600">This does not automatically authorize fabrication; gate evidence still controls what may happen next.</p></div></div>}
            </section>

            {(report.warnings.length > 0 || report.suggestions.length > 0) && (
              <details className="group overflow-hidden border-y border-slate-300 bg-white">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 [&::-webkit-details-marker]:hidden"><span className="inline-flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden="true" /> Review warnings and improvement evidence</span><span className="text-xs font-normal text-slate-500">{report.warnings.length + report.suggestions.length} items</span></summary>
                <div className="divide-y divide-slate-100 border-t border-slate-200">
                  {report.warnings.map((warning, index) => {
                    const route = routeForIssue(warning);
                    return <div key={`${warning}-${index}`} className="flex items-center gap-3 px-4 py-3"><p className="min-w-0 flex-1 text-xs leading-5 text-amber-950">{warning}</p><button type="button" onClick={() => setActiveView(route.viewId)} className="min-h-8 shrink-0 rounded-md border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-100">Open</button></div>;
                  })}
                  {report.suggestions.map((suggestion, index) => <div key={`${suggestion}-${index}`} className="px-4 py-3 text-xs leading-5 text-slate-600">{suggestion}</div>)}
                </div>
              </details>
            )}

            <details className="group overflow-hidden border-y border-slate-300 bg-white">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 [&::-webkit-details-marker]:hidden"><span>Supporting category scores</span><span className="text-xs font-normal text-slate-500">Secondary evidence</span></summary>
              <div className="grid gap-x-6 gap-y-4 border-t border-slate-200 p-4 md:grid-cols-2">
                {categories.map(([label, value]) => <div key={label}><div className="flex items-center justify-between gap-3 text-xs"><span className="font-medium text-slate-700">{label}</span><span className="tabular-nums text-slate-500">{value}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${label} evidence score`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className="h-full rounded-full bg-slate-700" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div></div>)}
              </div>
            </details>
          </main>

          <aside className="h-fit border border-slate-300 bg-white p-4 xl:sticky xl:top-4" aria-label="Lifecycle gate evidence">
            <div className="flex items-center gap-2"><FileCheck2 className="h-4 w-4 text-slate-500" aria-hidden="true" /><h2 className="text-sm font-semibold text-slate-950">Gate evidence</h2></div>
            <p className="mt-1 text-xs leading-5 text-slate-500">Gate rows show state. Only Review changes the workspace.</p>
            <div className="mt-4 divide-y divide-slate-100">
              {gates.map((gate, index) => (
                <div key={gate.label} className="flex min-h-11 items-center gap-2 py-2">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] font-semibold ${gate.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`} aria-hidden="true">{gate.passed ? '✓' : index + 1}</span>
                  <div className="min-w-0 flex-1"><p className="text-xs font-semibold text-slate-800">{gate.label}</p><p className={`text-[9px] ${gate.passed ? 'text-emerald-700' : 'text-slate-400'}`}>{gate.passed ? 'passed' : 'locked / incomplete'}</p></div>
                  <button type="button" onClick={() => setActiveView(gate.viewId)} className="min-h-7 shrink-0 rounded-md border border-slate-300 bg-white px-2 text-[9px] font-semibold text-slate-600 hover:bg-slate-100">Review</button>
                </div>
              ))}
            </div>
            {report.isDirectFabReviewRequired && <div className="mt-4 border-t border-amber-200 pt-3"><p className="text-[10px] font-semibold text-amber-800">Independent review required</p><p className="mt-1 text-xs leading-5 text-amber-950">A manufacturing package exists, but fabrication evidence is not fully verified. Review it instead of treating file existence as approval.</p><button type="button" onClick={() => setActiveView('factory-builder')} className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-md bg-amber-900 px-3 text-xs font-semibold text-white hover:bg-amber-800">Open factory review<ArrowRight className="h-3.5 w-3.5" /></button></div>}
          </aside>
        </div>
      </div>
    </div>
  );
};