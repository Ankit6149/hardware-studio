import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { calculateReadinessScore } from '../lib/readinessScore';
import { 
  exportBlueprintSheetsMarkdown, 
  exportBlueprintSheetsJson,
  exportBlueprintSheetsHtml 
} from '../lib/exportBlueprintSheets';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Download, 
  Printer, 
  CheckCircle
} from 'lucide-react';

import { BlueprintPageLayout } from './blueprints/BlueprintPageLayout';
import { CoverSheet } from './blueprints/sheets/CoverSheet';
import { 
  ArchitectureSheet, 
  OuterShellSheet, 
  InternalLayoutSheet, 
  ExplodedAssemblySheet 
} from './blueprints/sheets/MechanicalSheets';
import { 
  BoardSpecsSheet, 
  StackupConstraintsSheet, 
  ComponentPlacementSheet 
} from './blueprints/sheets/PCBSheets';
import { 
  CircuitSchematicSheet, 
  NetRoutingSheet, 
  PowerTreeSheet, 
  PinMapSheet 
} from './blueprints/sheets/ElectricalSheets';
import { 
  FirmwareArchitectureSheet, 
  TestingValidationSheet 
} from './blueprints/sheets/SoftwareQASheets';
import { 
  MfgChecklistSheet, 
  MissingFilesSheet 
} from './blueprints/sheets/HandoffSheets';

export const BlueprintSheets: React.FC = () => {
  const project = useProjectStore();
  const { 
    projectName, 
    version = "1.0",
    nodes = [], 
    testing = [],
    powerBudget = [],
    pinMap = [],
    firmwareTasks = [],
    boards = [],
    circuitBlocks = [],
    boardComponents = [],
    nets = [],
    pcbConstraints = [],
    manufacturingChecklist = []
  } = project;

  const report = calculateReadinessScore(project);
  const [activeSheet, setActiveSheet] = useState<number>(1);
  const [copiedAlert, setCopiedAlert] = useState<string | null>(null);

  const sheets = [
    { num: 1, name: "Cover / Product Release Index", group: "0. RELEASE INDEX", desc: "Global system release gates, statistics, and disclaimers" },
    { num: 2, name: "Product Architecture Blueprint", group: "1. MECHANICAL & ARCHITECTURE", desc: "Logical subsystem category layout and data routing flows" },
    { num: 3, name: "Mechanical Outer Shell Blueprint", group: "1. MECHANICAL & ARCHITECTURE", desc: "Enclosure dimensions, touch pads, battery cavities, and waterproofing rules" },
    { num: 4, name: "Internal Layout Blueprint", group: "1. MECHANICAL & ARCHITECTURE", desc: "Board internal layout, battery pouch slots, sensor positioning, and thermal paths" },
    { num: 5, name: "Exploded Assembly Blueprint", group: "1. MECHANICAL & ARCHITECTURE", desc: "Vertical mechanical layer stacking sequence and assembly method details" },
    { num: 6, name: "Board / PCB Blueprint", group: "2. PCB / BOARD BLUEPRINTS", desc: "Active PCB layout specifications, layer counts, and substrate parameters" },
    { num: 7, name: "PCB Stackup & Constraint Blueprint", group: "2. PCB / BOARD BLUEPRINTS", desc: "PCB layer stack thickness and physical constraints profiles" },
    { num: 8, name: "Component Placement Blueprint", group: "2. PCB / BOARD BLUEPRINTS", desc: "Reference designators placement concept grid and side placement index" },
    { num: 9, name: "Electrical Circuit Blueprint Pack", group: "3. ELECTRICAL & CIRCUITS", desc: "Functional schematic module preparation block diagrams" },
    { num: 10, name: "Net Routing Blueprint", group: "3. ELECTRICAL & CIRCUITS", desc: "Logical netlist signaling buses, voltage rails, and ground planes" },
    { num: 11, name: "Power Tree Blueprint", group: "3. ELECTRICAL & CIRCUITS", desc: "Regulation stages power tree flow, duty cycles, and battery lifetime estimates" },
    { num: 12, name: "Pin Map / MCU Interface Blueprint", group: "3. ELECTRICAL & CIRCUITS", desc: "MCU pin assignment signals, protocols, and terminal connections" },
    { num: 13, name: "Firmware Architecture Blueprint", group: "4. SOFTWARE & FIRMWARE", desc: "Device scheduled firmware loop state-machine states and drivers mapping" },
    { num: 14, name: "Testing & Validation Blueprint", group: "5. QUALITY & VALIDATION", desc: "Horizontal validation gates (EVT/DVT/PVT) testing checklist and logs" },
    { num: 15, name: "Manufacturing Handoff Blueprint", group: "6. MANUFACTURING HANDOFF", desc: "Pre-layout manufacturing checklists check and blockers audit log" },
    { num: 16, name: "Missing Files / Factory Readiness Sheet", group: "6. MANUFACTURING HANDOFF", desc: "Critical external assets and CAD design files required before factory fab release" }
  ];

  // Dynamic status evaluation helper
  const getSheetStatus = (num: number): { label: string; variant: 'success' | 'warning' | 'error' | 'neutral' } => {
    switch (num) {
      case 1:
      case 16:
        return { label: "Complete", variant: "success" };
      case 2:
        return nodes.filter(n => n.type !== 'boundaryNode').length > 0 
          ? { label: "Complete", variant: "success" } 
          : { label: "Missing", variant: "error" };
      case 3:
        const outline = pcbConstraints.find(c => c.constraintType === 'Board Outline');
        return outline && outline.value && outline.value !== "0 x 0"
          ? { label: "Complete", variant: "success" } 
          : { label: "Warning", variant: "warning" };
      case 4:
      case 5:
        return nodes.length > 0 
          ? { label: "Complete", variant: "success" } 
          : { label: "Warning", variant: "warning" };
      case 6:
        return boards.length > 0 
          ? (boards.some(b => !b.dimensionsMm || b.dimensionsMm === "0 x 0") ? { label: "Partial", variant: "warning" } : { label: "Complete", variant: "success" }) 
          : { label: "Missing", variant: "error" };
      case 7:
        return pcbConstraints.length > 0 
          ? { label: "Complete", variant: "success" } 
          : { label: "Warning", variant: "warning" };
      case 8:
        const missingFootprintCount = boardComponents.filter(c => !c.footprint || c.footprint.toUpperCase().includes("REQUIRED")).length;
        return boardComponents.length > 0 
          ? (missingFootprintCount > 0 ? { label: `${missingFootprintCount} Missing FP`, variant: "warning" } : { label: "Complete", variant: "success" }) 
          : { label: "Warning", variant: "warning" };
      case 9:
        return circuitBlocks.length > 0 
          ? { label: "Complete", variant: "success" } 
          : { label: "Warning", variant: "warning" };
      case 10:
        const hasGND = nets.some(n => n.netName.toUpperCase() === 'GND' || n.netType === 'Ground');
        return nets.length > 0 
          ? (!hasGND ? { label: "No GND Pin", variant: "error" } : { label: "Complete", variant: "success" }) 
          : { label: "Warning", variant: "warning" };
      case 11:
        return powerBudget.length > 0 
          ? { label: "Complete", variant: "success" } 
          : { label: "Warning", variant: "warning" };
      case 12:
        return pinMap.length > 0 
          ? { label: "Complete", variant: "success" } 
          : { label: "Warning", variant: "warning" };
      case 13:
        return firmwareTasks.length > 0 
          ? { label: "Complete", variant: "success" } 
          : { label: "Warning", variant: "warning" };
      case 14:
        const failedCount = testing.filter(t => t.status === 'Failed').length;
        return testing.length > 0 
          ? (failedCount > 0 ? { label: `${failedCount} Failed`, variant: "error" } : { label: "Complete", variant: "success" }) 
          : { label: "Warning", variant: "warning" };
      case 15:
        const blockedCount = manufacturingChecklist.filter(m => m.status === 'Blocked').length;
        return manufacturingChecklist.length > 0 
          ? (blockedCount > 0 ? { label: `${blockedCount} Blocked`, variant: "error" } : { label: "Complete", variant: "success" }) 
          : { label: "Warning", variant: "warning" };
      default:
        return { label: "Draft", variant: "neutral" };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const triggerToast = (msg: string) => {
    setCopiedAlert(msg);
    setTimeout(() => setCopiedAlert(null), 4000);
  };

  const downloadTextFile = (filename: string, content: string, mimeType = "text/plain") => {
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

  const renderActiveSheet = () => {
    switch (activeSheet) {
      case 1: return <CoverSheet project={project} report={report} />;
      case 2: return <ArchitectureSheet project={project} report={report} />;
      case 3: return <OuterShellSheet project={project} report={report} />;
      case 4: return <InternalLayoutSheet project={project} report={report} />;
      case 5: return <ExplodedAssemblySheet project={project} report={report} />;
      case 6: return <BoardSpecsSheet project={project} report={report} />;
      case 7: return <StackupConstraintsSheet project={project} report={report} />;
      case 8: return <ComponentPlacementSheet project={project} report={report} />;
      case 9: return <CircuitSchematicSheet project={project} report={report} />;
      case 10: return <NetRoutingSheet project={project} report={report} />;
      case 11: return <PowerTreeSheet project={project} report={report} />;
      case 12: return <PinMapSheet project={project} report={report} />;
      case 13: return <FirmwareArchitectureSheet project={project} report={report} />;
      case 14: return <TestingValidationSheet project={project} report={report} />;
      case 15: return <MfgChecklistSheet project={project} report={report} />;
      case 16: return <MissingFilesSheet project={project} report={report} />;
      default: return <CoverSheet project={project} report={report} />;
    }
  };

  const currentSheet = sheets.find(s => s.num === activeSheet)!;

  return (
    <div className="flex-1 flex min-h-0 bg-slate-100 font-sans print:bg-white print:p-0">
      
      {/* Print break configurations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          body > div:not(.print-pack-container),
          aside, nav, header, button, .print-hidden, .fixed {
            display: none !important;
          }
          .print-pack-container {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print-sheet-page {
            page-break-after: always;
            height: 100vh;
            padding: 2.5rem !important;
            box-sizing: border-box;
            background: white !important;
          }
        }
      `}} />

      {copiedAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-950 text-white rounded-lg px-4 py-3.5 shadow-xl max-w-sm flex items-center space-x-3 print:hidden">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-mono">{copiedAlert}</span>
        </div>
      )}

      {/* Selector Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col min-h-0 print:hidden select-none shrink-0 font-mono text-xs">
        <div className="p-4 border-b border-slate-150 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Blueprint Drawing Sheets</span>
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-tight">16 Drawing Sheets</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-slate-50/50">
          {sheets.map(s => {
            const statusInfo = getSheetStatus(s.num);
            return (
              <button
                key={s.num}
                onClick={() => setActiveSheet(s.num)}
                className={`w-full text-left px-3 py-2.5 rounded transition-all flex flex-col space-y-1 border cursor-pointer ${
                  activeSheet === s.num
                    ? 'bg-slate-900 border-slate-950 text-white shadow-sm font-bold'
                    : 'bg-white hover:bg-slate-50 border-slate-150 text-slate-650'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-[9px] font-bold uppercase tracking-wider block leading-normal w-[80%] truncate">
                    SH {s.num.toString().padStart(2, '0')}: {s.name}
                  </span>
                  <Badge variant={statusInfo.variant} className="scale-75 shrink-0 -mr-2 -mt-1 font-bold">
                    {statusInfo.label}
                  </Badge>
                </div>
                <span className={`text-[8.5px] leading-normal font-semibold block ${
                  activeSheet === s.num ? 'text-slate-350' : 'text-slate-450'
                }`}>
                  {s.group}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blueprint Canvas workspace */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6 space-y-6 print:hidden">
        
        {/* Controls Bar */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Drawing Sheet Workspace</span>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight font-mono">Sheet {activeSheet} of 16</h3>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              icon={<Printer className="w-4 h-4" />}
            >
              Print Sheet Pack
            </Button>
            <Button
              onClick={() => {
                downloadTextFile("blueprint_sheets.md", exportBlueprintSheetsMarkdown(project));
                triggerToast("Markdown blueprint sheets downloaded.");
              }}
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
            >
              Export MD
            </Button>
            <Button
              onClick={() => {
                downloadTextFile("blueprint_sheets.html", exportBlueprintSheetsHtml(project), "text/html");
                triggerToast("HTML blueprint sheets downloaded.");
              }}
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
            >
              Export HTML
            </Button>
            <Button
              onClick={() => {
                downloadTextFile("blueprint_sheets.json", exportBlueprintSheetsJson(project), "application/json");
                triggerToast("JSON blueprint sheets downloaded.");
              }}
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
            >
              Export JSON
            </Button>
          </div>
        </div>

        {/* Drafting Paper Sheet Container */}
        <BlueprintPageLayout
          sheetTitle={currentSheet.name}
          sheetNum={currentSheet.num}
          projectName={projectName}
          version={version}
          group={currentSheet.group}
        >
          {renderActiveSheet()}
        </BlueprintPageLayout>
      </div>

      {/* PRINT CONTAINER */}
      <div className="hidden print-pack-container">
        {sheets.map(s => {
          let sheetElement = <CoverSheet project={project} report={report} />;
          if (s.num === 2) sheetElement = <ArchitectureSheet project={project} report={report} />;
          if (s.num === 3) sheetElement = <OuterShellSheet project={project} report={report} />;
          if (s.num === 4) sheetElement = <InternalLayoutSheet project={project} report={report} />;
          if (s.num === 5) sheetElement = <ExplodedAssemblySheet project={project} report={report} />;
          if (s.num === 6) sheetElement = <BoardSpecsSheet project={project} report={report} />;
          if (s.num === 7) sheetElement = <StackupConstraintsSheet project={project} report={report} />;
          if (s.num === 8) sheetElement = <ComponentPlacementSheet project={project} report={report} />;
          if (s.num === 9) sheetElement = <CircuitSchematicSheet project={project} report={report} />;
          if (s.num === 10) sheetElement = <NetRoutingSheet project={project} report={report} />;
          if (s.num === 11) sheetElement = <PowerTreeSheet project={project} report={report} />;
          if (s.num === 12) sheetElement = <PinMapSheet project={project} report={report} />;
          if (s.num === 13) sheetElement = <FirmwareArchitectureSheet project={project} report={report} />;
          if (s.num === 14) sheetElement = <TestingValidationSheet project={project} report={report} />;
          if (s.num === 15) sheetElement = <MfgChecklistSheet project={project} report={report} />;
          if (s.num === 16) sheetElement = <MissingFilesSheet project={project} report={report} />;

          return (
            <div key={s.num} className="print-sheet-page">
              <BlueprintPageLayout
                sheetTitle={s.name}
                sheetNum={s.num}
                projectName={projectName}
                version={version}
                group={s.group}
              >
                {sheetElement}
              </BlueprintPageLayout>
            </div>
          );
        })}
      </div>

      {/* SVGs Marker settings */}
      <svg className="hidden w-0 h-0" aria-hidden="true">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
        </defs>
      </svg>

    </div>
  );
};
