'use client';

import React from 'react';
import { AlertTriangle, Download, FileArchive, ShieldCheck } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
import { exportProjectJson } from '../../lib/exportJson';
import { exportProjectMarkdown } from '../../lib/exportMarkdown';
import {
  exportBomCsv,
  generateNativeCplDraftCsv,
  generateNativeExcellonDrills,
  generateNativeGerberBoardOutline,
  generateNativeGerberCopperBottom,
  generateNativeGerberCopperTop,
  generateReleasePackageManifest,
} from '../../lib/nativeExports';
import { evaluateManufacturingContext } from '../../lib/manufacturing/manufacturingContext';
import { useFeedback } from '../feedback/FeedbackProvider';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The draft output could not be generated from the current project state.';
}

export const ReleaseOutputsSurface: React.FC = () => {
  const project = useProjectStore();
  const { notify } = useFeedback();
  const manufacturing = evaluateManufacturingContext(project);

  const downloadText = (filename: string, content: string, mimeType = 'text/plain') => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const safeDraftDownload = (label: string, filename: string, generate: () => string, mimeType = 'text/plain') => {
    try {
      downloadText(filename, generate(), mimeType);
    } catch (error) {
      notify({ tone: 'error', title: `${label} draft blocked`, detail: errorMessage(error) });
    }
  };

  const boardDrafts = [
    { label: 'Top copper draft', filename: 'top_copper.gbr', generate: () => generateNativeGerberCopperTop(project) },
    { label: 'Bottom copper draft', filename: 'bottom_copper.gbr', generate: () => generateNativeGerberCopperBottom(project) },
    { label: 'Board outline draft', filename: 'board_outline.gbr', generate: () => generateNativeGerberBoardOutline(project) },
    { label: 'NC drill draft', filename: 'drills.drl', generate: () => generateNativeExcellonDrills(project) },
    { label: 'Pick & place draft', filename: 'cpl.csv', mime: 'text/csv', generate: () => generateNativeCplDraftCsv(project) },
    { label: 'BOM draft', filename: 'bom.csv', mime: 'text/csv', generate: () => exportBomCsv(project) },
  ];

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="flex flex-col gap-3 border border-amber-300 bg-amber-50 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2"><FileArchive className="h-4 w-4 text-amber-700" aria-hidden="true" /><h1 className="text-sm font-semibold text-amber-950">Draft / Unqualified outputs</h1></div>
            <p className="mt-1 max-w-3xl text-[10px] leading-5 text-amber-900">Generation means only that the current local generator could produce a file from recorded project state. These files are not #21-qualified manufacturing/release artifacts until provenance, independent parsing/viewing, reproducibility and trusted review are implemented.</p>
          </div>
          <span className="shrink-0 border border-amber-300 bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-amber-800">Draft / Unqualified</span>
        </section>

        <section className="border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3"><h2 className="text-sm font-semibold text-slate-950">Project backups & review documents</h2><p className="mt-1 text-[10px] text-slate-500">Portable working-state documents. They are not manufacturing qualification files.</p></div>
          <div className="flex flex-wrap gap-2 p-4">
            <button type="button" onClick={() => exportProjectJson(project)} className="inline-flex h-8 items-center gap-1.5 bg-slate-950 px-3 text-[10px] font-semibold text-white"><Download className="h-3.5 w-3.5" /> Project JSON</button>
            <button type="button" onClick={() => exportProjectMarkdown(project)} className="inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-3 text-[10px] font-semibold text-slate-700"><Download className="h-3.5 w-3.5" /> Project summary</button>
          </div>
        </section>

        <section className="border border-slate-200 bg-white">
          <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-sm font-semibold text-slate-950">Board-bound manufacturing drafts</h2><p className="mt-1 text-[10px] text-slate-500">Requires explicit board/geometry/placement data from the existing manufacturing preflight.</p></div>
            <div className={`inline-flex items-center gap-1.5 text-[9px] font-semibold ${manufacturing.ready ? 'text-emerald-700' : 'text-rose-700'}`}>{manufacturing.ready ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}{manufacturing.ready ? 'Draft generation preflight available' : `${manufacturing.blockers.length} blocker${manufacturing.blockers.length === 1 ? '' : 's'}`}</div>
          </div>

          {!manufacturing.ready ? (
            <div className="divide-y divide-rose-100 bg-rose-50/60">
              {manufacturing.blockers.map((blocker) => <div key={`${blocker.code}-${blocker.objectId || blocker.message}`} className="flex gap-2 px-4 py-2.5 text-[10px] leading-5 text-rose-900"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{blocker.message}</div>)}
            </div>
          ) : (
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
              {boardDrafts.map((file) => (
                <button key={file.filename} type="button" onClick={() => safeDraftDownload(file.label, file.filename, file.generate, file.mime)} className="flex min-h-20 items-center justify-between gap-3 bg-white px-3.5 py-3 text-left hover:bg-slate-50">
                  <div className="min-w-0"><div className="text-[11px] font-semibold text-slate-800">{file.label}</div><div className="mt-1 truncate font-mono text-[9px] text-slate-400">{file.filename}</div></div><Download className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-950">Draft package preflight manifest</h2>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">This local manifest describes generated draft-package state. It is deliberately not named or presented as a release manifest.</p>
          <button type="button" disabled={!manufacturing.ready} onClick={() => safeDraftDownload('Draft package manifest', 'draft_package_manifest.json', () => generateReleasePackageManifest(project), 'application/json')} className="mt-3 inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-3 text-[10px] font-semibold text-slate-700 disabled:opacity-40"><Download className="h-3.5 w-3.5" /> Draft package manifest</button>
        </section>
      </div>
    </div>
  );
};
