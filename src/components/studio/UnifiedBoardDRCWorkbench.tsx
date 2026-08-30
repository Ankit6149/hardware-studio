'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircuitBoard,
  Component,
  ListTree,
  RefreshCw,
  Route,
  ShieldCheck,
} from 'lucide-react';
import { runBoardDRC } from '../../lib/boardDRC';
import { useProjectStore } from '../../store/projectStore';
import { useStudioContextStore } from '../../store/studioContextStore';
import type { ReviewResult } from '../../types';

const severityStyles: Record<ReviewResult['severity'], string> = {
  Blocker: 'border-red-300 bg-red-50 text-red-950',
  Error: 'border-red-200 bg-red-50 text-red-900',
  Warning: 'border-amber-200 bg-amber-50 text-amber-950',
  Info: 'border-sky-200 bg-sky-50 text-sky-950',
};

export const UnifiedBoardDRCWorkbench: React.FC = () => {
  const project = useProjectStore();
  const {
    boards = [],
    boardComponents = [],
    nets = [],
    traces = [],
    setActiveView,
    setActiveBoard,
  } = project;
  const {
    activeBoardId,
    setActiveBoard: setContextBoard,
    setActiveComponent,
    setActiveNet,
    beginHandoff,
  } = useStudioContextStore();
  const [results, setResults] = useState<ReviewResult[]>(() => runBoardDRC({ ...useProjectStore.getState(), activeBoardId: activeBoardId || '' }));

  const board = boards.find((candidate) => candidate.id === activeBoardId);
  const boardId = board?.id || '';
  const boardComponentIds = useMemo(
    () => new Set(boardComponents.filter((component) => component.boardId === boardId).map((component) => component.id)),
    [boardComponents, boardId],
  );
  const boardTraceIds = useMemo(
    () => new Set(traces.filter((trace) => trace.boardId === boardId).map((trace) => trace.id)),
    [boardId, traces],
  );

  const boardResults = useMemo(() => results.filter((result) => {
    if (!boardId) return false;
    if (result.linkedObjectType === 'board') return result.linkedObjectId === boardId;
    if (result.linkedObjectType === 'component') return boardComponentIds.has(result.linkedObjectId);
    if (result.linkedObjectType === 'trace') return boardTraceIds.has(result.linkedObjectId);
    if (result.linkedObjectType === 'net') {
      const linkedNet = nets.find((net) => net.id === result.linkedObjectId || net.netName === result.linkedObjectId);
      return Boolean(linkedNet);
    }
    return true;
  }), [boardComponentIds, boardId, boardTraceIds, nets, results]);

  const counts = useMemo(() => ({
    blockers: boardResults.filter((result) => result.severity === 'Blocker').length,
    errors: boardResults.filter((result) => result.severity === 'Error').length,
    warnings: boardResults.filter((result) => result.severity === 'Warning').length,
    info: boardResults.filter((result) => result.severity === 'Info').length,
  }), [boardResults]);

  const runChecks = () => {
    if (!boardId) return;
    setResults(runBoardDRC({ ...useProjectStore.getState(), activeBoardId: boardId }));
  };

  const openFinding = (result: ReviewResult) => {
    if (!boardId) return;
    beginHandoff('pcb-drc', 'pcb-drc');
    setContextBoard(boardId);
    setActiveBoard(boardId);

    if (result.linkedObjectType === 'component') {
      setActiveComponent(result.linkedObjectId);
    } else if (result.linkedObjectType === 'net') {
      const net = nets.find((candidate) => candidate.id === result.linkedObjectId || candidate.netName === result.linkedObjectId);
      setActiveNet(net?.netName || result.linkedObjectId);
    } else if (result.linkedObjectType === 'trace') {
      const trace = traces.find((candidate) => candidate.id === result.linkedObjectId && candidate.boardId === boardId);
      if (trace?.netName) setActiveNet(trace.netName);
    }

    setActiveView('board-designer');
  };

  if (!board) {
    return (
      <section className="grid h-full place-items-center overflow-y-auto bg-slate-50 p-6 text-center">
        <div className="max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <CircuitBoard className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
          <h1 className="mt-3 text-xl font-bold text-slate-950">Select a real board before running PCB checks</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">DRC needs explicit shared board context. Hardware Studio will not substitute the first board in the project or run checks against an ambiguous physical target.</p>
          <button type="button" onClick={() => setActiveView('board-settings')} className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800">Open board settings <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>
    );
  }

  return (
    <section className="h-full overflow-y-auto bg-slate-50 p-4 text-slate-900 sm:p-5 lg:p-6" aria-labelledby="unified-drc-title">
      <div className="mx-auto max-w-6xl space-y-4">
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-indigo-600" aria-hidden="true" /><p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-indigo-700">PCB checks in shared context</p></div>
              <h1 id="unified-drc-title" className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{board.name} design-rule findings</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Findings reference the same explicit board components, nets, and traces used by Schematic and PCB. Open a finding to carry its responsible object back into Board Designer.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={runChecks} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"><RefreshCw className="h-4 w-4" /> Run checks again</button>
              <button type="button" onClick={() => setActiveView('board-designer')} className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800"><CircuitBoard className="h-4 w-4" /> Open PCB <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ['Blockers', counts.blockers, 'border-red-200 bg-red-50 text-red-900'],
              ['Errors', counts.errors, 'border-red-200 bg-red-50 text-red-900'],
              ['Warnings', counts.warnings, 'border-amber-200 bg-amber-50 text-amber-900'],
              ['Information', counts.info, 'border-sky-200 bg-sky-50 text-sky-900'],
            ].map(([label, value, style]) => (
              <div key={String(label)} className={`rounded-xl border p-3 ${style}`}><p className="text-2xl font-bold">{value}</p><p className="mt-1 text-[9px] font-extrabold uppercase tracking-wide">{label}</p></div>
            ))}
          </div>
        </header>

        {boardResults.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center text-emerald-950 shadow-sm">
            <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" aria-hidden="true" />
            <h2 className="mt-3 text-lg font-bold">No current board-rule findings</h2>
            <p className="mt-1 text-sm text-emerald-800">This means the implemented DRC checks passed for the explicit current board state. It is not a substitute for manufacturer review or a qualified external CAD tool.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {boardResults.map((result) => {
              const Icon = result.linkedObjectType === 'component'
                ? Component
                : result.linkedObjectType === 'net'
                  ? ListTree
                  : result.linkedObjectType === 'trace'
                    ? Route
                    : AlertTriangle;
              return (
                <button key={result.id} type="button" onClick={() => openFinding(result)} className={`group flex w-full items-start gap-3 rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${severityStyles[result.severity]}`}>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/80"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold">{result.title}</span><span className="rounded-full border border-current/20 bg-white/50 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide">{result.severity}</span><span className="rounded-full border border-current/20 bg-white/50 px-2 py-0.5 text-[9px] font-semibold">{result.category}</span></span><span className="mt-1 block text-xs leading-5 opacity-80">{result.description}</span><span className="mt-2 block font-mono text-[9px] opacity-65">{result.linkedObjectType}: {result.linkedObjectId}</span></span>
                  <ArrowRight className="mt-2 h-4 w-4 shrink-0 opacity-50 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
