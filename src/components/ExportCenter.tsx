import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { exportProjectJson } from '../lib/exportJson';
import { exportProjectMarkdown } from '../lib/exportMarkdown';
import { exportBlueprintDossierMarkdown, exportBlueprintDossierJson } from '../lib/exportDossier';
import { generateFirmwareSkeleton } from '../lib/exportFirmware';
import { exportBoardPlanJson } from '../lib/exportBoardPlan';
import { exportToCSV } from '../lib/exportCsv';
import { FileJson, FileText, Download, Cpu, Layers, Table, Info } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { exportBlueprintSheetsMarkdown, exportBlueprintSheetsJson, exportBlueprintSheetsHtml } from '../lib/exportBlueprintSheets';

export const ExportCenter: React.FC = () => {
  const project = useProjectStore();
  const { 
    nodes = [], 
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
  
  const stats = [
    { label: "Blueprint Blocks", value: nodes.filter(n => n.type !== 'boundaryNode').length },
    { label: "Active PCBs / Flex", value: boards.length },
    { label: "BOM Part Rows", value: bom.length },
    { label: "Netlist Traces", value: nets.length },
    { label: "PCB Constraints", value: pcbConstraints.length },
    { label: "Checklist Items", value: manufacturingChecklist.length }
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

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 flex flex-col items-center select-none font-sans">
      <div className="w-full max-w-4xl space-y-6">
        <div>
          <h1 className="text-base font-black text-slate-800 tracking-tight uppercase font-mono">Project Export Center</h1>
          <p className="text-xs text-slate-550 mt-0.5">Compile blueprints, dossiers, netlists, C++ skeletons, and download CSV sheets.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
              <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest block font-mono">{s.label}</span>
              <span className="text-lg font-black text-slate-800 mt-1 block font-mono">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Master Exporters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Blueprint Dossier Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-650">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-black text-slate-850 uppercase tracking-wider font-mono">Blueprint Dossier Export</h2>
              <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
                Compile a detailed executive, mechanical, electrical, and validation dossier report including structural layout tables, pin assignments, power profiles, and design heuristics warnings.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => downloadTextFile("blueprint_dossier.md", exportBlueprintDossierMarkdown(project))}
                className="flex-1 flex items-center justify-center space-x-1 bg-slate-900 hover:bg-slate-805 text-white py-1.8 rounded text-[10px] font-bold transition-all border border-slate-950 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Dossier Markdown</span>
              </button>
              <button
                onClick={() => downloadTextFile("blueprint_dossier.json", exportBlueprintDossierJson(project), "application/json")}
                className="flex-1 flex items-center justify-center space-x-1 bg-white hover:bg-slate-50 text-slate-650 py-1.8 rounded text-[10px] font-bold transition-all border border-slate-200 cursor-pointer"
              >
                <FileJson className="w-3.5 h-3.5 text-slate-450" />
                <span>Dossier JSON</span>
              </button>
            </div>
          </div>

          {/* ECAD Prep Data package */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-black text-slate-850 uppercase tracking-wider font-mono">ECAD Prep & Code skeleton</h2>
              <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
                Download a JSON schema mapping boards, functional netlists, constraints, and reference designators. Download a matching C++ state driver skeleton file to boot MCU pins.
              </p>
            </div>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => downloadTextFile("ecad_prep.json", exportBoardPlanJson(project), "application/json")}
                className="flex-1 flex items-center justify-center space-x-1 bg-slate-900 hover:bg-slate-805 text-white py-1.8 rounded text-[10px] font-bold transition-all border border-slate-950 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ECAD JSON Prep</span>
              </button>
              <button
                onClick={() => downloadTextFile("firmware_skeleton.ino", generateFirmwareSkeleton(project))}
                className="flex-1 flex items-center justify-center space-x-1 bg-white hover:bg-slate-50 text-slate-650 py-1.8 rounded text-[10px] font-bold transition-all border border-slate-200 cursor-pointer"
              >
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                <span>C++ Driver (.ino)</span>
              </button>
            </div>
          </div>

          {/* Blueprint Drawing Pack */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-9 h-9 rounded bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-650">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-xs font-black text-slate-850 uppercase tracking-wider font-mono">Blueprint Drawing Pack</h2>
              <p className="text-[11px] text-slate-550 leading-relaxed font-sans">
                Download all 12 visual engineering sheets as print-ready markdown, technical layout documents, or serialized design data.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => downloadTextFile("blueprint_sheets.md", exportBlueprintSheetsMarkdown(project))}
                className="flex items-center justify-center space-x-1 bg-slate-900 hover:bg-slate-805 text-white py-1.8 rounded text-[9px] font-bold transition-all border border-slate-950 cursor-pointer"
              >
                <Download className="w-3 h-3 text-slate-100" />
                <span>MD</span>
              </button>
              <button
                onClick={() => downloadTextFile("blueprint_sheets.html", exportBlueprintSheetsHtml(project), "text/html")}
                className="flex items-center justify-center space-x-1 bg-white hover:bg-slate-50 text-slate-650 py-1.8 rounded text-[9px] font-bold transition-all border border-slate-200 cursor-pointer"
              >
                <Download className="w-3 h-3 text-slate-400" />
                <span>HTML</span>
              </button>
              <button
                onClick={() => downloadTextFile("blueprint_sheets.json", exportBlueprintSheetsJson(project), "application/json")}
                className="flex items-center justify-center space-x-1 bg-white hover:bg-slate-50 text-slate-650 py-1.8 rounded text-[9px] font-bold transition-all border border-slate-200 cursor-pointer"
              >
                <FileJson className="w-3 h-3 text-slate-450" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* CSV Sheets export */}
        <Card className="bg-white border border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b border-slate-150 py-3.5">
            <div className="flex items-center space-x-2">
              <Table className="w-4 h-4 text-slate-600" />
              <CardTitle>Engineering Spreadsheets (CSV Downloads)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { name: "BOM Sourcing List", count: bom.length, download: downloadBomCsv },
                { name: "Power Load Estimator", count: powerBudget.length, download: downloadPowerCsv },
                { name: "MCU Pin Mappings", count: pinMap.length, download: downloadPinMapCsv },
                { name: "Boards Substrates", count: boards.length, download: downloadBoardsCsv },
                { name: "Circuit Blocks", count: circuitBlocks.length, download: downloadCircuitsCsv },
                { name: "Placed Components", count: boardComponents.length, download: downloadComponentsCsv },
                { name: "Nets Routing Tracks", count: nets.length, download: downloadNetlistCsv },
                { name: "PCB Constraints", count: pcbConstraints.length, download: downloadConstraintsCsv },
                { name: "Manufacturing Checklist", count: manufacturingChecklist.length, download: downloadChecklistCsv }
              ].map((sheet, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex items-center justify-between hover:border-slate-350 transition-all">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-750 block">{sheet.name}</span>
                    <span className="text-[9px] font-semibold text-slate-450 block font-mono">{sheet.count} {sheet.count === 1 ? 'row' : 'rows'}</span>
                  </div>
                  <button
                    onClick={sheet.download}
                    className="p-1.5 rounded bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-650 transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
                    title="Download CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Backups & Legacy imports */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider font-mono text-slate-800">Raw Canvas Workspace Backup</span>
            <p className="text-[11px] text-slate-550 leading-normal">
              Download the complete system state including node positions, connections, metadata, and tables for recovery.
            </p>
          </div>
          <div className="flex space-x-3 shrink-0">
            <button
              onClick={() => exportProjectJson(project)}
              className="flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded text-[10px] font-bold transition-all border border-slate-950 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>project_blueprint.json</span>
            </button>
            <button
              onClick={() => exportProjectMarkdown(project)}
              className="flex items-center space-x-1 bg-white hover:bg-slate-50 text-slate-650 px-4 py-2 rounded text-[10px] font-bold transition-all border border-slate-200 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>project_blueprint.md</span>
            </button>
          </div>
        </div>

        {/* CAD / PCB Notice */}
        <div className="bg-slate-150/40 border border-slate-200 rounded-xl p-5 flex items-start space-x-3.5">
          <Info className="w-4 h-4 text-slate-650 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-slate-850 uppercase tracking-widest font-mono">Conceptual Engineering Limitations</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Hardware Studio acts as a **planning and layout-preparation bridge**. Blueprints, nets, pin allocations, and constraints downloaded here do **NOT** constitute manufacturing Gerbers or certified schematics. You must verify these values inside professional layouts tools (e.g. KiCad, Altium Designer, or EasyEDA) and perform formal reviews before submitting to factories.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
