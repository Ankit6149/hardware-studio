import React from 'react';
import { Project } from '../../../types';
import { ReadinessReport } from '../../../lib/readinessScore';

interface CoverSheetProps {
  project: Project;
  report: ReadinessReport;
}

export const CoverSheet: React.FC<CoverSheetProps> = ({ project, report }) => {
  const {
    projectName,
    description,
    templateName = "Custom Project",
    version = "1.0",
    nodes = [],
    bom = [],
    pinMap = [],
    firmwareTasks = [],
    testing = [],
    boards = [],
    circuitBlocks = [],
    boardComponents = [],
    nets = [],
    manufacturingChecklist = []
  } = project;

  // Determine current Release Status
  let releaseStatus = "DRAFT";
  if (report.canMoveToFabrication) {
    releaseStatus = "DIRECT FABRICATION READY";
  } else if (report.canMoveToFactoryHandoff) {
    releaseStatus = "FACTORY HANDOFF READY";
  } else if (report.canMoveToPrototype) {
    releaseStatus = "PROTOTYPE READY";
  } else if (report.isEditorLayoutReady) {
    releaseStatus = "EDITOR LAYOUT READY";
  } else if (report.isBlueprintPackReady) {
    releaseStatus = "BLUEPRINT PACK READY";
  } else if (report.isPlanningReady) {
    releaseStatus = "PLANNING READY";
  } else if (nodes.length > 0 && bom.length > 0) {
    releaseStatus = "CONCEPT DEVELOPMENT";
  }
  if (report.blockers.length > 0) {
    releaseStatus = "BLOCKED (CRITICAL ISSUES)";
  }

  const dateStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      
      {/* Decorative Title Border block */}
      <div className="border-4 border-slate-900 p-6 space-y-4 text-center bg-slate-50/50">
        <span className="text-[10px] font-black text-indigo-700 tracking-widest block uppercase">HARDWARE SYSTEM BLUEPRINT DRAWINGS</span>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase">{projectName}</h1>
        <div className="w-16 h-1 bg-slate-900 mx-auto" />
        <p className="text-[10px] text-slate-500 max-w-lg mx-auto italic font-sans normal-case leading-relaxed">{description || "No project description provided."}</p>
        
        <div className="flex justify-center space-x-6 text-[9px] font-bold text-slate-500 border-t border-slate-200 pt-3 max-w-md mx-auto">
          <div>TEMPLATE: <span className="text-slate-800">{templateName}</span></div>
          <div>VERSION: <span className="text-slate-800">{version}</span></div>
          <div>DATE: <span className="text-slate-800">{dateStr}</span></div>
        </div>
      </div>

      {/* Main stats block & gate blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Side: System Metrics Counts */}
        <div className="border border-slate-900 p-4 space-y-3 bg-white">
          <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest block">RELEASE INDEX STATISTICS</span>
          
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="border-b pb-1.5 flex justify-between">
              <span>PCBs COUNT:</span>
              <span className="font-bold">{boards.length}</span>
            </div>
            <div className="border-b pb-1.5 flex justify-between">
              <span>CIRCUITS BLOCKS:</span>
              <span className="font-bold">{circuitBlocks.length}</span>
            </div>
            <div className="border-b pb-1.5 flex justify-between">
              <span>BOM COMPONENT ROWS:</span>
              <span className="font-bold">{bom.length}</span>
            </div>
            <div className="border-b pb-1.5 flex justify-between">
              <span>PLACED FOOTPRINTS:</span>
              <span className="font-bold">{boardComponents.length}</span>
            </div>
            <div className="border-b pb-1.5 flex justify-between">
              <span>NETLIST TRACES:</span>
              <span className="font-bold">{nets.length}</span>
            </div>
            <div className="border-b pb-1.5 flex justify-between">
              <span>PIN MAP SIGNALS:</span>
              <span className="font-bold">{pinMap.length}</span>
            </div>
            <div className="border-b pb-1.5 flex justify-between">
              <span>FIRMWARE TASKS:</span>
              <span className="font-bold">{firmwareTasks.length}</span>
            </div>
            <div className="border-b pb-1.5 flex justify-between">
              <span>TEST PROCEDURES:</span>
              <span className="font-bold">{testing.length}</span>
            </div>
            <div className="col-span-2 border-b pb-1.5 flex justify-between">
              <span>MANUFACTURING CHECKLIST:</span>
              <span className="font-bold">{manufacturingChecklist.filter(m => m.status === 'Done').length}/{manufacturingChecklist.length} ITEMS</span>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center text-[10px] border-t border-dashed">
            <span className="font-bold">CRITICAL BLOCKERS:</span>
            <span className={`font-black ${report.blockers.length > 0 ? 'text-rose-600' : 'text-slate-500'}`}>{report.blockers.length} ITEMS</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="font-bold">DESIGN WARNINGS:</span>
            <span className={`font-black ${report.warnings.length > 0 ? 'text-amber-600' : 'text-slate-500'}`}>{report.warnings.length} ITEMS</span>
          </div>
        </div>

        {/* Right Side: Release Gates & Status */}
        <div className="border border-slate-900 p-4 space-y-3 flex flex-col justify-between bg-white">
          <div>
            <span className="text-[8px] font-black text-slate-450 uppercase tracking-widest block mb-2">GATEWAY AUDIT STATUS</span>
            <div className="space-y-1 text-[8.5px]">
              <div className="flex justify-between items-center border-b pb-0.5 font-mono">
                <span>01. PLANNING READY:</span>
                <span className={`font-bold ${report.isPlanningReady ? 'text-emerald-600' : 'text-slate-450'}`}>{report.isPlanningReady ? "PASSED" : "LOCKED"}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-0.5 font-mono">
                <span>02. BLUEPRINT PACK READY:</span>
                <span className={`font-bold ${report.isBlueprintPackReady ? 'text-emerald-600' : 'text-slate-455'}`}>{report.isBlueprintPackReady ? "PASSED" : "LOCKED"}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-0.5 font-mono">
                <span>03. EDITOR LAYOUT READY:</span>
                <span className={`font-bold ${report.isEditorLayoutReady ? 'text-emerald-600' : 'text-slate-455'}`}>{report.isEditorLayoutReady ? "PASSED" : "LOCKED"}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-0.5 font-mono">
                <span>04. PROTOTYPE PREP READY:</span>
                <span className={`font-bold ${report.canMoveToPrototype ? 'text-emerald-600' : 'text-slate-455'}`}>{report.canMoveToPrototype ? "PASSED" : "LOCKED"}</span>
              </div>
              <div className="flex justify-between items-center border-b pb-0.5 font-mono">
                <span>05. FACTORY HANDOFF READY:</span>
                <span className={`font-bold ${report.canMoveToFactoryHandoff ? 'text-emerald-600' : 'text-slate-455'}`}>{report.canMoveToFactoryHandoff ? "PASSED" : "LOCKED"}</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span>06. DIRECT FABRICATION READY:</span>
                <span className={`font-bold ${report.canMoveToFabrication ? 'text-emerald-600' : 'text-slate-455'}`}>{report.canMoveToFabrication ? "PASSED" : "LOCKED"}</span>
              </div>
            </div>
          </div>

          <div className="border-t pt-2 space-y-1">
            <span className="text-[7.5px] text-slate-400 block font-normal">RELEASE GATING PROFILE</span>
            <span className={`text-xs font-black block tracking-tight ${releaseStatus.startsWith('BLOCKED') ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>{releaseStatus}</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-2.5 text-[9px] leading-relaxed">
            <div className="font-bold text-slate-700">READINESS HEURISTICS VALUE: {report.overallScore}/100</div>
            <div className="text-slate-450 font-normal mt-0.5 font-sans leading-relaxed">Must resolve blockers to release ECAD layout JSON files.</div>
          </div>
        </div>
      </div>

      {/* Safety Stamp Warning box */}
      <div className="border-2 border-dashed border-rose-400 bg-rose-50/20 p-4 rounded text-center space-y-1">
        <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest block">▲ STAMP: CONCEPTUAL COMPILATION ONLY</span>
        <p className="text-[9px] text-rose-700 leading-normal font-sans normal-case max-w-xl mx-auto">
          Conceptual planning drawings. Not final direct fabrication, certified schematic, Gerber artwork, STEP cad loops, or factory production output. All layout pins, board outline dimensions, and trace widths must undergo a final external ECAD/MCAD design verification pass.
        </p>
      </div>

    </div>
  );
};
