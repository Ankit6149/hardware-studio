import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { calculateReadinessScore } from '../lib/readinessScore';
import { exportBlueprintDossierMarkdown, exportBlueprintDossierJson } from '../lib/exportDossier';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Printer, 
  Download, 
  ChevronDown, 
  ChevronRight,
  Eye,
  Cpu,
  Layers,
  Zap,
  Activity,
  CheckCircle,
  FileCheck2,
  ListCollapse,
  AlertTriangle,
  FolderOpen,
  CheckSquare,
  Table
} from 'lucide-react';

export const BlueprintDossier: React.FC = () => {
  const project = useProjectStore();
  const { 
    projectName, 
    description,
    nodes, 
    edges, 
    bom, 
    testing, 
    powerBudget, 
    pinMap, 
    firmwareTasks, 
    batteryCapacityMah,
    boards = [],
    circuitBlocks = [],
    boardComponents = [],
    nets = [],
    pcbConstraints = [],
    manufacturingChecklist = []
  } = project;

  const report = calculateReadinessScore(project);
  
  // Accordion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    master: true,
    outer: true,
    internal: true,
    electronics: true,
    power: true,
    pinmap: true,
    firmware: true,
    alpha: true,
    testing: true,
    bom: true,
    boardPlanning: true,
    readiness: true
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    Object.keys(expandedSections).forEach(k => {
      next[k] = expand;
    });
    setExpandedSections(next);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportMarkdown = () => {
    const md = exportBlueprintDossierMarkdown(project);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${projectName.toLowerCase().replace(/\s+/g, '_')}_dossier.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    const json = exportBlueprintDossierJson(project);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${projectName.toLowerCase().replace(/\s+/g, '_')}_dossier.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Readiness status
  let gateStatus = "Needs Review";
  let gateColor = "bg-amber-100 text-amber-800 border-amber-200";
  if (report.overallScore >= 85 && report.blockers.length === 0) {
    gateStatus = "Prototype Ready";
    gateColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
  } else if (report.blockers.length > 0) {
    gateStatus = "Blocked";
    gateColor = "bg-rose-100 text-rose-800 border-rose-200";
  }

  return (
    <div className="flex-1 bg-slate-50 flex flex-col min-h-0 p-6 space-y-6 overflow-y-auto font-mono text-xs print:p-0 print:bg-white print:overflow-visible">
      
      {/* Banner - No Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-4 rounded-lg shadow-sm print:hidden">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Concept / Prototype Blueprint Dossier
          </h2>
          <p className="text-[11px] text-slate-500 leading-normal max-w-xl">
            A comprehensive, structured architectural summary for hardware planning, trace validations, and review gates.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center space-x-2 shrink-0">
          <Button 
            onClick={() => toggleAll(true)} 
            variant="outline" 
            size="xs"
            icon={<ListCollapse className="w-3.5 h-3.5" />}
          >
            Expand All
          </Button>
          <Button 
            onClick={() => toggleAll(false)} 
            variant="outline" 
            size="xs"
            icon={<ListCollapse className="w-3.5 h-3.5" />}
          >
            Collapse All
          </Button>
          <Button 
            onClick={handleExportJson} 
            variant="outline" 
            size="xs"
            icon={<FolderOpen className="w-3.5 h-3.5" />}
          >
            Export JSON
          </Button>
          <Button 
            onClick={handleExportMarkdown} 
            variant="outline" 
            size="xs"
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export MD
          </Button>
          <Button 
            onClick={handlePrint} 
            variant="primary" 
            size="xs"
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Print Dossier
          </Button>
        </div>
      </div>

      {/* PRINT COVER PAGE - ONLY DISPLAY ON PRINT */}
      <div className="hidden print:flex flex-col justify-between h-[100vh] p-16 border-4 border-double border-slate-400 select-none page-break-after">
        <div className="space-y-6">
          <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">SYSTEM ALPHA LABS &bull; HARDWARE PLANNING</span>
          <h1 className="text-4xl font-extrabold text-slate-900 font-sans tracking-tight uppercase mt-12">{projectName}</h1>
          <p className="text-sm text-slate-500 font-sans leading-relaxed max-w-2xl mt-4">{description || 'Engineering workspace concept overview.'}</p>
        </div>
        <div className="space-y-6 border-t border-slate-200 pt-8 font-sans">
          <div className="grid grid-cols-2 gap-6 text-xs text-slate-600">
            <div>
              <p className="font-bold uppercase text-slate-400 text-[10px] tracking-wide">Document Type</p>
              <p className="mt-1 font-bold text-slate-800">Concept & Prototype Blueprint Dossier</p>
            </div>
            <div>
              <p className="font-bold uppercase text-slate-400 text-[10px] tracking-wide">Release Status</p>
              <p className="mt-1 font-bold text-slate-800">{gateStatus}</p>
            </div>
            <div>
              <p className="font-bold uppercase text-slate-400 text-[10px] tracking-wide">Validation Score</p>
              <p className="mt-1 font-bold text-slate-800">{report.overallScore}/100 Index</p>
            </div>
            <div>
              <p className="font-bold uppercase text-slate-400 text-[10px] tracking-wide">Date Generated</p>
              <p className="mt-1 font-bold text-slate-800">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-4 rounded text-[10px] text-slate-500 font-mono leading-relaxed mt-12">
            <strong>DISCLAIMER</strong>: This document contains conceptual specifications, block diagrams, schematic approximations, load simulations, and firmware flows. This is not factory production-ready MCAD/ECAD output.
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6 print:space-y-12">

        {/* 1. MASTER BLUEPRINT ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('master')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-slate-500" />
              <span>1. Master System Blueprint</span>
            </span>
            <span className="print:hidden">
              {expandedSections.master ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.master && (
            <div className="p-5 space-y-5">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider text-left border-b border-slate-200">
                      <th className="p-2">Block Name</th>
                      <th className="p-2">Category</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2">Purpose</th>
                      <th className="p-2">Candidate Parts</th>
                      <th className="p-2">Risks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {nodes.filter(n => n.type !== 'boundaryNode').map(n => (
                      <tr key={n.id} className="hover:bg-slate-50/50 text-[11px] align-top">
                        <td className="p-2 font-bold text-slate-900">{n.data.name}</td>
                        <td className="p-2">{n.data.category}</td>
                        <td className="p-2 text-center">
                          <span className="bg-slate-100 text-slate-650 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-slate-200">
                            {n.data.status}
                          </span>
                        </td>
                        <td className="p-2 leading-relaxed max-w-xs">{n.data.purpose || n.data.description}</td>
                        <td className="p-2 font-mono text-[10px] text-slate-600">{n.data.candidateComponents || 'TBD'}</td>
                        <td className="p-2 leading-relaxed max-w-xs text-rose-750">{n.data.risks || 'None identified'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Edge Connections */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">Master Interconnections</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                        <th className="p-2">Source Block</th>
                        <th className="p-2">Target Block</th>
                        <th className="p-2">Interface/Protocol</th>
                        <th className="p-2">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-750">
                      {edges.map(e => {
                        const src = nodes.find(n => n.id === e.source)?.data.name || e.source;
                        const tgt = nodes.find(n => n.id === e.target)?.data.name || e.target;
                        return (
                          <tr key={e.id} className="text-[10px]">
                            <td className="p-2 font-bold">{src}</td>
                            <td className="p-2 font-bold">{tgt}</td>
                            <td className="p-2 font-mono text-cyan-800">{e.label || 'Logical trace'}</td>
                            <td className="p-2 text-[9px] text-slate-400 font-mono">{(e.views || []).join(', ')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. OUTER DESIGN BLUEPRINT ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('outer')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>2. Outer Design Blueprint</span>
            </span>
            <span className="print:hidden">
              {expandedSections.outer ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.outer && (
            <div className="p-5 space-y-6">
              
              {/* Outer shell diagram */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-slate-50 border border-slate-150 rounded-lg p-6">
                
                {/* SVG representation */}
                <div className="w-48 h-48 relative shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                    {/* Ring band outer */}
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#64748b" strokeWidth="8" />
                    {/* Inner comfort zone */}
                    <circle cx="50" cy="50" r="38" fill="none" stroke="#cbd5e1" strokeWidth="0.8" />
                    
                    {/* Labeled Zones */}
                    {/* Touch area indicator */}
                    <path d="M 30 11 A 42 42 0 0 1 70 11" fill="none" stroke="#ec4899" strokeWidth="9" />
                    {/* Charging contacts */}
                    <circle cx="50" cy="92" r="3" fill="#eab308" />
                    <circle cx="43" cy="91" r="1.5" fill="#eab308" />
                    <circle cx="57" cy="91" r="1.5" fill="#eab308" />
                    {/* Antenna window */}
                    <path d="M 88 35 A 42 42 0 0 1 92 65" fill="none" stroke="#3b82f6" strokeWidth="8" />
                  </svg>
                  
                  {/* Overlay labels */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-pink-100 text-pink-850 px-1 py-0.5 rounded text-[8px] font-bold border border-pink-200">
                    TOUCH ZONE
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-yellow-100 text-yellow-850 px-1 py-0.5 rounded text-[8px] font-bold border border-yellow-200">
                    POGO CHARGE
                  </div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-850 px-1 py-0.5 rounded text-[8px] font-bold border border-blue-200">
                    ANTENNA KEEPOUT
                  </div>
                </div>

                <div className="space-y-3 max-w-md text-[11px] leading-relaxed text-slate-650">
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wide">Wearable Ring Shell Constraints</h4>
                  <p>
                    <strong>Outer Shell Material</strong>: Aerospace-grade titanium housing with smooth hypoallergenic epoxy inner lining (Comfort zone).
                  </p>
                  <p>
                    <strong>RF Keepouts</strong>: RF transparent windows required on outer edges where the internal antenna is situated to prevent signal attenuation.
                  </p>
                  <p>
                    <strong>Charge interfaces</strong>: Convex gold-plated pogo pin contact pads sealing moisture gates (IP68).
                  </p>
                </div>
              </div>

              {/* Table of outer nodes */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                      <th className="p-2">Block Name</th>
                      <th className="p-2">Mechanical Purpose</th>
                      <th className="p-2">Fit/Finish notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {nodes.filter(n => n.data.category === 'Interaction' || n.data.category === 'Mechanical').map(n => (
                      <tr key={n.id} className="text-[10px]">
                        <td className="p-2 font-bold">{n.data.name}</td>
                        <td className="p-2 leading-relaxed">{n.data.purpose || n.data.description}</td>
                        <td className="p-2 italic text-slate-550">{n.data.mechanicalNotes || 'Traced on comfort curvature.'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>

        {/* 3. INTERNAL LAYOUT BLUEPRINT ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('internal')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>3. Internal Layout Blueprint</span>
            </span>
            <span className="print:hidden">
              {expandedSections.internal ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.internal && (
            <div className="p-5 space-y-6">
              
              {/* Internal layout diagram */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 bg-slate-50 border border-slate-150 rounded-lg p-6">
                
                {/* SVG representation */}
                <div className="w-48 h-48 relative shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                    {/* Ring band outer casing */}
                    <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    
                    {/* Flex PCB route inside */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="2.5" />
                    
                    {/* Components placement */}
                    {/* Battery zone */}
                    <path d="M 12 50 A 38 38 0 0 1 50 12" fill="none" stroke="#f43f5e" strokeWidth="4.5" />
                    {/* MCU */}
                    <rect x="76" y="44" width="10" height="12" rx="1.5" fill="#6366f1" />
                    {/* IMU */}
                    <rect x="70" y="32" width="6" height="6" rx="1" fill="#a855f7" />
                    {/* Haptic */}
                    <circle cx="34" cy="74" r="5" fill="#eab308" />
                  </svg>
                  
                  {/* Overlay labels */}
                  <div className="absolute top-2 left-6 bg-rose-100 text-rose-850 px-1 py-0.5 rounded text-[8px] font-bold border border-rose-200">
                    CURVED BATT ZONE
                  </div>
                  <div className="absolute top-10 right-4 bg-indigo-100 text-indigo-850 px-1 py-0.5 rounded text-[8px] font-bold border border-indigo-200">
                    MCU & SENSORS
                  </div>
                  <div className="absolute bottom-6 left-6 bg-yellow-100 text-yellow-850 px-1 py-0.5 rounded text-[8px] font-bold border border-yellow-200">
                    HAPTICS CAVITY
                  </div>
                </div>

                <div className="space-y-3 max-w-md text-[11px] leading-relaxed text-slate-650">
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wide">Internal Component Stackup</h4>
                  <p>
                    <strong>Flex PCB Route</strong>: 0.15mm thick double-sided polyimide substrate routed along the inner core circumference.
                  </p>
                  <p>
                    <strong>Curved Lithium Battery</strong>: 18mAh curved lithium cell occupies the upper quadrant, thermally isolated from the processor.
                  </p>
                  <p>
                    <strong>Haptic Motor Isolation</strong>: Elastomer vibration bracket dampens mechanical feedback spikes to protect chip trace solder joints.
                  </p>
                </div>
              </div>

              {/* Stackup Notes and Risks */}
              <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block">Layout Design Notes & Risks</span>
                <ul className="list-disc pl-4 space-y-1 text-slate-650 text-[10px] leading-relaxed">
                  <li><strong>Thermal profile</strong>: High load current from active BLE wireless transmit may cause transient temperature spikes near MCU. Decoupling capacitors must stand on low thermal trace pathways.</li>
                  <li><strong>Physical expansion</strong>: Curved Lipo cell expands by 5-10% in thickness over lifetime. Casing slot allows safe displacement gap.</li>
                  <li><strong>Decoupling</strong>: IMU magnetometer sensitive to motor magnetic fields. Keep haptic placement offset by at least 15mm.</li>
                </ul>
              </div>

            </div>
          )}
        </div>

        {/* 4. ELECTRONICS BLUEPRINT ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('electronics')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-slate-500" />
              <span>4. Electronics Blueprint</span>
            </span>
            <span className="print:hidden">
              {expandedSections.electronics ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.electronics && (
            <div className="p-5 space-y-6">
              
              {/* Electronics Block Map SVG */}
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-5 flex justify-center overflow-x-auto">
                <svg width="600" height="150" viewBox="0 0 600 150" className="w-full max-w-3xl">
                  {/* Grid background */}
                  <defs>
                    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="600" height="150" fill="url(#grid)" />

                  {/* Categories Groups boxes */}
                  {/* Power Input Box */}
                  <rect x="10" y="30" width="100" height="90" rx="4" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="3,3" />
                  <text x="60" y="24" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#64748b" fontFamily="monospace">POWER INPUT</text>
                  <rect x="20" y="45" width="80" height="25" rx="2" fill="#fff" stroke="#f43f5e" strokeWidth="1.5" />
                  <text x="60" y="60" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#9f1239" fontFamily="monospace">LiPo Cell</text>

                  <rect x="20" y="85" width="80" height="25" rx="2" fill="#fff" stroke="#f43f5e" strokeWidth="1.5" />
                  <text x="60" y="100" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#9f1239" fontFamily="monospace">Charger IC</text>

                  {/* Regulation Box */}
                  <path d="M 110 95 L 140 95" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
                  <rect x="140" y="82" width="70" height="25" rx="2" fill="#fff" stroke="#eab308" strokeWidth="1.5" />
                  <text x="175" y="97" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#854d0e" fontFamily="monospace">3.3V LDO</text>

                  {/* MCU Box */}
                  <path d="M 210 95 L 250 95" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                  <rect x="250" y="40" width="100" height="70" rx="3" fill="#fff" stroke="#2563eb" strokeWidth="2" />
                  <text x="300" y="70" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1e3a8a" fontFamily="monospace">MCU / SoC</text>
                  <text x="300" y="85" textAnchor="middle" fontSize="7" fill="#3b82f6" fontFamily="monospace">(ESP32-C3)</text>

                  {/* Peripherals & Outputs */}
                  {/* IMU Sensor */}
                  <path d="M 300 40 L 300 20 L 410 20 L 410 35" fill="none" stroke="#a855f7" strokeWidth="1.2" />
                  <rect x="370" y="35" width="80" height="25" rx="2" fill="#fff" stroke="#a855f7" strokeWidth="1.5" />
                  <text x="410" y="50" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#6b21a8" fontFamily="monospace">IMU Sensor</text>

                  {/* Haptic Motor */}
                  <path d="M 350 75 L 410 75" fill="none" stroke="#ec4899" strokeWidth="1.2" />
                  <rect x="410" y="70" width="80" height="25" rx="2" fill="#fff" stroke="#ec4899" strokeWidth="1.5" />
                  <text x="450" y="85" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#9d174d" fontFamily="monospace">Haptic Driver</text>

                  {/* Antenna */}
                  <path d="M 320 110 L 320 130 L 410 130 L 410 120" fill="none" stroke="#6366f1" strokeWidth="1.2" />
                  <rect x="370" y="95" width="80" height="25" rx="2" fill="#fff" stroke="#6366f1" strokeWidth="1.5" />
                  <text x="410" y="110" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#4338ca" fontFamily="monospace">Chip Antenna</text>
                </svg>
              </div>

              {/* Warnings check list */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Conceptual Circuit Sanity Warnings</span>
                <div className="bg-rose-50/50 border border-rose-200 rounded p-4 space-y-1">
                  {(() => {
                    const warnings: string[] = [];
                    const names = nodes.map(n => n.data.name.toLowerCase());
                    
                    const hasMCU = names.some(n => n.includes("mcu") || n.includes("controller") || n.includes("soc"));
                    const hasRegulator = names.some(n => n.includes("regulator") || n.includes("ldo") || n.includes("buck") || n.includes("boost"));
                    const hasBattery = names.some(n => n.includes("battery") || n.includes("cell") || n.includes("li-po"));
                    const hasCharger = names.some(n => n.includes("charger") || n.includes("charging") || n.includes("tp4056"));
                    const hasProtection = names.some(n => n.includes("protection") || n.includes("fuse") || n.includes("bms"));
                    const hasHaptic = names.some(n => n.includes("haptic") || n.includes("vibrat"));
                    const hasHapticDriver = names.some(n => n.includes("driver") || n.includes("drv2605"));
                    const hasMic = names.some(n => n.includes("mic") || n.includes("microphone"));
                    const hasPrivacy = names.some(n => n.includes("switch") || n.includes("privacy") || n.includes("gate") || n.includes("cut"));
                    const hasBLE = names.some(n => n.includes("ble") || n.includes("bluetooth") || n.includes("antenna"));
                    const hasAntenna = names.some(n => n.includes("antenna") || n.includes("keepout"));
                    const hasDebug = names.some(n => n.includes("debug") || n.includes("jtag") || n.includes("swd") || n.includes("pogo") || n.includes("header"));

                    if (hasMCU && !hasRegulator) warnings.push("Controller block lacks power regulation support.");
                    if (hasBattery && (!hasCharger || !hasProtection)) warnings.push("Battery has no active battery charger or overcurrent BMS protection circuit.");
                    if (hasHaptic && !hasHapticDriver) warnings.push("Haptic vibration motor connected without high-current driver component.");
                    if (hasMic && !hasPrivacy) warnings.push("Microphone inputs require physical hardware switches or hardwired visual status gates.");
                    if (hasBLE && !hasAntenna) warnings.push("Wireless transceiver present without labeled antenna path.");
                    if (!hasDebug) warnings.push("No JTAG/SWD debug connector header is present on schematic layout.");

                    if (warnings.length === 0) {
                      return (
                        <div className="flex items-center space-x-2 text-emerald-800 font-bold uppercase">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>All conceptual circuit sanity checks passed cleanly!</span>
                        </div>
                      );
                    }
                    return warnings.map((w, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-rose-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="font-semibold">{w}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* 5. POWER BLUEPRINT ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('power')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-slate-500" />
              <span>5. Power Blueprint</span>
            </span>
            <span className="print:hidden">
              {expandedSections.power ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.power && (
            <div className="p-5 space-y-6">
              
              {/* Power Tree Visualizer */}
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-4 flex flex-col items-center">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-4">SYSTEM POWER RAIL TREE</span>
                <div className="flex items-center flex-wrap justify-center gap-3">
                  <div className="bg-white border border-rose-350 p-2.5 rounded shadow-sm text-center">
                    <span className="block font-bold text-rose-800">Battery Cell</span>
                    <span className="text-[9px] text-slate-400">Curved Lithium</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <div className="bg-white border border-rose-350 p-2.5 rounded shadow-sm text-center">
                    <span className="block font-bold text-rose-800">BMS Protect</span>
                    <span className="text-[9px] text-slate-400">Over-charge Gate</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <div className="bg-white border border-amber-350 p-2.5 rounded shadow-sm text-center">
                    <span className="block font-bold text-amber-800">3.3V Regulator</span>
                    <span className="text-[9px] text-slate-400">Low-Dropout LDO</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <div className="bg-white border border-blue-350 p-2.5 rounded shadow-sm text-center">
                    <span className="block font-bold text-blue-800">System Rails</span>
                    <span className="text-[9px] text-slate-400">3.3V Logic Bus</span>
                  </div>
                </div>
              </div>

              {/* Power Budget Details Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                      <th className="p-2">Load Block</th>
                      <th className="p-2">Voltage</th>
                      <th className="p-2">Active Current</th>
                      <th className="p-2">Sleep Current</th>
                      <th className="p-2">Duty Cycle</th>
                      <th className="p-2">Average Current</th>
                      <th className="p-2 text-center">Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {powerBudget.map(p => {
                      const active = Number(p.activeCurrentMa) || 0;
                      const sleep = Number(p.sleepCurrentUa) || 0;
                      const duty = Number(p.dutyCyclePercent) || 0;
                      const qty = Number(p.quantity) || 1;
                      const avg = (active * (duty / 100) + (sleep / 1000) * (1 - duty / 100)) * qty;
                      return (
                        <tr key={p.id} className="text-[10px]">
                          <td className="p-2 font-bold">{p.blockName}</td>
                          <td className="p-2 font-mono">{p.voltage}</td>
                          <td className="p-2 font-mono">{active} mA</td>
                          <td className="p-2 font-mono">{sleep} uA</td>
                          <td className="p-2 font-mono">{duty} %</td>
                          <td className="p-2 font-mono text-emerald-700 font-bold">{avg.toFixed(3)} mA</td>
                          <td className="p-2 text-center">{qty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Power calculations footer */}
              <div className="bg-slate-50 border border-slate-200 rounded p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Battery Enclosure</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-1 block">{batteryCapacityMah || 0} mAh Cell</span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Total Active Load</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-1 block">
                    {(() => {
                      const total = powerBudget.reduce((sum, p) => {
                        const active = Number(p.activeCurrentMa) || 0;
                        const sleep = Number(p.sleepCurrentUa) || 0;
                        const duty = Number(p.dutyCyclePercent) || 0;
                        const qty = Number(p.quantity) || 1;
                        return sum + (active * (duty / 100) + (sleep / 1000) * (1 - duty / 100)) * qty;
                      }, 0);
                      return total.toFixed(3);
                    })()} mA
                  </span>
                </div>
                <div>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">Estimated Runtime</span>
                  <span className="text-sm font-extrabold text-slate-800 mt-1 block">
                    {(() => {
                      const total = powerBudget.reduce((sum, p) => {
                        const active = Number(p.activeCurrentMa) || 0;
                        const sleep = Number(p.sleepCurrentUa) || 0;
                        const duty = Number(p.dutyCyclePercent) || 0;
                        const qty = Number(p.quantity) || 1;
                        return sum + (active * (duty / 100) + (sleep / 1000) * (1 - duty / 100)) * qty;
                      }, 0);
                      if (total <= 0) return 'Infinite';
                      const hrs = (batteryCapacityMah || 0) / total;
                      return `${hrs.toFixed(1)} Hours (${(hrs / 24).toFixed(1)} Days)`;
                    })()}
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* 6. PIN MAP BLUEPRINT ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('pinmap')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-slate-500" />
              <span>6. Pin Map Blueprint</span>
            </span>
            <span className="print:hidden">
              {expandedSections.pinmap ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.pinmap && (
            <div className="p-5 space-y-6">
              
              {/* Pin Maps Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                      <th className="p-2">MCU Pin</th>
                      <th className="p-2">Signal Name</th>
                      <th className="p-2">Connected Block</th>
                      <th className="p-2">Direction</th>
                      <th className="p-2">Protocol</th>
                      <th className="p-2">Voltage</th>
                      <th className="p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pinMap.map(pin => (
                      <tr key={pin.id} className="text-[10px]">
                        <td className="p-2 font-bold text-indigo-700">{pin.mcuPin || 'Floating'}</td>
                        <td className="p-2 font-semibold">{pin.signalName}</td>
                        <td className="p-2">{pin.connectedBlock}</td>
                        <td className="p-2">{pin.direction}</td>
                        <td className="p-2 font-mono text-[9px]">{pin.protocol}</td>
                        <td className="p-2 font-mono">{pin.voltage || 'Unset'}</td>
                        <td className="p-2 leading-normal max-w-xs">{pin.notes || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pin check notices */}
              {(() => {
                const assignedPins = pinMap.map(p => p.mcuPin).filter(Boolean);
                const duplicates = assignedPins.filter((p, i) => assignedPins.indexOf(p) !== i);
                const uniqDup = Array.from(new Set(duplicates));
                const floating = pinMap.filter(p => !p.mcuPin).length;
                
                if (uniqDup.length > 0 || floating > 0) {
                  return (
                    <div className="bg-amber-50 border border-amber-200 rounded p-4 space-y-2">
                      <span className="text-[9px] font-bold text-amber-550 uppercase tracking-widest block">Pin routing Warnings</span>
                      {uniqDup.length > 0 && (
                        <p className="text-amber-800 text-[10px]">
                          - <strong>Collision Conflict</strong>: Multiple signals are shorted to the same physical pin (<strong>{uniqDup.join(', ')}</strong>). Ensure lines are routed to separate peripheral channels.
                        </p>
                      )}
                      {floating > 0 && (
                        <p className="text-amber-800 text-[10px]">
                          - <strong>Floating Signals</strong>: There are {floating} logical connection signals not mapped to physical micro-pins.
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              })()}

            </div>
          )}
        </div>

        {/* 7. FIRMWARE BLUEPRINT ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('firmware')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-slate-500" />
              <span>7. Firmware Blueprint</span>
            </span>
            <span className="print:hidden">
              {expandedSections.firmware ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.firmware && (
            <div className="p-5 space-y-6">
              
              {/* State Flow diagram SVG */}
              <div className="bg-slate-50 border border-slate-150 rounded-lg p-5 flex justify-center">
                <svg width="500" height="80" viewBox="0 0 500 80" className="w-full max-w-2xl">
                  {/* Nodes */}
                  <rect x="10" y="25" width="50" height="25" rx="2" fill="#fff" stroke="#64748b" strokeWidth="1" />
                  <text x="35" y="40" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#475569" fontFamily="monospace">BOOT</text>
                  <path d="M 60 37.5 L 80 37.5" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

                  <rect x="80" y="25" width="70" height="25" rx="2" fill="#fff" stroke="#10b981" strokeWidth="1" />
                  <text x="115" y="40" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#065f46" fontFamily="monospace">INIT HW</text>
                  <path d="M 150 37.5 L 170 37.5" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

                  <rect x="170" y="25" width="80" height="25" rx="2" fill="#fff" stroke="#3b82f6" strokeWidth="1" />
                  <text x="210" y="40" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#1e40af" fontFamily="monospace">BLE ADVERT</text>
                  <path d="M 250 37.5 L 270 37.5" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

                  <rect x="270" y="25" width="70" height="25" rx="2" fill="#fff" stroke="#6366f1" strokeWidth="1" />
                  <text x="305" y="40" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#3730a3" fontFamily="monospace">IDLE SLEEP</text>
                  <path d="M 340 37.5 L 360 37.5" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

                  <rect x="360" y="25" width="70" height="25" rx="2" fill="#fff" stroke="#a855f7" strokeWidth="1" />
                  <text x="395" y="40" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#6b21a8" fontFamily="monospace">INPUT DET</text>
                  <path d="M 430 37.5 L 450 37.5" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

                  <rect x="450" y="25" width="40" height="25" rx="2" fill="#fff" stroke="#64748b" strokeWidth="1" />
                  <text x="470" y="40" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#475569" fontFamily="monospace">RETURN</text>
                </svg>
              </div>

              {/* Tasks details */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                      <th className="p-2">Task Name</th>
                      <th className="p-2">Subsystem</th>
                      <th className="p-2">Linked Block</th>
                      <th className="p-2">Priority</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {firmwareTasks.map(t => (
                      <tr key={t.id} className="text-[10px]">
                        <td className="p-2 font-bold">{t.name}</td>
                        <td className="p-2">{t.type}</td>
                        <td className="p-2 font-mono text-[9px]">{t.linkedBlock || 'Core Controller'}</td>
                        <td className="p-2 font-semibold text-slate-600">{t.priority}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            t.status === 'Done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="p-2 leading-relaxed max-w-xs">{t.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Code link block */}
              <div className="bg-slate-50 border border-slate-200 rounded p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Pseudocode Skeleton Boilerplate</span>
                  <span className="text-[10px] text-slate-500 block">Compiled definitions for hardware MCU and state loop timers.</span>
                </div>
                <span className="text-[10px] bg-slate-900 text-slate-200 px-3 py-1.5 rounded font-bold uppercase tracking-wider">
                  Traced in Firmware Exporter
                </span>
              </div>

            </div>
          )}
        </div>

        {/* 8. SYSTEM ALPHA INTEGRATION ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('alpha')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>8. System Alpha Integration Blueprint</span>
            </span>
            <span className="print:hidden">
              {expandedSections.alpha ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.alpha && (
            <div className="p-5 space-y-6">
              
              {/* Logical architecture split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-150 rounded-lg p-5">
                
                {/* Wearable side */}
                <div className="bg-white border border-slate-200 p-4 rounded shadow-sm space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Wearable Hardware client</span>
                  <div className="space-y-2 text-[10px] leading-relaxed text-slate-650">
                    <p><strong>ESP32 BLE stack</strong>: Encodes local sensor inputs (capacitive tap coordinates, IMU offsets) into wireless commands.</p>
                    <p><strong>No Local LLM processing</strong>: Low microcontroller SRAM capability blocks complex local language intent parsers.</p>
                  </div>
                </div>

                {/* Cloud/Phone side */}
                <div className="bg-white border border-indigo-200 p-4 rounded shadow-sm space-y-3">
                  <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest block flex items-center">
                    <span>System Alpha Host Bridge</span>
                    <Badge variant="info" className="ml-2 scale-90">External Software</Badge>
                  </span>
                  <div className="space-y-2 text-[10px] leading-relaxed text-slate-650">
                    <p><strong>Intent Parser Engine</strong>: Processes wireless gesture profiles to trigger corresponding cloud application commands.</p>
                    <p><strong>Security Firewall</strong>: Blocks device execution controls from triggering protected system processes without client screen confirmation clicks.</p>
                  </div>
                </div>
              </div>

              <div className="text-[11px] leading-relaxed text-slate-600">
                <strong>Attention</strong>: The System Alpha engine runs entirely on external host infrastructure (the companion mobile client or gateway hub) and communication occurs via Bluetooth BLE protocols. It does not occupy space or power rails within the physical ring wearable client.
              </div>

            </div>
          )}
        </div>

        {/* 9. TESTING BLUEPRINT ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('testing')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-slate-500" />
              <span>9. Testing Blueprint</span>
            </span>
            <span className="print:hidden">
              {expandedSections.testing ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.testing && (
            <div className="p-5 space-y-6">
              
              {["Interaction", "Electronics", "Power", "Firmware", "Mechanical", "Safety", "Integration"].map(category => {
                const categoryTests = testing.filter(t => (t.category || 'General').toLowerCase() === category.toLowerCase() || (category === 'Interaction' && !t.category));
                if (categoryTests.length === 0) return null;

                return (
                  <div key={category} className="space-y-2.5">
                    <h4 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">{category} Verification Protocols</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                            <th className="p-2 w-1/4">Test Stage</th>
                            <th className="p-2 w-1/3">Verification steps</th>
                            <th className="p-2 w-1/3">Pass criteria</th>
                            <th className="p-2 text-center w-24">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {categoryTests.map(t => (
                            <tr key={t.id} className="text-[10px] align-top">
                              <td className="p-2">
                                <span className="font-bold text-slate-900 block">{t.name}</span>
                                <span className="text-[9px] text-slate-400 block mt-0.5">Goal: {t.goal}</span>
                              </td>
                              <td className="p-2 leading-relaxed whitespace-pre-wrap">{t.steps}</td>
                              <td className="p-2 leading-relaxed whitespace-pre-wrap">{t.passCriteria}</td>
                              <td className="p-2 text-center">
                                <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                  t.status === 'Passed' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : t.status === 'Failed' 
                                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                      : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {t.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </div>

        {/* 10. BOM BLUEPRINT ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('bom')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <Table className="w-4 h-4 text-slate-500" />
              <span>10. BOM Blueprint</span>
            </span>
            <span className="print:hidden">
              {expandedSections.bom ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.bom && (
            <div className="p-5 space-y-6">
              
              {/* Procurement Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                      <th className="p-2">Component block</th>
                      <th className="p-2">Part Number</th>
                      <th className="p-2 text-center">Stage</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2">Cost</th>
                      <th className="p-2">Supplier</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {bom.map(b => (
                      <tr key={b.id} className="text-[10px]">
                        <td className="p-2">
                          <span className="font-bold text-slate-900 block">{b.blockName}</span>
                          <span className="text-[9px] text-slate-400 block">{b.candidateComponent}</span>
                        </td>
                        <td className="p-2 font-mono text-[9px]">{b.partNumber || 'TBD'}</td>
                        <td className="p-2 text-center">{b.stage}</td>
                        <td className="p-2 text-center">{b.quantity || 1}</td>
                        <td className="p-2 font-mono">${b.costEstimate || '0.00'}</td>
                        <td className="p-2">
                          {b.supplierUrl ? (
                            <a href={b.supplierUrl} target="_blank" rel="noreferrer" className="text-blue-700 underline">
                              {b.supplier || 'Link'}
                            </a>
                          ) : (
                            b.supplier || 'Unspecified'
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                            b.status === 'Sourced' ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sourcing warnings check */}
              {(() => {
                const alerts: string[] = [];
                bom.forEach(b => {
                  if (!b.supplierUrl) alerts.push(`Part "${b.blockName}" lacks a supplier web link.`);
                  if (!b.partNumber) alerts.push(`Part "${b.blockName}" has no manufacturer part number.`);
                  if (!b.costEstimate || b.costEstimate === '0.00' || b.costEstimate === '0') {
                    alerts.push(`Part "${b.blockName}" has a zero cost estimate.`);
                  }
                });

                if (alerts.length > 0) {
                  return (
                    <div className="bg-rose-50/50 border border-rose-200 rounded p-4 space-y-1">
                      <span className="text-[9px] font-bold text-rose-550 uppercase tracking-widest block">Procurement Warnings</span>
                      {alerts.map((a, idx) => (
                        <div key={idx} className="flex items-center space-x-1.5 text-rose-800 text-[10px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}

            </div>
          )}
        </div>

        {/* 11. BOARD PLANNING & ECAD PREPARATION ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('boardPlanning')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-slate-500" />
              <span>11. Board Planning & ECAD Prep</span>
            </span>
            <span className="print:hidden">
              {expandedSections.boardPlanning ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.boardPlanning && (
            <div className="p-5 space-y-6">
              
              {/* PCBs List */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">PCB / Board Specifications</h4>
                {boards.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No PCBs/boards planned yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                          <th className="p-2">Board Name</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Substrate</th>
                          <th className="p-2">Layers</th>
                          <th className="p-2">Dimensions</th>
                          <th className="p-2">Placement</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {boards.map(b => (
                          <tr key={b.id} className="text-[11px] align-top hover:bg-slate-50/50">
                            <td className="p-2 font-bold text-slate-900">{b.name}</td>
                            <td className="p-2">{b.boardType}</td>
                            <td className="p-2 font-mono">{b.substrate}</td>
                            <td className="p-2 text-center">{b.layerCount}</td>
                            <td className="p-2 font-mono">{b.dimensionsMm}</td>
                            <td className="p-2">{b.placement}</td>
                            <td className="p-2">
                              <span className="bg-slate-100 text-slate-650 px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border border-slate-200">
                                {b.status}
                              </span>
                            </td>
                            <td className="p-2 leading-relaxed text-[10px]">
                              <div><strong>Purpose</strong>: {b.purpose}</div>
                              {b.mountingNotes && <div><strong>Mount</strong>: {b.mountingNotes}</div>}
                              {b.connectorNotes && <div><strong>Connectors</strong>: {b.connectorNotes}</div>}
                              {b.thermalNotes && <div><strong>Thermal</strong>: {b.thermalNotes}</div>}
                              {b.rfNotes && <div><strong>RF</strong>: {b.rfNotes}</div>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Circuits Blocks */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Circuit Blocks Planning</h4>
                {circuitBlocks.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No circuit blocks configured yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                          <th className="p-2">Block Name</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Target Board</th>
                          <th className="p-2">Description</th>
                          <th className="p-2">Interface</th>
                          <th className="p-2">Design Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {circuitBlocks.map(c => {
                          const targetBoardName = boards.find(b => b.id === c.boardId)?.name || 'Unassigned';
                          return (
                            <tr key={c.id} className="text-[11px] align-top hover:bg-slate-50/50">
                              <td className="p-2 font-bold text-slate-900">{c.name}</td>
                              <td className="p-2 font-mono text-[10px]">{c.circuitType}</td>
                              <td className="p-2">{targetBoardName}</td>
                              <td className="p-2 leading-normal">{c.description}</td>
                              <td className="p-2 font-mono text-[10px]">{c.interfaceType || 'Direct Pin'}</td>
                              <td className="p-2 leading-relaxed text-[10px]">
                                <div><strong>RefDes</strong>: <code className="bg-slate-100 px-1 rounded font-bold text-slate-650">{c.referenceDesignators}</code></div>
                                {c.powerNets && <div><strong>Power Nets</strong>: {c.powerNets}</div>}
                                {c.signalNets && <div><strong>Signal Nets</strong>: {c.signalNets}</div>}
                                {c.designNotes && <div className="mt-1 text-slate-500">{c.designNotes}</div>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Component Placement */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Board Components & Placement</h4>
                {boardComponents.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No board components placed yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                          <th className="p-2">Ref Des</th>
                          <th className="p-2">Name</th>
                          <th className="p-2">Type</th>
                          <th className="p-2">Value</th>
                          <th className="p-2">Package / Footprint</th>
                          <th className="p-2">Board</th>
                          <th className="p-2 text-center">Side</th>
                          <th className="p-2">Criticality</th>
                          <th className="p-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {boardComponents.map(bc => {
                          const targetBoardName = boards.find(b => b.id === bc.boardId)?.name || 'Unassigned';
                          return (
                            <tr key={bc.id} className="text-[11px] align-top hover:bg-slate-50/50">
                              <td className="p-2 font-bold font-mono text-indigo-700">{bc.referenceDesignator}</td>
                              <td className="p-2 font-bold text-slate-800">{bc.componentName}</td>
                              <td className="p-2 text-[10px]">{bc.componentType}</td>
                              <td className="p-2 font-mono text-[10px]">{bc.value || 'N/A'}</td>
                              <td className="p-2 font-mono text-[10px]">{bc.footprint || bc.packageName || 'N/A'}</td>
                              <td className="p-2">{targetBoardName}</td>
                              <td className="p-2 text-center font-bold text-slate-600">{bc.side}</td>
                              <td className="p-2 text-[10px]">
                                <span className={`px-1 py-0.5 rounded text-[9px] font-bold ${
                                  ['High', 'RF Critical', 'Thermal Critical'].includes(bc.placementCriticality) 
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                    : 'bg-slate-100 text-slate-550'
                                }`}>
                                  {bc.placementCriticality}
                                </span>
                              </td>
                              <td className="p-2 text-[10px] text-slate-500 leading-normal max-w-xs">{bc.notes}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Signaling Nets */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">Signaling Nets & Netlist Prep</h4>
                {nets.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No signal/power nets mapped yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                          <th className="p-2">Net Name</th>
                          <th className="p-2">Type</th>
                          <th className="p-2 text-center">Voltage</th>
                          <th className="p-2">Source Component:Pin</th>
                          <th className="p-2">Target Component:Pin</th>
                          <th className="p-2">Impedance Req</th>
                          <th className="p-2">Current Est.</th>
                          <th className="p-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {nets.map(n => (
                          <tr key={n.id} className="text-[11px] align-top hover:bg-slate-50/50">
                            <td className="p-2 font-bold font-mono text-cyan-800">{n.netName}</td>
                            <td className="p-2 font-mono text-[10px]">{n.netType}</td>
                            <td className="p-2 text-center font-mono font-bold text-slate-650">{n.voltage || 'N/A'}</td>
                            <td className="p-2 font-mono text-[10px]">{n.sourceComponent}:{n.sourcePin}</td>
                            <td className="p-2 font-mono text-[10px]">{n.targetComponent}:{n.targetPin}</td>
                            <td className="p-2 font-mono text-[10px] text-slate-500">{n.impedanceRequirement || 'N/A'}</td>
                            <td className="p-2 font-mono text-[10px] text-slate-550">{n.currentEstimate || 'N/A'}</td>
                            <td className="p-2 text-[10px] text-slate-500 leading-normal max-w-xs">{n.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* PCB Constraints */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">PCB Layout Constraints & Tolerances</h4>
                {pcbConstraints.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No PCB constraints defined yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                          <th className="p-2">PCB Board</th>
                          <th className="p-2">Constraint Type</th>
                          <th className="p-2">Value / Parameter</th>
                          <th className="p-2 text-center">Severity</th>
                          <th className="p-2">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {pcbConstraints.map(pc => {
                          const targetBoardName = boards.find(b => b.id === pc.boardId)?.name || 'All boards';
                          return (
                            <tr key={pc.id} className="text-[11px] align-top hover:bg-slate-50/50">
                              <td className="p-2 font-bold text-slate-800">{targetBoardName}</td>
                              <td className="p-2 font-bold text-slate-900">{pc.constraintType}</td>
                              <td className="p-2 font-mono text-[10px] font-bold text-slate-650">{pc.value} {pc.unit}</td>
                              <td className="p-2 text-center">
                                <span className={`px-1 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                                  pc.severity === 'Critical' 
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                                    : pc.severity === 'Warning' 
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-550'
                                }`}>
                                  {pc.severity}
                                </span>
                              </td>
                              <td className="p-2 text-[10px] text-slate-500 leading-normal max-w-xs">{pc.description}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold text-slate-550 uppercase tracking-widest">Pre-Layout Verification Checklist</h4>
                {manufacturingChecklist.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic">No checklist items created.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 uppercase text-[9px] tracking-wider text-left border-b border-slate-200">
                          <th className="p-2">Category</th>
                          <th className="p-2">Checklist Verification Item</th>
                          <th className="p-2 text-center">Status</th>
                          <th className="p-2">Owner Notes & Blockers</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {manufacturingChecklist.map(ch => (
                          <tr key={ch.id} className="text-[11px] align-top hover:bg-slate-50/50">
                            <td className="p-2 font-bold text-slate-800">{ch.category}</td>
                            <td className="p-2 leading-normal">{ch.item}</td>
                            <td className="p-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${
                                ch.status === 'Done'
                                  ? 'bg-emerald-100 text-emerald-850 border-emerald-250'
                                  : ch.status === 'Blocked'
                                  ? 'bg-rose-100 text-rose-850 border-rose-250 font-extrabold animate-pulse'
                                  : ch.status === 'In Progress'
                                  ? 'bg-cyan-100 text-cyan-850 border-cyan-250'
                                  : 'bg-slate-100 text-slate-550 border-slate-200'
                              }`}>
                                {ch.status}
                              </span>
                            </td>
                            <td className="p-2 leading-relaxed text-[10px] text-slate-500">
                              <div>{ch.ownerNotes}</div>
                              {ch.blockingReason && (
                                <div className="text-rose-700 font-bold mt-1 flex items-center">
                                  <AlertTriangle className="w-3.5 h-3.5 mr-1 shrink-0" />
                                  <span>Blocker: {ch.blockingReason}</span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* 12. READINESS REVIEW ACCORDION */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm print:shadow-none print:border-slate-300">
          <button 
            onClick={() => toggleSection('readiness')}
            className="w-full flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-150 text-left font-bold text-slate-800 print:bg-white print:border-slate-300"
          >
            <span className="flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-slate-500" />
              <span>12. Readiness Review & Actions</span>
            </span>
            <span className="print:hidden">
              {expandedSections.readiness ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </span>
          </button>
          
          {expandedSections.readiness && (
            <div className="p-5 space-y-6">
              
              {/* Overall readiness score stat card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Readiness Score</span>
                  <span className="text-3xl font-extrabold text-slate-800 mt-2 block">{report.overallScore} / 100</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Prototype Release Gate</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded mt-2 border text-center uppercase tracking-wide ${gateColor}`}>
                    {gateStatus}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded p-4 flex flex-col justify-between col-span-1 sm:col-span-2">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Category Validation Ratios</span>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-[10px] text-slate-650 flex justify-between">
                      <span>Architecture:</span>
                      <span className="font-bold">{report.categories.architecture}%</span>
                    </div>
                    <div className="text-[10px] text-slate-650 flex justify-between">
                      <span>Components:</span>
                      <span className="font-bold">{report.categories.components}%</span>
                    </div>
                    <div className="text-[10px] text-slate-650 flex justify-between">
                      <span>Power Budget:</span>
                      <span className="font-bold">{report.categories.power}%</span>
                    </div>
                    <div className="text-[10px] text-slate-650 flex justify-between">
                      <span>Firmware:</span>
                      <span className="font-bold">{report.categories.firmware}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockers list */}
              {report.blockers.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded p-4 space-y-2">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-widest block flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1 text-rose-600" />
                    <span>Critical Prototype Blockers ({report.blockers.length})</span>
                  </span>
                  <ul className="list-disc pl-4 space-y-1 text-rose-900 text-[10px]">
                    {report.blockers.map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next actions list */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Next 5 Engineering Actions</span>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded bg-white">
                  {report.nextActions.slice(0, 5).map((act, index) => (
                    <div key={index} className="p-3 text-[11px] font-semibold text-slate-700 flex items-start space-x-2">
                      <span className="bg-slate-100 text-slate-500 w-4 h-4 rounded-full flex items-center justify-center text-[9px] shrink-0 font-bold">
                        {index + 1}
                      </span>
                      <span className="leading-normal">{act}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
