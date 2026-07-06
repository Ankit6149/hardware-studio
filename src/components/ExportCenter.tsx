import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { exportProjectJson } from '../lib/exportJson';
import { exportProjectMarkdown } from '../lib/exportMarkdown';
import { exportBlueprintDossierMarkdown, exportBlueprintDossierJson } from '../lib/exportDossier';
import { generateFirmwareSkeleton } from '../lib/exportFirmware';
import { exportToCSV } from '../lib/exportCsv';
import { 
  Download, 
  Cpu, 
  Table, 
  ShieldAlert, 
  FolderLock, 
  AlertTriangle
} from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { exportBlueprintSheetsMarkdown, exportBlueprintSheetsJson, exportBlueprintSheetsHtml } from '../lib/exportBlueprintSheets';
import {
  exportEditorLayoutsJson,
  exportConceptualPlacementCsv,
  exportConceptualSchematicJson,
  exportConceptualMechanicalLayoutJson,
  exportConceptualNetRoutingJson,
  exportFirmwareArchitectureJson,
  exportTestingPlanJson,
  exportFactoryReadinessJson,
  exportMissingFactoryFilesMarkdown,
  exportHandoffManifestJson,
  generateNativeGerberCopperTop,
  generateNativeGerberCopperBottom,
  generateNativeExcellonDrills
} from '../lib/nativeExports';

export const ExportCenter: React.FC = () => {
  const project = useProjectStore();
  const { 
    bom = [], 
    powerBudget = [],
    pinMap = [],
    boards = [],
    circuitBlocks = [],
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

  // CSV Exporters
  const downloadBomCsv = () => {
    const headers = ["Block Name", "Candidate Component", "Part Number", "Stage", "Quantity", "Cost Estimate ($)", "Supplier", "Datasheet URL", "Status", "Notes"];
    const rows = bom.map(item => [
      item.blockName,
      item.candidateComponent || '',
      item.partNumber || '',
      item.stage || '',
      item.quantity || 1,
      item.costEstimate || 0,
      item.supplier || '',
      item.datasheetUrl || '',
      item.status || 'Planned',
      item.notes || ''
    ]);
    exportToCSV("bom_sheet.csv", headers, rows);
  };

  const downloadPowerCsv = () => {
    const headers = ["Load Block Name", "Operating Voltage (V)", "Active Current (mA)", "Sleep Current (uA)", "Duty Cycle (%)", "Quantity", "Notes"];
    const rows = powerBudget.map(item => [
      item.blockName,
      item.voltage || '',
      item.activeCurrentMa || 0,
      item.sleepCurrentUa || 0,
      item.dutyCyclePercent || 0,
      item.quantity || 1,
      item.notes || ''
    ]);
    exportToCSV("power_budget_sheet.csv", headers, rows);
  };

  const downloadPinMapCsv = () => {
    const headers = ["Signal Name", "Connected Block", "MCU Pin", "Direction", "Interface Protocol", "Signal Voltage", "Notes"];
    const rows = pinMap.map(item => [
      item.signalName,
      item.connectedBlock,
      item.mcuPin,
      item.direction,
      item.protocol,
      item.voltage,
      item.notes || ''
    ]);
    exportToCSV("pin_map_sheet.csv", headers, rows);
  };

  const downloadBoardsCsv = () => {
    const headers = ["Board Name", "Board Type", "Product Area", "Purpose", "Dimensions (mm)", "Layer Count", "Substrate", "Placement", "Mounting Notes", "Connector Notes", "Thermal Notes", "RF Notes", "Status"];
    const rows = boards.map(b => [
      b.name,
      b.boardType,
      b.linkedProductArea || '',
      b.purpose || '',
      b.dimensionsMm || '',
      b.layerCount || 2,
      b.substrate || 'FR4',
      b.placement || '',
      b.mountingNotes || '',
      b.connectorNotes || '',
      b.thermalNotes || '',
      b.rfNotes || '',
      b.status || ''
    ]);
    exportToCSV("boards_outline_sheet.csv", headers, rows);
  };

  const downloadCircuitsCsv = () => {
    const headers = ["Circuit Name", "Circuit Type", "Board", "Description", "Required Components", "Reference Designators", "Power Nets", "Signal Nets", "Interface Type", "Status"];
    const rows = circuitBlocks.map(c => [
      c.name,
      c.circuitType,
      boards.find(b => b.id === c.boardId)?.name || 'Unknown',
      c.description || '',
      c.requiredComponents || '',
      c.referenceDesignators || '',
      c.powerNets || '',
      c.signalNets || '',
      c.interfaceType || '',
      c.status || ''
    ]);
    exportToCSV("circuits_sheet.csv", headers, rows);
  };

  const downloadComponentsCsv = () => {
    const headers = ["Reference Designator", "Component Name", "Component Type", "Value", "Package", "Footprint", "Part Number", "Quantity", "Side", "Placement Criticality", "Notes"];
    const rows = boardComponents.map(c => [
      c.referenceDesignator,
      c.componentName,
      c.componentType,
      c.value || '',
      c.packageName || '',
      c.footprint || '',
      c.partNumber || '',
      c.quantity || 1,
      c.side || 'Top',
      c.placementCriticality || 'Medium',
      c.notes || ''
    ]);
    exportToCSV("components_placement_sheet.csv", headers, rows);
  };

  const downloadNetlistCsv = () => {
    const headers = ["Net Name", "Net Type", "Voltage", "Source Component", "Source Pin", "Target Component", "Target Pin", "Protocol", "Current Estimate", "Impedance Requirement", "Notes"];
    const rows = nets.map(n => [
      n.netName,
      n.netType,
      n.voltage || '',
      n.sourceComponent || '',
      n.sourcePin || '',
      n.targetComponent || '',
      n.targetPin || '',
      n.protocol || '',
      n.currentEstimate || '',
      n.impedanceRequirement || '',
      n.notes || ''
    ]);
    exportToCSV("netlist_sheet.csv", headers, rows);
  };

  const downloadConstraintsCsv = () => {
    const headers = ["Constraint Type", "Parameter Value", "Unit", "Severity", "Description"];
    const rows = pcbConstraints.map(c => [
      c.constraintType,
      c.value,
      c.unit || '',
      c.severity || 'Info',
      c.description || ''
    ]);
    exportToCSV("pcb_constraints_sheet.csv", headers, rows);
  };

  const downloadChecklistCsv = () => {
    const headers = ["Category", "Verification Check Item", "Status", "Owner Notes", "Blocking Reason"];
    const rows = manufacturingChecklist.map(m => [
      m.category,
      m.item,
      m.status,
      m.ownerNotes || '',
      m.blockingReason || ''
    ]);
    exportToCSV("manufacturing_checklist_sheet.csv", headers, rows);
  };

  const downloadEditorLayoutCsv = () => {
    const headers = ["Object ID", "Editor Mode", "Source Type", "Source ID", "Label", "Kind / Symbol", "X position", "Y position", "Width", "Height", "Rotation (deg)", "Layer"];
    const rows: (string | number)[][] = [];
    Object.entries(project.editorLayouts || {}).forEach(([, list]) => {
      if (Array.isArray(list)) {
        list.forEach(obj => {
          rows.push([
            obj.id,
            obj.mode,
            obj.sourceType,
            obj.sourceId || '',
            obj.label,
            obj.kind,
            obj.x,
            obj.y,
            obj.width,
            obj.height,
            obj.rotation || 0,
            obj.layer || ''
          ]);
        });
      }
    });
    exportToCSV("blueprint_editor_layout.csv", headers, rows);
  };

  const downloadFactoryFilesCsv = () => {
    const headers = ["File Key", "Handoff Status", "Source CAD", "File Name", "Notes"];
    const rows = Object.entries(project.factoryFiles || {}).map(([key, val]) => [
      key.replace(/([A-Z])/g, ' $1'),
      val.status,
      val.source || '',
      val.fileName || '',
      val.notes || ''
    ]);
    exportToCSV("factory_files_checklist.csv", headers, rows);
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 flex flex-col items-center select-none font-sans">
      <div className="w-full max-w-4xl space-y-6">
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight uppercase font-mono">Project Export Center</h1>
          <p className="text-xs text-slate-550 mt-0.5">Download blueprint packages, native CAD layouts, C++ state machine drivers, and CSV tables.</p>
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

        {/* SECTION 1: PROJECT BACKUPS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">1. Project Backups & Databases</h2>
            <p className="text-[10px] text-slate-550">Restore or sync your complete project planning data (nodes, BOM, nets, checklist, layouts).</p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => exportProjectJson(project)}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded text-[10px] font-bold transition-all border border-slate-950 cursor-pointer shadow-sm"
              title="Full project backup including layouts"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Full project_blueprint.json (Generated In App)</span>
            </button>
            <button
              onClick={() => exportProjectMarkdown(project)}
              className="flex items-center space-x-1.5 bg-white hover:bg-slate-50 text-slate-650 px-3.5 py-2 rounded text-[10px] font-bold transition-all border border-slate-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
              title="Markdown overview report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Project Summary.md (Generated In App)</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: BLUEPRINT DOCUMENTS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">2. Blueprint Dossier & Sheets Pack</h2>
            <p className="text-[10px] text-slate-500">Download the consolidated 16 drawing sheets pack in markdown, web HTML, or JSON format.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded p-3 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] font-bold text-slate-700 uppercase block">Blueprint Dossier (Consolidated)</span>
                <span className="text-[9px] text-slate-450 block leading-relaxed">Comprehensive technical dossier detailing all planning tables.</span>
              </div>
              <div className="flex space-x-2 pt-1">
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

            <div className="md:col-span-3 bg-slate-50 border border-slate-200 rounded p-3 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] font-bold text-slate-700 uppercase block">16 Blueprint Sheets Drawing Pack</span>
                <span className="text-[9px] text-slate-450 block leading-relaxed">Drawing borders, title blocks, and coordinate ticks (SH 01 to SH 16).</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1">
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

        {/* SECTION 3: NATIVE IN-APP ENGINEERING EXPORTS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3.5">
          <div>
            <div className="flex items-center space-x-1.5">
              <FolderLock className="w-4 h-4 text-emerald-600" />
              <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">3. Native In-App Engineering Exports</h2>
            </div>
            <p className="text-[10px] text-slate-500">Visual mapping and parameters exported directly from the active Blueprint Editor. Pre-layout conceptual data.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
             {[
              {
                name: "Editor Layout JSON",
                desc: "Export absolute coordinates and sizes of all active visual objects.",
                action: () => downloadTextFile("blueprint_editor_layout.json", exportEditorLayoutsJson(project), "application/json"),
                conceptual: true
              },
              {
                name: "Top Copper Gerber (RS-274X)",
                desc: "Valid RS-274X layout Gerber artwork format top copper trace lines and apertures.",
                action: () => downloadTextFile("top_copper.gbr", generateNativeGerberCopperTop(project)),
                conceptual: false
              },
              {
                name: "Bottom Copper Gerber (RS-274X)",
                desc: "Valid RS-274X layout Gerber artwork format bottom copper trace lines and apertures.",
                action: () => downloadTextFile("bottom_copper.gbr", generateNativeGerberCopperBottom(project)),
                conceptual: false
              },
              {
                name: "NC Excellon Drill (DRL)",
                desc: "Valid Excellon NC drill format specifying tool hole diameters and coordinates list.",
                action: () => downloadTextFile("drills.drl", generateNativeExcellonDrills(project)),
                conceptual: false
              },
              {
                name: "Conceptual Placement CSV",
                desc: "SMT pick-and-place centroid placements (RefDes, footprint, XY positions, mount side).",
                action: () => downloadTextFile("conceptual_cpl.csv", exportConceptualPlacementCsv(project)),
                conceptual: true
              },
              {
                name: "Schematic Prep JSON",
                desc: "Circuit blocks logic, reference designators mappings, and electrical ports.",
                action: () => downloadTextFile("schematic_prep.json", exportConceptualSchematicJson(project), "application/json"),
                conceptual: true
              },
              {
                name: "Mechanical Layout JSON",
                desc: "Mechanical casing bounds, diameters, mounting slots, and resin notes.",
                action: () => downloadTextFile("mechanical_layout.json", exportConceptualMechanicalLayoutJson(project), "application/json"),
                conceptual: true
              },
              {
                name: "Net Routing JSON",
                desc: "Traces voltage ratings, current estimations, and microstrip matching rules.",
                action: () => downloadTextFile("nets_routing.json", exportConceptualNetRoutingJson(project), "application/json"),
                conceptual: true
              },
              {
                name: "Firmware Architecture JSON",
                desc: "State machine transitions, scheduler task loops, and physical pin drivers.",
                action: () => downloadTextFile("firmware_architecture.json", exportFirmwareArchitectureJson(project), "application/json"),
                conceptual: true
              },
              {
                name: "Testing Plan JSON",
                desc: "Verification stages breakdown (EVT, DVT, PVT) and pass evidence logs.",
                action: () => downloadTextFile("testing_plan.json", exportTestingPlanJson(project), "application/json"),
                conceptual: true
              },
              {
                name: "Factory Readiness JSON",
                desc: "Readiness categories calculation, open blockers count, and gateway release flags.",
                action: () => downloadTextFile("factory_readiness_report.json", exportFactoryReadinessJson(project), "application/json"),
                conceptual: true
              },
              {
                name: "Missing Factory Files MD",
                desc: "Checklist report highlighting CAD source gaps and guidelines to resolve them.",
                action: () => downloadTextFile("missing_factory_files.md", exportMissingFactoryFilesMarkdown(project)),
                conceptual: true
              },
              {
                name: "Handoff Manifest JSON",
                desc: "Release manifest compile detailing metadata, completed checkers, and revision stamps.",
                action: () => downloadTextFile("handoff_manifest.json", exportHandoffManifestJson(project), "application/json"),
                conceptual: true
              }
            ].map((exp, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200 rounded p-3 flex flex-col justify-between hover:border-slate-350 transition-all">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-bold text-slate-700 block">{exp.name}</span>
                  <span className="text-[9px] text-slate-450 leading-relaxed block font-sans">{exp.desc}</span>
                </div>
                <button
                  onClick={exp.action}
                  className="mt-3 w-full flex items-center justify-center space-x-1 bg-white hover:bg-slate-100 text-slate-655 border border-slate-250 py-1 rounded text-[9px] font-bold cursor-pointer"
                >
                  <Download className="w-3 h-3 text-slate-400" />
                  <span>Download{exp.conceptual ? " (Conceptual)" : ""}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: ENGINEERING CSVS */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-150 py-3.5">
            <div className="flex items-center space-x-2">
              <Table className="w-4 h-4 text-slate-600" />
              <CardTitle>4. Engineering Spreadsheet Tables (CSVs)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: "BOM Sourcing List", count: bom.length, download: downloadBomCsv, type: "Generated In App" },
                { name: "Power Load Estimator", count: powerBudget.length, download: downloadPowerCsv, type: "Generated In App" },
                { name: "MCU Pin Mappings", count: pinMap.length, download: downloadPinMapCsv, type: "Generated In App" },
                { name: "Boards Substrates", count: boards.length, download: downloadBoardsCsv, type: "Generated In App" },
                { name: "Circuit Blocks", count: circuitBlocks.length, download: downloadCircuitsCsv, type: "Generated In App" },
                { name: "Placed Components", count: boardComponents.length, download: downloadComponentsCsv, type: "Conceptual" },
                { name: "Nets Routing Tracks", count: nets.length, download: downloadNetlistCsv, type: "Generated In App" },
                { name: "PCB Constraints", count: pcbConstraints.length, download: downloadConstraintsCsv, type: "Generated In App" },
                { name: "Manufacturing Checklist", count: manufacturingChecklist.length, download: downloadChecklistCsv, type: "Generated In App" },
                { name: "Editor Layout Objects", count: totalLayoutObjs, download: downloadEditorLayoutCsv, type: "Conceptual" },
                { name: "Factory File Statuses", count: Object.keys(project.factoryFiles || {}).length, download: downloadFactoryFilesCsv, type: "Conceptual" }
              ].map((sheet, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between hover:border-slate-350 transition-all">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-bold text-slate-755 block">{sheet.name}</span>
                    <div className="flex items-center space-x-1.5 text-[8.5px] font-mono text-slate-450">
                      <span>{sheet.count} rows</span>
                      <span>•</span>
                      <span className={sheet.type === "Conceptual" ? "text-amber-500 font-semibold" : "text-emerald-500 font-semibold"}>{sheet.type}</span>
                    </div>
                  </div>
                  <button
                    onClick={sheet.download}
                    className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-650 cursor-pointer"
                    title="Download CSV"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SECTION 5: FIRMWARE SKELETON */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div>
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider font-mono">5. MCU Firmware Code Skeleton</h2>
            <p className="text-[10px] text-slate-500">C++ state machine code template (.ino) mapping microcontroller pins and scheduling tasks generated dynamically.</p>
          </div>
          <div>
            <button
              onClick={() => downloadTextFile("firmware_skeleton.ino", generateFirmwareSkeleton(project))}
              className="flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-[10px] font-bold cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-455" />
              <span>Download firmware_skeleton.ino (Generated In App)</span>
            </button>
          </div>
        </div>

        {/* SECTION 6: MISSING FINAL FACTORY FILES CHECKLIST */}
        <div className="bg-white border border-rose-150 rounded-xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <h2 className="text-xs font-black text-rose-700 uppercase tracking-wider font-mono">6. Missing Final Factory Files (Production checklist)</h2>
          </div>
          <p className="text-[10px] text-slate-500">These files are mandatory for direct factory PCB fabrication and casing manufacturing. They cannot be generated in-app.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="bg-rose-50/50 border border-rose-200 rounded p-3 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] font-bold text-rose-800 uppercase block">Gaps & Instructions Checklist</span>
                <span className="text-[9px] text-slate-500 block leading-relaxed">Detailed report on what files are missing, why they are needed, and how to create them in external CAD.</span>
              </div>
              <button
                onClick={() => downloadTextFile("missing_factory_files.md", exportMissingFactoryFilesMarkdown(project))}
                className="w-full flex items-center justify-center space-x-1.5 bg-rose-700 hover:bg-rose-600 text-white py-1.5 rounded text-[9px] font-bold cursor-pointer border border-rose-800"
              >
                <Download className="w-3 h-3" />
                <span>Download missing_factory_files.md (Conceptual Checklist)</span>
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2 flex flex-col justify-between">
              <div>
                <span className="text-[9.5px] font-bold text-slate-700 uppercase block">Factory Readiness Index</span>
                <span className="text-[9px] text-slate-500 block leading-relaxed">Overall gating metrics. Direct fabrication ready index remains locked until required final files are verified.</span>
              </div>
              <button
                onClick={() => downloadTextFile("factory_readiness_report.json", exportFactoryReadinessJson(project), "application/json")}
                className="w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white py-1.5 rounded text-[9px] font-bold cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>Download factory_readiness.json (Conceptual Index)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Honest Limitations Panel */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start space-x-3.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-amber-850 uppercase tracking-widest font-mono">Conceptual Engineering Limitations</h3>
            <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
              Hardware Studio acts as a **planning and layout-preparation bridge**. Drawing grids, nets, pin allocations, and component coordinates downloaded here do **NOT** constitute manufacturing Gerber artwork or certified electronics schematics. You must verify these values inside professional layouts tools (e.g. KiCad, Altium Designer, or EasyEDA) and perform formal reviews before submitting to factories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
