import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { calculateReadinessScore } from '../lib/readinessScore';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  CheckSquare, 
  FileText, 
  ArrowRight, 
  RefreshCw, 
  Info,
  CheckCircle
} from 'lucide-react';

export const ProjectDashboard: React.FC = () => {
  const store = useProjectStore();
  const { 
    projectName, 
    description, 
    templateName, 
    nodes = [], 
    bom = [], 
    powerBudget = [], 
    pinMap = [], 
    firmwareTasks = [], 
    testing = [], 
    boards = [], 
    circuitBlocks = [], 
    boardComponents = [], 
    nets = [], 
    pcbConstraints = [], 
    manufacturingChecklist = [],
    setActiveView,
    generateFullProductPlan,
    generateBOMFromMVP,
    generatePowerFromBlueprint,
    generatePinMapFromBlueprint,
    generateFirmwareTasksFromBlueprint,
    generateTestsFromMVP,
    generateBoardPlanFromProduct,
    generateCircuitsFromBlueprint,
    generateBoardComponentsFromBOM,
    generateNetsFromPinMap,
    generatePCBConstraintsFromBoard,
    generateManufacturingChecklist
  } = store;

  const report = calculateReadinessScore(store);
  
  // Local state for full generation alert/toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAll = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const res = generateFullProductPlan();
      setToastMessage(res.summary);
      setIsGenerating(false);
      // Auto-dismiss toast after 7 seconds
      setTimeout(() => setToastMessage(null), 7000);
    }, 800);
  };

  const getSourcingRatio = () => {
    if (bom.length === 0) return 0;
    const sourcedCount = bom.filter(item => ['Sourced', 'Ordered', 'Received', 'Tested'].includes(item.status)).length;
    return Math.round((sourcedCount / bom.length) * 100);
  };

  const getChecklistRatio = () => {
    if (manufacturingChecklist.length === 0) return 0;
    const doneCount = manufacturingChecklist.filter(m => m.status === 'Done').length;
    return Math.round((doneCount / manufacturingChecklist.length) * 100);
  };

  const getTestPassRatio = () => {
    if (testing.length === 0) return 0;
    const passedCount = testing.filter(t => t.status === 'Passed').length;
    return Math.round((passedCount / testing.length) * 100);
  };

  // Pipeline configuration
  const pipelineStages = [
    {
      id: 'master',
      name: 'Blueprint',
      count: nodes.filter(n => n.type !== 'boundaryNode').length,
      status: nodes.filter(n => n.type !== 'boundaryNode').length > 0 ? 'Configured' : 'Empty',
      description: 'Logical system architecture blocks.',
      actionLabel: null,
      onAction: null
    },
    {
      id: 'bom',
      name: 'BOM',
      count: bom.length,
      status: bom.length > 0 ? (getSourcingRatio() === 100 ? 'Sourced' : 'In Sourcing') : 'Empty',
      description: 'Sourcing component registry list.',
      actionLabel: 'Generate BOM',
      onAction: generateBOMFromMVP
    },
    {
      id: 'power-budget',
      name: 'Power',
      count: powerBudget.length,
      status: powerBudget.length > 0 ? 'Estimated' : 'Empty',
      description: 'Duty cycle power loads budget.',
      actionLabel: 'Generate Power',
      onAction: generatePowerFromBlueprint
    },
    {
      id: 'pin-map',
      name: 'Pins',
      count: pinMap.length,
      status: pinMap.length > 0 ? 'Mapped' : 'Empty',
      description: 'MCU signal pin assignments.',
      actionLabel: 'Generate Pins',
      onAction: generatePinMapFromBlueprint
    },
    {
      id: 'firmware-plan',
      name: 'Firmware',
      count: firmwareTasks.length,
      status: firmwareTasks.length > 0 ? 'Planned' : 'Empty',
      description: 'Device state logic and driver tasks.',
      actionLabel: 'Generate Firmware',
      onAction: generateFirmwareTasksFromBlueprint
    },
    {
      id: 'board-studio',
      name: 'Boards',
      count: boards.length,
      status: boards.length > 0 ? 'Designed' : 'Empty',
      description: 'Physical PCB outlines & substrates.',
      actionLabel: 'Generate Boards',
      onAction: generateBoardPlanFromProduct
    },
    {
      id: 'circuit-planner',
      name: 'Circuits',
      count: circuitBlocks.length,
      status: circuitBlocks.length > 0 ? 'Configured' : 'Empty',
      description: 'Functional schematic module blocks.',
      actionLabel: 'Generate Circuits',
      onAction: generateCircuitsFromBlueprint
    },
    {
      id: 'board-components',
      name: 'Components',
      count: boardComponents.length,
      status: boardComponents.length > 0 ? 'Placed' : 'Empty',
      description: 'PCB footprints reference mapping.',
      actionLabel: 'Map Components',
      onAction: generateBoardComponentsFromBOM
    },
    {
      id: 'netlist-planner',
      name: 'Nets',
      count: nets.length,
      status: nets.length > 0 ? 'Routed' : 'Empty',
      description: 'Electronics signaling net connections.',
      actionLabel: 'Generate Nets',
      onAction: generateNetsFromPinMap
    },
    {
      id: 'pcb-constraints',
      name: 'Constraints',
      count: pcbConstraints.length,
      status: pcbConstraints.length > 0 ? 'Constrained' : 'Empty',
      description: 'Trace widths, clearances and bend rules.',
      actionLabel: 'Generate Rules',
      onAction: generatePCBConstraintsFromBoard
    },
    {
      id: 'testing',
      name: 'Tests',
      count: testing.length,
      status: testing.length > 0 ? `${getTestPassRatio()}% Passed` : 'Empty',
      description: 'EVT/DVT prototype testing protocols.',
      actionLabel: 'Generate Tests',
      onAction: generateTestsFromMVP
    },
    {
      id: 'mfg-pack',
      name: 'Checklist',
      count: manufacturingChecklist.length,
      status: manufacturingChecklist.length > 0 ? `${getChecklistRatio()}% Complete` : 'Empty',
      description: 'Pre-layout factory handoff review check.',
      actionLabel: 'Generate Checklist',
      onAction: generateManufacturingChecklist
    }
  ];

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 space-y-6 select-none font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-950 text-white rounded-lg px-4 py-3.5 shadow-xl max-w-md animate-fade-in flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider block font-mono text-emerald-300">Plan Generation Successful</span>
            <p className="text-[11px] font-sans font-medium text-slate-350 leading-relaxed">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2.5">
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight font-mono">{projectName}</h1>
            <Badge variant="neutral" className="uppercase text-[9px] tracking-widest font-mono font-bold py-0.5">
              {templateName || 'Custom Blueprint'}
            </Badge>
          </div>
          <p className="text-xs text-slate-550 leading-relaxed max-w-2xl">{description || 'No description added to this project.'}</p>
        </div>

        <div className="shrink-0 flex space-x-3">
          <Button
            onClick={() => setActiveView('dossier')}
            variant="outline"
            size="sm"
            icon={<FileText className="w-4 h-4" />}
          >
            Preview Dossier
          </Button>
          <Button
            onClick={handleGenerateAll}
            variant="primary"
            size="sm"
            disabled={isGenerating}
            icon={<RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />}
          >
            {isGenerating ? 'Generating...' : 'Generate Full Product Plan'}
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Readiness Index', val: `${report.overallScore}/100`, sub: report.overallScore >= 80 ? 'Prototype Ready' : 'In Verification', color: report.overallScore >= 80 ? 'text-emerald-600' : 'text-slate-800' },
          { label: 'Active PCBs', val: boards.length, sub: 'Board stackups', color: 'text-slate-800' },
          { label: 'Circuit Modules', val: circuitBlocks.length, sub: 'Functional schematics', color: 'text-slate-800' },
          { label: 'BOM Components', val: bom.length, sub: `$${bom.reduce((sum, b) => sum + (Number(b.costEstimate) || 0) * (b.quantity || 1), 0).toFixed(2)} Total Cost`, color: 'text-slate-800' },
          { label: 'Firmware Tasks', val: `${firmwareTasks.filter(t => t.status === 'Done').length}/${firmwareTasks.length}`, sub: 'Completed drivers', color: 'text-slate-800' },
          { label: 'Critical Blockers', val: report.blockers.length, sub: 'Requires immediate review', color: report.blockers.length > 0 ? 'text-rose-600 font-extrabold' : 'text-slate-800' }
        ].map((m, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest block font-mono">{m.label}</span>
            <span className={`text-2xl font-black mt-1.5 block font-mono ${m.color}`}>{m.val}</span>
            <span className="text-[10px] text-slate-450 leading-relaxed block mt-1">{m.sub}</span>
          </div>
        ))}
      </div>

      {/* Gating Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            name: "ECAD Layout Gate", 
            ready: report.canMoveToEcad, 
            desc: "Ready to transition blueprints and netlists into KiCad/Altium schematic placement.", 
            reqs: "Requires boards, circuits, placed component packages, signaling nets, and 0 blockers." 
          },
          { 
            name: "Prototype Spin Gate", 
            ready: report.canMoveToPrototype, 
            desc: "Ready to procure physical parts, order board samples, and assemble initial MVP board validation run.",
            reqs: "Requires BOM sourced, power budget estimated, pin assignments locked, testing checklist defined, and readiness >70."
          },
          { 
            name: "Factory Handoff Gate", 
            ready: report.canMoveToFactoryHandoff, 
            desc: "Ready to export final dossier, component coordinates, and run factory bring-up scripts.",
            reqs: "Requires full board prep schemas, completed pre-layout checklist review, zero blocked issues, and readiness >85."
          }
        ].map((gate, idx) => (
          <div key={idx} className={`border rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4 bg-white ${
            gate.ready 
              ? 'border-emerald-250 bg-emerald-50/10' 
              : 'border-slate-200'
          }`}>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-slate-800">{gate.name}</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider font-mono border ${
                  gate.ready 
                    ? 'bg-emerald-100 text-emerald-850 border-emerald-200' 
                    : 'bg-slate-100 text-slate-450 border-slate-200'
                }`}>
                  {gate.ready ? 'PASSED' : 'LOCKED'}
                </span>
              </div>
              <p className="text-[11px] text-slate-550 leading-normal">{gate.desc}</p>
            </div>
            
            <div className="bg-slate-50 border border-slate-150 p-2.5 rounded text-[9px] text-slate-450 leading-relaxed font-mono">
              <strong>Check Criteria</strong>: {gate.reqs}
            </div>
          </div>
        ))}
      </div>

      {/* Conceptual-to-Factory Pipeline Visualizer */}
      <Card className="bg-white border border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50/50 border-b border-slate-150">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle>Concept-to-Handoff Progress Pipeline</CardTitle>
              <p className="text-[10px] text-slate-450">Track, sync, and generate downstream planning lists from logical architectures.</p>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest font-mono text-slate-450 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
              Verification Pipeline
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          
          {/* Timeline Pipeline Graphic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-5">
            {pipelineStages.map((stage, idx) => {
              const isEmpty = stage.status === 'Empty';
              
              return (
                <div key={idx} className="bg-slate-50/50 border border-slate-200 rounded-xl p-4.5 flex flex-col justify-between space-y-4 hover:border-slate-350 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.01)] group relative">
                  
                  {/* Arrow Indicator on Desktop */}
                  {idx < pipelineStages.length - 1 && (
                    <div className="hidden xl:block absolute -right-3.5 top-[50%] -translate-y-[50%] z-10 bg-slate-50 text-slate-350 p-0.5 rounded-full border border-slate-200">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-800 font-mono">{idx + 1}. {stage.name}</span>
                      <span className={`px-1.5 py-0.25 rounded text-[8px] font-bold uppercase font-mono ${
                        isEmpty 
                          ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {stage.status}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-650 font-mono block">
                      {stage.count} {stage.count === 1 ? 'item' : 'items'}
                    </span>
                    <p className="text-[10px] text-slate-455 leading-relaxed font-sans">{stage.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-150">
                    <button
                      onClick={() => setActiveView(stage.id)}
                      className="w-full flex items-center justify-center space-x-1 py-1.5 bg-white border border-slate-200 hover:border-slate-450 hover:bg-slate-50 text-slate-650 rounded text-[10px] font-bold transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                    >
                      <span>Open View</span>
                    </button>
                    
                    {stage.onAction && isEmpty && (
                      <button
                        onClick={() => {
                          stage.onAction!();
                          setToastMessage(`Successfully generated ${stage.name} items from blueprints.`);
                          setTimeout(() => setToastMessage(null), 5000);
                        }}
                        className="w-full flex items-center justify-center space-x-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all cursor-pointer border border-emerald-750 shadow-sm"
                      >
                        <RefreshCw className="w-3 h-3 shrink-0" />
                        <span>{stage.actionLabel}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </CardContent>
      </Card>

      {/* Critical Warnings & Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Next Gating Action List */}
        <Card className="bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="bg-slate-50/50 border-b border-slate-150">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <CardTitle>Next Recommended Priority Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5">
            {report.nextActions.map((action, idx) => {
              const isBlocker = action.startsWith('Blocker:');
              const isWarning = action.startsWith('Warning:');
              
              return (
                <div key={idx} className="flex items-start space-x-2.5 bg-slate-50/50 p-2.5 rounded border border-slate-100">
                  <Badge variant={isBlocker ? 'error' : isWarning ? 'warning' : 'neutral'} className="shrink-0 mt-0.5">
                    {isBlocker ? 'Blocker' : isWarning ? 'Warning' : 'Info'}
                  </Badge>
                  <span className="text-[11px] text-slate-700 leading-normal font-sans font-medium">
                    {action.replace(/^(Blocker|Warning|Suggestion):\s*/, '')}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Workspace Position & Limitations */}
        <Card className="bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <CardHeader className="bg-slate-50/50 border-b border-slate-150">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-indigo-500" />
              <CardTitle>Workspace Position & Limitations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 font-sans leading-relaxed text-[11px] text-slate-600">
            <p>
              Hardware Studio acts as a **logical planning and ECAD preparation layer** before laying out copper or mechanical frames. It is designed to capture components, footprints, pins, nets, power, and testing protocols.
            </p>
            
            <div className="space-y-1.5 border-t border-slate-100 pt-3">
              <span className="font-bold text-slate-800 uppercase text-[9px] tracking-wider font-mono block">⚠️ Important Disclaimers:</span>
              <ul className="list-disc pl-4 space-y-1 text-slate-500">
                <li>This tool does **NOT** replace a certified hardware, electronics, or compliance safety engineer.</li>
                <li>This tool does **NOT** output production Gerber files. Use exported netlists and constraints to guide KiCad/Altium routing.</li>
                <li>Gating release locks are heuristics. Final mechanical, thermal, and electrical sign-offs require professional engineering reviews.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
