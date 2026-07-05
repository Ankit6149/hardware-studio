import React from 'react';

interface BlueprintTitleBlockProps {
  sheetTitle: string;
  sheetNum: number;
  projectName: string;
  version?: string;
  generatedDate?: string;
  scale?: string;
  status?: string;
}

export const BlueprintTitleBlock: React.FC<BlueprintTitleBlockProps> = ({
  sheetTitle,
  sheetNum,
  projectName,
  version = "1.0",
  generatedDate,
  scale = "CONCEPTUAL",
  status = "PRE-ECAD DRAFT"
}) => {
  const dateStr = generatedDate || new Date().toISOString().split('T')[0];
  
  return (
    <div className="border-t-2 border-slate-900 bg-white grid grid-cols-1 md:grid-cols-4 text-[9px] font-mono font-bold uppercase mt-6 select-none print:break-inside-avoid">
      {/* Revision Log Block */}
      <div className="border-r border-slate-900 p-2 space-y-1 col-span-1 md:col-span-2">
        <div className="text-[7px] text-slate-400 block font-normal pb-1 border-b border-slate-200">REVISION HISTORY LOG</div>
        <table className="w-full text-[8px] text-slate-750 font-normal">
          <thead>
            <tr className="text-slate-400 border-b border-slate-100 text-left">
              <th className="font-normal w-12">REV</th>
              <th className="font-normal w-16">DATE</th>
              <th className="font-normal">DESCRIPTION</th>
              <th className="font-normal w-12">APPROVED</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-50">
              <td>P0.1</td>
              <td>2026-06-15</td>
              <td>Initial conceptual architecture blockout</td>
              <td>SYSTEM A</td>
            </tr>
            <tr>
              <td>{version}</td>
              <td>{dateStr}</td>
              <td>Active layout & constraints planning spin</td>
              <td>ENGINEER</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Mid block metadata */}
      <div className="border-r border-slate-900 p-2.5 space-y-1.5 flex flex-col justify-between">
        <div>
          <span className="text-[7px] text-slate-400 block font-normal">PROJECT NAME</span>
          <span className="text-slate-800 text-xs font-black tracking-tight">{projectName || "UNKNOWN SYSTEM"}</span>
        </div>
        <div>
          <span className="text-[7px] text-slate-400 block font-normal">SHEET TITLE</span>
          <span className="text-slate-850 text-[10px] font-bold block truncate">{sheetTitle}</span>
        </div>
      </div>

      {/* Scaled/Numbering info block */}
      <div className="p-2.5 space-y-1.5 flex flex-col justify-between">
        <div className="flex justify-between items-center text-[7px] text-slate-400 font-normal">
          <span>BY HARDWARE STUDIO</span>
          <span>SH {sheetNum.toString().padStart(2, '0')} OF 16</span>
        </div>
        <div className="space-y-0.5 text-[8px] text-slate-750">
          <div>SCALE: {scale}</div>
          <div>STATUS: {status}</div>
        </div>
        <span className="text-[7px] text-rose-500 block leading-tight font-black">
          CONCEPTUAL PREP - FINAL ENGINEER REVIEW REQUIRED
        </span>
      </div>
    </div>
  );
};
