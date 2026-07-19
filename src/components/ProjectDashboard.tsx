import React, { useState, useEffect } from 'react';
import { useProjectStore } from '../store/projectStore';
import { calculateReadinessScore } from '../lib/readinessScore';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  RefreshCw, 
  CheckCircle,
  Download,
  AlertTriangle,
  Play,
  Hammer,
  ShieldCheck,
  ChevronRight,
  Check,
  Package
} from 'lucide-react';

export const ProjectDashboard: React.FC = () => {
  const store = useProjectStore();
  const { 
    projectName, 
    description, 
    templateName, 
    version,
    nodes = [], 
    firmwareTasks = [], 
    testing = [], 
    boards = [], 
    circuitBlocks = [], 
    boardComponents = [], 
    nets = [], 
    factoryFiles = {},
    editorLayouts = {},
    traces = [],
    drillHoles = [],
    mechanicalZones = [],
    assemblyLayers = [],
    factoryPackageStatus = "Draft",
    factoryReviewChecks = {},
    reviewResults = [],
    requirements = [],
    architectureNodes = [],
    mechanicalObjects = [],
    firmwareModules = [],
    validationTests = [],
    setActiveView,
    generateFullProductPlan,
    runFullDesignReview,
    generateEditorLayouts,
    addGndNet,
    addI2cPullupResistor,
    addFlybackDiode,
    addDebugTestPad,
    fixMissingDimensionsWithPlaceholder,
    autoPlaceComponents
  } = store;

  // Run design review on render mount
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

  // Determine stage info
  const getProjectStageInfo = () => {
    if (report.canMoveToFabrication) {
      return { stage: "Factory Released", action: "Export Handoff Package", nextView: "factory-builder" };
    }
    if (report.canMoveToFactoryHandoff) {
      return { stage: "Manufacturing Audit", action: "Verify Factory release files", nextView: "factory-builder" };
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
    return { stage: "Architecture & Planning", action: "Generate Full Product Plan", nextView: "dashboard" };
  };

  const stageInfo = getProjectStageInfo();

  // Design review severity breakdown
  const reviewSummary = {
    blockers: reviewResults.filter(r => r.severity === 'Blocker').length,
    errors: reviewResults.filter(r => r.severity === 'Error').length,
    warnings: reviewResults.filter(r => r.severity === 'Warning').length,
    infos: reviewResults.filter(r => r.severity === 'Info').length,
  };

  // Dynamic next recommended actions
  const nextActionsList: { label: string; action: () => void; buttonLabel: string }[] = [];

  if (boards.length === 0) {
    nextActionsList.push({
      label: "Active board outline dimensions not configured in database.",
      buttonLabel: "Configure Board",
      action: () => setActiveView("board-studio")
    });
  }

  const unplaced = boardComponents.filter(c => !c.placementX || !c.placementY);
  if (unplaced.length > 0) {
    nextActionsList.push({
      label: `${unplaced.length} components footprints lack placement coordinates.`,
      buttonLabel: "Auto-Place Layout",
      action: () => {
        autoPlaceComponents();
        setToastMessage("Auto-placed SMT components layout coordinates.");
        runFullDesignReview();
      }
    });
  }

  if (!nets.some(n => n.netName.toUpperCase() === 'GND')) {
    nextActionsList.push({
      label: "Logical GND ground connection path reference net is missing.",
      buttonLabel: "Add GND Net",
      action: () => {
        addGndNet();
        setToastMessage("Created missing logical GND net.");
        runFullDesignReview();
      }
    });
  }

  const totalLayoutObjs = Object.values(editorLayouts).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  if (totalLayoutObjs === 0) {
    nextActionsList.push({
      label: "Blueprint Editor layout canvas outlines have not been initialized.",
      buttonLabel: "Generate Layouts",
      action: () => handleGenerateLayouts()
    });
  }

  if (drillHoles.length === 0) {
    nextActionsList.push({
      label: "Micro drill holes coordinate list is empty.",
      buttonLabel: "Seed Template Drills",
      action: () => setActiveView("board-studio")
    });
  }

  if (factoryPackageStatus === 'Draft') {
    nextActionsList.push({
      label: "Draft manufacturing stencils package has not been generated.",
      buttonLabel: "Compile Package",
      action: () => setActiveView("factory-builder")
    });
  }

  const checklistItemsCount = 10;
  const checkedCount = Object.values(factoryReviewChecks).filter(Boolean).length;
  if (checkedCount < checklistItemsCount && factoryPackageStatus !== 'Draft') {
    nextActionsList.push({
      label: `${checklistItemsCount - checkedCount} checklist review verifications are pending.`,
      buttonLabel: "Complete Review",
      action: () => setActiveView("factory-builder")
    });
  }

  const mainNextActionLabel = nextActionsList[0]?.label || "Engineering review passed. Export your fabrication release manifest.";
  const mainNextActionTrigger = nextActionsList[0]?.action || (() => setActiveView("factory-builder"));
  const mainNextActionButton = nextActionsList[0]?.buttonLabel || "Open Builder";

  // Category warnings extractor helper
  const getCategoryIssuesCount = (cat: string) => {
    return reviewResults.filter(r => r.category === cat && r.severity !== 'Info').length;
  };

  // 10 Pipeline Stages Configuration
  const pipelineStages = [
    { step: "Idea", label: "Template pick", active: true, count: 1, unit: "selected", warnings: 0, view: "dashboard" },
    { step: "Architecture", label: "Subsystems map", active: architectureNodes.length > 0 || nodes.length > 0, count: architectureNodes.length || nodes.length, unit: "nodes", warnings: getCategoryIssuesCount("Architecture"), view: "electronics" },
    { step: "Mechanical", label: "Enclosure outline", active: mechanicalObjects.length > 0 || mechanicalZones.length > 0, count: mechanicalObjects.length || mechanicalZones.length, unit: "zones", warnings: getCategoryIssuesCount("Mechanical"), view: "mechanical-studio" },
    { step: "Assembly", label: "Stackup stack", active: assemblyLayers.length > 0, count: assemblyLayers.length, unit: "layers", warnings: getCategoryIssuesCount("Assembly"), view: "assembly-stack" },
    { step: "Schematic", label: "Logical modules", active: circuitBlocks.length > 0, count: circuitBlocks.length, unit: "circuits", warnings: getCategoryIssuesCount("Schematic ERC"), view: "schematic-editor" },
    { step: "PCB Layout", label: "Substrates contours", active: boards.length > 0, count: boards.length, unit: "PCBs", warnings: getCategoryIssuesCount("PCB DRC"), view: "board-designer" },
    { step: "Routing", label: "Trace track path", active: traces.length > 0, count: traces.length, unit: "traces", warnings: getCategoryIssuesCount("Routing"), view: "board-designer" },
    { step: "Firmware", label: "Code driver loops", active: firmwareModules.length > 0 || firmwareTasks.length > 0, count: firmwareModules.length || firmwareTasks.length, unit: "modules", warnings: getCategoryIssuesCount("Firmware"), view: "firmware-studio" },
    { step: "Testing", label: "QA diagnostic plan", active: validationTests.length > 0 || testing.length > 0, count: validationTests.length || testing.length, unit: "tests", warnings: getCategoryIssuesCount("Testing"), view: "validation-studio" },
    { step: "Factory Package", label: "Gerbers drill release", active: factoryPackageStatus !== 'Draft', count: Object.values(factoryFiles).filter(f => f && f.status !== 'Not Generated').length, unit: "files", warnings: getCategoryIssuesCount("Factory Package"), view: "factory-builder" }
  ];

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
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 space-y-6 select-none font-sans text-slate-800 h-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-3.5 shadow-xl max-w-md flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider block font-mono text-emerald-700">Store Action Confirmed</span>
            <p className="text-[11px] font-sans font-medium text-slate-600 leading-relaxed">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Hero Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Badge className="bg-indigo-50 text-indigo-700 border border-indigo-200/50 uppercase text-[9px] tracking-widest font-mono font-bold py-0.5">
                {templateName || 'Custom Blueprint'}
              </Badge>
              <span className="text-slate-400 font-mono text-[10px]">V{version || "3.0"}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-mono">{projectName}</h1>
            <p className="text-xs text-slate-500 max-w-2xl">{description || 'No project description mapped.'}</p>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2 text-[10.5px]">
              <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                <span className="text-slate-450">Pipeline Stage:</span>
                <span className="text-indigo-650 font-bold uppercase font-mono">{stageInfo.stage}</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                <span className="text-slate-455">Readiness Score:</span>
                <span className="text-emerald-600 font-black font-mono">{report.overallScore}%</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                <span className="text-slate-455">Package Status:</span>
                <span className="text-emerald-600 font-bold font-mono">{factoryPackageStatus}</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-wrap gap-2 lg:max-w-md">
            <Button onClick={handleGenerateAll} disabled={isGenerating} className="h-8 text-[10.5px] uppercase font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shadow-sm">
              <RefreshCw className={`w-3.5 h-3.5 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate Product Plan
            </Button>
            <Button onClick={handleGenerateLayouts} variant="outline" className="h-8 text-[10.5px] border-slate-250 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-sm">
              <Hammer className="w-3.5 h-3.5 mr-1" />
              Generate Layouts
            </Button>
            <Button onClick={() => store.runFullDesignReview()} variant="outline" className="h-8 text-[10.5px] border-slate-250 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" />
              Run Design Review
            </Button>
            <Button onClick={() => setActiveView('blueprint-editor')} className="h-8 text-[10.5px] uppercase font-bold bg-emerald-600 hover:bg-emerald-555 text-white cursor-pointer shadow-sm">
              <Play className="w-3.5 h-3.5 mr-1 fill-current" />
              Open Canvas
            </Button>
            <Button onClick={() => setActiveView('factory-builder')} variant="outline" className="h-8 text-[10.5px] border-slate-250 bg-white hover:bg-slate-50 text-slate-700 cursor-pointer shadow-sm">
              <Download className="w-3.5 h-3.5 mr-1" />
              Export Factory Package
            </Button>
          </div>
        </div>
      </div>

      {/* Main Recommended Action Callout */}
      <div className="bg-amber-50 border border-amber-250/60 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start space-x-3 text-amber-850">
          <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] uppercase font-black tracking-wider text-slate-500 font-mono">Next Recommended Action</div>
            <p className="text-[11px] leading-relaxed mt-0.5">{mainNextActionLabel}</p>
          </div>
        </div>
        <Button onClick={mainNextActionTrigger} className="shrink-0 h-7 text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold border-none shadow-sm">
          {mainNextActionButton}
        </Button>
      </div>

      {/* End-to-End Pipeline visual flowchart */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <h2 className="text-[10px] font-black uppercase tracking-wider text-slate-600 mb-3 px-1 font-mono">
          Engineering Flow Pipeline
        </h2>
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {pipelineStages.map((stage, idx) => {
            const isCompleted = stage.active;
            const wCount = stage.warnings;
            return (
              <React.Fragment key={idx}>
                <div 
                  onClick={() => setActiveView(stage.view)}
                  className={`flex-1 min-w-[125px] border rounded-lg p-2.5 flex flex-col justify-between text-left transition-all cursor-pointer relative hover:border-slate-350 ${
                    isCompleted 
                      ? 'border-indigo-200 bg-indigo-50/40 text-slate-900 hover:bg-indigo-50/70' 
                      : 'border-slate-150 bg-slate-50/50 text-slate-400'
                  }`}
                >
                  {isCompleted && (
                    <div className="absolute top-1.5 right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  
                  <div>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider font-mono block">{stage.step}</span>
                    <span className="text-[7.5px] text-slate-450 mt-0.5 leading-none block font-sans truncate">{stage.label}</span>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-1 border-t border-slate-100 text-[9px] font-mono">
                    <span className="text-slate-655 font-bold">{stage.count} {stage.unit}</span>
                    {wCount > 0 && (
                      <span className="text-amber-700 font-bold bg-amber-50 px-1 rounded">
                        {wCount} ⚠️
                      </span>
                    )}
                  </div>
                </div>
                {idx < 9 && (
                  <ChevronRight className={`w-3.5 h-3.5 hidden md:block shrink-0 ${isCompleted ? 'text-indigo-300' : 'text-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Grid: Design Review & Factory Package Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Design Review (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/60 border-b border-slate-150 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                    Design Review Summary
                  </CardTitle>
                </div>
                <div className="flex space-x-2">
                  <div className="flex space-x-1 bg-slate-50 p-0.5 rounded border border-slate-150 self-start">
                    {(['all', 'blockers', 'warnings'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-2.5 py-1 rounded text-[8.5px] uppercase font-bold tracking-wider font-mono transition-all cursor-pointer ${
                          activeTab === tab 
                            ? 'bg-white text-slate-900 font-bold shadow-sm border border-slate-200/50' 
                            : 'text-slate-500 hover:text-slate-705'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 max-h-[350px] overflow-y-auto scrollbar-thin">
              
              {/* Severity Summary Counter */}
              <div className="grid grid-cols-4 gap-2 mb-2 text-center text-[10px] font-mono">
                <div className="bg-slate-50 p-2 rounded border border-slate-150">
                  <div className="text-rose-600 font-bold text-sm">{reviewSummary.blockers}</div>
                  <div className="text-slate-500 uppercase tracking-widest text-[7px] mt-0.5">Blockers</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-150">
                  <div className="text-rose-500 font-bold text-sm">{reviewSummary.errors}</div>
                  <div className="text-slate-500 uppercase tracking-widest text-[7px] mt-0.5">Errors</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-150">
                  <div className="text-amber-600 font-bold text-sm">{reviewSummary.warnings}</div>
                  <div className="text-slate-500 uppercase tracking-widest text-[7px] mt-0.5">Warnings</div>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-150">
                  <div className="text-indigo-600 font-bold text-sm">{reviewSummary.infos}</div>
                  <div className="text-slate-500 uppercase tracking-widest text-[7px] mt-0.5">Info</div>
                </div>
              </div>

              {filteredReviews.length === 0 ? (
                <div className="text-center py-6 text-slate-500 space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                  <p className="text-[10px] uppercase font-bold tracking-wider font-mono">0 review violations flagged</p>
                  <p className="text-[10px] font-sans text-slate-500">ERC parameters and layout DRC paths look safe.</p>
                </div>
              ) : (
                filteredReviews.slice(0, 5).map((action, idx) => {
                  const resolver = getActionResolver(action.id);
                  const isError = action.severity === 'Error' || action.severity === 'Blocker';
                  
                  return (
                    <div key={action.id || idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50 p-3 rounded border border-slate-150 hover:bg-slate-50 transition-all">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-1.5 py-0.25 rounded text-[8px] font-extrabold font-mono border uppercase tracking-wider ${
                            isError
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {action.severity}
                          </span>
                          <span className="text-[10.5px] font-bold text-slate-800 font-mono block">
                            {action.title}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-sans max-w-xl">
                          {action.description}
                        </p>
                      </div>

                      <div className="shrink-0 flex items-center space-x-1.5 self-end sm:self-center">
                        <button
                          onClick={() => {
                            if (action.linkedObjectType) {
                              const viewMap: Record<string, string> = {
                                "node": "blueprint-editor",
                                "mechanical-zone": "blueprint-editor",
                                "assembly-layer": "blueprint-editor",
                                "board": "board-studio",
                                "component": "board-components",
                                "circuit": "circuit-planner",
                                "net": "netlist-planner",
                                "pin": "pin-map",
                                "power": "power-budget",
                                "firmware": "firmware-plan",
                                "test": "testing",
                                "checklist": "mfg-pack",
                                "factory-file": "factory-builder",
                                "trace": "netlist-planner"
                              };
                              setActiveView(viewMap[action.linkedObjectType] || "blueprint-editor");
                            } else {
                              setActiveView("blueprint-editor");
                            }
                          }}
                          className="flex items-center space-x-1 px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-655 hover:text-slate-800 rounded text-[9px] font-bold transition-all cursor-pointer font-mono"
                        >
                          <span>Inspect</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        
                        {resolver && (
                          <button
                            onClick={() => {
                              resolver.run();
                              setToastMessage(`Auto-fix applied successfully: ${resolver.label}`);
                              runFullDesignReview();
                            }}
                            className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 rounded text-[9px] font-bold transition-all cursor-pointer font-mono"
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

        {/* Factory Package Summary (5 columns) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="bg-white border border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/60 border-b border-slate-150 p-4">
              <div className="flex items-center space-x-2">
                <Package className="w-4.5 h-4.5 text-indigo-650" />
                <CardTitle className="text-xs font-black text-slate-900 uppercase tracking-wider font-mono">
                  Factory Package Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3.5 text-[10.5px]">
              
              <div className="space-y-2 bg-slate-50 p-3 rounded border border-slate-150 font-mono text-[9.5px]">
                <div className="flex justify-between border-b border-slate-200/60 pb-1">
                  <span className="text-slate-450">Gerbers status:</span>
                  <span className={factoryFiles.gerberZip?.status === 'Verified' ? "text-emerald-600 font-bold" : "text-slate-500"}>
                    {factoryFiles.gerberZip?.status || 'Not Generated'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1 mt-1">
                  <span className="text-slate-455">Drill status:</span>
                  <span className={factoryFiles.drillFiles?.status === 'Verified' ? "text-emerald-600 font-bold" : "text-slate-500"}>
                    {factoryFiles.drillFiles?.status || 'Not Generated'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1 mt-1">
                  <span className="text-slate-455">BOM status:</span>
                  <span className={factoryFiles.bomCsv?.status === 'Verified' ? "text-emerald-600 font-bold" : "text-slate-500"}>
                    {factoryFiles.bomCsv?.status || 'Not Generated'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1 mt-1">
                  <span className="text-slate-455">CPL status:</span>
                  <span className={factoryFiles.cplCsv?.status === 'Verified' ? "text-emerald-600 font-bold" : "text-slate-500"}>
                    {factoryFiles.cplCsv?.status || 'Not Generated'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1 mt-1">
                  <span className="text-slate-455">Handoff Manifest:</span>
                  <span className={checkedCount === checklistItemsCount ? "text-emerald-600 font-bold" : "text-slate-500"}>
                    {factoryPackageStatus}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-slate-455">FABRICATION RELEASE:</span>
                  <span className={report.canMoveToFabrication ? "text-emerald-600 font-black animate-pulse" : "text-slate-450 font-bold"}>
                    {report.canMoveToFabrication ? "RELEASE READY" : "LOCKED"}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-150 pt-3 space-y-1 text-slate-500 leading-normal">
                <span className="font-extrabold text-slate-800 uppercase text-[9px] tracking-wider block font-mono">⚠️ Verification Status Notice:</span>
                <p className="text-[10px] text-slate-400 font-sans">
                  The package is configured as <strong>{factoryPackageStatus}</strong>. It requires checking off the 10 manual verification guidelines inside the Factory Package Builder before release confirmation is unlocked.
                </p>
              </div>

              <button
                onClick={() => setActiveView("factory-builder")}
                className="w-full py-1.5 mt-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center font-mono shadow-md"
              >
                Go to Factory Package Builder
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
