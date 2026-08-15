import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { exportProjectJson } from '../lib/exportJson';
import { exportProjectMarkdown } from '../lib/exportMarkdown';
import { exportBlueprintDossierMarkdown, exportBlueprintDossierJson } from '../lib/exportDossier';
import { generateFirmwareSkeleton } from '../lib/exportFirmware';
import { exportBlueprintPackHtml, exportBlueprintPackJson, exportBlueprintPackMarkdown } from '../lib/blueprintPackExport';
import { exportBlueprintSheetsHtml, exportBlueprintSheetsJson, exportBlueprintSheetsMarkdown } from '../lib/exportBlueprintSheets';
import {
  exportBomCsv,
  exportConceptualMechanicalLayoutJson,
  exportConceptualSchematicJson,
  exportEditorLayoutsJson,
  exportFactoryReadinessJson,
  exportFirmwareArchitectureJson,
  exportHandoffManifestJson,
  exportMissingFactoryFilesMarkdown,
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
import { AlertTriangle, ChevronDown, Download, FileArchive, FileCode2, RefreshCw, ShieldCheck } from 'lucide-react';

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'The export could not be generated from the current project state.';
}

export const ExportCenter: React.FC = () => {
  const project = useProjectStore();
  const { notify } = useFeedback();
  const manufacturing = evaluateManufacturingContext(project);
  const context = manufacturing.context;

  const downloadTextFile = (filename: string, content: string, mimeType = 'text/plain') => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const safeDownload = (label: string, filename: string, generate: () => string, mimeType = 'text/plain') => {
    try {
      downloadTextFile(filename, generate(), mimeType);
    } catch (error) {
      notify({ tone: 'error', title: `${label} export blocked`, detail: errorMessage(error) });
    }
  };

  const manufacturingExports = [
    { label: 'Top copper', filename: 'top_copper.gbr', generate: () => generateNativeGerberCopperTop(project) },
    { label: 'Bottom copper', filename: 'bottom_copper.gbr', generate: () => generateNativeGerberCopperBottom(project) },
    { label: 'Board outline', filename: 'board_outline.gbr', generate: () => generateNativeGerberBoardOutline(project) },
    { label: 'NC drill', filename: 'drills.drl', generate: () => generateNativeExcellonDrills(project) },
    { label: 'Pick & place', filename: 'cpl.csv', mime: 'text/csv', generate: () => generateNativeCplDraftCsv(project) },
    { label: 'BOM', filename: 'bom.csv', mime: 'text/csv', generate: () => exportBomCsv(project) },
  ];

  const blueprintSummary = project.blueprintPack?.summary;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-100/80 text-slate-900">
      <div className="mx-auto w-full max-w-7xl px-5 py-5 lg:px-7">
        <header className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              <FileArchive className="h-3.5 w-3.5" />
              Output
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-950">Export center</h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
              Keep project backups, design documents and manufacturing drafts separate. Only outputs supported by the current engineering state are presented as fabrication actions.
            </p>
          </div>
          <div className={`inline-flex w-fit items-center gap-2 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold ${manufacturing.ready ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
            {manufacturing.ready ? <ShieldCheck className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {manufacturing.ready ? 'Manufacturing draft eligible' : 'Manufacturing blocked'}
          </div>
        </header>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <main className="min-w-0 space-y-4">
            <section className="border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Project source</p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-950">Backups & working documents</h2>
                  <p className="mt-1 text-xs text-slate-500">Portable project state and current engineering documentation. These are not manufacturing qualification files.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => exportProjectJson(project)} className="inline-flex h-8 items-center gap-1.5 bg-slate-950 px-3 text-[11px] font-semibold text-white hover:bg-slate-800">
                    <Download className="h-3.5 w-3.5" /> Project JSON
                  </button>
                  <button onClick={() => exportProjectMarkdown(project)} className="inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-3 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                    <Download className="h-3.5 w-3.5" /> Project summary
                  </button>
                </div>
              </div>

              <div className="grid gap-px bg-slate-200 md:grid-cols-[1fr_auto]">
                <div className="bg-white p-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-slate-900">Blueprint pack</h3>
                    {project.blueprintPackStatus && <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-slate-500">{project.blueprintPackStatus}</span>}
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    {blueprintSummary
                      ? `${blueprintSummary.totalSheets} sheets · ${blueprintSummary.missingDataSheets} missing-data sheets · ${blueprintSummary.blockers} blockers`
                      : 'No blueprint pack has been generated from the current project state.'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 bg-white p-4 md:justify-end">
                  <button onClick={() => project.generateBlueprintPack()} className="inline-flex h-8 items-center gap-1.5 border border-slate-300 bg-white px-3 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                    <RefreshCw className="h-3.5 w-3.5" /> {project.blueprintPack ? 'Regenerate' : 'Generate'}
                  </button>
                  {project.blueprintPack && (
                    <>
                      <button onClick={() => downloadTextFile('blueprint_pack.json', exportBlueprintPackJson(project.blueprintPack!), 'application/json')} className="h-8 border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">JSON</button>
                      <button onClick={() => downloadTextFile('blueprint_pack.md', exportBlueprintPackMarkdown(project.blueprintPack!))} className="h-8 border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">MD</button>
                      <button onClick={() => downloadTextFile('blueprint_pack.html', exportBlueprintPackHtml(project.blueprintPack!), 'text/html')} className="h-8 border border-slate-300 bg-white px-2.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">HTML</button>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="border border-slate-200 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Manufacturing</p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-950">Board-bound draft outputs</h2>
                  {context && <p className="mt-1 text-xs text-slate-500">{context.board.name} · {context.components.length} components · {context.traces.length} traces · {context.vias.length} vias</p>}
                </div>
                {manufacturing.ready && (
                  <button onClick={() => safeDownload('Release manifest', 'release_manifest.json', () => generateReleasePackageManifest(project), 'application/json')} className="inline-flex h-8 shrink-0 items-center gap-1.5 border border-slate-300 bg-white px-3 text-[11px] font-semibold text-slate-700 hover:bg-slate-50">
                    <Download className="h-3.5 w-3.5" /> Manifest
                  </button>
                )}
              </div>

              {!manufacturing.ready ? (
                <div className="p-4">
                  <div className="border border-rose-200 bg-rose-50/60">
                    <div className="border-b border-rose-200 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-rose-700">Resolve before manufacturing export</div>
                    <div className="divide-y divide-rose-100">
                      {manufacturing.blockers.slice(0, 6).map((blocker) => (
                        <div key={`${blocker.code}-${blocker.objectId || blocker.message}`} className="flex gap-2 px-3 py-2.5 text-xs leading-5 text-rose-900">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <span>{blocker.message}</span>
                        </div>
                      ))}
                    </div>
                    {manufacturing.blockers.length > 6 && <div className="border-t border-rose-200 px-3 py-2 text-[10px] text-rose-700">+ {manufacturing.blockers.length - 6} additional blockers</div>}
                  </div>
                </div>
              ) : (
                <div className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
                  {manufacturingExports.map((file) => (
                    <button
                      key={file.filename}
                      onClick={() => safeDownload(file.label, file.filename, file.generate, file.mime)}
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

            <details className="group border border-slate-200 bg-white shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">Secondary exports</p>
                  <h2 className="mt-1 text-sm font-semibold text-slate-950">Engineering data & review documents</h2>
                  <p className="mt-1 text-xs text-slate-500">Open this only when you need interchange, audit or firmware support files.</p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
              </summary>
              <div className="grid gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: 'Board layout JSON', filename: 'board_layout.json', mime: 'application/json', generate: () => generateNativeBoardLayoutJson(project) },
                  { label: 'Netlist JSON', filename: 'netlist.json', mime: 'application/json', generate: () => generateNativeNetlistJson(project) },
                  { label: 'Handoff state', filename: 'handoff_manifest.json', mime: 'application/json', generate: () => exportHandoffManifestJson(project) },
                  { label: 'Factory readiness', filename: 'factory_readiness.json', mime: 'application/json', generate: () => exportFactoryReadinessJson(project) },
                  { label: 'Factory review guide', filename: 'factory_review_readme.md', mime: 'text/markdown', generate: () => generateFactoryReviewReadme(project) },
                  { label: 'Missing factory files', filename: 'missing_factory_files.md', mime: 'text/markdown', generate: () => exportMissingFactoryFilesMarkdown(project) },
                  { label: 'Editor layout JSON', filename: 'editor_layout.json', mime: 'application/json', generate: () => exportEditorLayoutsJson(project) },
                  { label: 'Mechanical project JSON', filename: 'mechanical_layout.json', mime: 'application/json', generate: () => exportConceptualMechanicalLayoutJson(project) },
                  { label: 'Schematic project JSON', filename: 'schematic_graph.json', mime: 'application/json', generate: () => exportConceptualSchematicJson(project) },
                  { label: 'Firmware architecture', filename: 'firmware_architecture.json', mime: 'application/json', generate: () => exportFirmwareArchitectureJson(project) },
                ].map((item) => (
                  <button key={item.filename} onClick={() => safeDownload(item.label, item.filename, item.generate, item.mime)} className="flex items-center justify-between gap-3 bg-white px-3.5 py-3 text-left hover:bg-slate-50">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-700">{item.label}</div>
                      <div className="mt-0.5 font-mono text-[9px] text-slate-400">{item.filename}</div>
                    </div>
                    <Download className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
              <div className="grid gap-3 border-t border-slate-200 p-4 md:grid-cols-3">
                <button onClick={() => downloadTextFile('blueprint_dossier.md', exportBlueprintDossierMarkdown(project))} className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-100">Blueprint dossier MD</button>
                <button onClick={() => downloadTextFile('blueprint_dossier.json', exportBlueprintDossierJson(project), 'application/json')} className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-100">Blueprint dossier JSON</button>
                <button onClick={() => downloadTextFile('firmware_skeleton.ino', generateFirmwareSkeleton(project))} className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-100">Firmware skeleton</button>
                <button onClick={() => downloadTextFile('blueprint_sheets.md', exportBlueprintSheetsMarkdown(project))} className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-100">Blueprint sheets MD</button>
                <button onClick={() => downloadTextFile('blueprint_sheets.json', exportBlueprintSheetsJson(project), 'application/json')} className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-100">Blueprint sheets JSON</button>
                <button onClick={() => downloadTextFile('blueprint_sheets.html', exportBlueprintSheetsHtml(project), 'text/html')} className="border border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold text-slate-700 hover:bg-slate-100">Blueprint sheets HTML</button>
              </div>
            </details>
          </main>

          <aside className="space-y-4 xl:sticky xl:top-5 xl:self-start">
            <section className="border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <FileCode2 className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-950">Output boundaries</h2>
              </div>
              <div className="mt-4 space-y-3 text-[11px] leading-5 text-slate-600">
                <div>
                  <div className="font-semibold text-slate-800">Native draft now</div>
                  <div>Board copper, outline, drill, placement, BOM and structured project data when preflight passes.</div>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <div className="font-semibold text-slate-800">Explicitly unsupported</div>
                  <div>Mask, paste, silkscreen artwork, authoritative bottom-side footprint mirroring and a complete fabrication ZIP.</div>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <div className="font-semibold text-slate-800">Never implied</div>
                  <div>Independent ERC/DRC/DFM qualification, supplier approval or fab-house acceptance.</div>
                </div>
              </div>
            </section>

            <section className="border border-amber-200 bg-amber-50/70 p-4 text-[11px] leading-5 text-amber-900">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <div className="font-semibold">Draft engineering output</div>
                  <p className="mt-1">A downloadable file is not the same as a qualified manufacturing release. Final independent review remains mandatory.</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};
