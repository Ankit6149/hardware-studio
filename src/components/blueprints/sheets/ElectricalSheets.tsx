import React, { useState } from 'react';
import { Project } from '../../../types';
import { ReadinessReport } from '../../../lib/readinessScore';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface SheetProps {
  project: Project;
  report: ReadinessReport;
}

// ----------------------------------------------------
// SH 09: ELECTRICAL CIRCUIT BLUEPRINT PACK
// ----------------------------------------------------
export const CircuitSchematicSheet: React.FC<SheetProps> = ({ project }) => {
  const circuitBlocks = project.circuitBlocks || [];
  const boards = project.boards || [];
  const [activeId, setActiveId] = useState<string>(circuitBlocks[0]?.id || 'all');

  const selectedCircuit = circuitBlocks.find(c => c.id === activeId) || circuitBlocks[0];

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-500 border-b border-slate-200 pb-2 flex justify-between items-center select-none">
        <span>DRAWING TITLE: SCHEMATIC SPECIFICATION SHEETS BY MODULE BLOCKS</span>
        {circuitBlocks.length > 1 && (
          <div className="flex space-x-1 shrink-0 print:hidden">
            {circuitBlocks.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase cursor-pointer transition-all ${
                  activeId === c.id ? 'bg-slate-900 text-white border border-slate-950' : 'bg-slate-200 text-slate-650 hover:bg-slate-300'
                }`}
              >
                {c.name.slice(0, 10)}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedCircuit ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
          {/* Schematic SVG Drawer */}
          <div className="border p-4 bg-white rounded space-y-4 flex flex-col justify-between">
            <div className="border-b pb-2 flex justify-between items-center">
              <span className="font-bold text-slate-850">{selectedCircuit.name} Schematic Module</span>
              <span className="text-[8px] bg-indigo-50 border px-1.5 py-0.5 rounded text-indigo-700 font-bold uppercase">{selectedCircuit.circuitType}</span>
            </div>

            <div className="w-full h-56 bg-slate-50 border border-slate-100 rounded flex items-center justify-center relative">
              <svg className="w-full max-w-[280px] h-48 bg-white border border-slate-250" viewBox="0 0 160 120">
                {/* IC Body */}
                <rect x="40" y="30" width="80" height="60" rx="1.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
                <text x="80" y="55" textAnchor="middle" className="text-[8px] font-bold fill-slate-800">{selectedCircuit.circuitType}</text>
                <text x="80" y="68" textAnchor="middle" className="text-[6.5px] fill-slate-450 font-bold">{selectedCircuit.referenceDesignators}</text>

                {/* Left Pins */}
                <line x1="20" y1="45" x2="40" y2="45" stroke="#475569" strokeWidth="1" />
                <text x="43" y="47" className="text-[5px] fill-slate-500 font-bold">VCC</text>
                <line x1="20" y1="75" x2="40" y2="75" stroke="#475569" strokeWidth="1" />
                <text x="43" y="77" className="text-[5px] fill-slate-500 font-bold">GND</text>

                {/* Right Pins */}
                <line x1="120" y1="45" x2="140" y2="45" stroke="#475569" strokeWidth="1" />
                <text x="117" y="47" textAnchor="end" className="text-[5.5px] fill-slate-500 font-bold">IO1</text>
                <line x1="120" y1="75" x2="140" y2="75" stroke="#475569" strokeWidth="1" />
                <text x="117" y="77" textAnchor="end" className="text-[5.5px] fill-slate-500 font-bold">IO2</text>

                {/* VCC Bypass Cap */}
                <line x1="20" y1="45" x2="20" y2="15" stroke="#ef4444" strokeWidth="0.8" />
                <line x1="15" y1="15" x2="25" y2="15" stroke="#ef4444" strokeWidth="1" />
                <line x1="15" y1="11" x2="25" y2="11" stroke="#ef4444" strokeWidth="1" />
                <line x1="20" y1="11" x2="20" y2="5" stroke="#ef4444" strokeWidth="0.8" />

                {/* GND symbol */}
                <line x1="20" y1="75" x2="20" y2="95" stroke="#475569" strokeWidth="0.8" />
                <polygon points="16,95 24,95 20,102" fill="#475569" />
              </svg>
              
              <div className="absolute top-2 left-2 text-[6.5px] text-slate-400 font-bold uppercase">SCHEMATIC BLOCK DRAFT</div>
            </div>

            <div className="text-[9px] leading-relaxed grid grid-cols-2 gap-2 text-slate-500">
              <div><strong>Power Rails</strong>: {selectedCircuit.powerNets || "NET REQUIRED"}</div>
              <div><strong>Signals</strong>: {selectedCircuit.signalNets || "NET REQUIRED"}</div>
            </div>
          </div>

          {/* Specifications Card */}
          <div className="border p-4 bg-white rounded space-y-4">
            <span className="font-bold text-slate-850 block border-b pb-2">Properties & Components Spec</span>
            
            <div className="space-y-3 font-mono text-[9.5px] leading-relaxed">
              <div><strong>Description</strong>: <span className="text-slate-650">{selectedCircuit.description || "None"}</span></div>
              <div><strong>BOM Required Parts</strong>: <span className="font-bold text-slate-900">{selectedCircuit.requiredComponents || "COMPONENT REQUIRED"}</span></div>
              <div><strong>Reference Designators</strong>: <span className="font-bold text-slate-900">{selectedCircuit.referenceDesignators || "REFERENCE DESIGNATOR REQUIRED"}</span></div>
              <div><strong>Signal Interface Type</strong>: {selectedCircuit.interfaceType || "Direct"}</div>
              
              <div className="border-t pt-2 mt-2 border-dashed text-amber-700 space-y-1">
                <span className="font-black uppercase text-[8px] text-amber-600 block">Critical Circuit Risks Review</span>
                <p className="italic leading-normal text-[9px]">{selectedCircuit.risks || "No design risks identified."}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-rose-300 bg-rose-50/10 p-6 rounded flex items-center justify-center min-h-[220px]">
          <span className="text-rose-500 font-bold uppercase tracking-wider">[ STAMP: CIRCUITS DATABASE EMPTY ]</span>
        </div>
      )}

      {/* Circuit Blocks table summary */}
      <div className="border p-2 bg-white space-y-1">
        <span className="font-bold text-slate-700 block border-b pb-1">Circuit Modules Catalog Table</span>
        <div className="overflow-y-auto max-h-36">
          <table className="w-full text-[9px] text-left">
            <thead>
              <tr className="text-slate-400 border-b">
                <th className="pb-1">Block Name</th>
                <th className="pb-1">Substrate PCB</th>
                <th className="pb-1">RefDes List</th>
                <th className="pb-1">Required Parts</th>
                <th className="pb-1">Power nets</th>
                <th className="pb-1">Signal nets</th>
              </tr>
            </thead>
            <tbody>
              {circuitBlocks.map(c => (
                <tr key={c.id} className={`border-b border-slate-100 ${activeId === c.id ? 'bg-blue-50/20' : ''}`}>
                  <td className="py-1 font-bold">{c.name}</td>
                  <td>{boards.find(b => b.id === c.boardId)?.name || "Main Board"}</td>
                  <td className="font-mono text-indigo-700 font-bold">{c.referenceDesignators || "REQUIRED"}</td>
                  <td className="text-slate-550 font-bold">{c.requiredComponents || "COMPONENT REQUIRED"}</td>
                  <td className="font-mono text-rose-600">{c.powerNets || "NET REQUIRED"}</td>
                  <td className="font-mono text-blue-600">{c.signalNets || "NET REQUIRED"}</td>
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
// SH 10: NET ROUTING BLUEPRINT
// ----------------------------------------------------
export const NetRoutingSheet: React.FC<SheetProps> = ({ project }) => {
  const nets = project.nets || [];
  const powerNets = nets.filter(n => n.netType === 'Power' || n.netType === 'Ground');
  const signalNets = nets.filter(n => n.netType !== 'Power' && n.netType !== 'Ground');

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-550 border-b border-slate-200 pb-2 flex justify-between items-center">
        <span>DRAWING TITLE: SCHEMATIC SIGNAL NETLIST CONNECTIVITY MAP</span>
        <span>POWER REGULATED RAILS: {powerNets.length} | ROUTED SIGNALS: {signalNets.length}</span>
      </div>

      <div className="w-full border border-slate-250 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[350px]">
        {nets.length === 0 ? (
          <div className="text-[10px] text-rose-500 font-black border-2 border-dashed border-rose-300 p-4">
            [ STAMP: SIGNAL NETLIST LOG EMPTY - GENERATE PLAN FROM PIN MAP ]
          </div>
        ) : (
          <svg className="w-full max-w-2xl h-80 bg-white border border-slate-200" viewBox="0 0 600 280">
            <rect width="100%" height="100%" fill="url(#arch-grid)" />
            
            {/* Rails Buses */}
            {/* VCC 3V3 */}
            <line x1="50" y1="40" x2="550" y2="40" stroke="#ef4444" strokeWidth="2.5" />
            <text x="60" y="32" className="text-[7px] font-bold fill-red-600">3V3 REGULATED DIGITAL SUPPLY BUS</text>

            {/* VBAT */}
            <line x1="50" y1="80" x2="550" y2="80" stroke="#f43f5e" strokeWidth="2" />
            <text x="60" y="72" className="text-[7px] font-bold fill-rose-600">VBAT RAW BATTERY SUPPLY BUS</text>

            {/* GND */}
            <line x1="50" y1="240" x2="550" y2="240" stroke="#475569" strokeWidth="2.5" />
            <text x="60" y="232" className="text-[7px] font-bold fill-slate-500">SYSTEM COMMON GROUND (GND) RETURN PLANE</text>

            {/* Traces paths */}
            {nets.slice(0, 7).map((n, idx) => {
              const x = 90 + idx * 65;
              const isGnd = n.netName.toUpperCase() === 'GND' || n.netType === 'Ground';
              const isPwr = n.netType === 'Power';
              
              let strokeCol = "#3b82f6";
              let lineSvg = null;

              if (isGnd) {
                strokeCol = "#475569";
                lineSvg = <line x1={x} y1="130" x2={x} y2="240" stroke={strokeCol} strokeWidth="1.2" />;
              } else if (isPwr) {
                strokeCol = n.netName.toUpperCase().includes('3V3') ? '#ef4444' : '#f43f5e';
                lineSvg = <line x1={x} y1={n.netName.toUpperCase().includes('3V3') ? '40' : '80'} x2={x} y2="130" stroke={strokeCol} strokeWidth="1.2" />;
              } else {
                lineSvg = <path d={`M ${x} 80 L ${x - 8} 100 L ${x + 8} 115 L ${x} 130`} fill="none" stroke={strokeCol} strokeWidth="1" strokeDasharray="2,2" />;
              }

              return (
                <g key={n.id || idx}>
                  {lineSvg}
                  <rect x={x - 22} y="130" width="44" height="28" rx="1" fill="#fff" stroke="#334155" />
                  <text x={x} y="142" textAnchor="middle" className="text-[7px] font-black fill-slate-800">{n.netName}</text>
                  <text x={x} y="152" textAnchor="middle" className="text-[5.5px] fill-slate-400 font-bold">{n.sourceComponent || 'SRC?'}</text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[9.5px] leading-relaxed">
        <div className="border p-2.5 bg-white space-y-1.5">
          <span className="font-bold text-slate-705 block border-b pb-1">Routing Warnings checker</span>
          <div className="space-y-1">
            {nets.some(n => !n.sourceComponent || !n.targetComponent) ? (
              <div className="text-rose-700 font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>ORPHAN NET WARNING: Mapped net traces lack active hardware nodes!</span>
              </div>
            ) : (
              <div className="text-emerald-700 font-bold flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>All net terminations successfully connect SMT designators.</span>
              </div>
            )}
            {nets.some(n => n.netType === 'RF' && !n.impedanceRequirement) && (
              <div className="text-amber-700 font-bold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>RF IMPEDANCE CRITICAL: 50Ω copper width parameters required for RF matching.</span>
              </div>
            )}
          </div>
        </div>

        <div className="border p-2.5 bg-white text-slate-500">
          <span className="font-bold text-slate-750 block border-b pb-1">GND Return plane design rules</span>
          <span>Ensure matching differential traces (SWD_CLK, SWD_DIO) are routed parallel. Solid ground pour immediately backing high frequency BLE antenna crystal trace.</span>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// SH 11: POWER TREE BLUEPRINT
// ----------------------------------------------------
export const PowerTreeSheet: React.FC<SheetProps> = ({ project }) => {
  const { powerBudget = [], batteryCapacityMah = 18 } = project;
  
  const totalAvg = powerBudget.reduce((sum, item) => {
    const active = item.activeCurrentMa || 0;
    const duty = (item.dutyCyclePercent || 0) / 100;
    const qty = item.quantity || 1;
    return sum + (active * duty * qty);
  }, 0);

  const runtime = totalAvg > 0 ? (batteryCapacityMah / totalAvg).toFixed(1) : "0.0";

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-550 border-b border-slate-200 pb-2">
        DRAWING TITLE: SCHEMATIC REGULATION POWER TREE STAGES & LOADS ESTIMATES
      </div>

      <div className="w-full border border-slate-250 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[350px]">
        <svg className="w-full max-w-2xl h-80 bg-white border border-slate-200" viewBox="0 0 600 280">
          <rect width="100%" height="100%" fill="url(#arch-grid)" />

          {/* V_POGO -> Charger PMIC -> Battery -> LDO -> rails */}
          <rect x="15" y="110" width="80" height="40" rx="1" fill="#fff" stroke="#475569" />
          <text x="23" y="126" className="text-[7.5px] font-bold fill-slate-700">VBUS POGO</text>
          <text x="23" y="136" className="text-[6px] fill-slate-400">V_IN: 5.0 V</text>
          <line x1="95" y1="130" x2="135" y2="130" stroke="#475569" strokeWidth="1.2" />

          {/* Charger PMIC */}
          <rect x="135" y="110" width="90" height="40" rx="1.5" fill="#fff" stroke="#ef4444" strokeWidth="1.5" />
          <text x="143" y="126" className="text-[8px] font-black fill-red-800">CHARGER PMIC</text>
          <text x="143" y="136" className="text-[6.5px] fill-slate-400">TP4056 Core</text>
          <line x1="225" y1="130" x2="270" y2="130" stroke="#ef4444" strokeWidth="1" />

          {/* Battery */}
          <rect x="230" y="30" width="90" height="40" rx="1.5" fill="#fff" stroke="#10b981" strokeWidth="2" />
          <text x="238" y="46" className="text-[8px] font-black fill-emerald-800">LIPO BATTERY</text>
          <text x="238" y="56" className="text-[6.5px] fill-slate-450">{batteryCapacityMah} mAh curved cell</text>
          <line x1="275" y1="70" x2="275" y2="110" stroke="#10b981" strokeWidth="1.2" />

          {/* LDO */}
          <rect x="270" y="110" width="90" height="40" rx="1.5" fill="#fff" stroke="#3b82f6" strokeWidth="1.5" />
          <text x="278" y="126" className="text-[8px] font-black fill-blue-800">3.3V LDO REG</text>
          <text x="278" y="136" className="text-[6.5px] fill-slate-400">AP2112 600mA</text>
          <line x1="360" y1="130" x2="400" y2="130" stroke="#3b82f6" strokeWidth="1.5" />

          {/* Loads map */}
          {powerBudget.slice(0, 3).map((p, idx) => {
            const y = 35 + idx * 65;
            return (
              <g key={p.id || idx}>
                <line x1="400" y1="130" x2="400" y2={y + 20} stroke="#3b82f6" strokeWidth="1" />
                <line x1="400" y1={y + 20} x2="430" y2={y + 20} stroke="#3b82f6" strokeWidth="1" />
                
                <rect x="430" y={y} width="140" height="42" rx="1.5" fill="#fff" stroke="#475569" />
                <text x="438" y={y + 16} className="text-[7.5px] font-bold fill-slate-800">{p.blockName.slice(0, 22)}</text>
                <text x="438" y={y + 26} className="text-[6.5px] fill-slate-450">Active: {p.activeCurrentMa}mA | Sleep: {p.sleepCurrentUa}uA</text>
                <text x="438" y={y + 35} className="text-[6.5px] fill-emerald-700 font-bold">DUTY CYCLE: {p.dutyCyclePercent}%</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Estimates calculations footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[9.5px]">
        <div className="border p-2.5 bg-white">
          <span className="text-slate-400 uppercase text-[8px] font-bold block">Average System Current Draw</span>
          <span className="text-slate-850 font-black text-sm block mt-1">{totalAvg.toFixed(3)} mA Average</span>
        </div>
        <div className="border p-2.5 bg-white">
          <span className="text-slate-400 uppercase text-[8px] font-bold block">Estimated Battery Lifespan</span>
          <span className="text-emerald-700 font-black text-sm block mt-1">{runtime} Hours ({ (parseFloat(runtime) / 24).toFixed(1) } Days)</span>
        </div>
        <div className="border p-2.5 bg-white flex flex-col justify-center text-slate-500 leading-normal">
          <span>Battery Charge Threshold: <strong>4.20V</strong></span>
          <span>Regulator Quiescent Current: <strong>55 uA</strong></span>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------
// SH 12: PIN MAP / MCU INTERFACE BLUEPRINT
// ----------------------------------------------------
export const PinMapSheet: React.FC<SheetProps> = ({ project }) => {
  const pinMap = project.pinMap || [];

  return (
    <div className="space-y-6 flex-grow flex flex-col justify-between font-mono text-xs text-slate-800">
      <div className="text-[10px] text-slate-550 border-b border-slate-200 pb-2">
        DRAWING TITLE: MCU PORT INTERFACE SIGNAL PIN ASSIGNMENTS SCHEMATIC
      </div>

      <div className="w-full border border-slate-250 bg-slate-50/20 rounded flex items-center justify-center p-6 min-h-[350px]">
        {pinMap.length === 0 ? (
          <div className="text-[10px] text-rose-500 font-black border-2 border-dashed border-rose-300 p-4">
            [ STAMP: MCU PIN MAP DATABASE EMPTY ]
          </div>
        ) : (
          <svg className="w-full max-w-2xl h-80 bg-white border border-slate-200" viewBox="0 0 600 280">
            <rect width="100%" height="100%" fill="url(#arch-grid)" />
            
            {/* Central MCU Box */}
            <rect x="220" y="80" width="160" height="120" rx="3" fill="#fff" stroke="#000" strokeWidth="2.5" />
            <text x="300" y="130" textAnchor="middle" className="text-[9.5px] font-black fill-slate-900">ESP32 MCU</text>
            <text x="300" y="145" textAnchor="middle" className="text-[6.5px] fill-slate-400">GPIO SIGNAL HEADER</text>

            {/* Draw signals mapping out */}
            {pinMap.slice(0, 6).map((p, idx) => {
              const leftSide = idx < 3;
              const x = leftSide ? 220 : 380;
              const y = 100 + (idx % 3) * 35;
              
              const textX = leftSide ? x - 120 : x + 25;
              const lineX1 = leftSide ? x - 15 : x;
              const lineX2 = leftSide ? x : x + 15;

              return (
                <g key={p.id || idx}>
                  <line x1={lineX1} y1={y} x2={lineX2} y2={y} stroke="#475569" strokeWidth="1.2" />
                  <circle cx={leftSide ? lineX1 : lineX2} cy={y} r="2" fill="#ef4444" />
                  
                  {/* Pin label inside */}
                  <text x={leftSide ? x + 5 : x - 5} y={y + 3} textAnchor={leftSide ? 'start' : 'end'} className="text-[6px] font-bold fill-slate-400">{p.mcuPin}</text>
                  
                  {/* Outer signal tag */}
                  <rect x={leftSide ? textX : textX} y={y - 8} width={90} height={16} rx="1" fill="#f8fafc" stroke="#94a3b8" strokeWidth="0.8" />
                  <text x={leftSide ? textX + 45 : textX + 45} y={y + 2} textAnchor="middle" className="text-[6.5px] font-black fill-slate-800 truncate w-80">{p.signalName}</text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      {/* Pin list table */}
      <div className="border p-2 bg-white space-y-1">
        <span className="font-bold text-slate-700 block border-b pb-1">Port Interface Signal Assignments Index</span>
        <div className="overflow-y-auto max-h-36">
          <table className="w-full text-[9px] text-left">
            <thead>
              <tr className="text-slate-400 border-b">
                <th className="pb-1">Signal Name</th>
                <th className="pb-1">MCU Pad Pin</th>
                <th className="pb-1">Signal Type</th>
                <th className="pb-1">Direction</th>
                <th className="pb-1">Voltage Level</th>
                <th className="pb-1">Connected Block</th>
              </tr>
            </thead>
            <tbody>
              {pinMap.map(p => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="py-1 font-bold text-indigo-700">{p.signalName}</td>
                  <td className="font-bold font-mono">{p.mcuPin}</td>
                  <td>{p.protocol}</td>
                  <td>{p.direction}</td>
                  <td>{p.voltage}</td>
                  <td>{p.connectedBlock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
