import React from 'react';
import { BlueprintTitleBlock } from './BlueprintTitleBlock';

interface BlueprintPageLayoutProps {
  sheetTitle: string;
  sheetNum: number;
  projectName: string;
  version?: string;
  generatedDate?: string;
  group: string;
  children: React.ReactNode;
  scale?: string;
  status?: string;
}

export const BlueprintPageLayout: React.FC<BlueprintPageLayoutProps> = ({
  sheetTitle,
  sheetNum,
  projectName,
  version,
  generatedDate,
  group,
  children,
  scale,
  status
}) => {
  return (
    <div className="bg-white border-2 border-slate-900 rounded-lg shadow-md p-8 flex flex-col justify-between min-h-[820px] relative overflow-hidden print:shadow-none print:border-2 print:border-black print:m-0 print:p-8">
      {/* Grid background overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03] select-none print:opacity-[0.02]" 
        style={{ 
          backgroundSize: '20px 20px', 
          backgroundImage: 'linear-gradient(to right, #0284c7 1px, transparent 1px), linear-gradient(to bottom, #0284c7 1px, transparent 1px)' 
        }} 
      />

      {/* Border Coordinate Grid */}
      <div className="absolute inset-1.5 border border-slate-400 pointer-events-none select-none flex flex-col justify-between p-1">
        <div className="flex justify-around text-[8px] text-slate-400 font-bold w-full">
          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span>
        </div>
        <div className="flex-grow flex justify-between items-center text-[8px] text-slate-400 font-bold my-1">
          <div className="flex flex-col justify-around h-full">
            <span>A</span><span>B</span><span>C</span><span>D</span>
          </div>
          <div className="flex flex-col justify-around h-full">
            <span>A</span><span>B</span><span>C</span><span>D</span>
          </div>
        </div>
        <div className="flex justify-around text-[8px] text-slate-400 font-bold w-full">
          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span>8</span>
        </div>
      </div>

      {/* Content wrapper */}
      <div className="space-y-5 flex-1 flex flex-col justify-between z-10">
        {/* Top bar header */}
        <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-center select-none">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest font-mono block">{group}</span>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight font-mono">{sheetTitle}</h2>
          </div>
          <span className="text-[8px] font-bold font-mono text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
            BY SYSTEM ALPHA HARDWARE STUDIO
          </span>
        </div>

        {/* Dynamic Sheet Content */}
        <div className="flex-grow py-4 flex flex-col justify-center min-h-[450px]">
          {children}
        </div>

        {/* Disclaimer bar */}
        <div className="text-[7.5px] text-slate-500 font-mono text-center select-none mt-2 border-t border-slate-200 pt-2 leading-relaxed">
          * CONCEPTUAL PLANNING DOCUMENT PREPARED IN HARDWARE STUDIO. THIS IS NOT AN ENTIRELY FABRICATION-READY ECAD/MCAD OUTPUT. ALTIUM/KICAD SCHEMATICS AND SOLIDWORKS MODELS REQUIRED FOR PRODUCTION.
        </div>

        {/* Title Block */}
        <BlueprintTitleBlock 
          sheetTitle={sheetTitle}
          sheetNum={sheetNum}
          projectName={projectName}
          version={version}
          generatedDate={generatedDate}
          scale={scale}
          status={status}
        />
      </div>
    </div>
  );
};
