import React from 'react';
import { Project } from '../../../types';
import { ReadinessReport } from '../../../lib/readinessScore';

interface SheetProps {
  project: Project;
  report: ReadinessReport;
}

// ----------------------------------------------------
// SH 15: MANUFACTURING HANDOFF BLUEPRINT
// ----------------------------------------------------
export const MfgChecklistSheet: React.FC<SheetProps> = ({ project, report }) => {
  const mfgChecklist = project.manufacturingChecklist || [];
  
  const doneCount = mfgChecklist.filter(m => m.status === 'Done').length;
  const inProgressCount = mfgChecklist.filter(m => m.status === 'In Progress').length;
  const blockedCount = mfgChecklist.filter(m => m.status === 'Blocked').length;
  const notStartedCount = mfgChecklist.filter(m => m.status === 'Not Started').length;

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-550 border-b border-slate-200 pb-2">
        DRAWING TITLE: FACTORY RELEASE PACKAGE GATE审核 COVER SHEET
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Release Status Gates */}
        <div className="border p-4 bg-white rounded space-y-4">
          <span className="font-bold text-slate-850 block border-b pb-2">Handoff Readiness Gates</span>
          <ul className="space-y-2.5 text-[9.5px]">
            <li className="flex justify-between items-center pb-1 border-b border-slate-100">
              <span>1. ECAD Layout Release:</span>
              <span className={`font-bold px-1 rounded text-[8px] ${
                report.canMoveToEcad ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'
              }`}>{report.canMoveToEcad ? 'PASSED' : 'LOCKED'}</span>
            </li>
            <li className="flex justify-between items-center pb-1 border-b border-slate-100">
              <span>2. Prototype Bring-Up:</span>
              <span className={`font-bold px-1 rounded text-[8px] ${
                report.canMoveToPrototype ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'
              }`}>{report.canMoveToPrototype ? 'PASSED' : 'LOCKED'}</span>
            </li>
            <li className="flex justify-between items-center">
              <span>3. Factory Handoff Ready:</span>
              <span className={`font-bold px-1 rounded text-[8px] ${
                report.canMoveToFactoryHandoff ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-400'
              }`}>{report.canMoveToFactoryHandoff ? 'PASSED' : 'LOCKED'}</span>
            </li>
          </ul>

          <div className="border-t border-slate-150 pt-2 text-[9.5px]">
            <span>OVERALL SCORE INDEX:</span>
            <span className="text-xl font-black text-slate-850 block mt-1">{report.overallScore} / 100</span>
          </div>
        </div>

        {/* Checklist Metrics */}
        <div className="border p-4 bg-white rounded space-y-3 md:col-span-2 flex flex-col justify-between">
          <div>
            <span className="font-bold text-slate-850 block border-b pb-2">Checklist Review Progress</span>
            <div className="grid grid-cols-2 gap-2 text-[9.5px] pt-1">
              <div className="flex justify-between">
                <span>DONE:</span>
                <span className="font-bold text-emerald-700">{doneCount}</span>
              </div>
              <div className="flex justify-between">
                <span>IN PROGRESS:</span>
                <span className="font-bold text-blue-700">{inProgressCount}</span>
              </div>
              <div className="flex justify-between">
                <span>BLOCKED:</span>
                <span className="font-bold text-rose-700">{blockedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>NOT STARTED:</span>
                <span className="font-bold text-slate-500">{notStartedCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-850 p-2 text-[9px] leading-relaxed mt-2 rounded">
            <strong>Blockers Audit Log</strong>: {report.blockers.length > 0 ? report.blockers[0] : "No active blockers identified."}
          </div>
        </div>
      </div>

      {/* Checklist items list */}
      <div className="border p-2 bg-white space-y-1">
        <span className="font-bold text-slate-700 block border-b pb-1">Pre-Layout Manufacturing Checklist Table</span>
        <div className="overflow-y-auto max-h-36">
          <table className="w-full text-[9px] text-left">
            <thead>
              <tr className="text-slate-400 border-b">
                <th className="pb-1">Category</th>
                <th className="pb-1">Verification Check Item</th>
                <th className="pb-1">Status</th>
                <th className="pb-1">Owner Notes</th>
                <th className="pb-1">Blocker reason</th>
              </tr>
            </thead>
            <tbody>
              {mfgChecklist.map(m => (
                <tr key={m.id} className="border-b border-slate-100">
                  <td className="py-1 font-bold">{m.category}</td>
                  <td className="font-sans max-w-xs truncate leading-normal">{m.item}</td>
                  <td>{m.status}</td>
                  <td className="text-slate-450 italic">{m.ownerNotes || "N/A"}</td>
                  <td className="text-rose-600 font-bold font-sans text-[8.5px]">{m.blockingReason || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// SH 16: MISSING FILES / FACTORY READINESS SHEET
// ----------------------------------------------------
export const MissingFilesSheet: React.FC<SheetProps> = () => {
  const outputs = [
    { name: "Project Blueprint Schema", code: "project_blueprint.json", format: "JSON", status: "READY FOR EXPORT" },
    { name: "Blueprint Dossier Spec Markdown", code: "blueprint_dossier.md", format: "Markdown", status: "READY FOR EXPORT" },
    { name: "Blueprint Sheets Exporter HTML", code: "blueprint_sheets.html", format: "HTML Drawing Pack", status: "READY FOR EXPORT" },
    { name: "ECAD Layout Pin / Nets Mappings", code: "ecad_prep.json", format: "JSON Package", status: "READY FOR EXPORT" },
    { name: "C++ Driver state-machine Skeleton", code: "firmware_skeleton.ino", format: "Arduino C++", status: "READY FOR EXPORT" }
  ];

  const externalFiles = [
    { name: "Altium / KiCad project schematic files", status: "NOT GENERATED YET" },
    { name: "Gerber RS-274X artwork ZIP (L1-L4 layers)", status: "NOT GENERATED YET" },
    { name: "EXCELLON NC Drill CNC coordinates", status: "NOT GENERATED YET" },
    { name: "STEP/STL enclosure casing physical model", status: "NOT GENERATED YET" },
    { name: "Pick-and-place Centroid CPL coordinates", status: "CONCEPTUAL ONLY" },
    { name: "Formal fab-house DFM / DFT checks clearance", status: "REQUIRED BEFORE FAB" },
    { name: "FCC / CE compliance emissions testing certifications", status: "REQUIRED WHERE APPLICABLE" }
  ];

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-550 border-b border-slate-200 pb-2">
        DRAWING TITLE: REQUIRED EXTERNAL FABRICATION FILE AUDIT
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
        {/* Available Outputs */}
        <div className="border p-4 bg-white rounded space-y-3 flex flex-col justify-between">
          <div>
            <span className="font-bold text-slate-850 block border-b pb-2">Available Conceptual Exports</span>
            <div className="space-y-1.5 pt-1 text-[9.5px]">
              {outputs.map((o, i) => (
                <div key={i} className="flex justify-between border-b pb-1">
                  <div>
                    <span className="font-bold text-slate-900 block">{o.name}</span>
                    <span className="text-slate-400 font-mono block text-[8px]">{o.code}</span>
                  </div>
                  <span className="text-emerald-700 font-bold shrink-0 mt-0.5">{o.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Required Files Not Generated */}
        <div className="border p-4 bg-white rounded space-y-3">
          <span className="font-bold text-slate-850 block border-b pb-2">Required External Engineering CAD Files</span>
          <div className="space-y-1.5 text-[9px]">
            {externalFiles.map((f, i) => (
              <div key={i} className="flex justify-between items-start border-b pb-1 text-slate-550">
                <span className="font-sans leading-normal mr-2">{f.name}</span>
                <span className={`font-bold shrink-0 px-1 border rounded text-[7.5px] ${
                  f.status === 'CONCEPTUAL ONLY' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-700'
                }`}>{f.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Warning limitation block */}
      <div className="bg-amber-50 border border-amber-200 text-amber-850 rounded p-3 text-[9px] leading-relaxed select-none">
        <strong>LIMITATION WARNING NOTICE</strong>: Hardware Studio does not directly produce final fab-house binary artwork exports (Gerber, NC Drill, or STEP models). Real ECAD/MCAD tool suites are required to complete full tracing validation. All exports and drawings generated are conceptual preparations for pre-ECAD review.
      </div>
    </div>
  );
};
