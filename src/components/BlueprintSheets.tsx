import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { calculateReadinessScore } from '../lib/readinessScore';
import { exportBlueprintSheetsMarkdown, exportBlueprintSheetsJson } from '../lib/exportBlueprintSheets';
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
    boards = [],
    boardComponents = [],
    nets = []
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

  // 12 Sheet Renderers
  const renderOverviewSheet = () => {
    const categories = Array.from(new Set(nodes.map(n => n.data?.category).filter(Boolean)));
    return (
      <div className="space-y-4">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Overview diagram displaying logical system subsystems and connections mapped from the active blueprint canvas model.
        </div>
        
        {/* SVG Diagram */}
        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          <svg className="w-full max-w-2xl h-64" viewBox="0 0 600 240">
            {/* Draw grouped Category boxes */}
            {categories.slice(0, 3).map((cat, i) => (
              <g key={i}>
                <rect x={40 + i * 180} y={40} width={150} height={120} rx={4} fill="#fff" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
                <text x={50 + i * 180} y={35} className="text-[8px] font-mono font-bold fill-slate-400 uppercase tracking-wider">{cat}</text>
                
                {/* Node representation items inside category */}
                {nodes.filter(n => n.data?.category === cat).slice(0, 2).map((node, j) => (
                  <g key={j}>
                    <rect x={55 + i * 180} y={55 + j * 45} width={120} height={32} rx={2} fill="#f8fafc" stroke="#334155" strokeWidth="1" />
                    <text x={65 + i * 180} y={74 + j * 45} className="text-[9px] font-mono font-bold fill-slate-700">{node.data?.name.slice(0, 16)}</text>
                  </g>
                ))}
              </g>
            ))}

            {/* Interconnection links */}
            {edges.slice(0, 3).map((edge, i) => (
              <path key={i} d={`M ${175 + i * 120} 100 L ${220 + i * 120} 100`} fill="none" stroke="#64748b" strokeWidth="1" markerEnd="url(#arrow)" strokeDasharray="2,2" />
            ))}
          </svg>
        </div>

        {/* Overview Table */}
        <div className="space-y-1">
          <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono">Subsystem Readiness Gateway Check</span>
          <table className="min-w-full text-[10px] font-mono border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-1.5">Gate Verification Category</th>
                <th className="border border-slate-200 p-1.5">Score Status</th>
                <th className="border border-slate-200 p-1.5">Gateway Checklist Requirements Heuristics</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 p-1.5 font-bold">ECAD Layout Gate</td>
                <td className={`border border-slate-200 p-1.5 font-bold ${report.canMoveToEcad ? 'text-emerald-600' : 'text-slate-450'}`}>{report.canMoveToEcad ? 'PASSED' : 'LOCKED'}</td>
                <td className="border border-slate-200 p-1.5 text-slate-500">Requires physical PCBs outlines, circuit modules, components footprints, and nets mapped.</td>
              </tr>
              <tr>
                <td className="border border-slate-200 p-1.5 font-bold">Prototype Spin Gate</td>
                <td className={`border border-slate-200 p-1.5 font-bold ${report.canMoveToPrototype ? 'text-emerald-600' : 'text-slate-450'}`}>{report.canMoveToPrototype ? 'PASSED' : 'LOCKED'}</td>
                <td className="border border-slate-200 p-1.5 text-slate-500">Requires BOM sourced parts, power regulator budget, MCU pin maps, and test plan defined.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderOuterSheet = () => {
    const isRing = projectName.toLowerCase().includes("ring") || templateName?.toLowerCase().includes("ring");
    
    return (
      <div className="space-y-4">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Outer case dimensions blueprint. Labels touch-input zones, connectors, and chassis limits.
        </div>

        {/* SVG Drawing */}
        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          {isRing ? (
            <svg className="w-full max-w-lg h-60" viewBox="0 0 500 220">
              {/* Ring side circular profile */}
              <circle cx="150" cy="110" r="55" fill="none" stroke="#334155" strokeWidth="6" />
              <circle cx="150" cy="110" r="47" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
              
              {/* Dimension lines for ring diameter */}
              <line x1="90" y1="110" x2="210" y2="110" stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="95" y1="106" x2="95" y2="114" stroke="#0284c7" strokeWidth="1" />
              <line x1="205" y1="106" x2="205" y2="114" stroke="#0284c7" strokeWidth="1" />
              <text x="125" y="103" className="text-[9px] font-mono fill-blue-600 font-bold">DIA: 17.5mm</text>

              {/* Ring outer platform/pod */}
              <rect x="135" y="44" width="30" height="12" rx="1" fill="#334155" stroke="#334155" />
              <text x="175" y="52" className="text-[8px] font-mono fill-slate-500 font-bold">← ELECTRONICS POD PLATFORM</text>

              {/* Ring top layout view */}
              <rect x="320" y="80" width="80" height="60" rx="3" fill="none" stroke="#334155" strokeWidth="2" />
              <line x1="320" y1="110" x2="400" y2="110" stroke="#64748b" strokeWidth="1" strokeDasharray="2,2" />
              
              {/* Top touch zone marker */}
              <rect x="340" y="90" width="40" height="40" rx="1" fill="none" stroke="#0284c7" strokeWidth="1" strokeDasharray="2,2" />
              <text x="335" y="85" className="text-[7px] font-mono fill-blue-600 font-bold">TOUCH INPUT SURFACE</text>

              {/* Title annotations */}
              <text x="320" y="160" className="text-[9px] font-mono fill-slate-700 font-bold">RING SHELL PROFILE VIEWS</text>
            </svg>
          ) : (
            <svg className="w-full max-w-lg h-60" viewBox="0 0 500 220">
              {/* Rectangular box device */}
              <rect x="100" y="50" width="160" height="110" rx="4" fill="none" stroke="#334155" strokeWidth="2" />
              
              {/* Width dimension line */}
              <line x1="100" y1="180" x2="260" y2="180" stroke="#0284c7" strokeWidth="1" />
              <line x1="100" y1="176" x2="100" y2="184" stroke="#0284c7" strokeWidth="1" />
              <line x1="260" y1="176" x2="260" y2="184" stroke="#0284c7" strokeWidth="1" />
              <text x="165" y="193" className="text-[9px] font-mono fill-blue-600 font-bold">45.0mm (WIDTH)</text>

              {/* Height dimension line */}
              <line x1="60" y1="50" x2="60" y2="160" stroke="#0284c7" strokeWidth="1" />
              <line x1="56" y1="50" x2="64" y2="50" stroke="#0284c7" strokeWidth="1" />
              <line x1="56" y1="160" x2="64" y2="160" stroke="#0284c7" strokeWidth="1" />
              <text x="15" y="110" className="text-[9px] font-mono fill-blue-600 font-bold rotate-90 origin-center">30.0mm (HEIGHT)</text>

              {/* Button & Ports indicators */}
              <rect x="254" y="90" width="6" height="20" rx="1" fill="#64748b" />
              <text x="270" y="102" className="text-[8px] font-mono fill-slate-500 font-bold">← USB-C PORT REGION</text>
            </svg>
          )}
        </div>

        {/* Mechanical/Material Parameters Table */}
        <div className="space-y-1">
          <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono">Mechanical & Enclosure specifications</span>
          <table className="min-w-full text-[10px] font-mono border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-1.5">Enclosure Parameter</th>
                <th className="border border-slate-200 p-1.5">Target Spec</th>
                <th className="border border-slate-200 p-1.5">Material & Biocompatibility Design Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 p-1.5 font-bold">Waterproofing / Sealing</td>
                <td className="border border-slate-200 p-1.5">IP68 (Sweat Resistant)</td>
                <td className="border border-slate-200 p-1.5 text-slate-500">Requires bio-compatible epoxy resin sealing for inner layers.</td>
              </tr>
              <tr>
                <td className="border border-slate-200 p-1.5 font-bold">Outer Material Coating</td>
                <td className="border border-slate-200 p-1.5">Polyurethane / Resins</td>
                <td className="border border-slate-200 p-1.5 text-slate-500">Must undergo skin-contact hypoallergenic testing prior to tooling release.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderInternalSheet = () => {
    return (
      <div className="space-y-4">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Internal Layout Map. Graphically positions batteries, PCBA, haptics, and antennas within the physical casing.
        </div>

        {/* SVG Drawing */}
        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
            {/* Draw Outer bounding box representing casing */}
            <rect x="50" y="30" width="400" height="180" rx="6" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />
            <text x="60" y="45" className="text-[8px] font-mono fill-slate-400 font-bold uppercase">INTERNAL CASING ENVELOPE</text>

            {/* Batteries placement */}
            <rect x="80" y="60" width="100" height="60" rx="3" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
            <text x="90" y="80" className="text-[9px] font-mono fill-slate-700 font-bold">BATTERY PACK (18mAh)</text>
            <text x="90" y="95" className="text-[8px] font-mono fill-slate-450">Lithium-Polymer Cell</text>

            {/* Flex PCB placing */}
            <rect x="200" y="60" width="120" height="110" rx="3" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
            <text x="210" y="80" className="text-[9px] font-mono fill-amber-800 font-bold">MAIN FLEX PCBA</text>
            
            {/* Haptic motor placing */}
            <circle cx="140" cy="160" r="22" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
            <text x="125" y="163" className="text-[8px] font-mono fill-slate-700 font-bold">HAPTIC LRA</text>

            {/* BLE Antenna placement */}
            <rect x="340" y="60" width="80" height="40" rx="2" fill="#fee2e2" stroke="#dc2626" strokeWidth="1.5" />
            <text x="350" y="80" className="text-[9px] font-mono fill-red-800 font-bold">BLE ANTENNA</text>
            <text x="350" y="93" className="text-[7px] font-mono fill-red-500 font-bold">KEEPOUT WINDOW</text>
          </svg>
        </div>

        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded text-[10px] font-mono leading-relaxed text-slate-550">
          <strong>Design Note</strong>: The haptic motor (LRA) creates structural vibration. Placing it near the battery compartment requires shock damping tape pads to prevent connector fatigue.
        </div>
      </div>
    );
  };

  const renderExplodedSheet = () => {
    return (
      <div className="space-y-4">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Exploded vertical stacking layers map. Show assembly order, material layers, and sealing methods.
        </div>

        {/* SVG Exploded View */}
        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[320px]">
          <svg className="w-full max-w-lg h-72" viewBox="0 0 500 280">
            {/* Dashed vertical center alignment axis */}
            <line x1="250" y1="20" x2="250" y2="250" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4,4" />

            {/* Layer 1: Outer Shell */}
            <rect x="150" y="30" width="200" height="20" rx="3" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
            <text x="250" y="43" className="text-[9px] font-mono font-bold fill-slate-700 text-anchor-middle" textAnchor="middle">LAYER 1: OUTER CASING SHELL (Titanium)</text>

            {/* Layer 2: Seal */}
            <rect x="170" y="75" width="160" height="10" rx="1" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2,2" />
            <text x="250" y="82" className="text-[8px] font-mono fill-slate-500 text-anchor-middle" textAnchor="middle">LAYER 2: WATERPROOF ACRYLIC EPOXY ADHESIVE</text>

            {/* Layer 3: PCBA */}
            <rect x="160" y="115" width="180" height="20" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
            <text x="250" y="128" className="text-[9px] font-mono font-bold fill-amber-800 text-anchor-middle" textAnchor="middle">LAYER 3: FLEX CIRCUITS PCBA ASSEMBLY</text>

            {/* Layer 4: Battery */}
            <rect x="190" y="160" width="120" height="20" rx="3" fill="#f1f5f9" stroke="#334155" strokeWidth="1.5" />
            <text x="250" y="173" className="text-[9px] font-mono font-bold fill-slate-700 text-anchor-middle" textAnchor="middle">LAYER 4: LITHIUM BATTERY CELL</text>

            {/* Layer 5: Inner ring sleeve */}
            <rect x="150" y="210" width="200" height="20" rx="3" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />
            <text x="250" y="223" className="text-[9px] font-mono font-bold fill-slate-700 text-anchor-middle" textAnchor="middle">LAYER 5: INNER COATING SLEEVE (Resin / Ceramic)</text>
          </svg>
        </div>

        {/* Assembly Order Table */}
        <div className="space-y-1">
          <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono">Factory assembly process specs</span>
          <table className="min-w-full text-[10px] font-mono border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-1.5">Step</th>
                <th className="border border-slate-200 p-1.5">Fastening Method</th>
                <th className="border border-slate-200 p-1.5">Critical Factory Verification Checks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-200 p-1.5 font-bold">01. Flex Laminating</td>
                <td className="border border-slate-200 p-1.5">3M Pressure Sensitive Adhesive Tape</td>
                <td className="border border-slate-200 p-1.5 text-slate-500">Ensure no air bubbles below the polyimide flex tail to prevent copper fatigue.</td>
              </tr>
              <tr>
                <td className="border border-slate-200 p-1.5 font-bold">02. Battery Potting</td>
                <td className="border border-slate-200 p-1.5">Epoxy Resins Filler</td>
                <td className="border border-slate-200 p-1.5 text-slate-500">Waterproofing seal check. Must not deform the soft pack lithium pouch envelope.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBoardSheet = () => {
    return (
      <div className="space-y-4">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Detailed board outlines, layer counts, substrate selections, and trace clearances mapped from the active Board planning registry.
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(boards.length > 0 ? boards : [
            { id: "demo_1", name: "Main PCBA Outline", boardType: "Flex PCB", dimensionsMm: "18.5 x 6.5", layerCount: 2, substrate: "Polyimide Flex", status: "Concept" }
          ]).map((b, idx) => {
            const isFlex = b.substrate?.toLowerCase().includes("flex");
            return (
              <div key={b.id} className="border border-slate-200 rounded-lg p-5 bg-white space-y-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 font-mono">BOARD {idx + 1}: {b.name}</span>
                  <Badge variant="neutral" className="text-[8px] font-mono tracking-wider font-bold">{b.boardType}</Badge>
                </div>
                
                {/* SVG Outline representation */}
                <div className="w-full h-36 bg-slate-50 border border-slate-100 rounded flex items-center justify-center">
                  {isFlex ? (
                    <svg className="w-full max-w-[200px] h-24" viewBox="0 0 120 60">
                      {/* Curved outline for flex board */}
                      <path d="M 10 30 Q 60 10 110 30 L 110 40 Q 60 20 10 40 Z" fill="none" stroke="#d97706" strokeWidth="2" />
                      <line x1="10" y1="20" x2="110" y2="20" stroke="#0284c7" strokeWidth="1" strokeDasharray="2,2" />
                      <text x="45" y="16" className="text-[8px] font-mono fill-blue-600 font-bold">18.5mm</text>
                    </svg>
                  ) : (
                    <svg className="w-full max-w-[200px] h-24" viewBox="0 0 120 60">
                      {/* Rectangular outline for FR4 */}
                      <rect x="20" y="15" width="80" height="30" rx="3" fill="none" stroke="#334155" strokeWidth="2" />
                      <line x1="20" y1="52" x2="100" y2="52" stroke="#0284c7" strokeWidth="1" strokeDasharray="2,2" />
                      <text x="50" y="48" className="text-[8px] font-mono fill-blue-600 font-bold">8.0mm</text>
                    </svg>
                  )}
                </div>

                {/* Specs list */}
                <div className="grid grid-cols-2 gap-3 text-[10px] font-mono leading-relaxed text-slate-650">
                  <div>
                    <strong>Dimensions</strong>: {b.dimensionsMm || "DIMENSION REQUIRED"}
                  </div>
                  <div>
                    <strong>Layers</strong>: {b.layerCount || "LAYERS TBD"}
                  </div>
                  <div>
                    <strong>Substrate</strong>: {b.substrate || "TBD"}
                  </div>
                  <div>
                    <strong>Status</strong>: {b.status || "TBD"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderComponentSheet = () => {
    return (
      <div className="space-y-4">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Conceptual component placement map showing primary reference designator locations on the PCB layouts contour shapes.
        </div>

        {/* SVG Drawing */}
        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
            {/* Draw Main PCB Outline */}
            <path d="M 60 180 Q 250 80 440 180 L 440 210 Q 250 110 60 210 Z" fill="none" stroke="#d97706" strokeWidth="2.5" />
            <text x="70" y="225" className="text-[7px] font-mono fill-amber-700 font-bold">MAIN CURVED FLEX PCB LAYOUT CONTOUR</text>

            {/* Plot U1 MCU */}
            <rect x="230" y="115" width="40" height="30" rx="1" fill="#fff" stroke="#dc2626" strokeWidth="1.5" />
            <text x="242" y="132" className="text-[8px] font-mono font-bold fill-red-800">U1</text>
            <text x="210" y="105" className="text-[7px] font-mono fill-red-500 font-bold">MCU (Top Side)</text>

            {/* Plot U2 Power LDO */}
            <rect x="140" y="145" width="22" height="18" rx="1" fill="#fff" stroke="#2563eb" strokeWidth="1.5" />
            <text x="146" y="156" className="text-[7px] font-mono font-bold fill-blue-800">U2</text>
            <text x="135" y="138" className="text-[7px] font-mono fill-blue-500">LDO</text>

            {/* Plot ANT1 BLE Antenna */}
            <rect x="360" y="130" width="30" height="15" rx="1" fill="#fff" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="364" y="141" className="text-[7px] font-mono font-bold fill-amber-800">ANT1</text>
            <text x="350" y="122" className="text-[7px] font-mono fill-amber-600 font-bold">RF CLEARANCE ZONE</text>

            {/* Label Disclaimer stamp */}
            <text x="180" y="45" className="text-[9px] font-mono fill-rose-500 font-bold uppercase tracking-wider" stroke="none">Conceptual Component placement map — final XY placement must be completed in ECAD.</text>
          </svg>
        </div>

        {/* Footprint annotations */}
        <div className="space-y-1">
          <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono">Components Placement Footprints</span>
          <table className="min-w-full text-[10px] font-mono border-collapse border border-slate-200">
            <thead>
              <tr className="bg-slate-50">
                <th className="border border-slate-200 p-1.5">Designator</th>
                <th className="border border-slate-200 p-1.5">Package Shape</th>
                <th className="border border-slate-200 p-1.5">Footprint specification</th>
                <th className="border border-slate-200 p-1.5">Placement Priority</th>
              </tr>
            </thead>
            <tbody>
              {(boardComponents.length > 0 ? boardComponents : [
                { id: "bc_u1", referenceDesignator: "U1", packageName: "QFN-32", footprint: "QFN32_5x5mm_0.5mm", placementCriticality: "High" }
              ]).map((c, idx) => (
                <tr key={idx}>
                  <td className="border border-slate-200 p-1.5 font-bold">{c.referenceDesignator}</td>
                  <td className="border border-slate-200 p-1.5 text-slate-500">{c.packageName || "FOOTPRINT TBD"}</td>
                  <td className="border border-slate-200 p-1.5 text-slate-500">{c.footprint || "TBD"}</td>
                  <td className="border border-slate-200 p-1.5 text-slate-500">{c.placementCriticality}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderCircuitSheet = () => {
    return (
      <div className="space-y-4">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Circuit module dependencies and connections map. Mapped from physical schematic block definitions.
        </div>

        {/* SVG Schematic Block Diagram */}
        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
            {/* Center MCU Module */}
            <rect x="200" y="90" width="100" height="60" rx="3" fill="#fff" stroke="#334155" strokeWidth="2" />
            <text x="210" y="115" className="text-[10px] font-mono font-bold fill-slate-700">MCU CONTROLLER</text>
            <text x="210" y="130" className="text-[8px] font-mono fill-slate-450">GPIO, I2C, SPI Bus</text>

            {/* Left Power regulator module */}
            <rect x="40" y="90" width="90" height="60" rx="3" fill="#fff" stroke="#2563eb" strokeWidth="1.5" />
            <text x="50" y="115" className="text-[9px] font-mono font-bold fill-blue-800">POWER BLOCK</text>
            <text x="50" y="130" className="text-[8px] font-mono fill-slate-450">AP2112 LDO</text>

            {/* Top Touch Sensor module */}
            <rect x="200" y="10" width="100" height="50" rx="3" fill="#fff" stroke="#059669" strokeWidth="1.5" />
            <text x="210" y="32" className="text-[9px] font-mono font-bold fill-emerald-800">TOUCH CONTROLLER</text>
            <text x="210" y="44" className="text-[7px] font-mono fill-slate-450">I2C, Interrupts</text>

            {/* Right Antenna RF module */}
            <rect x="370" y="90" width="90" height="60" rx="3" fill="#fff" stroke="#d97706" strokeWidth="1.5" />
            <text x="380" y="115" className="text-[9px] font-mono font-bold fill-amber-800">RF MATCHING</text>
            <text x="380" y="130" className="text-[7px] font-mono fill-slate-450">Chip Antenna</text>

            {/* Connection Buses */}
            <path d="M 130 120 L 200 120" fill="none" stroke="#3b82f6" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x="145" y="112" className="text-[7px] font-mono fill-blue-600 font-bold">3V3 RAIL</text>

            <path d="M 250 60 L 250 90" fill="none" stroke="#10b981" strokeWidth="1.5" />
            <text x="256" y="78" className="text-[7px] font-mono fill-emerald-600 font-bold">I2C BUS</text>

            <path d="M 300 120 L 370 120" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="312" y="112" className="text-[7px] font-mono fill-amber-600 font-bold">RF FEED</text>
          </svg>
        </div>
      </div>
    );
  };

  const renderNetlistSheet = () => {
    return (
      <div className="space-y-4">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Electrical Net Routing. Visualizes rails distributions (VBAT, 3V3) and GND returns paths.
        </div>

        {/* SVG Drawing */}
        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
            {/* Top Power Rail line */}
            <line x1="50" y1="40" x2="450" y2="40" stroke="#ef4444" strokeWidth="3" />
            <text x="60" y="32" className="text-[9px] font-mono fill-red-600 font-bold">VBAT POWER BUS (3.7V - 4.2V)</text>

            {/* Mid regulated Rail line */}
            <line x1="50" y1="120" x2="450" y2="120" stroke="#3b82f6" strokeWidth="2" />
            <text x="60" y="112" className="text-[9px] font-mono fill-blue-600 font-bold">3V3 REGULATED POWER RAIL (3.3V)</text>

            {/* Bottom Ground Rail line */}
            <line x1="50" y1="200" x2="450" y2="200" stroke="#475569" strokeWidth="3" />
            <text x="60" y="192" className="text-[9px] font-mono fill-slate-600 font-bold">GND GROUND REFERENCE RETURN BUS (0V)</text>

            {/* Connect components pads to rails */}
            <circle cx="100" cy="40" r="4" fill="#ef4444" />
            <line x1="100" y1="40" x2="100" y2="80" stroke="#94a3b8" strokeWidth="1" />
            <rect x="80" y="80" width="40" height="20" rx="1" fill="#fff" stroke="#475569" />
            <text x="88" y="93" className="text-[8px] font-mono font-bold fill-slate-700">BT1</text>

            <circle cx="250" cy="120" r="4" fill="#3b82f6" />
            <line x1="250" y1="120" x2="250" y2="160" stroke="#94a3b8" strokeWidth="1" />
            <rect x="230" y="160" width="40" height="20" rx="1" fill="#fff" stroke="#475569" />
            <text x="238" y="173" className="text-[8px] font-mono font-bold fill-slate-700">U1</text>
          </svg>
        </div>

        {/* Net warnings list */}
        <div className="space-y-1.5">
          <span className="text-[8px] font-bold text-slate-450 uppercase tracking-widest font-mono">Routing alerts & diagnostics</span>
          {!nets.some(n => n.netName.toUpperCase() === 'GND') ? (
            <div className="bg-rose-50 border border-rose-100 p-2.5 rounded text-[10px] font-mono text-rose-700 flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>BLOCKER: Netlist lacks active Ground (GND) return plane paths.</span>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded text-[10px] font-mono text-emerald-700 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Diagnostic check: Reference Ground (GND) lines successfully mapped in netlist.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPowerSheet = () => {
    return (
      <div className="space-y-4">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Power tree cascade diagram. Steps current loads along battery regulator pathways.
        </div>

        {/* SVG Power Tree */}
        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
            {/* Charger box */}
            <rect x="40" y="90" width="80" height="50" rx="3" fill="#fff" stroke="#475569" strokeWidth="1.5" />
            <text x="50" y="112" className="text-[9px] font-mono font-bold fill-slate-700">USB CHARGER</text>
            <text x="50" y="125" className="text-[8px] font-mono fill-slate-450">VBUS 5.0V</text>

            {/* Battery block */}
            <rect x="160" y="90" width="80" height="50" rx="3" fill="#fff" stroke="#10b981" strokeWidth="1.5" />
            <text x="170" y="112" className="text-[9px] font-mono font-bold fill-emerald-800">BMS BATTERY</text>
            <text x="170" y="125" className="text-[8px] font-mono fill-slate-450">VBAT 3.7V</text>

            {/* Regulator block */}
            <rect x="280" y="90" width="80" height="50" rx="3" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="290" y="112" className="text-[9px] font-mono font-bold fill-blue-800">AP2112 LDO</text>
            <text x="290" y="125" className="text-[8px] font-mono fill-slate-450">VOUT 3.3V</text>

            {/* Loads blocks */}
            <rect x="400" y="30" width="70" height="40" rx="2" fill="#f8fafc" stroke="#64748b" />
            <text x="405" y="52" className="text-[8px] font-mono font-bold fill-slate-700">MCU: 15mA</text>

            <rect x="400" y="95" width="70" height="40" rx="2" fill="#f8fafc" stroke="#64748b" />
            <text x="405" y="118" className="text-[8px] font-mono font-bold fill-slate-700">SENSORS: 1.5mA</text>

            <rect x="400" y="160" width="70" height="40" rx="2" fill="#f8fafc" stroke="#64748b" />
            <text x="405" y="182" className="text-[8px] font-mono font-bold fill-slate-700">MOTOR: 80mA</text>

            {/* Connections */}
            <path d="M 120 115 L 160 115" fill="none" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M 240 115 L 280 115" fill="none" stroke="#10b981" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M 360 115 L 380 115 L 380 50 L 400 50" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M 380 115 L 400 115" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M 380 115 L 380 180 L 400 180" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow)" />
          </svg>
        </div>
      </div>
    );
  };

  const renderFirmwareSheet = () => {
    return (
      <div className="space-y-4">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          On-device firmware controller task flow. Highlights device boot sequences and state drivers loop pathways.
        </div>

        {/* SVG Drawing */}
        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
            {/* Boot box */}
            <rect x="40" y="90" width="80" height="50" rx="4" fill="#fff" stroke="#334155" strokeWidth="1.5" />
            <text x="50" y="115" className="text-[9px] font-mono font-bold fill-slate-700">01. BOOT INIT</text>
            <text x="50" y="128" className="text-[7px] font-mono fill-slate-450">GPIO, BLE Config</text>

            {/* Deep sleep node */}
            <rect x="160" y="90" width="80" height="50" rx="4" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="170" y="115" className="text-[9px] font-mono font-bold fill-blue-800">02. DEEP SLEEP</text>
            <text x="170" y="128" className="text-[7px] font-mono fill-slate-450">Current: 15uA</text>

            {/* Interrupt trigger sensor */}
            <rect x="280" y="90" width="80" height="50" rx="4" fill="#fff" stroke="#d97706" strokeWidth="1.5" />
            <text x="290" y="115" className="text-[9px] font-mono font-bold fill-amber-800">03. INTERRUPT</text>
            <text x="290" y="128" className="text-[7px] font-mono fill-slate-450">Touch sense pull</text>

            {/* Active task executor */}
            <rect x="400" y="90" width="80" height="50" rx="4" fill="#fff" stroke="#10b981" strokeWidth="1.5" />
            <text x="410" y="115" className="text-[9px] font-mono font-bold fill-emerald-800">04. ACTIVE STATE</text>
            <text x="410" y="128" className="text-[7px] font-mono fill-slate-450">Haptic, BLE Tx</text>

            {/* Connections */}
            <path d="M 120 115 L 160 115" fill="none" stroke="#475569" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M 240 115 L 280 115" fill="none" stroke="#3b82f6" strokeWidth="1.5" markerEnd="url(#arrow)" />
            <path d="M 360 115 L 400 115" fill="none" stroke="#d97706" strokeWidth="1.5" markerEnd="url(#arrow)" />
            
            {/* Sleep return path arrow loop */}
            <path d="M 440 90 L 440 60 L 200 60 L 200 90" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3,3" markerEnd="url(#arrow)" />
            <text x="260" y="52" className="text-[7px] font-mono fill-emerald-600 font-bold">STATE CYCLE RETURN ON STANDBY TIMEOUT</text>
          </svg>
        </div>
      </div>
    );
  };

  const renderTestingSheet = () => {
    return (
      <div className="space-y-4">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Horizontal validation timeline. Lists tests milestones categorized by active design results.
        </div>

        {/* SVG Testing flowchart */}
        <div className="w-full border border-slate-200 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[300px]">
          <svg className="w-full max-w-xl h-64" viewBox="0 0 500 240">
            {/* EVT */}
            <circle cx="80" cy="120" r="30" fill="#fff" stroke="#3b82f6" strokeWidth="2" />
            <text x="80" y="123" className="text-[9px] font-mono font-bold fill-blue-800" textAnchor="middle">01. EVT</text>
            <text x="80" y="165" className="text-[8px] font-mono fill-slate-450" textAnchor="middle">Signal verification</text>

            {/* DVT */}
            <circle cx="200" cy="120" r="30" fill="#fff" stroke="#dc2626" strokeWidth="2" />
            <text x="200" y="123" className="text-[9px] font-mono font-bold fill-red-800" textAnchor="middle">02. DVT</text>
            <text x="200" y="165" className="text-[8px] font-mono fill-slate-450" textAnchor="middle">RF compliance</text>

            {/* PVT */}
            <circle cx="320" cy="120" r="30" fill="#fff" stroke="#f59e0b" strokeWidth="2" />
            <text x="320" y="123" className="text-[9px] font-mono font-bold fill-amber-800" textAnchor="middle">03. PVT</text>
            <text x="320" y="165" className="text-[8px] font-mono fill-slate-450" textAnchor="middle">Enclosure sealing</text>

            {/* QA */}
            <circle cx="440" cy="120" r="30" fill="#fff" stroke="#10b981" strokeWidth="2" />
            <text x="440" y="123" className="text-[9px] font-mono font-bold fill-emerald-800" textAnchor="middle">04. QA</text>
            <text x="440" y="165" className="text-[8px] font-mono fill-slate-450" textAnchor="middle">Calibration run</text>

            {/* Arrows */}
            <line x1="110" y1="120" x2="170" y2="120" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="230" y1="120" x2="290" y2="120" stroke="#94a3b8" strokeWidth="1.5" />
            <line x1="350" y1="120" x2="410" y2="120" stroke="#94a3b8" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
    );
  };

  const renderMfgHandoffSheet = () => {
    return (
      <div className="space-y-6">
        <div className="text-[10px] text-slate-550 leading-relaxed font-sans max-w-xl">
          Factory release pack cover overview. Specifies required fabrication notes and warnings checks.
        </div>

        {/* Handoff Specs Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-slate-200 rounded p-4 space-y-3 bg-white">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest font-mono block">PCB Fabrication Instructions</span>
            <ul className="list-disc pl-4 text-[10px] font-mono space-y-1 text-slate-550 leading-relaxed">
              <li><strong>Layer Count</strong>: {boards[0]?.layerCount || "2"} layers target</li>
              <li><strong>Substrate</strong>: {boards[0]?.substrate || "Polyimide Flex"}</li>
              <li><strong>Material thickness</strong>: 0.15mm (Flex PCBA area)</li>
              <li><strong>Surface Finish</strong>: Electroless Nickel Immersion Gold (ENIG)</li>
              <li><strong>Impedance Trace Rules</strong>: 50-ohm target for RF BLE transmission paths</li>
            </ul>
          </div>

          <div className="border border-slate-200 rounded p-4 space-y-3 bg-white">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest font-mono block">Assembly SMT specifications</span>
            <ul className="list-disc pl-4 text-[10px] font-mono space-y-1 text-slate-550 leading-relaxed">
              <li><strong>Solderpaste type</strong>: SAC305 Lead-free (RoHS compliant)</li>
              <li><strong>SMT Placement side</strong>: Components mapped to Top side layers</li>
              <li><strong>Adhesive Laminations</strong>: 3M thermal tape backing</li>
              <li><strong>Underfill potting</strong>: Waterproof polyurethane sealant</li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Warning */}
        <div className="bg-amber-50 border border-amber-200 p-4 rounded flex items-start space-x-3.5 select-none font-mono text-[10px] leading-relaxed text-amber-800">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong>CONCEPTUAL BLUEPRINT DISCLAIMER</strong>
            <p>
              This is a preliminary manufacturing prep document. Final copper traces, routing vias, solid casework draft metrics, and physical solder paste stencil patterns MUST be designed and verified inside professional ECAD/MCAD layout tools (e.g. KiCad, Altium, or Fusion 360) before release to a factory.
            </p>
          </div>
        </div>
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
      
      {/* Toast Notification */}
      {copiedAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-950 text-white rounded-lg px-4 py-3.5 shadow-xl max-w-sm flex items-center space-x-3">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-[11px] font-mono">{copiedAlert}</span>
        </div>
      )}

      {/* Sheets Sidebar Selector - Hidden on Print */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col min-h-0 print:hidden select-none shrink-0">
        <div className="p-4 border-b border-slate-150 space-y-1">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Blueprint Sheets Pack</span>
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-tight font-mono">12 Verification Sheets</h2>
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
              <span className="text-[10px] font-bold font-mono uppercase tracking-wider block">
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
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-6 space-y-6 print:p-0 print:overflow-visible">
        
        {/* Controls Bar - Hidden on Print */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm print:hidden">
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
        <div className="bg-white border-2 border-slate-900 rounded-lg shadow-md p-8 flex flex-col justify-between min-h-[680px] print:shadow-none print:border-slate-900 print:p-8 print:min-h-0 print:w-full print:rounded-none relative overflow-hidden">
          
          {/* Blueprint Draft Paper Grid pattern Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] select-none print:hidden" 
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

      {/* SVG Marker Definitions */}
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
