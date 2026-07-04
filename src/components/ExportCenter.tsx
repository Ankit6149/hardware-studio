import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { exportProjectJson } from '../lib/exportJson';
import { exportProjectMarkdown } from '../lib/exportMarkdown';
import { FileJson, FileText, Download, CheckCircle, Database } from 'lucide-react';
import { runValidationRules } from '../lib/validationRules';

export const ExportCenter: React.FC = () => {
  const { projectName, nodes, edges, bom, testing } = useProjectStore();

  const warnings = runValidationRules(nodes, edges);
  
  const stats = [
    { label: "Blueprint Blocks", value: nodes.filter(n => n.type !== 'boundaryNode').length },
    { label: "Grouping Boundaries", value: nodes.filter(n => n.type === 'boundaryNode').length },
    { label: "GATT & Circuit Connections", value: edges.length },
    { label: "BOM Component Rows", value: bom.length },
    { label: "Testing Protocols Defined", value: testing.length },
    { label: "Architecture Warnings", value: warnings.length }
  ];

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-6">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Project Export Center</h1>
          <p className="text-xs text-slate-500 mt-0.5">Generate, compile, and download documentation and configuration outputs for specialist tools.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 select-none">
          {stats.map((s, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">{s.label}</span>
              <span className="text-xl font-extrabold text-slate-800 mt-1 block">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* JSON Export Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650">
                <FileJson className="w-5 h-5" />
              </div>
              <h2 className="text-xs font-extrabold text-slate-850 uppercase tracking-wide">Export Blueprint Workspace (JSON)</h2>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Download the complete raw canvas positions, edges, BOM list, and testing steps as a JSON document. Use this file to import or backup your work in Hardware Studio.
              </p>
            </div>
            <button
              onClick={() => exportProjectJson({ projectName, activeView: 'master', nodes, edges, bom, testing })}
              className="mt-6 w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white py-2 rounded-lg text-xs font-semibold shadow-sm transition-all border border-slate-950 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download project_blueprint.json</span>
            </button>
          </div>

          {/* Markdown Export Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-650">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-xs font-extrabold text-slate-850 uppercase tracking-wide">Export Blueprint Report (Markdown)</h2>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Generate a comprehensive markdown dossier compiling product scope, layout categories, circuit blocks, firmware states, bill of materials, test plans, and warnings.
              </p>
            </div>
            <button
              onClick={() => exportProjectMarkdown({ projectName, activeView: 'master', nodes, edges, bom, testing })}
              className="mt-6 w-full flex items-center justify-center space-x-1.5 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white py-2 rounded-lg text-xs font-semibold shadow-sm transition-all border border-slate-950 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download project_blueprint.md</span>
            </button>
          </div>
        </div>

        {/* CAD / PCB Notice */}
        <div className="bg-slate-100/70 border border-slate-200 rounded-xl p-5 flex items-start space-x-3.5 select-none">
          <Database className="w-5 h-5 text-slate-650 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">Future Integration Roadmap</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Subsequent releases of Hardware Studio will support exporting to ECAD schematics (KiCad/EasyEDA), mechanical briefings (Onshape/FreeCAD), pin mapping setups (Wokwi simulators), and automated supplier matching APIs.
            </p>
            <div className="flex items-center space-x-1.5 mt-2 text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>V1.1 Scope is focused on conceptual planning. No external CAD/PCB exports are active.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
