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
import { Download, Printer, AlertTriangle, CheckCircle } from 'lucide-react';

export const BlueprintSheets: React.FC = () => {
  const project = useProjectStore();
  const { 
    projectName, 
    templateName, 
    version = "1.0",
    nodes = [], 
    edges = [], 
    testing = [],
    powerBudget = [],
    firmwareTasks = [],
    boards = [],
    circuitBlocks = [],
    boardComponents = [],
    nets = [],
    pcbConstraints = [],
    manufacturingChecklist = [],
    batteryCapacityMah = 18
  } = project;

  const report = calculateReadinessScore(project);
  const [activeSheet, setActiveSheet] = useState<number>(1);
  const [copiedAlert, setCopiedAlert] = useState<string | null>(null);

  const sheets = [
    { num: 1, name: "Product Overview Architecture", desc: "Logical system subsystems and connections map" },
    { num: 2, name: "Outer Design Shell Blueprint", desc: "Physical casing dimensions, user touch zones, and charging pins" },
    { num: 3, name: "Internal Assembly & Stacking", desc: "Component layout, battery placement, and flex board curves" },
    { num: 4, name: "Exploded Assembly Diagram", desc: "Vertical mechanical layer stack order and materials notes" },
    { num: 5, name: "Board Plan Specifications", desc: "PCBs outline, layers count, substrate type, and mounting holes" },
    { num: 6, name: "Component Placement Concept", desc: "Reference designators placement, thermal and RF critical zones" },
    { num: 7, name: "Circuit Map Schematic Prep", desc: "Schematic modules, MCU routing cores, and interconnecting busses" },
    { num: 8, name: "Netlist Logical Routing Map", desc: "Voltages rails, Ground references, and signal track buses" },
    { num: 9, name: "Power Tree Diagram", desc: "Charger PMIC flow, regulator stages, and peripherals current estimates" },
    { num: 10, name: "Firmware State-Machine Flow", desc: "Boot, sleep cycle transitions, and driver software tasks" },
    { num: 11, name: "Testing Protocol Timeline", desc: "Horizontal validation gates (EVT/DVT/PVT/QA) and logs" },
    { num: 12, name: "Manufacturing Handoff Checklist", desc: "Pre-layout factory checker notes and review disclaimers" }
  ];

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

  const parseDimensions = (dimStr: string) => {
    if (!dimStr) return null;
    const parts = dimStr.split(/x|X|\*/).map(p => parseFloat(p.trim())).filter(n => !isNaN(n));
    if (parts.length >= 2) return { w: parts[0], h: parts[1] };
    return null;
  };

  // Reusable Title Block Render
  const renderTitleBlock = (sheetName: string, sheetNum: number) => {
    return (
      <div className="border-t-2 border-slate-900 bg-white grid grid-cols-4 text-[9px] font-mono select-none font-bold uppercase mt-6 print:break-inside-avoid">
        <div className="border-r border-slate-900 p-2.5 space-y-1">
          <span className="text-[7px] text-slate-400 block font-normal">PROJECT NAME</span>
          <span className="text-slate-800 text-xs font-black tracking-tight">{projectName}</span>
        </div>
        <div className="border-r border-slate-900 p-2.5 space-y-1">
          <span className="text-[7px] text-slate-400 block font-normal">SHEET TITLE</span>
          <span className="text-slate-800 text-xs font-black tracking-tight">{sheetName}</span>
        </div>
        <div className="border-r border-slate-900 p-2.5 space-y-1">
          <span className="text-[7px] text-slate-400 block font-normal">SHEET DETAIL</span>
          <span className="text-slate-850 block">SCALE: NONE</span>
          <span className="text-slate-850 block">REV: {version}</span>
        </div>
        <div className="p-2.5 space-y-1 flex flex-col justify-between">
          <div className="flex justify-between items-center text-[7px] text-slate-400 font-normal">
            <span>BY SYSTEM ALPHA</span>
            <span>SH {sheetNum} OF 12</span>
          </div>
          <span className="text-[7px] text-rose-500 block leading-tight font-extrabold">CONCEPTUAL PREP - NOT FOR FAB</span>
        </div>
      </div>
    );
  };

  // 1. PRODUCT OVERVIEW SHEET
  const renderOverviewSheet = () => {
    const categories = Array.from(new Set(nodes.map(n => n.data?.category).filter(Boolean)));
    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          System schematic displaying logical subsystems and connection lines compiled from the blueprint canvas.
        </div>
        
        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          {nodes.length === 0 ? (
            <div className="text-[10px] font-mono text-slate-400">NO BLUEPRINT NODES AVAILABLE - SEED A TEMPLATE</div>
          ) : (
            <svg className="w-full max-w-2xl h-64" viewBox="0 0 600 240">
              {categories.slice(0, 3).map((cat, i) => (
                <g key={i}>
                  <rect x={20 + i * 190} y={30} width={170} height={160} rx={4} fill="#fff" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
                  <text x={30 + i * 190} y={24} className="text-[8px] font-mono font-bold fill-slate-400 uppercase tracking-wider">{cat}</text>
                  
                  {nodes.filter(n => n.data?.category === cat).slice(0, 3).map((node, j) => (
                    <g key={j}>
                      <rect x={30 + i * 190} y={45 + j * 45} width={150} height={35} rx={2} fill="#f8fafc" stroke="#334155" strokeWidth="1" />
                      <text x={40 + i * 190} y={60 + j * 45} className="text-[9px] font-mono font-bold fill-slate-700">{node.data?.name.slice(0, 20)}</text>
                      <text x={40 + i * 190} y={72 + j * 45} className="text-[7px] font-mono fill-slate-400">STATUS: {node.data?.status || 'MVP'}</text>
                    </g>
                  ))}
                </g>
              ))}

              {edges.slice(0, 4).map((edge, i) => {
                const xOffset = 180 + (i % 2) * 190;
                const yOffset = 80 + (i > 1 ? 60 : 0);
                return (
                  <path key={i} d={`M ${xOffset} ${yOffset} L ${xOffset + 40} ${yOffset}`} fill="none" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="2,2" />
                );
              })}
            </svg>
          )}
        </div>

        <div className="space-y-1">
          <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono">Conceptual Subsystems Summary</span>
          <div className="grid grid-cols-3 gap-4 text-[10px] font-mono">
            <div className="border border-slate-200 p-2 rounded bg-white">
              <span className="text-slate-400 block text-[8px]">READINESS INDEX</span>
              <span className="text-slate-800 font-bold text-xs">{report.overallScore}/100</span>
            </div>
            <div className="border border-slate-200 p-2 rounded bg-white">
              <span className="text-slate-400 block text-[8px]">BLOCKERS</span>
              <span className="text-rose-600 font-bold text-xs">{report.blockers.length} ACTIVE</span>
            </div>
            <div className="border border-slate-200 p-2 rounded bg-white">
              <span className="text-slate-400 block text-[8px]">WARNINGS</span>
              <span className="text-amber-600 font-bold text-xs">{report.warnings.length} DIAGNOSED</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 2. OUTER DESIGN SHEET
  const renderOuterSheet = () => {
    const isRing = projectName.toLowerCase().includes("ring") || templateName?.toLowerCase().includes("ring");
    
    // Attempt to extract constraints dimensions
    const widthConstraint = pcbConstraints.find(c => c.constraintType === 'Board Outline' || c.description.toLowerCase().includes('width'));
    const widthVal = widthConstraint?.value || (isRing ? "18.5" : "45.0");
    const unitVal = widthConstraint?.unit || "mm";

    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Outer case dimensions blueprint. Renders physical chassis outlines, touch zones, and charging pins.
        </div>

        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          {isRing ? (
            <svg className="w-full max-w-lg h-60" viewBox="0 0 500 220">
              <circle cx="150" cy="110" r="55" fill="none" stroke="#334155" strokeWidth="6" />
              <circle cx="150" cy="110" r="47" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              
              <line x1="90" y1="110" x2="210" y2="110" stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="95" y1="106" x2="95" y2="114" stroke="#0284c7" strokeWidth="1" />
              <line x1="205" y1="106" x2="205" y2="114" stroke="#0284c7" strokeWidth="1" />
              <text x="115" y="102" className="text-[9px] font-mono fill-blue-600 font-bold">DIA: {widthVal}{unitVal}</text>

              <rect x="135" y="44" width="30" height="12" rx="1" fill="#334155" stroke="#334155" />
              <text x="175" y="52" className="text-[8px] font-mono fill-slate-500 font-bold">← ELECTRONICS COVER ARC</text>

              <rect x="320" y="80" width="80" height="60" rx="3" fill="none" stroke="#334155" strokeWidth="2" />
              <line x1="320" y1="110" x2="400" y2="110" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
              
              <rect x="340" y="90" width="40" height="40" rx="1" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="2,2" />
              <text x="332" y="85" className="text-[7px] font-mono fill-blue-600 font-bold">TOUCH POLLING REGION</text>

              <text x="310" y="160" className="text-[9px] font-mono fill-slate-700 font-bold uppercase">Wearable Outer Profile</text>
            </svg>
          ) : (
            <svg className="w-full max-w-lg h-60" viewBox="0 0 500 220">
              <rect x="120" y="50" width="180" height="110" rx="4" fill="none" stroke="#334155" strokeWidth="2" />
              
              <line x1="120" y1="180" x2="300" y2="180" stroke="#0284c7" strokeWidth="1" />
              <line x1="120" y1="176" x2="120" y2="184" stroke="#0284c7" strokeWidth="1" />
              <line x1="300" y1="176" x2="300" y2="184" stroke="#0284c7" strokeWidth="1" />
              <text x="180" y="195" className="text-[9px] font-mono fill-blue-600 font-bold">WIDTH: {widthVal} {unitVal}</text>

              <rect x="294" y="90" width="6" height="20" rx="1" fill="#64748b" />
              <text x="310" y="102" className="text-[8px] font-mono fill-slate-500 font-bold">← CONNECTOR PORT</text>
              <text x="150" y="110" className="text-[9px] font-mono fill-slate-700 font-bold uppercase">Generic Chassis Profile</text>
            </svg>
          )}
        </div>
      </div>
    );
  };

  // 3. INTERNAL ASSEMBLY SHEET
  const renderInternalSheet = () => {
    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Internal layout map. Places active boards, batteries, haptic motors, and RF antennas.
        </div>

        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
            <rect x="40" y="30" width="420" height="180" rx="6" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x="50" y="45" className="text-[8px] font-mono fill-slate-450 font-bold uppercase">CHASSIS SPACE CONSTRAINTS ENVELOPE</text>

            {/* Render actual boards */}
            {boards.slice(0, 2).map((b, i) => (
              <g key={b.id}>
                <rect x={70 + i * 190} y={60} width={150} height={120} rx={3} fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
                <text x={80 + i * 190} y={80} className="text-[9px] font-mono fill-amber-900 font-bold">{b.name.toUpperCase()}</text>
                <text x={80 + i * 190} y={95} className="text-[8px] font-mono fill-amber-700">SUBSTRATE: {b.substrate}</text>
                <text x={80 + i * 190} y={110} className="text-[8px] font-mono fill-amber-750">DIM: {b.dimensionsMm || 'REQUIRED'}</text>
              </g>
            ))}

            {boardComponents.some(c => c.componentType.toLowerCase().includes('battery')) && (
              <g>
                <rect x={150} y={130} width={80} height={40} rx={2} fill="#fff" stroke="#334155" strokeWidth="1" />
                <text x={155} y={152} className="text-[7.5px] font-mono fill-slate-700 font-bold">BATTERY POUCH</text>
              </g>
            )}
          </svg>
        </div>
      </div>
    );
  };

  // 4. EXPLODED ASSEMBLY SHEET
  const renderExplodedSheet = () => {
    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Exploded vertical assembly stacks. Indicates assembly order and fastening specifications.
        </div>

        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          <svg className="w-full max-w-lg h-64" viewBox="0 0 500 240">
            <line x1="250" y1="20" x2="250" y2="220" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4" />

            <rect x="150" y="30" width="200" height="20" rx="3" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
            <text x="250" y="42" className="text-[9px] font-mono font-bold fill-slate-700" textAnchor="middle">01. OUTER CASING SHELL</text>

            <rect x="170" y="75" width="160" height="15" rx="2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
            <text x="250" y="85" className="text-[8px] font-mono fill-slate-550" textAnchor="middle">02. EPOXY WATERPROOF SEAL/GLUE</text>

            {boards.slice(0, 1).map(b => (
              <g key={b.id}>
                <rect x="160" y="115" width="180" height="20" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
                <text x="250" y="128" className="text-[9px] font-mono font-bold fill-amber-800" textAnchor="middle">03. PCBA: {b.name.toUpperCase()}</text>
              </g>
            ))}

            <rect x="180" y="160" width="140" height="20" rx="3" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
            <text x="250" y="173" className="text-[9px] font-mono font-bold fill-slate-700" textAnchor="middle">04. POWER POUCH cell</text>

            <rect x="150" y="205" width="200" height="20" rx="3" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
            <text x="250" y="218" className="text-[9px] font-mono font-bold fill-slate-700" textAnchor="middle">05. INNER RESIN sleeve/backing</text>
          </svg>
        </div>
      </div>
    );
  };

  // 5. BOARD PLAN SPECIFICATIONS
  const renderBoardSheet = () => {
    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Detailed dimensions and substrates from actual boards.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(boards.length > 0 ? boards : [
            { id: "missing", name: "No Board Configured", boardType: "Main PCB", substrate: "FR4", dimensionsMm: "", layerCount: 2, placement: "Internal", status: "Concept" }
          ]).map((b, idx) => {
            const dims = parseDimensions(b.dimensionsMm);
            const isFlex = b.substrate?.toLowerCase().includes("flex");
            return (
              <div key={b.id || idx} className="border border-slate-200 rounded p-4 bg-white space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 font-mono">SH 05.{idx+1}: {b.name}</span>
                  <Badge variant="neutral" className="text-[8px] font-mono tracking-wider font-bold">{b.boardType}</Badge>
                </div>

                <div className="w-full h-32 bg-slate-50 border border-slate-100 rounded flex items-center justify-center relative">
                  {dims ? (
                    isFlex ? (
                      <svg className="w-full max-w-[180px] h-20" viewBox="0 0 120 60">
                        <path d="M 10 30 Q 60 10 110 30 L 110 40 Q 60 20 10 40 Z" fill="none" stroke="#d97706" strokeWidth="2" />
                        <line x1="10" y1="20" x2="110" y2="20" stroke="#0284c7" strokeWidth="1" strokeDasharray="2,2" />
                        <text x="45" y="16" className="text-[8px] font-mono fill-blue-600 font-bold">{dims.w} mm</text>
                      </svg>
                    ) : (
                      <svg className="w-full max-w-[180px] h-20" viewBox="0 0 120 60">
                        <rect x="20" y="15" width="80" height="30" rx="3" fill="none" stroke="#334155" strokeWidth="2" />
                        <line x1="20" y1="52" x2="100" y2="52" stroke="#0284c7" strokeWidth="1" strokeDasharray="2,2" />
                        <text x="45" y="48" className="text-[8px] font-mono fill-blue-600 font-bold">{dims.w} mm</text>
                      </svg>
                    )
                  ) : (
                    <span className="text-[8px] font-mono text-rose-500 font-black tracking-widest bg-rose-50 border border-rose-100 px-2 py-1 rounded">
                      DIMENSION REQUIRED
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-550 leading-relaxed">
                  <div><strong>Substrate</strong>: {b.substrate}</div>
                  <div><strong>Layer Count</strong>: {b.layerCount || "TBD"}</div>
                  <div><strong>Placement</strong>: {b.placement}</div>
                  <div><strong>Dimensions</strong>: {b.dimensionsMm || "DIMENSION REQUIRED"}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 6. COMPONENT PLACEMENT SHEET
  const renderComponentSheet = () => {
    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Conceptual component placement grid mapped from the active Board Components library.
        </div>

        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          {boardComponents.length === 0 ? (
            <div className="text-[10px] font-mono text-rose-500 font-black bg-rose-50 border border-rose-100 p-3.5 rounded">
              NO PLACED COMPONENTS DATA - GENERATE PRODUCT PLAN OR SEED TEMPLATE
            </div>
          ) : (
            <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
              {/* Draw casing board outline */}
              <rect x="40" y="50" width="420" height="150" rx="3" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="5,5" />
              <text x="50" y="44" className="text-[8px] font-mono fill-slate-400 font-bold uppercase">PHYSICAL MOUNTING BOUNDS</text>

              {/* Distribute components in a grid layout dynamically */}
              {boardComponents.map((c, i) => {
                const cols = Math.min(5, Math.ceil(Math.sqrt(boardComponents.length)));
                const row = Math.floor(i / cols);
                const col = i % cols;
                const totalRows = Math.ceil(boardComponents.length / cols);
                
                const x = 70 + col * (360 / Math.max(1, cols - 1 || 1));
                const y = 80 + row * (90 / Math.max(1, totalRows - 1 || 1));

                // Border color by criticality
                let strokeCol = "#475569";
                if (c.placementCriticality === 'High' || c.placementCriticality === 'RF Critical') {
                  strokeCol = "#dc2626";
                } else if (c.placementCriticality === 'Medium' || c.placementCriticality === 'Thermal Critical') {
                  strokeCol = "#2563eb";
                }

                return (
                  <g key={c.id || i}>
                    <rect x={x} y={y} width={38} height={24} rx={1} fill="#fff" stroke={strokeCol} strokeWidth="1.5" />
                    <text x={x + 19} y={y + 12} className="text-[8px] font-mono font-bold fill-slate-700 text-anchor-middle" textAnchor="middle">{c.referenceDesignator}</text>
                    <text x={x + 19} y={y + 22} className="text-[6px] font-mono fill-slate-450 text-anchor-middle" textAnchor="middle">{c.packageName.slice(0, 8)}</text>
                    <text x={x} y={y - 4} className="text-[5.5px] font-mono font-black fill-slate-500 truncate w-36">{c.componentName.slice(0, 8)}</text>
                  </g>
                );
              })}

              <text x="140" y="225" className="text-[8.5px] font-mono fill-rose-500 font-bold uppercase">CONCEPTUAL PLACEMENT ONLY — COMPLETE PHYSICAL ROUTING IN ECAD</text>
            </svg>
          )}
        </div>
      </div>
    );
  };

  // 7. CIRCUIT MAP SHEET
  const renderCircuitSheet = () => {
    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Schematic circuit blocks functional connectivity tree.
        </div>

        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          {circuitBlocks.length === 0 ? (
            <div className="text-[10px] font-mono text-slate-400">NO CIRCUIT BLOCKS CONFIGURED - RUN GENERATOR</div>
          ) : (
            <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
              {/* Plot MCU in center if available, otherwise draw list */}
              {circuitBlocks.map((c, i) => {
                const total = circuitBlocks.length;
                const angle = (i * 2 * Math.PI) / total;
                const isMcu = c.circuitType === 'MCU';
                
                // MCU in center, others in circle
                const x = isMcu ? 250 : 250 + Math.cos(angle) * 160;
                const y = isMcu ? 110 : 110 + Math.sin(angle) * 75;

                return (
                  <g key={c.id || i}>
                    {/* Draw line to center MCU if not MCU itself */}
                    {!isMcu && (
                      <line x1={x} y1={y} x2={250} y2="110" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
                    )}
                    <rect x={x - 45} y={y - 20} width={90} height={40} rx={2} fill="#fff" stroke={isMcu ? '#1e293b' : '#3b82f6'} strokeWidth="1.5" />
                    <text x={x} y={y - 6} className="text-[7.5px] font-mono font-bold fill-slate-800 text-anchor-middle" textAnchor="middle">{c.name.slice(0, 16)}</text>
                    <text x={x} y={y + 6} className="text-[6.5px] font-mono fill-slate-450 text-anchor-middle" textAnchor="middle">REF: {c.referenceDesignators.slice(0, 12)}</text>
                    <text x={x} y={y + 16} className="text-[6px] font-mono fill-blue-600 text-anchor-middle" textAnchor="middle">{c.circuitType.toUpperCase()}</text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>
    );
  };

  // 8. NET ROUTING SHEET
  const renderNetlistSheet = () => {
    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Logical trace networks compiled from active project nets databases.
        </div>

        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          {nets.length === 0 ? (
            <div className="text-[10px] font-mono text-slate-400">NO NETS DEFINED - SEED AN ACTIVE TEMPLATE</div>
          ) : (
            <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
              {/* Rails */}
              <line x1="40" y1="30" x2="460" y2="30" stroke="#ef4444" strokeWidth="2.5" />
              <text x="50" y="24" className="text-[8px] font-mono fill-red-600 font-bold">POWER RAILS (VBAT / 3V3)</text>

              <line x1="40" y1="210" x2="460" y2="210" stroke="#475569" strokeWidth="2.5" />
              <text x="50" y="202" className="text-[8px] font-mono fill-slate-600 font-bold">GND REFERENCE RAIL</text>

              {/* Draw nets path lines */}
              {nets.slice(0, 6).map((n, i) => {
                const xPos = 80 + i * 65;
                const isGnd = n.netName.toUpperCase() === 'GND';
                const isPower = n.netType === 'Power';

                return (
                  <g key={n.id || i}>
                    {isGnd ? (
                      <line x1={xPos} y1={210} x2={xPos} y2="130" stroke="#475569" strokeWidth="1.5" />
                    ) : isPower ? (
                      <line x1={xPos} y1="30" x2={xPos} y2="130" stroke="#ef4444" strokeWidth="1.5" />
                    ) : (
                      <line x1={xPos} y1="70" x2={xPos} y2="130" stroke="#3b82f6" strokeWidth="1" strokeDasharray="3,3" />
                    )}
                    
                    <rect x={xPos - 25} y="130" width="50" height="30" rx="1" fill="#fff" stroke="#94a3b8" />
                    <text x={xPos} y="142" className="text-[7px] font-mono fill-slate-700 text-anchor-middle" textAnchor="middle">{n.netName.slice(0, 10)}</text>
                    <text x={xPos} y="152" className="text-[6px] font-mono fill-slate-450 text-anchor-middle" textAnchor="middle">{n.voltage || 'SIGNAL'}</text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>
    );
  };

  // 9. POWER TREE SHEET
  const renderPowerSheet = () => {
    const totalAvg = powerBudget.reduce((sum, item) => {
      const active = item.activeCurrentMa || 0;
      const duty = (item.dutyCyclePercent || 0) / 100;
      const qty = item.quantity || 1;
      return sum + (active * duty * qty);
    }, 0);

    const estRuntime = totalAvg > 0 ? (batteryCapacityMah / totalAvg).toFixed(1) : null;

    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Power tree regulator tree and estimated loads summary computed dynamically.
        </div>

        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
            {/* Battery Cell block */}
            <rect x="40" y="90" width="90" height="50" rx="2" fill="#fff" stroke="#10b981" strokeWidth="2" />
            <text x="50" y="112" className="text-[9px] font-mono font-bold fill-emerald-800">LIPO BATTERY</text>
            <text x="50" y="125" className="text-[8px] font-mono fill-slate-555">{batteryCapacityMah} mAh Cell</text>

            {/* PMIC / Regulator block */}
            <rect x="180" y="90" width="90" height="50" rx="2" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="190" y="112" className="text-[9px] font-mono font-bold fill-blue-800">LDO REGULATOR</text>
            <text x="190" y="125" className="text-[8px] font-mono fill-slate-555">VOUT: 3.3V</text>

            {/* Path lines */}
            <line x1="130" y1="115" x2="180" y2="115" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <line x1="270" y1="115" x2="310" y2="115" stroke="#3b82f6" strokeWidth="1.5" />

            {/* Loads listing */}
            {powerBudget.slice(0, 3).map((p, i) => {
              const yPos = 40 + i * 65;
              return (
                <g key={p.id || i}>
                  <line x1="310" y1="115" x2="310" y2={yPos + 15} stroke="#3b82f6" strokeWidth="1" />
                  <line x1="310" y1={yPos + 15} x2="340" y2={yPos + 15} stroke="#3b82f6" strokeWidth="1" markerEnd="url(#arrow)" />
                  
                  <rect x="340" y={yPos} width="110" height="35" rx="1" fill="#fff" stroke="#475569" />
                  <text x="348" y={yPos + 14} className="text-[7.5px] font-mono font-bold fill-slate-800">{p.blockName.slice(0, 16)}</text>
                  <text x="348" y={yPos + 25} className="text-[7px] font-mono fill-slate-450">{p.activeCurrentMa}mA / {p.dutyCyclePercent}% Duty</text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
          <div className="border border-slate-200 p-2.5 rounded bg-white">
            <span className="text-slate-400 block text-[8px] uppercase">Calculated Average Current</span>
            <span className="text-slate-800 font-bold text-xs">{totalAvg.toFixed(2)} mA</span>
          </div>
          <div className="border border-slate-200 p-2.5 rounded bg-white">
            <span className="text-slate-400 block text-[8px] uppercase">Estimated Battery Lifespan</span>
            <span className="text-emerald-700 font-bold text-xs">{estRuntime ? `${estRuntime} Hours continuous` : 'TBD'}</span>
          </div>
        </div>
      </div>
    );
  };

  // 10. FIRMWARE STATE-MACHINE FLOW
  const renderFirmwareSheet = () => {
    const tasksByType = (type: string) => firmwareTasks.filter(t => t.type === type);
    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          On-device firmware controller task states. Mapped dynamically from actual firmware plan registries.
        </div>

        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          {firmwareTasks.length === 0 ? (
            <div className="text-[10px] font-mono text-slate-450">NO FIRMWARE TASKS CONFIGURED - RUN SCHEMATIC PLANNER</div>
          ) : (
            <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
              {/* Boot Sequence flowchart */}
              <rect x="30" y="90" width="80" height="50" rx="3" fill="#fff" stroke="#334155" strokeWidth="1.5" />
              <text x="40" y="112" className="text-[8px] font-mono font-bold fill-slate-700">01. BOOT INIT</text>
              <text x="40" y="125" className="text-[6.5px] font-mono fill-slate-450">System setup()</text>

              <line x1="110" y1="115" x2="160" y2="115" stroke="#94a3b8" strokeWidth="1" markerEnd="url(#arrow)" />

              {/* Loop node */}
              <rect x="160" y="90" width="90" height="50" rx="3" fill="#fff" stroke="#3b82f6" strokeWidth="2" />
              <text x="170" y="112" className="text-[8.5px] font-mono font-bold fill-blue-800">02. STATE LOOP</text>
              <text x="170" y="125" className="text-[7px] font-mono fill-slate-450">loop() scheduler</text>

              {/* Render dynamic task blocks as sub-bubbles */}
              {['Driver', 'BLE', 'Safety'].slice(0, 3).map((type, idx) => {
                const list = tasksByType(type);
                const xPos = 290 + idx * 65;
                return (
                  <g key={type}>
                    <line x1="250" y1="115" x2={xPos - 15} y2={80 + idx * 30} stroke="#cbd5e1" strokeWidth="1" />
                    <rect x={xPos - 15} y={65 + idx * 30} width={45} height={25} rx={1} fill="#fff" stroke="#94a3b8" />
                    <text x={xPos + 8} y={78 + idx * 30} className="text-[6px] font-mono font-bold fill-slate-600 text-anchor-middle" textAnchor="middle">{type.toUpperCase()}</text>
                    <text x={xPos + 8} y={86 + idx * 30} className="text-[5.5px] font-mono fill-slate-450 text-anchor-middle" textAnchor="middle">{list.length} tasks</text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>
    );
  };

  // 11. TESTING PROTOCOL TIMELINE
  const renderTestingSheet = () => {
    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Dynamic testing lanes grouped by category milestones.
        </div>

        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          {testing.length === 0 ? (
            <div className="text-[10px] font-mono text-slate-450">NO TESTS PROTOCOLS REGISTERED - GENERATE TIMELINES</div>
          ) : (
            <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
              {['EVT', 'DVT', 'PVT', 'QA'].map((lane, idx) => {
                const xPos = 30 + idx * 115;
                const laneTests = testing.filter(t => (t.category || 'EVT').toUpperCase() === lane);
                return (
                  <g key={lane}>
                    <rect x={xPos} y={20} width={105} height={180} rx={3} fill="#fff" stroke="#cbd5e1" />
                    <text x={xPos + 10} y={35} className="text-[9px] font-mono font-extrabold fill-slate-700 tracking-wider uppercase">{lane} LANE</text>
                    
                    {laneTests.slice(0, 3).map((t, j) => {
                      let tagCol = "#64748b";
                      if (t.status === 'Passed') tagCol = "#10b981";
                      if (t.status === 'Failed') tagCol = "#ef4444";
                      if (t.status === 'Blocked') tagCol = "#f59e0b";

                      return (
                        <g key={t.id || j}>
                          <rect x={xPos + 5} y={50 + j * 45} width={95} height={35} rx={1} fill="#f8fafc" stroke={tagCol} strokeWidth="1" />
                          <text x={xPos + 10} y={63} className="text-[6.5px] font-mono font-bold fill-slate-700 truncate w-80">{t.name.slice(0, 16)}</text>
                          <text x={xPos + 10} y={73} className="text-[5.5px] font-mono fill-slate-455 font-semibold">{t.status.toUpperCase()}</text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </svg>
          )}
        </div>
      </div>
    );
  };

  // 12. MANUFACTURING HANDOFF CHECKLIST
  const renderMfgHandoffSheet = () => {
    return (
      <div className="space-y-4 flex-grow flex flex-col justify-between">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Factory handoff verification summary. Tracks layout completeness, compliance checks, and release blockers.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded p-4 bg-white space-y-3 shadow-sm">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest font-mono block">Gateway Releases status</span>
            <ul className="space-y-2 text-[10px] font-mono text-slate-650">
              <li className="flex justify-between items-center">
                <span>ECAD Layout Release:</span>
                <span className={`font-black ${report.canMoveToEcad ? 'text-emerald-600' : 'text-slate-450'}`}>{report.canMoveToEcad ? 'PASSED' : 'LOCKED'}</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Prototype Spin Release:</span>
                <span className={`font-black ${report.canMoveToPrototype ? 'text-emerald-600' : 'text-slate-450'}`}>{report.canMoveToPrototype ? 'PASSED' : 'LOCKED'}</span>
              </li>
              <li className="flex justify-between items-center">
                <span>Factory Handoff Release:</span>
                <span className={`font-black ${report.canMoveToFactoryHandoff ? 'text-emerald-600' : 'text-slate-450'}`}>{report.canMoveToFactoryHandoff ? 'PASSED' : 'LOCKED'}</span>
              </li>
            </ul>
          </div>

          <div className="border border-slate-200 rounded p-4 bg-white space-y-3 shadow-sm">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest font-mono block">Pre-Layout Checklist Audit</span>
            <div className="space-y-1.5 text-[10px] font-mono text-slate-550">
              <div><strong>Checked Items</strong>: {manufacturingChecklist.filter(c => c.status === 'Done').length} of {manufacturingChecklist.length}</div>
              <div><strong>Active Blockers</strong>: {report.blockers.length} issues</div>
              <div><strong>Warnings</strong>: {report.warnings.length} notifications</div>
            </div>
          </div>
        </div>

        {report.blockers.length > 0 && (
          <div className="border border-rose-200 bg-rose-50 p-4 rounded text-[10px] font-mono leading-relaxed text-rose-800 flex items-start space-x-3 select-none">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong>CRITICAL FABRICATION BLOCKERS ({report.blockers.length})</strong>
              <ul className="list-disc pl-4 space-y-0.5">
                {report.blockers.slice(0, 3).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActiveSheet = () => {
    switch (activeSheet) {
      case 1: return renderOverviewSheet();
      case 2: return renderOuterSheet();
      case 3: return renderInternalSheet();
      case 4: return renderExplodedSheet();
      case 5: return renderBoardSheet();
      case 6: return renderComponentSheet();
      case 7: return renderCircuitSheet();
      case 8: return renderNetlistSheet();
      case 9: return renderPowerSheet();
      case 10: return renderFirmwareSheet();
      case 11: return renderTestingSheet();
      case 12: return renderMfgHandoffSheet();
      default: return renderOverviewSheet();
    }
  };

  const currentSheet = sheets.find(s => s.num === activeSheet)!;

  return (
    <div className="flex-1 flex min-h-0 bg-slate-100 font-sans print:bg-white print:p-0">
      
      {/* Dynamic Global Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Hide all screen interface elements */
          body > div:not(.print-pack-container),
          aside, nav, header, button, .print-hidden, .fixed {
            display: none !important;
          }
          /* Show print container */
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
            border: 2px solid #000 !important;
            box-sizing: border-box;
            background: white !important;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
        }
      `}} />

      {copiedAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-950 text-white rounded-lg px-4 py-3.5 shadow-xl max-w-sm flex items-center space-x-3 print:hidden">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-mono">{copiedAlert}</span>
        </div>
      )}

      {/* Sheets Sidebar Selector - Hidden on Print */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col min-h-0 print:hidden select-none shrink-0 font-mono text-xs">
        <div className="p-4 border-b border-slate-150 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Blueprint Sheets Pack</span>
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-tight">12 Verification Sheets</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
          {sheets.map(s => (
            <button
              key={s.num}
              onClick={() => setActiveSheet(s.num)}
              className={`w-full text-left px-3 py-2.5 rounded transition-all flex flex-col space-y-0.5 border cursor-pointer ${
                activeSheet === s.num
                  ? 'bg-slate-900 border-slate-950 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-50 border-transparent text-slate-650'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-wider block">
                SH {s.num.toString().padStart(2, '0')}: {s.name.slice(0, 24)}...
              </span>
              <span className={`text-[8px] leading-normal font-medium block ${
                activeSheet === s.num ? 'text-slate-350' : 'text-slate-450'
              }`}>
                {s.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Blueprint Sheet Workspace Canvas */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6 space-y-6 print:hidden">
        
        {/* Controls Bar */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Drawing Sheet Workspace</span>
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight font-mono">Sheet {activeSheet} of 12</h3>
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

        {/* Blueprint Paper Drawing Sheet */}
        <div className="bg-white border-2 border-slate-900 rounded-lg shadow-md p-8 flex flex-col justify-between min-h-[680px] relative overflow-hidden">
          
          {/* Blueprint Draft Paper Grid pattern Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none" 
               style={{ 
                 backgroundSize: '20px 20px', 
                 backgroundImage: 'linear-gradient(to right, #0284c7 1px, transparent 1px), linear-gradient(to bottom, #0284c7 1px, transparent 1px)' 
               }} 
          />

          <div className="space-y-5 flex-1 flex flex-col justify-between">
            {/* Sheet Title Bar */}
            <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-center select-none">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">SHEET {activeSheet.toString().padStart(2, '0')} SPECIFICATION</span>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight font-mono">{currentSheet.name}</h2>
              </div>
              <span className="text-[10px] font-bold font-mono text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
                BY SYSTEM ALPHA
              </span>
            </div>

            {/* Dynamic Sheet Diagram Workspace */}
            <div className="flex-1 py-4 flex flex-col justify-center min-h-[300px]">
              {renderActiveSheet()}
            </div>

            {/* Reusable Blueprint Title Block */}
            {renderTitleBlock(currentSheet.name, activeSheet)}
          </div>
        </div>
      </div>

      {/* PRINT-ONLY PACK CONTAINER - Page Break Separated */}
      <div className="hidden print-pack-container">
        {sheets.map(s => {
          let sheetRenderer = renderOverviewSheet;
          if (s.num === 2) sheetRenderer = renderOuterSheet;
          if (s.num === 3) sheetRenderer = renderInternalSheet;
          if (s.num === 4) sheetRenderer = renderExplodedSheet;
          if (s.num === 5) sheetRenderer = renderBoardSheet;
          if (s.num === 6) sheetRenderer = renderComponentSheet;
          if (s.num === 7) sheetRenderer = renderCircuitSheet;
          if (s.num === 8) sheetRenderer = renderNetlistSheet;
          if (s.num === 9) sheetRenderer = renderPowerSheet;
          if (s.num === 10) sheetRenderer = renderFirmwareSheet;
          if (s.num === 11) sheetRenderer = renderTestingSheet;
          if (s.num === 12) sheetRenderer = renderMfgHandoffSheet;

          return (
            <div key={s.num} className="print-sheet-page">
              <div className="w-full flex-1 flex flex-col justify-between">
                <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-end">
                  <div>
                    <span className="text-[8px] font-mono block text-slate-400">SHEET {s.num.toString().padStart(2, '0')} SPECIFICATION</span>
                    <h2 className="text-xs font-black font-mono uppercase text-slate-900">{s.name}</h2>
                  </div>
                  <span className="text-[8px] font-mono text-slate-500 uppercase text-anchor-end" style={{ textAnchor: 'end' }}>System Alpha Builder</span>
                </div>

                <div className="flex-1 py-4 flex flex-col justify-center min-h-[300px]">
                  {sheetRenderer()}
                </div>

                {renderTitleBlock(s.name, s.num)}
              </div>
            </div>
          );
        })}
      </div>

      {/* SVG Marker Definitions */}
      <svg className="hidden w-0 h-0" aria-hidden="true">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
          </marker>
        </defs>
      </svg>

    </div>
  );
};
