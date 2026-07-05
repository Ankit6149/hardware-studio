import React from 'react';
import { Project } from '../../../types';
import { ReadinessReport } from '../../../lib/readinessScore';

interface SheetProps {
  project: Project;
  report: ReadinessReport;
}

// ----------------------------------------------------
// SH 02: PRODUCT ARCHITECTURE BLUEPRINT
// ----------------------------------------------------
export const ArchitectureSheet: React.FC<SheetProps> = ({ project }) => {
  const { nodes = [], edges = [] } = project;
  const categories = Array.from(new Set(nodes.map(n => n.data?.category).filter(Boolean)));
  const blocks = nodes.filter(n => n.type !== 'boundaryNode');

  const hasInput = nodes.some(n => 
    n.data?.status === 'MVP' && 
    (n.data?.name.toLowerCase().includes('button') || n.data?.name.toLowerCase().includes('touch') || n.data?.name.toLowerCase().includes('gesture') || n.data?.name.toLowerCase().includes('input'))
  );
  const hasFeedback = nodes.some(n => 
    n.data?.status === 'MVP' && 
    (n.data?.name.toLowerCase().includes('haptic') || n.data?.name.toLowerCase().includes('led') || n.data?.name.toLowerCase().includes('buzzer') || n.data?.name.toLowerCase().includes('display'))
  );
  const hasPower = nodes.some(n => n.data?.name.toLowerCase().includes('battery') || n.data?.name.toLowerCase().includes('power') || n.id.includes('battery'));
  const hasMCU = nodes.some(n => n.data?.name.toLowerCase().includes('mcu') || n.data?.name.toLowerCase().includes('controller'));
  const hasFw = project.firmwareTasks?.length > 0;

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-500 border-b border-slate-200 pb-2">
        DRAWING TITLE: HARDWARE SYSTEM OVERVIEW GROUPED ARCHITECTURE
      </div>

      {/* SVG Diagram Area */}
      <div className="w-full border border-slate-250 bg-slate-50/20 rounded flex flex-col items-center justify-center p-6 min-h-[350px]">
        {blocks.length === 0 ? (
          <div className="text-[10px] font-mono text-rose-500 font-black border-2 border-dashed border-rose-300 p-4">
            [ NO PRODUCT ARCHITECTURE DEFINED - SEED TEMPLATE ]
          </div>
        ) : (
          <svg className="w-full max-w-3xl h-72 border border-slate-200 bg-white" viewBox="0 0 700 280">
            <rect width="100%" height="100%" fill="#fafafa" />
            
            {/* Drafting grids */}
            <defs>
              <pattern id="arch-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#arch-grid)" />

            {/* Loop categories to draw boundaries */}
            {categories.slice(0, 3).map((cat, i) => (
              <g key={i}>
                <rect x={15 + i * 230} y={35} width={210} height={200} rx={2} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />
                <text x={25 + i * 230} y={26} className="text-[8px] font-bold fill-slate-500 uppercase tracking-widest">{cat}</text>
                
                {nodes.filter(n => n.data?.category === cat).slice(0, 3).map((node, j) => (
                  <g key={j}>
                    <rect x={25 + i * 230} y={50 + j * 55} width={190} height={42} rx={1.5} fill="#fff" stroke="#334155" strokeWidth="1.2" />
                    <text x={33 + i * 230} y={66} className="text-[9px] font-bold fill-slate-900">{node.data?.name.slice(0, 24)}</text>
                    <text x={33 + i * 230} y={77} className="text-[6.5px] fill-slate-400">PART: {node.data?.candidateComponents || 'TBD REQUIRED'}</text>
                    <text x={33 + i * 230} y={85} className="text-[6.5px] fill-indigo-700 font-bold uppercase">STATUS: {node.data?.status || 'MVP'}</text>
                  </g>
                ))}
              </g>
            ))}

            {/* Connections */}
            {edges.slice(0, 5).map((edge, idx) => {
              const startX = 225 + (idx % 2 === 0 ? 0 : 230);
              const startY = 80 + (idx * 25);
              return (
                <path key={idx} d={`M ${startX} ${startY} L ${startX + 20} ${startY}`} fill="none" stroke="#475569" strokeWidth="1.2" strokeDasharray="2,2" />
              );
            })}
          </svg>
        )}
      </div>

      {/* Warnings & Integrity Heuristics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border p-3 space-y-1.5 bg-white">
          <span className="font-bold text-slate-700 block border-b pb-1">ARCHITECTURE INTEGRITY CHECKLIST</span>
          <div className="text-[9.5px] leading-relaxed space-y-1">
            <div className="flex items-center space-x-1.5">
              {hasInput ? <span className="text-emerald-600">●</span> : <span className="text-rose-600">○</span>}
              <span>User Input (Tact/Capacitive Sensor): {hasInput ? "Defined" : "WARNING REQUIRED"}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              {hasFeedback ? <span className="text-emerald-600">●</span> : <span className="text-rose-600">○</span>}
              <span>User Feedback (LED/Haptic Engine): {hasFeedback ? "Defined" : "WARNING REQUIRED"}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              {hasPower ? <span className="text-emerald-600">●</span> : <span className="text-rose-600">○</span>}
              <span>System Power Core (Battery/Regulators): {hasPower ? "Defined" : "WARNING REQUIRED"}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              {(!hasMCU || hasFw) ? <span className="text-emerald-600">●</span> : <span className="text-rose-600">○</span>}
              <span>Firmware Driver States: {hasFw ? "Mapped" : "FIRMWARE NOTES REQUIRED"}</span>
            </div>
          </div>
        </div>

        <div className="border p-3 space-y-1 bg-white">
          <span className="font-bold text-slate-700 block border-b pb-1">Drawing Index</span>
          <table className="w-full text-[9px]">
            <thead>
              <tr className="text-slate-400 border-b">
                <th className="text-left font-normal pb-1">Block</th>
                <th className="text-left font-normal pb-1">Category</th>
                <th className="text-left font-normal pb-1">Priority</th>
                <th className="text-left font-normal pb-1 font-bold">Requirements?</th>
              </tr>
            </thead>
            <tbody>
              {blocks.slice(0, 3).map((n, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-1 font-bold">{n.data?.name}</td>
                  <td>{n.data?.category}</td>
                  <td>{n.data?.priority || "Medium"}</td>
                  <td className="text-emerald-600 font-bold">{n.data?.requirements ? "Yes" : "NO - REQ TBD"}</td>
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
// SH 03: MECHANICAL OUTER SHELL BLUEPRINT
// ----------------------------------------------------
export const OuterShellSheet: React.FC<SheetProps> = ({ project }) => {
  const isRing = project.projectName.toLowerCase().includes("ring") || project.templateName?.toLowerCase().includes("ring");
  
  // Try to parse boards/pcb outline dimensions
  const outlineConstraint = project.pcbConstraints?.find(c => c.constraintType === 'Board Outline');
  const widthVal = outlineConstraint?.value || (isRing ? "18.5" : "");
  const unitVal = outlineConstraint?.unit || "mm";

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-500 border-b border-slate-200 pb-2">
        DRAWING TITLE: EXTERIOR ENCLOSURE MECHANICAL CONTOURS
      </div>

      <div className="w-full border border-slate-250 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[350px]">
        {isRing ? (
          <svg className="w-full max-w-2xl h-80 bg-white border border-slate-200" viewBox="0 0 600 280">
            <rect width="100%" height="100%" fill="url(#arch-grid)" />
            
            {/* View 1: Top elevation */}
            <g transform="translate(160, 130)">
              <circle cx="0" cy="0" r="60" fill="none" stroke="#0f172a" strokeWidth="8" />
              <circle cx="0" cy="0" r="50" fill="none" stroke="#64748b" strokeWidth="0.8" strokeDasharray="3,3" />
              <circle cx="0" cy="0" r="44" fill="none" stroke="#334155" strokeWidth="1.5" />
              
              <line x1="-70" y1="0" x2="70" y2="0" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2,2" />
              <line x1="0" y1="-70" x2="0" y2="70" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="2,2" />
              
              {/* Dimension lines */}
              <line x1="-50" y1="0" x2="50" y2="0" stroke="#0284c7" strokeWidth="1" />
              <line x1="-50" y1="-4" x2="-50" y2="4" stroke="#0284c7" strokeWidth="1" />
              <line x1="50" y1="-4" x2="50" y2="4" stroke="#0284c7" strokeWidth="1" />
              <text x="0" y="-8" textAnchor="middle" className="text-[7.5px] font-bold fill-blue-600">ID: {widthVal ? `${widthVal} ${unitVal}` : "DIMENSION REQUIRED"}</text>

              {/* Outer shell arc */}
              <path d="M -30 -52 A 60 60 0 0 1 30 -52" fill="none" stroke="#ef4444" strokeWidth="8" />
              <text x="0" y="-62" textAnchor="middle" className="text-[6.5px] font-bold fill-white uppercase">Sensor Pod</text>
            </g>

            {/* View 2: Side Elevation */}
            <g transform="translate(420, 130)">
              <rect x="-30" y="-60" width="60" height="120" rx="3" fill="none" stroke="#0f172a" strokeWidth="3" />
              <rect x="-24" y="-54" width="48" height="108" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
              
              {/* Charging contacts */}
              <rect x="-35" y="-20" width="5" height="10" fill="#eab308" />
              <rect x="-35" y="10" width="5" height="10" fill="#eab308" />
              <text x="-40" y="2" textAnchor="end" className="text-[6px] fill-amber-700 font-bold">CHARGE PADS</text>

              {/* Touch Zone */}
              <rect x="27" y="-25" width="5" height="50" fill="#d946ef" />
              <text x="36" y="2" textAnchor="start" className="text-[6px] fill-fuchsia-700 font-bold">TOUCH ZONE</text>
              
              <line x1="-30" y1="75" x2="30" y2="75" stroke="#0284c7" strokeWidth="1" />
              <line x1="-30" y1="70" x2="-30" y2="80" stroke="#0284c7" strokeWidth="1" />
              <line x1="30" y1="70" x2="30" y2="80" stroke="#0284c7" strokeWidth="1" />
              <text x="0" y="87" textAnchor="middle" className="text-[8px] font-bold fill-blue-600">WIDTH: 7.8 mm</text>
            </g>

            <text x="160" y="240" textAnchor="middle" className="text-[9px] font-bold fill-slate-800 uppercase">SECTION A-A: LOOP PROFILE</text>
            <text x="420" y="240" textAnchor="middle" className="text-[9px] font-bold fill-slate-800 uppercase">SECTION B-B: LATERAL elevation</text>
          </svg>
        ) : (
          <svg className="w-full max-w-2xl h-80 bg-white border border-slate-200" viewBox="0 0 600 280">
            <rect width="100%" height="100%" fill="url(#arch-grid)" />
            <g transform="translate(150, 120)">
              <rect x="-80" y="-50" width="160" height="100" rx="4" fill="none" stroke="#0f172a" strokeWidth="3.5" />
              <line x1="-80" y1="65" x2="80" y2="65" stroke="#0284c7" strokeWidth="1" />
              <line x1="-80" y1="60" x2="-80" y2="70" stroke="#0284c7" strokeWidth="1" />
              <line x1="80" y1="60" x2="80" y2="70" stroke="#0284c7" strokeWidth="1" />
              <text x="0" y="78" textAnchor="middle" className="text-[8px] font-bold fill-blue-600">LENGTH: {widthVal ? `${widthVal} ${unitVal}` : "DIMENSION REQUIRED"}</text>
            </g>

            <g transform="translate(420, 120)">
              <rect x="-35" y="-50" width="70" height="100" rx="2" fill="none" stroke="#0f172a" strokeWidth="3.5" />
              <line x1="-35" y1="65" x2="35" y2="65" stroke="#0284c7" strokeWidth="1" />
              <text x="0" y="78" textAnchor="middle" className="text-[8px] font-bold fill-blue-600">WIDTH: 35.0 mm</text>
            </g>

            <text x="150" y="230" textAnchor="middle" className="text-[9px] font-bold fill-slate-800 uppercase">FRONT PROFILE VIEW</text>
            <text x="420" y="230" textAnchor="middle" className="text-[9px] font-bold fill-slate-800 uppercase">LATERAL PROFILE VIEW</text>
          </svg>
        )}
      </div>

      <div className="border p-3 bg-white space-y-1">
        <span className="font-bold text-slate-700 block border-b pb-1">Mechanical Specifications Tolerances</span>
        <div className="text-[9px] grid grid-cols-2 gap-4">
          <div>
            <strong>Contour Contour</strong>: {isRing ? "Concentric Ring Arc Loop" : "Rectangular Shell Enclosure"}<br />
            <strong>Target Tolerances</strong>: +/- 0.05 mm (ISO 2768-f)<br />
            <strong>Hypoallergenic Shell</strong>: {isRing ? "Grade 5 Biocompatible Titanium Sleeve" : "Anodized Aluminium AL6061"}
          </div>
          <div>
            <strong>Waterproofing Seal</strong>: O-Ring Gasket (IP68, 5ATM Rating)<br />
            <strong>Antenna Keepout</strong>: 5mm Copper-Free clearance window surrounding Chip Antenna.<br />
            <strong>Thermal Dissipation</strong>: Active copper LDO heatsink dissipation loop.
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// SH 04: INTERNAL LAYOUT BLUEPRINT
// ----------------------------------------------------
export const InternalLayoutSheet: React.FC<SheetProps> = ({ project }) => {
  const isRing = project.projectName.toLowerCase().includes("ring") || project.templateName?.toLowerCase().includes("ring");
  const boards = project.boards || [];

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-550 border-b border-slate-200 pb-2">
        DRAWING TITLE: INTERNAL COMPONENT ASSEMBLY STACKS & VOLUMETRIC PLANNING
      </div>

      <div className="w-full border border-slate-250 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[350px]">
        <svg className="w-full max-w-2xl h-80 bg-white border border-slate-200" viewBox="0 0 600 280">
          <rect width="100%" height="100%" fill="url(#arch-grid)" />
          <rect x="40" y="30" width="520" height="220" rx="3" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />
          <text x="50" y="44" className="text-[7.5px] font-bold fill-slate-400">CHASSIS BOUNDS SPACE CONSTRAINTS</text>

          {isRing ? (
            <g transform="translate(180, 140)">
              <circle cx="0" cy="0" r="70" fill="none" stroke="#cbd5e1" strokeWidth="1" />
              {/* Flex PCB arc */}
              <circle cx="0" cy="0" r="62" fill="none" stroke="#10b981" strokeWidth="3" />
              <text x="0" y="-76" textAnchor="middle" className="text-[7.5px] font-bold fill-emerald-600">MAIN FLEX FPC PATH</text>
              
              {/* Battery envelope */}
              <path d="M -50 40 A 64 64 0 0 1 -40 -48" fill="none" stroke="#f43f5e" strokeWidth="6" />
              <text x="-58" y="0" textAnchor="end" className="text-[7px] font-bold fill-rose-600 font-mono">BATTERY POUCH</text>
              
              {/* MCU Node */}
              <rect x="35" y="-18" width="18" height="24" rx="1" fill="#3b82f6" />
              <text x="58" y="-4" className="text-[7px] font-bold fill-blue-700">MCU U1</text>
              
              {/* Haptic cav */}
              <circle cx="0" cy="54" r="8" fill="#eab308" />
              <text x="0" y="72" textAnchor="middle" className="text-[7px] font-bold fill-amber-700">HAPTIC motor</text>
            </g>
          ) : (
            <g transform="translate(100, 80)">
              <rect x="0" y="0" width="400" height="120" rx="2" fill="none" stroke="#334155" strokeWidth="1.5" />
              {boards.slice(0, 2).map((b, idx) => (
                <g key={b.id || idx} transform={`translate(${15 + idx * 190}, 20)`}>
                  <rect x="0" y="0" width="170" height="80" fill="#fff" stroke="#10b981" strokeWidth="1.5" />
                  <text x="10" y="15" className="text-[8px] font-bold fill-slate-800">{b.name}</text>
                  <text x="10" y="27" className="text-[6.5px] fill-slate-400">TYPE: {b.boardType} | {b.substrate}</text>
                </g>
              ))}
            </g>
          )}

          {/* Notes column */}
          <g transform="translate(410, 45)">
            <rect x="0" y="0" width="140" height="190" rx="1.5" fill="#fafafa" stroke="#e2e8f0" />
            <text x="10" y="16" className="text-[7.5px] font-black fill-slate-500">ASSEMBLY NOTES</text>
            <text x="10" y="32" className="text-[7px] font-bold fill-slate-700">• FLEX ANGLE RULES</text>
            <text x="10" y="42" className="text-[6px] fill-slate-500">Maintain bend radius &gt; 1.5mm.</text>
            <text x="10" y="60" className="text-[7px] font-bold fill-slate-700">• THERMAL PATHS</text>
            <text x="10" y="70" className="text-[6px] fill-slate-500">Provide copper vias under LDO U2.</text>
            <text x="10" y="90" className="text-[7px] font-bold fill-slate-700">• ANTENNA KEEPOUT</text>
            <text x="10" y="100" className="text-[6px] fill-slate-500">No copper fills within 5mm width.</text>
          </g>
        </svg>
      </div>

      <div className="border p-3 bg-white space-y-1">
        <span className="font-bold text-slate-700 block border-b pb-1">Internal Stack Allocations Index</span>
        <table className="w-full text-[9px] text-left">
          <thead>
            <tr className="text-slate-400 border-b">
              <th className="pb-1">Internal Zone</th>
              <th className="pb-1">Linked Data Block</th>
              <th className="pb-1">Reason/Function</th>
              <th className="pb-1">Risk Heuristics</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-1 font-bold">Main Board Stack</td>
              <td>{boards[0]?.name || "Main Board"}</td>
              <td>Host processing & sensors</td>
              <td>Flex bend cracks, trace spacing shorts</td>
            </tr>
            <tr className="border-b border-slate-100">
              <td className="py-1 font-bold">Power Cell pouch</td>
              <td>BT1 Battery Cell</td>
              <td>Storage current reservoir</td>
              <td className="text-rose-600 font-bold">Thermal runaway risk in charging</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// SH 05: EXPLODED ASSEMBLY BLUEPRINT
// ----------------------------------------------------
export const ExplodedAssemblySheet: React.FC<SheetProps> = () => {
  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-550 border-b border-slate-200 pb-2">
        DRAWING TITLE: VERTICAL MECHANICAL LAYERS ASSEMBLY SCHEMATIC
      </div>

      <div className="w-full border border-slate-250 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[350px]">
        <svg className="w-full max-w-2xl h-80 bg-white border border-slate-200" viewBox="0 0 600 280">
          <rect width="100%" height="100%" fill="url(#arch-grid)" />
          <line x1="300" y1="10" x2="300" y2="250" stroke="#64748b" strokeWidth="0.8" strokeDasharray="4,4" />

          {/* Layer lines stack */}
          <g transform="translate(180, 20)">
            {[
              { id: 1, name: "01. OUTER PROTECTION METAL SHELL", fill: "#f1f5f9", stroke: "#0f172a" },
              { id: 2, name: "02. WATERPROOF EPOXY GASKET ADHESIVE", fill: "none", stroke: "#cbd5e1" },
              { id: 3, name: "03. PCBA / COPPER FLEX PCB CORE", fill: "#fef3c7", stroke: "#d97706" },
              { id: 4, name: "04. CURVED LIPO CELL ENVELOPE (BT1)", fill: "#fff5f5", stroke: "#f43f5e" },
              { id: 5, name: "05. HAPTIC ENGINE ACTUATOR CAVITY", fill: "#fffbeb", stroke: "#eab308" },
              { id: 6, name: "06. COMFORT SLEEVE HYPOALLERGENIC SLEEVE", fill: "#f8fafc", stroke: "#475569" }
            ].map((layer, idx) => (
              <g key={layer.id} transform={`translate(0, ${15 + idx * 38})`}>
                <rect x="-80" y="0" width="200" height="18" rx="2" fill={layer.fill} stroke={layer.stroke} strokeWidth="1.2" />
                <text x="20" y="11" textAnchor="middle" className="text-[8px] font-bold fill-slate-800 uppercase">{layer.name}</text>
                <circle cx="-95" cy="9" r="7" fill="#e2e8f0" />
                <text x="-95" y="11" textAnchor="middle" className="text-[7px] font-bold fill-slate-700">{layer.id}</text>
              </g>
            ))}
          </g>
        </svg>
      </div>

      {/* Assembly checklist rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9px] leading-relaxed">
        <div className="border p-2.5 bg-white space-y-1.5">
          <span className="font-bold text-slate-700 block border-b pb-1">Assembly Fastener Notes</span>
          <div>
            <strong>Primary Fastening</strong>: Threadless slot alignment sealed using UV-curing epoxy resin.<br />
            <strong>Adhesive Curing</strong>: 25°C room-temp cure for 24h. No high baking heat allowed.<br />
            <strong>IP68 Hermetic Seal</strong>: Check perimeter dispense track under microscope before closure.
          </div>
        </div>

        <div className="border p-2.5 bg-white space-y-1 text-rose-700 font-bold">
          <span className="text-slate-700 block border-b pb-1">Critical Assembly Risks</span>
          <div>
            • Flex copper fatigue cracking during slide-in.<br />
            • Thermal heat during soldering damaging LiPo separator pouch.<br />
            • Minor air gap voids in adhesive causing water leaks.<br />
            • Metal shell shield detuning the BLE antenna trace loop.
          </div>
        </div>
      </div>
    </div>
  );
};
