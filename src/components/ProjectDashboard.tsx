import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  Download,
  AlertTriangle,
  Play,
  Hammer,
  Settings,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  FileCode,
  Check
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
    factoryFiles = {},
    editorLayouts = {},
    traces = [],
    reviewResults = [],
    setActiveView,
    generateFullProductPlan,
    runFullDesignReview,
    generateEditorLayouts,
    addGndNet,
    addVbatNet,
    add3v3Net,
    addI2cPullupResistor,
    addFlybackDiode,
    addDebugTestPad,
    fixMissingDimensionsWithPlaceholder,
    autoPlaceComponents,
    autoCreateFirmwareTasksFromHardware,
    autoCreateTestsFromHardware,
    addRequiredFactoryFileChecklist
  } = store;

  // Run initial review on load
  useEffect(() => {
    runFullDesignReview();
  }, [runFullDesignReview]);

  const report = calculateReadinessScore(store);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'blockers' | 'warnings'>('all');

  const handleGenerateAll = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const res = generateFullProductPlan();
      setToastMessage(res.summary);
      setIsGenerating(false);
      runFullDesignReview();
      setTimeout(() => setToastMessage(null), 5000);
    }, 600);
  };

  const handleGenerateLayouts = () => {
    generateEditorLayouts();
    setToastMessage("Editor Layouts generated dynamically. View them in Blueprint Editor.");
    runFullDesignReview();
    setTimeout(() => setToastMessage(null), 5000);
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

  // Determine stage and next action
  const getProjectStageInfo = () => {
    if (report.canMoveToFabrication) {
      return { stage: "Factory Released", action: "Export Handoff Package", nextView: "exports" };
    }
    if (report.canMoveToFactoryHandoff) {
      return { stage: "Manufacturing Audit", action: "Verify Factory release files", nextView: "exports" };
    }
    if (report.canMoveToPrototype) {
      return { stage: "Prototype Testing", action: "Execute bring-up checklist", nextView: "testing" };
    }
    if (report.isEditorLayoutReady) {
      return { stage: "CAD Layout Routing", action: "Draw copper trace paths", nextView: "blueprint-editor" };
    }
    if (report.isBlueprintPackReady) {
      return { stage: "Drawing Generation", action: "Review engineering sheets", nextView: "blueprint-sheets" };
    }
    return { stage: "Architecture & Planning", action: "Generate Full Product Plan", nextView: "generate" };
  };

  const stageInfo = getProjectStageInfo();

  // 9 Pipeline Cards Configuration
  const pipelineCards = [
    {
      title: "Product Architecture",
      status: nodes.length > 0 ? "Mapped" : "Missing",
      count: nodes.length,
      unit: "subsystems",
      missing: nodes.length === 0 ? "No blocks defined" : "",
      fixAction: () => handleGenerateAll(),
      fixLabel: "Seed default architecture",
      viewKey: "electronics"
    },
    {
      title: "Mechanical Design",
      status: (editorLayouts.mechanical?.length || 0) > 0 ? "Drafted" : "Missing",
      count: editorLayouts.mechanical?.length || 0,
      unit: "envelope zones",
      missing: (editorLayouts.mechanical?.length || 0) === 0 ? "No enclosure dimensions" : "",
      fixAction: () => fixMissingDimensionsWithPlaceholder(),
      fixLabel: "Generate outlines",
      viewKey: "outer"
    },
    {
      title: "PCB / Board Design",
      status: boards.length > 0 ? "Defined" : "Missing",
      count: boards.length,
      unit: "active boards",
      missing: boards.length === 0 ? "No substrates configured" : "",
      fixAction: () => fixMissingDimensionsWithPlaceholder(),
      fixLabel: "Add default board",
      viewKey: "board-studio"
    },
    {
      title: "Circuit / Schematic",
      status: circuitBlocks.length > 0 ? "Planned" : "Missing",
      count: circuitBlocks.length,
      unit: "functional modules",
      missing: circuitBlocks.length === 0 ? "Schematic symbols missing" : "",
      fixAction: () => addI2cPullupResistor(),
      fixLabel: "Add pullup resistors",
      viewKey: "circuit-planner"
    },
    {
      title: "Component Placement",
      status: boardComponents.length > 0 ? "Placed" : "Missing",
      count: boardComponents.length,
      unit: "BOM SMT footprints",
      missing: boardComponents.some(c => !c.placementX) ? "Footprints unplaced" : "",
      fixAction: () => autoPlaceComponents(),
      fixLabel: "Auto-place footprints",
      viewKey: "board-components"
    },
    {
      title: "Net Routing",
      status: nets.length > 0 ? "Logical Netlist" : "Missing",
      count: nets.length,
      unit: "trace tracks",
      missing: !nets.some(n => n.netName.toUpperCase() === 'GND') ? "Missing GND ground net" : "",
      fixAction: () => addGndNet(),
      fixLabel: "Connect return GND",
      viewKey: "netlist-planner"
    },
    {
      title: "Firmware",
      status: firmwareTasks.length > 0 ? "Mapped loops" : "Missing",
      count: firmwareTasks.length,
      unit: "drivers tasks",
      missing: firmwareTasks.length === 0 ? "No flow event loops" : "",
      fixAction: () => autoCreateFirmwareTasksFromHardware(),
      fixLabel: "Generate code loops",
      viewKey: "firmware-plan"
    },
    {
      title: "Testing",
      status: testing.length > 0 ? `${getTestPassRatio()}% Passed` : "Missing",
      count: testing.length,
      unit: "QA procedures",
      missing: testing.length === 0 ? "No bring-up tests" : "",
      fixAction: () => autoCreateTestsFromHardware(),
      fixLabel: "Seed diagnostic test plan",
      viewKey: "testing"
    },
    {
      title: "Manufacturing Package",
      status: Object.values(factoryFiles).some(f => f.status === 'Verified') ? "Reviewed" : "Draft package",
      count: Object.values(factoryFiles).filter(f => f.status !== 'Not Generated').length,
      unit: "fab release files",
      missing: Object.values(factoryFiles).length === 0 ? "Release files checklist empty" : "",
      fixAction: () => addRequiredFactoryFileChecklist(),
      fixLabel: "Build files checklists",
      viewKey: "exports"
    }
  ];

  // Map review results to action hooks
  const getActionResolver = (resId: string) => {
    switch (resId) {
      case 'rev_erc_gnd':
        return { label: "Add GND Net", run: () => addGndNet() };
      case 'rev_arch_input':
      case 'rev_arch_power':
      case 'rev_arch_feedback':
        return { label: "Generate Blueprint Pack", run: () => handleGenerateAll() };
      case 'rev_erc_i2c_pullups':
        return { label: "Add pull-ups (4.7k)", run: () => addI2cPullupResistor() };
      case 'rev_erc_motor_protection':
        return { label: "Add flyback protection", run: () => addFlybackDiode() };
      case 'rev_erc_mcu_debug':
        return { label: "Add SWD programming pads", run: () => addDebugTestPad() };
      case 'rev_drc_dim_board_main':
      case 'rev_drc_dim_board_ring':
        return { label: "Fix board bounds", run: () => fixMissingDimensionsWithPlaceholder() };
      case 'rev_bom_footprint_led':
      case 'rev_bom_footprint_mcu':
        return { label: "Auto-place layout", run: () => autoPlaceComponents() };
      default:
        return null;
    }
  };

  const filteredReviews = reviewResults.filter(res => {
    if (activeTab === 'blockers') return res.severity === 'Blocker' || res.severity === 'Error';
    if (activeTab === 'warnings') return res.severity === 'Warning';
    return true;
  });

  return (
    <div className="flex-1 bg-slate-950 overflow-y-auto p-6 space-y-6 select-none font-sans text-slate-100">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white rounded-lg px-4 py-3.5 shadow-2xl max-w-md animate-fade-in flex items-start space-x-3 backdrop-blur-md">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider block font-mono text-emerald-400">Database Action Triggered</span>
            <p className="text-[11px] font-sans font-medium text-slate-300 leading-relaxed">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Builder Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="space-y-3 relative z-10">
          <div className="flex items-center space-x-2.5">
            <Badge className="bg-indigo-600/30 text-indigo-300 border border-indigo-500/20 uppercase text-[9px] tracking-widest font-mono font-bold py-0.5">
              {templateName || 'Custom Blueprint'}
            </Badge>
            <span className="text-slate-500 font-mono text-[10px]">V{store.version || "3.0"}</span>
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight font-mono">{projectName}</h1>
          <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{description || 'No description added to this project.'}</p>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1.5 text-[10.5px]">
            <div className="flex items-center space-x-1.5 bg-slate-950/40 px-2.5 py-1 rounded border border-slate-850">
              <span className="text-slate-500">Current Stage:</span>
              <span className="text-indigo-400 font-bold uppercase font-mono">{stageInfo.stage}</span>
            </div>
            <div className="flex items-center space-x-1.5 bg-slate-950/40 px-2.5 py-1 rounded border border-slate-850">
              <span className="text-slate-500">Readiness:</span>
              <span className="text-emerald-450 font-black font-mono">{report.overallScore}%</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-wrap gap-2.5 relative z-10 max-w-lg">
          <button
            onClick={handleGenerateAll}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer shadow-lg"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>Generate Plan</span>
          </button>
          <button
            onClick={handleGenerateLayouts}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer"
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>Gen Layouts</span>
          </button>
          <button
            onClick={() => store.runFullDesignReview()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Design Review</span>
          </button>
          <button
            onClick={() => setActiveView('blueprint-editor')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Canvas</span>
          </button>
          <button
            onClick={() => setActiveView('blueprint-sheets')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Sheets</span>
          </button>
          <button
            onClick={() => setActiveView('exports')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded text-[10px] uppercase font-black tracking-wider transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Pack</span>
          </button>
        </div>
      </div>

      {/* Inline Pipeline Visualizer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <h2 className="text-[8.5px] font-black uppercase tracking-widest text-slate-500 mb-3 px-1 font-mono">
          Engineering Flow Pipeline
        </h2>
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 overflow-x-auto scrollbar-thin pb-1">
          {[
            { step: "Idea", desc: "Template pick", active: true },
            { step: "Architecture", desc: "Subsystems block map", active: nodes.length > 0 },
            { step: "Mechanical", desc: "Enclosure layout bounds", active: (editorLayouts.mechanical?.length || 0) > 0 },
            { step: "Boards", desc: "PCB layer substrate config", active: boards.length > 0 },
            { step: "Schematic", desc: "Logic graph and modules", active: circuitBlocks.length > 0 },
            { step: "Layout", desc: "Component placement", active: boardComponents.length > 0 },
            { step: "Routing", desc: "Signal net traces routing", active: traces.length > 0 },
            { step: "Firmware", desc: "Event loop driver loops", active: firmwareTasks.length > 0 },
            { step: "Testing", desc: "QA diagnosic checklists", active: testing.length > 0 },
            { step: "Factory Package", desc: "Gerber drill release package", active: report.canMoveToFabrication }
          ].map((item, idx) => {
            const isCompleted = item.active;
            return (
              <React.Fragment key={idx}>
                <div 
                  onClick={() => {
                    const viewMap: Record<string, string> = {
                      "Idea": "dashboard",
                      "Architecture": "electronics",
                      "Mechanical": "outer",
                      "Boards": "board-studio",
                      "Schematic": "circuit-planner",
                      "Layout": "board-components",
                      "Routing": "netlist-planner",
                      "Firmware": "firmware-plan",
                      "Testing": "testing",
                      "Factory Package": "exports"
                    };
                    setActiveView(viewMap[item.step] || "dashboard");
                  }}
                  className={`flex-1 min-w-[100px] border rounded-lg p-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
                    isCompleted 
                      ? 'border-indigo-800 bg-indigo-950/20 text-white hover:bg-indigo-950/40' 
                      : 'border-slate-800 bg-slate-950/30 text-slate-500'
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                      <Check className="w-2 h-2 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-[9.5px] font-bold uppercase tracking-wider font-mono">{item.step}</span>
                  <span className="text-[7.5px] text-slate-500 leading-none mt-1 truncate max-w-full font-sans">{item.desc}</span>
                </div>
                {idx < 9 && (
                  <ChevronRight className={`w-3.5 h-3.5 hidden md:block shrink-0 ${isCompleted ? 'text-indigo-800' : 'text-slate-850'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 9 Pipeline Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4.5">
        {pipelineCards.map((card, idx) => {
          const isOk = card.status !== "Missing";
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4.5 flex flex-col justify-between space-y-4 shadow-xl transition-all group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-mono">
                    {idx + 1}. {card.title}
                  </span>
                  <span className={`px-1.5 py-0.25 rounded text-[8px] font-bold uppercase font-mono border ${
                    isOk 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' 
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                  }`}>
                    {card.status}
                  </span>
                </div>
                
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-xl font-bold font-mono text-white">{card.count}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide font-mono">{card.unit}</span>
                </div>

                {card.missing ? (
                  <p className="text-[9.5px] text-amber-400/90 leading-relaxed font-mono flex items-center space-x-1">
                    <AlertTriangle className="w-3 h-3 shrink-0 text-amber-500" />
                    <span>Assumption: {card.missing}</span>
                  </p>
                ) : (
                  <p className="text-[9.5px] text-slate-400 leading-relaxed font-sans">
                    Fully configured database records.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-850">
                <button
                  onClick={() => setActiveView(card.viewKey)}
                  className="w-full py-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                >
                  Edit Model
                </button>
                <button
                  onClick={() => {
                    card.fixAction();
                    setToastMessage(`Triggered automatic V3 builder routine: ${card.fixLabel}`);
                  }}
                  className="w-full py-1.5 bg-indigo-600/35 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 rounded text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center truncate px-1"
                  title={card.fixLabel}
                >
                  {card.fixLabel.split(' ')[0]} Fix
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Layout - Next Recommended Priority Actions & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Next Gating Action List (7 columns) */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
            <CardHeader className="bg-slate-900/60 border-b border-slate-800 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-emerald-500" />
                  <CardTitle className="text-sm font-black text-white uppercase tracking-wider font-mono">
                    Live ERC/DRC Review Results ({filteredReviews.length})
                  </CardTitle>
                </div>
                
                {/* Severity tabs */}
                <div className="flex space-x-1 bg-slate-950 p-1 rounded border border-slate-850 self-start">
                  {(['all', 'blockers', 'warnings'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-2.5 py-1 rounded text-[8.5px] uppercase font-bold tracking-wider font-mono transition-all cursor-pointer ${
                        activeTab === tab 
                          ? 'bg-slate-800 text-white font-bold' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-8 text-slate-500 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                  <p className="text-[10px] uppercase font-bold tracking-wider font-mono">0 review violations flagged</p>
                  <p className="text-[10.5px] font-sans text-slate-450">ERC electrical parameters and layout DRC paths look safe.</p>
                </div>
              ) : (
                filteredReviews.map((action, idx) => {
                  const resolver = getActionResolver(action.id);
                  const isError = action.severity === 'Error' || action.severity === 'Blocker';
                  
                  return (
                    <div key={action.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3 rounded border border-slate-850 hover:bg-slate-950 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-1.5 py-0.25 rounded text-[8px] font-extrabold font-mono border uppercase tracking-wider ${
                            isError
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                          }`}>
                            {action.severity}
                          </span>
                          <span className="text-[10.5px] font-bold text-slate-300 font-mono block">
                            {action.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-450 leading-relaxed font-sans max-w-xl">
                          {action.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center space-x-2 self-end sm:self-center">
                        <button
                          onClick={() => {
                            if (action.linkedObjectType) {
                              const viewMap: Record<string, string> = {
                                "node": "electronics",
                                "mechanical-zone": "outer",
                                "assembly-layer": "internal",
                                "board": "board-studio",
                                "component": "board-components",
                                "circuit": "circuit-planner",
                                "net": "netlist-planner",
                                "pin": "pin-map",
                                "power": "power-budget",
                                "firmware": "firmware-plan",
                                "test": "testing",
                                "checklist": "mfg-pack",
                                "factory-file": "exports",
                                "trace": "netlist-planner"
                              };
                              setActiveView(viewMap[action.linkedObjectType] || "blueprint-editor");
                            } else {
                              setActiveView("blueprint-editor");
                            }
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-slate-350 hover:text-white rounded text-[9.5px] font-bold transition-all cursor-pointer font-mono"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        
                        {resolver && (
                          <button
                            onClick={() => {
                              resolver.run();
                              setToastMessage(`Auto-fix successfully applied: ${resolver.label}`);
                            }}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600/35 hover:bg-emerald-600/50 border border-emerald-500/30 text-emerald-250 rounded text-[9.5px] font-bold transition-all cursor-pointer font-mono"
                          >
                            <span>Fix</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Workspace Position & Limitations (4 columns) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
            <CardHeader className="bg-slate-900/60 border-b border-slate-800 p-4">
              <div className="flex items-center space-x-2">
                <Info className="w-4 h-4 text-indigo-400" />
                <CardTitle className="text-sm font-black text-white uppercase tracking-wider font-mono">
                  Hardware Studio Info
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4 font-sans leading-relaxed text-[11px] text-slate-400">
              <p>
                A native in-app hardware/product engineering workspace to draft subsystems, enclosure volumes, stackup orders, logical circuits, net widths, pin mappings, and testing protocols.
              </p>
              
              <div className="space-y-2 bg-slate-950 p-3.5 rounded border border-slate-850 text-[10px] text-slate-500 font-mono">
                <div className="flex justify-between border-b border-slate-900 pb-1">
                  <span>WORKSPACE:</span>
                  <span className="text-slate-300">Local-First</span>
                </div>
                <div className="flex justify-between border-b border-slate-900 pb-1 mt-1">
                  <span>COMPILER:</span>
                  <span className="text-emerald-450 font-bold">READY</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span>DFM SIGN-OFF:</span>
                  <span className="text-amber-450 font-bold">REQUIRED</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-850 pt-4 font-sans">
                <span className="font-extrabold text-slate-300 uppercase text-[9.5px] tracking-wider block font-mono">⚠️ Integrity Safeguards:</span>
                <ul className="list-disc pl-4 space-y-1.5 text-slate-455 text-[10.5px]">
                  <li>Generated Gerber RS-274X, Excellon drill files, pick-and-place lists, and BOMs are drafts only.</li>
                  <li><strong>Human review</strong> and fab-house DFM validation must be performed before ordering boards.</li>
                  <li>Compliance (FCC/CE) and thermal profiles must be checked in physical layout tools.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

    </div>
  );
};
