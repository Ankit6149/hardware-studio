'use client';

import React from 'react';
import { AlertTriangle, CheckCircle2, Download, FileCheck2, RotateCcw } from 'lucide-react';
import { useProjectStore } from '../../store/projectStore';
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

const checklistItems = [
  { key: 'gerber_viewer', label: 'Independent Gerber viewer checked' },
  { key: 'board_dims', label: 'Board contour and dimensions checked' },
  { key: 'drill_align', label: 'Drill table, plating and alignment checked' },
  { key: 'rotations', label: 'Component side and rotation checked' },
  { key: 'bom_quantities', label: 'BOM part numbers and quantities reconciled' },
  { key: 'cpl_rotations', label: 'CPL origin / assembly-house convention checked' },
  { key: 'dfm_run', label: 'External DFM review noted' },
  { key: 'drc_erc', label: 'ERC/DRC blockers reviewed' },
] as const;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Draft package generation failed.';
}

export const ReleaseFactorySurface: React.FC = () => {
  const store = useProjectStore();
  const { notify } = useFeedback();
  const factoryReviewChecks = store.factoryReviewChecks || {};
  const manufacturing = evaluateManufacturingContext(store);
  const reviewComplete = checklistItems.every((item) => factoryReviewChecks[item.key] === true);

  const draftFiles = [
    { label: 'Top copper draft', filename: 'top_copper.gbr', mime: 'text/plain', generate: () => generateNativeGerberCopperTop(store) },
    { label: 'Bottom copper draft', filename: 'bottom_copper.gbr', mime: 'text/plain', generate: () => generateNativeGerberCopperBottom(store) },
    { label: 'Board outline draft', filename: 'board_outline.gbr', mime: 'text/plain', generate: () => generateNativeGerberBoardOutline(store) },
    { label: 'NC drill draft', filename: 'drills.drl', mime: 'text/plain', generate: () => generateNativeExcellonDrills(store) },
    { label: 'Pick & place draft', filename: 'cpl.csv', mime: 'text/csv', generate: () => generateNativeCplDraftCsv(store) },
    { label: 'BOM draft', filename: 'bom.csv', mime: 'text/csv', generate: () => exportBomCsv(store) },
  ];

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const handlePrepareDraft = () => {
    if (!manufacturing.ready) {
      notify({ tone: 'error', title: 'Draft package preflight blocked', detail: manufacturing.blockers[0]?.message || 'Resolve manufacturing preflight first.' });
      return;
    }
    try {
      draftFiles.forEach((file) => file.generate());
      generateReleasePackageManifest(store);
      store.updateFactoryFileStatus('gerberZip', 'Not Generated', 'No authoritative ZIP bundle is synthesized.', 'Hardware Studio');
      store.updateFactoryFileStatus('drillFiles', 'Needs Final Review', 'Draft NC drill generated from recorded geometry.', 'Hardware Studio', 'drills.drl');
      store.updateFactoryFileStatus('bomCsv', 'Needs Final Review', 'Draft BOM generated from board-bound components.', 'Hardware Studio', 'bom.csv');
      store.updateFactoryFileStatus('cplCsv', 'Needs Final Review', 'Draft CPL generated from explicit placement/rotation.', 'Hardware Studio', 'cpl.csv');
      store.updateFactoryFileStatus('boardDrawing', 'Needs Final Review', 'Draft outline generated from selected-board contour.', 'Hardware Studio', 'board_outline.gbr');
      store.setFactoryPackageStatus('Needs Review');
      notify({
        tone: 'success',
        title: 'Draft package prepared for review',
        detail: 'Supported draft outputs were generated from the current canonical project state. They remain unqualified until #21-grade independent checks and trusted review exist.',
      });
    } catch (error) {
      store.setFactoryPackageStatus('Blocked');
      notify({ tone: 'error', title: 'Draft package preflight blocked', detail: errorMessage(error) });
    }
  };

  const handleReset = () => {
    store.resetFactoryReview();
    store.updateFactoryFileStatus('gerberZip', 'Not Generated');
    store.updateFactoryFileStatus('drillFiles', 'Not Generated');
    store.updateFactoryFileStatus('bomCsv', 'Not Generated');
    store.updateFactoryFileStatus('cplCsv', 'Not Generated');
    store.updateFactoryFileStatus('boardDrawing', 'Conceptual');
    notify({ tone: 'info', title: 'Local factory review reset', detail: 'Review notes and declared draft-file statuses returned to draft state.' });
  };

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-4">
        <section className="border border-amber-300 bg-amber-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div><h1 className="text-sm font-semibold text-amber-950">Factory package · Draft / Unqualified</h1><p className="mt-1 max-w-3xl text-[10px] leading-5 text-amber-900">This surface prepares review drafts only. A successful generator, checklist, or local status does not create a #21-qualified manufacturing package or a #20 release artifact.</p></div>
            <span className="shrink-0 border border-amber-300 bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-amber-800">Draft / Unqualified</span>
          </div>
        </section>

        <section className="border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-sm font-semibold text-slate-950">Manufacturing preflight</h2><p className="mt-1 text-[10px] text-slate-500">Explicit board geometry, placement and supported manufacturing context are required before draft generation.</p></div>
            <div className="flex gap-2">
              <button type="button" onClick={handlePrepareDraft} disabled={!manufacturing.ready} className="inline-flex h-8 items-center gap-1.5 bg-slate-950 px-3 text-[10px] font-semibold text-white disabled:opacity-40"><FileCheck2 className="h-3.5 w-3.5" /> Preflight & prepare draft</button>
              <button type="button" onClick={handleReset} className="inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-3 text-[10px] font-semibold text-slate-700"><RotateCcw className="h-3.5 w-3.5" /> Reset review notes</button>
            </div>
          </div>

          {!manufacturing.ready ? (
            <div className="divide-y divide-rose-100 bg-rose-50/60">
              {manufacturing.blockers.map((blocker) => <div key={`${blocker.code}-${blocker.objectId || blocker.message}`} className="flex gap-2 px-4 py-2.5 text-[10px] leading-5 text-rose-900"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{blocker.message}</div>)}
            </div>
          ) : (
            <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
              {draftFiles.map((file) => (
                <button key={file.filename} type="button" onClick={() => {
                  try { downloadFile(file.generate(), file.filename, file.mime); }
                  catch (error) { notify({ tone: 'error', title: `${file.label} blocked`, detail: errorMessage(error) }); }
                }} className="flex min-h-20 items-center justify-between gap-3 bg-white px-3.5 py-3 text-left hover:bg-slate-50">
                  <div className="min-w-0"><div className="text-[11px] font-semibold text-slate-800">{file.label}</div><div className="mt-1 truncate font-mono text-[9px] text-slate-400">{file.filename}</div></div><Download className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-950">Draft package preflight manifest</h2>
            <p className="mt-1 text-[10px] leading-5 text-slate-500">Describes current local draft-package state. It is not a signed/content-addressed release manifest.</p>
            <button type="button" disabled={!manufacturing.ready} onClick={() => {
              try { downloadFile(generateReleasePackageManifest(store), 'draft_package_manifest.json', 'application/json'); }
              catch (error) { notify({ tone: 'error', title: 'Draft package manifest blocked', detail: errorMessage(error) }); }
            }} className="mt-3 inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-3 text-[10px] font-semibold text-slate-700 disabled:opacity-40"><Download className="h-3.5 w-3.5" /> Draft package manifest</button>
            <div className="mt-4 border border-slate-200 bg-slate-50 p-3 text-[10px] leading-5 text-slate-600">Unsupported or incomplete fabrication outputs remain unsupported. No synthetic Gerber ZIP, authoritative solder-mask/paste/silkscreen qualification, or independent parser/DFM proof is implied.</div>
          </div>

          <div className="border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2"><div><p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-400">Local review notes</p><h2 className="mt-1 text-sm font-semibold text-slate-950">Evidence checklist</h2></div>{reviewComplete && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}</div>
            <p className="mt-2 text-[10px] leading-5 text-slate-500">Checklist state records review notes only. It does not mark a package Verified, bind a trusted reviewer to a manifest hash, or satisfy #21.</p>
            <div className="mt-3 divide-y divide-slate-100 border-y border-slate-100">
              {checklistItems.map((item) => (
                <label key={item.key} className="flex cursor-pointer items-start gap-2.5 py-2.5">
                  <input type="checkbox" checked={factoryReviewChecks[item.key] === true} onChange={(event) => store.setFactoryReviewCheck(item.key, event.target.checked)} className="mt-0.5 h-3.5 w-3.5" />
                  <span className="text-[10px] leading-4 text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
            <p className={`mt-3 text-[9px] font-semibold ${reviewComplete ? 'text-emerald-700' : 'text-slate-400'}`}>{reviewComplete ? 'All local review notes checked · still unqualified' : 'Local review notes incomplete'}</p>
          </div>
        </section>
      </div>
    </div>
  );
};
