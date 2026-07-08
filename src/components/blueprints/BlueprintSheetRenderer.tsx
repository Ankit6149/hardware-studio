import React from 'react';
import type { BlueprintSheet } from '../../lib/blueprintSheetTypes';
import { BlueprintDrawingRenderer } from './BlueprintDrawingRenderer';
import { AlertTriangle, AlertOctagon, Info } from 'lucide-react';

interface BlueprintSheetRendererProps {
  sheet: BlueprintSheet;
  projectName: string;
  revision?: string;
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  "Generated In App": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "Missing Data": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  "Draft": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "Needs Review": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "Verified": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-300" },
};

const severityIcons: Record<string, React.ReactNode> = {
  "Blocker": <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />,
  "Error": <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />,
  "Warning": <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />,
  "Info": <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />,
};

export const BlueprintSheetRenderer: React.FC<BlueprintSheetRendererProps> = ({ sheet, projectName, revision }) => {
  const sts = statusStyles[sheet.status] || statusStyles["Draft"];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden print:shadow-none print:border-slate-300 page-break-after">
      {/* Title Block */}
      <div className="border-b-2 border-slate-900 px-5 py-3 bg-slate-50/60 flex items-center justify-between print:bg-white">
        <div className="flex items-center space-x-3">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest font-mono min-w-[60px]">Sheet {sheet.sheetNo}</span>
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight">{sheet.title}</h2>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${sts.bg} ${sts.text} ${sts.border}`}>
            {sheet.status}
          </span>
          <span className="text-[8px] text-slate-400 font-mono">{sheet.category}</span>
        </div>
      </div>

      {/* Meta row */}
      <div className="px-5 py-1.5 border-b border-slate-150 flex items-center justify-between text-[9px] text-slate-400 font-mono bg-slate-50/30">
        <span>{projectName} — Rev {revision || "1.0"}</span>
        <span>{sheet.sourceObjects.length} source objects</span>
      </div>

      {/* Drawing area */}
      {sheet.drawing.objects.length > 0 && (
        <div className="px-5 py-4 border-b border-slate-100">
          <BlueprintDrawingRenderer drawing={sheet.drawing} />
        </div>
      )}

      {/* Notes */}
      {sheet.notes.length > 0 && (
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">Notes</h3>
          <ul className="space-y-0.5">
            {sheet.notes.map((n, i) => (
              <li key={i} className="text-[10px] text-slate-600 flex items-start space-x-1.5">
                <span className="text-slate-350 mt-0.5">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tables */}
      {sheet.tables.map(table => (
        <div key={table.id} className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">{table.title}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px] border-collapse">
              <thead>
                <tr>
                  {table.columns.map((col, ci) => (
                    <th key={ci} className="text-left px-2 py-1.5 bg-slate-50 border border-slate-200 text-[8px] font-bold uppercase tracking-wider text-slate-600">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-slate-50/50">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-2 py-1 border border-slate-150 text-slate-700 font-mono text-[9px]">
                        {cell || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
                {table.rows.length === 0 && (
                  <tr>
                    <td colSpan={table.columns.length} className="px-2 py-3 text-center text-slate-400 italic border border-slate-150">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Warnings */}
      {sheet.warnings.length > 0 && (
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Warnings ({sheet.warnings.length})</h3>
          <div className="space-y-1.5">
            {sheet.warnings.map(w => (
              <div key={w.id} className="flex items-start space-x-2 text-[10px]">
                {severityIcons[w.severity] || severityIcons["Info"]}
                <div>
                  <span className="font-bold text-slate-700">{w.title}</span>
                  <span className="text-slate-500 ml-1">{w.message}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {sheet.disclaimer && (
        <div className="px-5 py-2.5 bg-amber-50/50 border-t border-amber-200/40">
          <p className="text-[9px] text-amber-700 font-medium flex items-start space-x-1.5">
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
            <span>{sheet.disclaimer}</span>
          </p>
        </div>
      )}

      {/* Source refs footer */}
      {sheet.sourceObjects.length > 0 && (
        <div className="px-5 py-2 bg-slate-50/40 text-[8px] text-slate-400 font-mono">
          Sources: {sheet.sourceObjects.slice(0, 10).map(s => s.label || s.id).join(", ")}
          {sheet.sourceObjects.length > 10 && ` +${sheet.sourceObjects.length - 10} more`}
        </div>
      )}
    </div>
  );
};
