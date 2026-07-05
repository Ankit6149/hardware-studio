import React from 'react';
import { Project } from '../../../types';
import { ReadinessReport } from '../../../lib/readinessScore';

interface SheetProps {
  project: Project;
  report: ReadinessReport;
}

// ----------------------------------------------------
// SH 06: BOARD / PCB BLUEPRINT
// ----------------------------------------------------
export const BoardSpecsSheet: React.FC<SheetProps> = ({ project }) => {
  const boards = project.boards || [];
  const pcbConstraints = project.pcbConstraints || [];

  const parseDimensions = (dimStr: string) => {
    if (!dimStr) return null;
    const parts = dimStr.split(/x|X|\*/).map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
    if (parts.length >= 2) return { w: parts[0], h: parts[1] };
    return null;
  };

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-500 border-b border-slate-200 pb-2">
        DRAWING TITLE: PRINTED CIRCUIT BOARDS MECHANICAL OUTLINES SPECIFICATIONS
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
        {boards.length === 0 ? (
          <div className="col-span-2 border border-dashed border-rose-300 bg-rose-50/10 p-6 rounded flex items-center justify-center min-h-[220px]">
            <span className="text-rose-500 font-bold uppercase tracking-wider">[ BOARD REQUIRED - GENERATE PLAN ]</span>
          </div>
        ) : (
          boards.slice(0, 2).map(b => {
            const dims = parseDimensions(b.dimensionsMm);
            const isFlex = b.substrate?.toLowerCase().includes("flex");
            const hasAntenna = project.circuitBlocks?.some(cb => cb.boardId === b.id && cb.circuitType === 'RF');
            const hasBend = pcbConstraints.some(c => c.boardId === b.id && c.constraintType === 'Flex Bend');

            return (
              <div key={b.id} className="border p-4 bg-white space-y-4 rounded flex flex-col justify-between">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-slate-800">{b.name}</span>
                  <span className="text-[8px] bg-slate-100 border px-1.5 py-0.5 rounded uppercase font-bold text-slate-500">{b.boardType}</span>
                </div>

                {/* SVG Visual PCB */}
                <div className="w-full h-44 bg-slate-50 border border-slate-100 rounded flex items-center justify-center relative select-none">
                  {dims ? (
                    isFlex ? (
                      <svg className="w-full max-w-[220px] h-32" viewBox="0 0 140 80">
                        {/* Curved flex profile */}
                        <path d="M 10 40 Q 70 10 130 40 L 130 48 Q 70 18 10 48 Z" fill="none" stroke="#d97706" strokeWidth="2" />
                        <line x1="10" y1="22" x2="130" y2="22" stroke="#0284c7" strokeWidth="0.8" strokeDasharray="2,2" />
                        <text x="70" y="16" textAnchor="middle" className="text-[7px] font-bold fill-blue-600">ARC WIDTH: {dims.w} mm</text>
                        {hasAntenna && (
                          <rect x="50" y="32" width="40" height="8" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="1,1" />
                        )}
                      </svg>
                    ) : (
                      <svg className="w-full max-w-[220px] h-32" viewBox="0 0 140 80">
                        <rect x="20" y="20" width="100" height="40" rx="3" fill="none" stroke="#15803d" strokeWidth="2" />
                        <circle cx="28" cy="28" r="2.5" fill="none" stroke="#94a3b8" strokeWidth="0.8" />
                        <circle cx="112" cy="52" r="2.5" fill="none" stroke="#94a3b8" strokeWidth="0.8" />
                        <line x1="20" y1="67" x2="120" y2="67" stroke="#0284c7" strokeWidth="0.8" />
                        <text x="70" y="75" textAnchor="middle" className="text-[7px] font-bold fill-blue-600">LENGTH: {dims.w} mm</text>
                      </svg>
                    )
                  ) : (
                    <span className="text-[8px] font-bold text-rose-500 tracking-widest bg-rose-50 border border-rose-100 px-3 py-1 rounded">
                      [ STAMP: DIMENSION REQUIRED ]
                    </span>
                  )}
                  <div className="absolute bottom-2 left-2 text-[6.5px] text-slate-400 font-bold uppercase">TOP VIEW SHAPE</div>
                </div>

                {/* Metadata details */}
                <div className="text-[9.5px] leading-relaxed space-y-1 pt-2 border-t border-dashed">
                  <div><strong>Substrate Substrate</strong>: {b.substrate || "SUBSTRATE REQUIRED"}</div>
                  <div><strong>PCB Layer Build</strong>: {b.layerCount > 0 ? `${b.layerCount} Layers` : "LAYER COUNT REQUIRED"}</div>
                  <div><strong>Mounting Placement</strong>: {b.placement}</div>
                  
                  {isFlex && !hasBend && (
                    <div className="text-rose-600 font-bold uppercase text-[8px] animate-pulse">▲ WARNING: FLEX BEND RADIUS REQUIRED</div>
                  )}
                  {hasAntenna && !pcbConstraints.some(c => c.constraintType === 'RF Keepout') && (
                    <div className="text-rose-600 font-bold uppercase text-[8px] animate-pulse">▲ WARNING: RF KEEP OUT REQUIRED</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Boards table index */}
      <div className="border p-2 bg-white space-y-1">
        <span className="font-bold text-slate-700 block border-b pb-1">PCBs Specifications Matrix Table</span>
        <table className="w-full text-[9px] text-left">
          <thead>
            <tr className="text-slate-400 border-b">
              <th className="pb-1">Board Identifier</th>
              <th className="pb-1">Copper Layers</th>
              <th className="pb-1">Outline Dimensions</th>
              <th className="pb-1">Substrate Material</th>
              <th className="pb-1">RF Constraints</th>
              <th className="pb-1">Thermal notes</th>
            </tr>
          </thead>
          <tbody>
            {boards.map(b => (
              <tr key={b.id} className="border-b border-slate-100">
                <td className="py-1 font-bold">{b.name}</td>
                <td>{b.layerCount || "LAYER COUNT REQUIRED"}</td>
                <td className="font-mono">{b.dimensionsMm || "DIMENSION REQUIRED"}</td>
                <td>{b.substrate || "SUBSTRATE REQUIRED"}</td>
                <td>{b.rfNotes || "None"}</td>
                <td>{b.thermalNotes || "None"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// SH 07: PCB STACKUP & CONSTRAINT BLUEPRINT
// ----------------------------------------------------
export const StackupConstraintsSheet: React.FC<SheetProps> = ({ project }) => {
  const boards = project.boards || [];
  const pcbConstraints = project.pcbConstraints || [];
  const selectedBoard = boards[0];

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-550 border-b border-slate-200 pb-2">
        DRAWING TITLE: PCB MULTI-LAYER STACKUP PROFILE & DESIGN RULES CONSTRAINTS
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Layer Stackup SVG */}
        <div className="border p-4 bg-white rounded space-y-3">
          <span className="font-bold text-slate-850 block border-b pb-2">PCB Layer Build Stackup (L1 - L4 Profile)</span>
          
          <div className="w-full h-44 bg-slate-50 border border-slate-100 rounded flex flex-col justify-center p-4 relative font-mono text-[8px]">
            {/* L1 Top */}
            <div className="flex items-center space-x-2 my-0.5">
              <span className="w-16 font-bold text-emerald-800 text-right">L1 (TOP):</span>
              <div className="flex-1 h-3 bg-green-700 border border-emerald-950 flex items-center justify-center text-white text-[6.5px] font-bold uppercase">Silkscreen & Soldermask Copper</div>
            </div>
            
            {/* Core Substrate */}
            <div className="h-5 flex items-center space-x-2 my-1">
              <span className="w-16 font-bold text-slate-400 text-right">CORE:</span>
              <div className="flex-1 h-full bg-amber-500/10 border border-amber-300 flex items-center justify-center text-slate-500 text-[6px] uppercase font-bold">Dielectric Substrate Core</div>
            </div>

            {selectedBoard && selectedBoard.layerCount >= 4 && (
              <>
                <div className="flex items-center space-x-2 my-0.5">
                  <span className="w-16 font-bold text-blue-800 text-right">L2 (GND):</span>
                  <div className="flex-1 h-2.5 bg-blue-600 border border-blue-900 flex items-center justify-center text-white text-[6px] uppercase font-bold">Ground reference plane copper</div>
                </div>
                <div className="h-3 flex items-center space-x-2 my-0.5">
                  <span className="w-16 text-slate-400 text-right">PREPREG:</span>
                  <div className="flex-1 h-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 text-[5.5px] uppercase">Isolator Prepreg</div>
                </div>
                <div className="flex items-center space-x-2 my-0.5">
                  <span className="w-16 font-bold text-red-800 text-right">L3 (PWR):</span>
                  <div className="flex-1 h-2.5 bg-red-600 border border-red-900 flex items-center justify-center text-white text-[6px] uppercase font-bold">Regulated power rail copper</div>
                </div>
                <div className="h-3 flex items-center space-x-2 my-0.5">
                  <span className="w-16 text-slate-400 text-right">PREPREG:</span>
                  <div className="flex-1 h-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-400 text-[5.5px] uppercase">Isolator Prepreg</div>
                </div>
              </>
            )}

            {/* L2 Bottom */}
            <div className="flex items-center space-x-2 my-0.5">
              <span className="w-16 font-bold text-emerald-800 text-right">L2 (BOT):</span>
              <div className="flex-1 h-3 bg-green-700 border border-emerald-950 flex items-center justify-center text-white text-[6.5px] font-bold uppercase">Silkscreen & Soldermask Copper</div>
            </div>

            <div className="absolute bottom-2 right-2 text-[6.5px] text-slate-400 font-bold uppercase">CONCEPTUAL STACK DESIGN ONLY</div>
          </div>
        </div>

        {/* Constraints List */}
        <div className="border p-4 bg-white rounded space-y-3">
          <span className="font-bold text-slate-850 block border-b pb-2">PCB Layout Constraints Database</span>
          {pcbConstraints.length === 0 ? (
            <div className="text-center py-6 text-rose-500 font-bold uppercase animate-pulse">[ PCB CONSTRAINTS MISSING ]</div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto max-h-44 text-[9.5px]">
              {pcbConstraints.map((c, i) => (
                <div key={i} className="flex justify-between items-start border-b border-slate-100 pb-1">
                  <div>
                    <span className="font-bold text-indigo-700 block">{c.constraintType} ({c.value} {c.unit})</span>
                    <span className="text-slate-450 font-sans block leading-normal">{c.description}</span>
                  </div>
                  <span className={`text-[7px] font-black uppercase px-1 rounded border shrink-0 mt-0.5 ${
                    c.severity === 'Critical' ? 'bg-red-50 text-red-700 border-red-200' : c.severity === 'Warning' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-50 text-slate-500'
                  }`}>{c.severity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Constraints missing check warnings stamp */}
      {!pcbConstraints.some(c => c.constraintType === 'Board Outline') && (
        <div className="border border-dashed border-rose-300 p-2.5 bg-rose-50/10 text-center text-rose-600 font-bold uppercase">
          ▲ STAMP CHECKER: BOARD OUTLINE CONSTRAINT REQUIRED FOR ALL FABRICATION RUNS
        </div>
      )}
    </div>
  );
};

// ----------------------------------------------------
// SH 08: COMPONENT PLACEMENT BLUEPRINT
// ----------------------------------------------------
export const ComponentPlacementSheet: React.FC<SheetProps> = ({ project }) => {
  const { boardComponents = [] } = project;

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-550 border-b border-slate-200 pb-2">
        DRAWING TITLE: DRAFT PHYSICAL SMT FOOTPRINTS MOUNT COORDINATES MAP
      </div>

      <div className="w-full border border-slate-250 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[350px]">
        {boardComponents.length === 0 ? (
          <div className="text-[10px] text-rose-500 font-black border-2 border-dashed border-rose-300 p-4">
            [ COMPONENT REGISTER EMPTY - SEED PROJECT PLAN FROM BOM ]
          </div>
        ) : (
          <svg className="w-full max-w-3xl h-80 bg-white border border-slate-200" viewBox="0 0 600 280">
            <rect width="100%" height="100%" fill="url(#arch-grid)" />
            
            {/* Outline bounds */}
            <rect x="40" y="30" width="520" height="200" rx="3" fill="none" stroke="#000" strokeWidth="2" strokeDasharray="5,5" />
            <text x="50" y="24" className="text-[8px] font-black fill-slate-450 uppercase">PCB EDGE COMPONENT PLACEMENT MOUNTING LIMITS</text>

            {/* Placement SVG mapping logic */}
            {boardComponents.map((c, i) => {
              const cols = Math.min(6, Math.ceil(Math.sqrt(boardComponents.length)));
              const row = Math.floor(i / cols);
              const col = i % cols;
              const totalRows = Math.ceil(boardComponents.length / cols);
              
              const x = 70 + col * (460 / Math.max(1, cols - 1 || 1));
              const y = 60 + row * (140 / Math.max(1, totalRows - 1 || 1));

              const ref = c.referenceDesignator;
              const isIC = ref.startsWith('U');
              const isAntenna = ref.startsWith('ANT');
              const isBattery = ref.startsWith('BT') || ref.startsWith('B');

              let strokeCol = "#475569";

              if (c.placementCriticality === 'RF Critical' || c.placementCriticality === 'High') {
                strokeCol = "#ef4444";
              } else if (c.placementCriticality === 'Thermal Critical') {
                strokeCol = "#3b82f6";
              }

              return (
                <g key={c.id || i}>
                  {isIC ? (
                    <rect x={x - 18} y={y - 12} width={36} height={24} rx="1" fill="#f8fafc" stroke={strokeCol} strokeWidth="1.5" />
                  ) : isAntenna ? (
                    <polygon points={`${x},${y - 14} ${x - 8},${y + 2} ${x + 8},${y + 2}`} fill="none" stroke="#6366f1" strokeWidth="1.5" />
                  ) : isBattery ? (
                    <rect x={x - 22} y={y - 10} width={44} height={20} fill="none" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
                  ) : (
                    <rect x={x - 12} y={y - 7} width={24} height={14} fill="#fff" stroke={strokeCol} strokeWidth="1" />
                  )}
                  <circle cx={x - 12} cy={y - 8} r="1" fill="#94a3b8" />
                  <text x={x} y={y + 18} textAnchor="middle" className="text-[7.5px] font-black fill-slate-800">{c.referenceDesignator}</text>
                  <text x={x} y={y - 15} textAnchor="middle" className="text-[5.5px] fill-slate-400 font-sans tracking-tight">{c.packageName}</text>
                </g>
              );
            })}

            <text x="300" y="250" textAnchor="middle" className="text-[7.5px] font-bold fill-rose-500 uppercase tracking-widest">
              CPL COPL PLACEMENT COORDINATES NOT FINAL — CONCEPTUAL ONLY (GENERATE IN ECAD TOOL)
            </text>
          </svg>
        )}
      </div>

      {/* Component Placement directory table */}
      <div className="border p-2 bg-white space-y-1">
        <span className="font-bold text-slate-700 block border-b pb-1">Placed Components Package Directory</span>
        <div className="overflow-y-auto max-h-40">
          <table className="w-full text-[9px] text-left">
            <thead>
              <tr className="text-slate-400 border-b">
                <th className="pb-1">RefDes</th>
                <th className="pb-1">Part Name</th>
                <th className="pb-1">Footprint Package</th>
                <th className="pb-1">Mount Side</th>
                <th className="pb-1">Criticality</th>
                <th className="pb-1">Supplier Part Number</th>
                <th className="pb-1 font-bold">Datasheet?</th>
              </tr>
            </thead>
            <tbody>
              {boardComponents.map(bc => (
                <tr key={bc.id} className="border-b border-slate-100">
                  <td className="py-1 font-bold text-indigo-700">{bc.referenceDesignator}</td>
                  <td className="font-bold">{bc.componentName}</td>
                  <td className="font-mono text-slate-500">{bc.footprint || bc.packageName || "FOOTPRINT REQUIRED"}</td>
                  <td>{bc.side}</td>
                  <td>
                    <span className={`px-1 py-0.2 rounded text-[7.5px] font-bold ${
                      ['High', 'RF Critical'].includes(bc.placementCriticality) ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-slate-100 text-slate-500'
                    }`}>{bc.placementCriticality}</span>
                  </td>
                  <td className="font-mono text-slate-400">{bc.partNumber || "PART NUMBER REQUIRED"}</td>
                  <td className="text-emerald-700 font-bold">{bc.datasheetUrl ? "Attached" : "DATASHEET REQUIRED"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
