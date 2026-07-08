import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { exportProjectJson } from '../lib/exportJson';
import { exportProjectMarkdown } from '../lib/exportMarkdown';
import { exportBlueprintDossierMarkdown, exportBlueprintDossierJson } from '../lib/exportDossier';
import { generateFirmwareSkeleton } from '../lib/exportFirmware';
import { 
  Download, 
  Cpu, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { exportBlueprintPackJson, exportBlueprintPackMarkdown, exportBlueprintPackHtml } from '../lib/blueprintPackExport';
import { exportBlueprintSheetsMarkdown, exportBlueprintSheetsJson, exportBlueprintSheetsHtml } from '../lib/exportBlueprintSheets';
import {
  exportEditorLayoutsJson,
  exportConceptualSchematicJson,
  exportConceptualMechanicalLayoutJson,
  exportFirmwareArchitectureJson,
  exportFactoryReadinessJson,
  exportMissingFactoryFilesMarkdown,
  exportHandoffManifestJson,
  generateNativeGerberCopperTop,
  generateNativeGerberCopperBottom,
  generateNativeGerberBoardOutline,
  generateNativeGerberTopSilkscreen,
  generateNativeGerberTopMask,
  generateNativeGerberBottomMask,
  generateNativeGerberTopPaste,
  generateNativeGerberBottomPaste,
  generateNativeExcellonDrills,
  generateNativeCplDraftCsv,
  generateNativeNetlistJson,
  generateNativeBoardLayoutJson,
  generateFactoryReviewReadme
} from '../lib/nativeExports';

export const ExportCenter: React.FC = () => {
  const project = useProjectStore();
  const { 
    bom = [], 
    boards = [],
    boardComponents = [],
    nets = [],
    pcbConstraints = [],
    manufacturingChecklist = []
  } = project;

  const totalLayoutObjs = Object.values(project.editorLayouts || {}).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  
  const stats = [
    { label: "BOM Part Rows", value: bom.length },
    { label: "Active PCBs / Flex", value: boards.length },
    { label: "Netlist Traces", value: nets.length },
    { label: "PCB Constraints", value: pcbConstraints.length },
    { label: "Handoff Checks", value: manufacturingChecklist.length },
    { label: "Editor Placed Objects", value: totalLayoutObjs }
  ];

  const downloadTextFile = (filename: string, content: string, mimeType = "text/plain") => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportFile = (key: string) => {
    if (key === 'top_copper') {
      downloadTextFile('top_copper.gbr', generateNativeGerberCopperTop(project));
    } else if (key === 'bottom_copper') {
      downloadTextFile('bottom_copper.gbr', generateNativeGerberCopperBottom(project));
    } else if (key === 'board_outline') {
      downloadTextFile('board_outline.gbr', generateNativeGerberBoardOutline(project));
    } else if (key === 'top_silkscreen') {
      downloadTextFile('top_silkscreen.gbr', generateNativeGerberTopSilkscreen(project));
    } else if (key === 'top_mask') {
      downloadTextFile('top_mask.gbr', generateNativeGerberTopMask(project));
    } else if (key === 'bottom_mask') {
      downloadTextFile('bottom_mask.gbr', generateNativeGerberBottomMask(project));
    } else if (key === 'top_paste') {
      downloadTextFile('top_paste.gbr', generateNativeGerberTopPaste(project));
    } else if (key === 'bottom_paste') {
      downloadTextFile('bottom_paste.gbr', generateNativeGerberBottomPaste(project));
    } else if (key === 'drill') {
      downloadTextFile('drills.drl', generateNativeExcellonDrills(project));
    } else if (key === 'bom') {
      // BOM CSV
      const headers = ["Designator", "Name", "Type", "Value", "Package", "Quantity"];
      const rows = (boardComponents || []).map(c => [
        c.referenceDesignator, c.componentName, c.componentType, c.value, c.packageName, c.quantity
      ].map(v => `"${String(v || '').replace(/"/g, '""')}"`).join(","));
      const content = headers.join(",") + "\n" + rows.join("\n");
      downloadTextFile('bom.csv', content, 'text/csv');
    } else if (key === 'cpl') {
      downloadTextFile('cpl.csv', generateNativeCplDraftCsv(project), 'text/csv');
    } else if (key === 'netlist') {
      downloadTextFile('netlist.json', generateNativeNetlistJson(project), 'application/json');
    } else if (key === 'readme') {
      downloadTextFile('factory_review_readme.md', generateFactoryReviewReadme(project));
    } else if (key === 'manifest') {
      downloadTextFile('handoff_manifest.json', exportHandoffManifestJson(project), 'application/json');
    } else if (key === 'board_layout') {
      downloadTextFile('board_layout.json', generateNativeBoardLayoutJson(project), 'application/json');
    }
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 flex flex-col items-center select-none font-sans">
      <div className="w-full max-w-4xl space-y-6">
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight uppercase font-mono">Factory Export Center</h1>
          <p className="text-xs text-slate-550 mt-0.5">Download physical project planning database, draft layout artwork files, or BOM tables.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
              <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest block font-mono">{s.label}</span>
              <span className="text-lg font-black text-slate-800 mt-1 block font-mono">{s.value}</span>
            </div>
          ))}
        </div>

        {/* 1. PROJECT BACKUPS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">1. Project Backup</h2>
            <p className="text-[10px] text-slate-550">Save or sync your complete project layout planning databases.</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => exportProjectJson(project)}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded text-[10px] font-bold transition-all border border-slate-950 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full Project JSON (Generated In App)</span>
            </button>
            <button
              onClick={() => exportProjectMarkdown(project)}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-650 px-3.5 py-2 rounded text-[10px] font-bold transition-all border border-slate-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Project Summary Markdown (Generated In App)</span>
            </button>
          </div>
        </div>

        {/* 2. GENERATED BLUEPRINT PACK */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">2. Generated Blueprint Pack</h2>
              <p className="text-[10px] text-slate-500 mt-0.5">16-sheet blueprint pack generated from live project data with drawings, tables, and warnings.</p>
            </div>
            <div className="flex items-center space-x-2">
              {project.blueprintPackStatus && (
                <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  project.blueprintPackStatus === 'Generated' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  project.blueprintPackStatus === 'Stale' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  project.blueprintPackStatus === 'Verified' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  {project.blueprintPackStatus}
                </span>
              )}
            </div>
          </div>

          {project.blueprintPackStatus === 'Stale' && (
            <div className="bg-amber-50 border border-amber-200 rounded px-3 py-2 flex items-center space-x-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[10px] text-amber-700 font-medium">Blueprint pack is stale. Project data changed since last generation.</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => {
                project.generateBlueprintPack();
              }}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded text-[10px] font-bold transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{project.blueprintPack ? 'Regenerate' : 'Generate'} Blueprint Pack</span>
            </button>

            {project.blueprintPack && (
              <>
                <button
                  onClick={() => {
                    downloadTextFile('blueprint_pack.json', exportBlueprintPackJson(project.blueprintPack!), 'application/json');
                  }}
                  className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded text-[10px] font-bold transition-all border border-slate-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pack JSON</span>
                </button>
                <button
                  onClick={() => {
                    downloadTextFile('blueprint_pack.md', exportBlueprintPackMarkdown(project.blueprintPack!));
                  }}
                  className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded text-[10px] font-bold transition-all border border-slate-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pack Markdown</span>
                </button>
                <button
                  onClick={() => {
                    downloadTextFile('blueprint_pack.html', exportBlueprintPackHtml(project.blueprintPack!), 'text/html');
                  }}
                  className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2 rounded text-[10px] font-bold transition-all border border-slate-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Pack HTML</span>
                </button>
              </>
            )}
          </div>

          {project.blueprintPack && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { label: 'Sheets', val: project.blueprintPack.summary.totalSheets },
                { label: 'Generated', val: project.blueprintPack.summary.generatedSheets },
                { label: 'Missing', val: project.blueprintPack.summary.missingDataSheets },
                { label: 'Warnings', val: project.blueprintPack.summary.warnings },
                { label: 'Errors', val: project.blueprintPack.summary.errors },
                { label: 'Blockers', val: project.blueprintPack.summary.blockers },
              ].map((s, i) => (
                <div key={i} className="bg-slate-50 border border-slate-150 rounded p-2 text-center">
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block">{s.label}</span>
                  <span className={`text-sm font-black block mt-0.5 ${
                    s.label === 'Blockers' && s.val > 0 ? 'text-rose-600' :
                    s.label === 'Errors' && s.val > 0 ? 'text-rose-500' :
                    s.label === 'Missing' && s.val > 0 ? 'text-amber-600' : 'text-slate-800'
                  }`}>{s.val}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. BLUEPRINT DOCUMENTS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">3. Blueprint Documents</h2>
            <p className="text-[10px] text-slate-500">Download consolidated blueprint layouts and design packs.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[9.5px] font-bold text-slate-700 uppercase block">Blueprint Dossier</span>
                <span className="text-[9px] text-slate-450 block leading-relaxed">Integrated technical review report dossier templates.</span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => downloadTextFile("blueprint_dossier.md", exportBlueprintDossierMarkdown(project))}
                  className="flex-grow flex items-center justify-center space-x-1 bg-slate-900 hover:bg-slate-805 text-white py-1.5 rounded text-[9px] font-bold cursor-pointer"
                >
                  <span>Dossier MD</span>
                </button>
                <button
                  onClick={() => downloadTextFile("blueprint_dossier.json", exportBlueprintDossierJson(project), "application/json")}
                  className="flex-grow flex items-center justify-center space-x-1 bg-white hover:bg-slate-100 text-slate-650 border border-slate-250 py-1.5 rounded text-[9px] font-bold cursor-pointer font-sans"
                >
                  <span>Dossier JSON</span>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[9.5px] font-bold text-slate-700 uppercase block">Blueprint Sheets Pack</span>
                <span className="text-[9px] text-slate-450 block leading-relaxed">16-sheet coordinates layout pack (SH 01 to SH 16).</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => downloadTextFile("blueprint_sheets.md", exportBlueprintSheetsMarkdown(project))}
                  className="flex items-center justify-center space-x-1 bg-slate-900 hover:bg-slate-805 text-white py-1.5 rounded text-[9px] font-bold cursor-pointer"
                >
                  <span>Sheets MD</span>
                </button>
                <button
                  onClick={() => downloadTextFile("blueprint_sheets.html", exportBlueprintSheetsHtml(project), "text/html")}
                  className="flex items-center justify-center space-x-1 bg-white hover:bg-slate-100 text-slate-650 border border-slate-250 py-1.5 rounded text-[9px] font-bold cursor-pointer"
                >
                  <span>Sheets HTML</span>
                </button>
                <button
                  onClick={() => downloadTextFile("blueprint_sheets.json", exportBlueprintSheetsJson(project), "application/json")}
                  className="flex items-center justify-center space-x-1 bg-white hover:bg-slate-100 text-slate-650 border border-slate-250 py-1.5 rounded text-[9px] font-bold cursor-pointer"
                >
                  <span>Sheets JSON</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. NATIVE EDITOR DATA */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">4. Native Editor Data</h2>
            <p className="text-[10px] text-slate-500">Structured layout databases mapping absolute grid geometries.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { name: "Editor Layout JSON", fn: "editor_layout.json", action: () => downloadTextFile("editor_layout.json", exportEditorLayoutsJson(project), "application/json") },
              { name: "Mechanical Layout JSON", fn: "mechanical_layout.json", action: () => downloadTextFile("mechanical_layout.json", exportConceptualMechanicalLayoutJson(project), "application/json") },
              { name: "Schematic Graph JSON", fn: "schematic_graph.json", action: () => downloadTextFile("schematic_graph.json", exportConceptualSchematicJson(project), "application/json") },
              { name: "Board Layout JSON", fn: "board_layout.json", action: () => handleExportFile("board_layout") },
              { name: "Routing JSON", fn: "routing.json", action: () => downloadTextFile("routing.json", generateNativeNetlistJson(project), "application/json") }
            ].map((d, i) => (
              <div key={i} className="bg-slate-55/20 border border-slate-200 rounded p-3 flex flex-col justify-between hover:border-slate-350 transition-all">
                <div>
                  <span className="text-[9.5px] font-bold text-slate-700 block">{d.name}</span>
                  <span className="text-[8px] text-slate-400 font-mono block mt-1">{d.fn}</span>
                </div>
                <button
                  onClick={d.action}
                  className="mt-3 w-full flex items-center justify-center space-x-1 bg-white hover:bg-slate-100 text-slate-650 border border-slate-250 py-1 rounded text-[9px] font-bold cursor-pointer"
                >
                  <Download className="w-3 h-3 text-slate-400" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 5. MANUFACTURING DRAFT FILES */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">5. Manufacturing Draft Files</h2>
            <p className="text-[10px] text-slate-500">Draft manufacturing stencils generated in-app. Requires final review check before submit.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Top Copper Gerber", key: "top_copper", fn: "top_copper.gbr" },
              { label: "Bottom Copper Gerber", key: "bottom_copper", fn: "bottom_copper.gbr" },
              { label: "Board Outline Gerber", key: "board_outline", fn: "board_outline.gbr" },
              { label: "Top Silkscreen Gerber", key: "top_silkscreen", fn: "top_silkscreen.gbr" },
              { label: "Top Mask Gerber", key: "top_mask", fn: "top_mask.gbr" },
              { label: "Bottom Mask Gerber", key: "bottom_mask", fn: "bottom_mask.gbr" },
              { label: "Top Solder Paste Gerber", key: "top_paste", fn: "top_paste.gbr" },
              { label: "Bottom Solder Paste Gerber", key: "bottom_paste", fn: "bottom_paste.gbr" },
              { label: "Excellon Drill File", key: "drill", fn: "drills.drl" },
              { label: "BOM Sourcing CSV", key: "bom", fn: "bom.csv" },
              { label: "CPL Draft CSV", key: "cpl", fn: "cpl.csv" },
              { label: "Netlist JSON Map", key: "netlist", fn: "netlist.json" },
              { label: "Handoff Manifest JSON", key: "manifest", fn: "handoff_manifest.json" },
              { label: "Factory Review README", key: "readme", fn: "factory_review_readme.md" }
            ].map((f, i) => (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
                <div>
                  <div className="text-[9.5px] font-bold text-slate-700">{f.label}</div>
                  <div className="text-[8px] text-amber-600 font-bold font-mono mt-1">Generated In App — Needs Review</div>
                </div>
                <button
                  onClick={() => handleExportFile(f.key)}
                  className="mt-3 w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-1 rounded text-[9px] font-bold cursor-pointer"
                >
                  <Download className="w-3 h-3 text-slate-300" />
                  <span>Export</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 6. REVIEW & READINESS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">6. Review & Readiness</h2>
            <p className="text-[10px] text-slate-550">Validate system integration indexes and compliance check sheets.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[9.5px] font-bold text-slate-700 uppercase block">Design Review JSON</span>
                <span className="text-[9px] text-slate-450 block leading-relaxed">Full list of open design warnings and suggestions.</span>
              </div>
              <button
                onClick={() => downloadTextFile("design_review.json", JSON.stringify(project.reviewResults || [], null, 2), "application/json")}
                className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-1.5 rounded text-[9px] font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[9.5px] font-bold text-slate-700 uppercase block">Factory Readiness JSON</span>
                <span className="text-[9px] text-slate-450 block leading-relaxed">System metrics, weighting parameters, and gates checklist.</span>
              </div>
              <button
                onClick={() => downloadTextFile("factory_readiness.json", exportFactoryReadinessJson(project), "application/json")}
                className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-1.5 rounded text-[9px] font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[9.5px] font-bold text-slate-700 uppercase block">Missing Factory Files MD</span>
                <span className="text-[9px] text-slate-450 block leading-relaxed">Detailed checklist reporting external CAD guidelines.</span>
              </div>
              <button
                onClick={() => downloadTextFile("missing_factory_files.md", exportMissingFactoryFilesMarkdown(project))}
                className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-1.5 rounded text-[9px] font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Markdown</span>
              </button>
            </div>
          </div>
        </div>

        {/* 7. FIRMWARE */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">7. Firmware</h2>
            <p className="text-[10px] text-slate-550">Dynamic driver code templates based on pinouts mapping.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[9.5px] font-bold text-slate-700 uppercase block">Firmware Skeleton (.ino)</span>
                <span className="text-[9px] text-slate-450 block leading-relaxed">Arduino C++ header pins mapping config stub.</span>
              </div>
              <button
                onClick={() => downloadTextFile("firmware_skeleton.ino", generateFirmwareSkeleton(project))}
                className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-1.5 rounded text-[9px] font-bold cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                <span>Export C++ code</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col justify-between space-y-2">
              <div>
                <span className="text-[9.5px] font-bold text-slate-700 uppercase block">Firmware Architecture JSON</span>
                <span className="text-[9px] text-slate-450 block leading-relaxed">Task priority loops scheduler config values list.</span>
              </div>
              <button
                onClick={() => downloadTextFile("firmware_architecture.json", exportFirmwareArchitectureJson(project), "application/json")}
                className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-1.5 rounded text-[9px] font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Limitations Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start space-x-3.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-amber-850 uppercase tracking-widest font-mono">Conceptual Engineering Limitations</h3>
            <p className="text-[11px] text-amber-800 leading-relaxed font-sans font-medium">
              Hardware Studio acts as a **planning and layout-preparation bridge**. Drawing grids, nets, pin allocations, and component coordinates downloaded here do **NOT** guarantee final physical copper tolerances automatically. Final engineering review, independent Gerber viewer review, and fab-house DFM validation are mandatory prior to mass factory production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
