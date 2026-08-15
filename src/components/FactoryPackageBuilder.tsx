import React from 'react';
import { useProjectStore } from '../store/projectStore';
import {
  exportBomCsv,
  exportHandoffManifestJson,
  generateFactoryReviewReadme,
  generateNativeBoardLayoutJson,
  generateNativeCplDraftCsv,
  generateNativeExcellonDrills,
  generateNativeGerberBoardOutline,
  generateNativeGerberCopperBottom,
  generateNativeGerberCopperTop,
  generateNativeNetlistJson,
  generateReleasePackageManifest,
} from '../lib/nativeExports';
import { evaluateManufacturingContext } from '../lib/manufacturing/manufacturingContext';
import { useFeedback } from './feedback/FeedbackProvider';
import { AlertTriangle, CheckCircle2, Download, FileCheck2, Hammer, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from '../ui/Button';

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

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The export could not be generated from the current project state.';
}

export const FactoryPackageBuilder: React.FC = () => {
  const store = useProjectStore();
  const { notify } = useFeedback();
  const {
    projectName,
    factoryPackageStatus = 'Draft',
    factoryReviewChecks = {},
    setFactoryPackageStatus,
    setFactoryReviewCheck,
    resetFactoryReview,
    updateFactoryFileStatus,
  } = store;

  const manufacturing = evaluateManufacturingContext(store);
  const context = manufacturing.context;

  const checklistItems = [
    { key: 'gerber_viewer', label: 'Independent Gerber viewer checked' },
    { key: 'board_dims', label: 'Board contour and dimensions checked' },
    { key: 'drill_align', label: 'Drill table, plating and alignment checked' },
    { key: 'rotations', label: 'Component side and rotation checked' },
    { key: 'bom_quantities', label: 'BOM part numbers and quantities reconciled' },
    { key: 'cpl_rotations', label: 'CPL origin and assembly-house rotation convention checked' },
    { key: 'dfm_run', label: 'External DFM review completed' },
    { key: 'drc_erc', label: 'ERC/DRC blockers reviewed' },
  ];

  const reviewComplete = checklistItems.every((item) => factoryReviewChecks[item.key] === true);

  const exportFiles = [
    { key: 'top_copper', label: 'Top copper', filename: 'top_copper.gbr', mime: 'text/plain', generate: () => generateNativeGerberCopperTop(store) },
    { key: 'bottom_copper', label: 'Bottom copper', filename: 'bottom_copper.gbr', mime: 'text/plain', generate: () => generateNativeGerberCopperBottom(store) },
    { key: 'outline', label: 'Board outline', filename: 'board_outline.gbr', mime: 'text/plain', generate: () => generateNativeGerberBoardOutline(store) },
    { key: 'drill', label: 'NC drill', filename: 'drills.drl', mime: 'text/plain', generate: () => generateNativeExcellonDrills(store) },
    { key: 'cpl', label: 'Pick & place', filename: 'cpl.csv', mime: 'text/csv', generate: () => generateNativeCplDraftCsv(store) },
    { key: 'bom', label: 'BOM', filename: 'bom.csv', mime: 'text/csv', generate: () => exportBomCsv(store) },
    { key: 'netlist', label: 'Netlist', filename: 'netlist.json', mime: 'application/json', generate: () => generateNativeNetlistJson(store) },
    { key: 'layout', label: 'Board layout data', filename: 'board_layout.json', mime: 'application/json', generate: () => generateNativeBoardLayoutJson(store) },
  ];

  const handlePrepareDraft = () => {
    if (!manufacturing.ready) {
      notify({
        tone: 'error',
        title: 'Manufacturing draft blocked',
        detail: manufacturing.blockers[0]?.message || 'Resolve the manufacturing preflight before generating draft outputs.',
      });
      return;
    }

    try {
      exportFiles.forEach((file) => file.generate());
      generateReleasePackageManifest(store);

      updateFactoryFileStatus('gerberZip', 'Not Generated', 'Native Gerbers are currently exported as individual reviewed files; no ZIP bundle is synthesized.', 'Hardware Studio');
      updateFactoryFileStatus('drillFiles', 'Needs Final Review', 'NC drill output generated from recorded via and drill geometry.', 'Hardware Studio', 'drills.drl');
      updateFactoryFileStatus('bomCsv', 'Needs Final Review', 'BOM generated from board-bound component state.', 'Hardware Studio', 'bom.csv');
      updateFactoryFileStatus('cplCsv', 'Needs Final Review', 'Pick-and-place data generated from explicit placement coordinates, side and rotation.', 'Hardware Studio', 'cpl.csv');
      updateFactoryFileStatus('boardDrawing', 'Needs Final Review', 'Board outline Gerber generated from the explicit selected-board contour.', 'Hardware Studio', 'board_outline.gbr');
      setFactoryPackageStatus('Needs Review');

      notify({
        tone: 'success',
        title: 'Draft outputs validated',
        detail: 'The supported board outputs can be generated from the current canonical project state. Independent review is still required.',
      });
    } catch (error) {
      setFactoryPackageStatus('Blocked');
      notify({ tone: 'error', title: 'Draft generation blocked', detail: errorMessage(error) });
    }
  };

  const handleExport = (file: (typeof exportFiles)[number]) => {
    try {
      downloadFile(file.generate(), file.filename, file.mime);
    } catch (error) {
      notify({ tone: 'error', title: `${file.label} export blocked`, detail: errorMessage(error) });
    }
  };

  const handleDownloadReleaseManifest = () => {
    try {
      downloadFile(generateReleasePackageManifest(store), 'release_manifest.json', 'application/json');
    } catch (error) {
      notify({ tone: 'error', title: 'Release manifest blocked', detail: errorMessage(error) });
    }
  };

  const handleReset = () => {
    resetFactoryReview();
    updateFactoryFileStatus('gerberZip', 'Not Generated');
    updateFactoryFileStatus('drillFiles', 'Not Generated');
    updateFactoryFileStatus('bomCsv', 'Not Generated');
    updateFactoryFileStatus('cplCsv', 'Not Generated');
    updateFactoryFileStatus('boardDrawing', 'Conceptual');
    notify({ tone: 'info', title: 'Factory review reset', detail: 'Review evidence and declared file statuses were returned to draft state.' });
  };

  const statusLabel = manufacturing.ready
    ? factoryPackageStatus === 'Needs Review' ? 'Draft prepared · review required' : 'Ready to prepare draft'
    : `${manufacturing.blockers.length} blocker${manufacturing.blockers.length === 1 ? '' : 's'}`;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100/80 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 lg:px-7">
        <header className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <Hammer className="h-3.5 w-3.5" />
              Manufacturing
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">Factory package</h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
              Prepare only the manufacturing outputs supported by recorded engineering state for {projectName}. Generated files remain draft until independently reviewed.
            </p>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${manufacturing.ready ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
            {manufacturing.ready ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {statusLabel}
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0 space-y-4">
            <section className="border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${manufacturing.ready ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <h2 className="text-sm font-semibold text-slate-950">Manufacturing preflight</h2>
                  </div>
                  {context ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {context.board.name} · {context.components.length} components · {context.traces.length} traces · {context.vias.length} vias
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">No valid board context is available yet.</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handlePrepareDraft} disabled={!manufacturing.ready} className="h-8 bg-slate-950 px-3 text-[11px] font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40">
                    <FileCheck2 className="mr-1.5 h-3.5 w-3.5" />
                    Validate & prepare draft
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="h-8 border-slate-300 bg-white px-3 text-[11px] text-slate-700 hover:bg-slate-50">
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Reset review
                  </Button>
                </div>
              </div>

              {!manufacturing.ready && (
                <div className="p-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-rose-700">Resolve before export</p>
                  <div className="divide-y divide-rose-100 border border-rose-200 bg-rose-50/60">
                    {manufacturing.blockers.map((blocker) => (
                      <div key={`${blocker.code}-${blocker.objectId || blocker.message}`} className="flex gap-2 px-3 py-2.5 text-xs leading-5 text-rose-900">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{blocker.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {manufacturing.ready && (
                <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
                  {exportFiles.map((file) => (
                    <button
                      key={file.key}
                      type="button"
                      onClick={() => handleExport(file)}
                      className="group flex min-h-20 items-center justify-between gap-3 bg-white px-3.5 py-3 text-left transition hover:bg-slate-50"
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-800">{file.label}</div>
                        <div className="mt-1 truncate font-mono text-[9px] text-slate-400">{file.filename}</div>
                      </div>
                      <Download className="h-3.5 w-3.5 shrink-0 text-slate-400 transition group-hover:text-slate-700" />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <div className="border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">Package evidence</h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">These files explain exactly what Hardware Studio can and cannot claim about the current package.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={handleDownloadReleaseManifest} disabled={!manufacturing.ready} variant="outline" className="h-8 border-slate-300 bg-white text-[11px] text-slate-700 disabled:opacity-40">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Release manifest
                  </Button>
                  <Button onClick={() => downloadFile(exportHandoffManifestJson(store), 'handoff_manifest.json', 'application/json')} variant="outline" className="h-8 border-slate-300 bg-white text-[11px] text-slate-700">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Handoff state
                  </Button>
                  <Button onClick={() => downloadFile(generateFactoryReviewReadme(store), 'factory_review_readme.md', 'text/markdown')} variant="outline" className="h-8 border-slate-300 bg-white text-[11px] text-slate-700">
                    <Download className="mr-1.5 h-3.5 w-3.5" /> Review guide
                  </Button>
                </div>
              </div>

              <div className="border border-amber-200 bg-amber-50/70 p-4">
                <h2 className="text-sm font-semibold text-amber-950">Not native fabrication outputs yet</h2>
                <p className="mt-1 text-xs leading-5 text-amber-800">Solder mask, paste, silkscreen artwork, authoritative bottom-side footprint mirroring and complete factory ZIP packaging remain explicitly unsupported. They are not shown as normal export actions.</p>
              </div>
            </section>
          </main>

          <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
            <section className="border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">External review</p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-950">Evidence checklist</h2>
                </div>
                {reviewComplete && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              </div>
              <p className="mt-2 text-[11px] leading-5 text-slate-500">Checklist state records review work only. It does not automatically mark the package Verified.</p>

              <div className="mt-4 divide-y divide-slate-100 border-y border-slate-100">
                {checklistItems.map((item) => {
                  const checked = factoryReviewChecks[item.key] === true;
                  return (
                    <label key={item.key} className="flex cursor-pointer items-start gap-2.5 py-2.5">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => setFactoryReviewCheck(item.key, event.target.checked)}
                        className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
                      />
                      <span className={`text-[11px] leading-4 ${checked ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{item.label}</span>
                    </label>
                  );
                })}
              </div>

              <div className={`mt-4 border px-3 py-2.5 text-[11px] leading-5 ${reviewComplete ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>
                {reviewComplete
                  ? 'Review checklist complete. Release qualification still requires recorded evidence and the release gate.'
                  : `${checklistItems.filter((item) => factoryReviewChecks[item.key] !== true).length} review checks remain.`}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
