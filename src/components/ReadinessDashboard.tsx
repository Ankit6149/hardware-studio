import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { calculateReadinessScore } from '../lib/readinessScore';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { 
  ShieldAlert, 
  CheckSquare, 
  CheckCircle2
} from 'lucide-react';

export const ReadinessDashboard: React.FC = () => {
  const project = useProjectStore();
  const report = calculateReadinessScore(project);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 50) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const getCategoryProgressColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 relative p-6 space-y-6 overflow-y-auto">
      
      {/* Header Panel */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
            Prototype Readiness Review
          </h2>
          <p className="text-[11px] text-slate-500 leading-normal max-w-xl">
            This module evaluates your active blueprint against validation heuristics to gauge overall prototype verification readiness before moving to PCB spin or component procurement.
          </p>
        </div>
      </div>

      {/* Main Grid: Circle score and category bars */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Card: Radial Score Indicator */}
        <Card className="lg:col-span-2 flex flex-col items-center justify-center p-6 bg-white border border-slate-200">
          <CardHeader className="border-0 bg-transparent pb-0 w-full text-center">
            <CardTitle className="text-slate-550 font-bold uppercase tracking-widest font-mono text-[10px]">
              Active Readiness Index
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
            
            {/* SVG Radial Progress Circle */}
            <div className="relative w-36 h-36">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-slate-100 stroke-slate-100"
                  strokeWidth="8"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className={`transition-all duration-500 ${getScoreColor(report.overallScore)}`}
                  strokeWidth="8"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * report.overallScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
                <span className="text-3xl font-extrabold font-mono tracking-tight text-slate-800 leading-none">
                  {report.overallScore}
                </span>
                <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest leading-none">
                  Readiness
                </span>
              </div>
            </div>

            <div className="text-center space-y-1 max-w-xs">
              <span className="text-xs font-bold text-slate-800 font-mono">
                {report.overallScore >= 80 ? '🔥 PROTOTYPE READY' : report.overallScore >= 50 ? '⚠️ VERIFICATION PENDING' : '❌ CONCEPT BLOCK STAGE'}
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed font-sans">
                {report.overallScore >= 80 
                  ? "Your hardware planning model meets all basic verification criteria. You are clear to export plans." 
                  : "Resolve all active blockers and warnings below to push your index towards production ready."}
              </p>
            </div>

            {/* Verification Gates */}
            <div className="w-full border-t border-slate-100 pt-3 mt-1 space-y-1.5 text-left">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Gateway Verification Status</span>
              <div className="grid grid-cols-1 gap-1">
                {[
                  { name: "Planning Gate", status: report.isPlanningReady },
                  { name: "Blueprint Pack Gate", status: report.isBlueprintPackReady },
                  { name: "CAD Editor Layout Gate", status: report.isEditorLayoutReady },
                  { name: "Prototype Spin Gate", status: report.canMoveToPrototype },
                  { name: "Factory Handoff Gate", status: report.canMoveToFactoryHandoff },
                  { name: "Direct Fabrication Gate", status: report.canMoveToFabrication }
                ].map((gate, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px] font-sans font-semibold bg-slate-50 border border-slate-100 rounded px-2.5 py-1">
                    <span className="text-slate-650">{gate.name}</span>
                    <span className={`text-[8px] font-bold uppercase tracking-wider ${
                      gate.status ? 'text-emerald-600' : 'text-slate-400'
                    }`}>
                      {gate.status ? '● PASSED' : '○ LOCKED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </CardContent>
        </Card>

        {/* Right Card: Categories Scores list */}
        <Card className="lg:col-span-3 bg-white border border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100">
            <CardTitle>Heuristics Category breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5 max-h-[480px] overflow-y-auto scrollbar-thin">
            
            {/* Category Bars */}
            {[
              { label: 'Product Architecture', val: report.categories.architecture },
              { label: 'Mechanical Layout', val: report.categories.mechanical },
              { label: 'Assembly Layout', val: report.categories.assembly },
              { label: 'Board/PCB Prep', val: report.categories.boardPrep },
              { label: 'Component Placement', val: report.categories.components },
              { label: 'Circuit/Schematic Prep', val: report.categories.electronics },
              { label: 'Nets Layout', val: report.categories.nets },
              { label: 'MCU Pin Map', val: report.categories.pinMap },
              { label: 'Power Budget Tree', val: report.categories.power },
              { label: 'Firmware Driver Plans', val: report.categories.firmware },
              { label: 'Test Protocols & QA', val: report.categories.testing },
              { label: 'Manufacturing Checklist', val: report.categories.manufacturing },
              { label: 'Native Export Pack', val: report.categories.nativeExports },
              { label: 'Factory Files Package', val: report.categories.factoryFiles },
              { label: 'Safety & Compliance', val: report.categories.safety }
            ].map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-650 font-mono uppercase tracking-wider">
                  <span>{cat.label}</span>
                  <span>{cat.val}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${getCategoryProgressColor(cat.val)}`}
                    style={{ width: `${cat.val}%` }}
                  />
                </div>
              </div>
            ))}

          </CardContent>
        </Card>

      </div>

      {/* Recommended Actions Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Action Box: Next 5 Actions Checklist */}
        <Card className="bg-white border border-slate-200">
          <CardHeader className="bg-slate-50/50 border-b border-slate-150">
            <div className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <CardTitle>Next 5 Priority Actions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2.5">
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
            </div>
          </CardContent>
        </Card>

        {/* Right Action Box: Warnings detail review */}
        <Card className="bg-white border border-slate-200 flex flex-col">
          <CardHeader className="bg-slate-50/50 border-b border-slate-150">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <CardTitle>Active Architecture review log</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="p-4 flex-1 overflow-y-auto space-y-4">
            
            {/* Blockers lists */}
            {report.blockers.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest font-mono block">
                  🔴 Critical Blockers ({report.blockers.length})
                </span>
                <ul className="space-y-1 list-disc pl-4 text-[10px] text-rose-700 font-sans leading-relaxed">
                  {report.blockers.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            )}

            {/* Warnings list */}
            {report.warnings.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono block">
                  ⚠️ Validation Warnings ({report.warnings.length})
                </span>
                <ul className="space-y-1 list-disc pl-4 text-[10px] text-amber-700 font-sans leading-relaxed">
                  {report.warnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            )}

            {/* Suggestions list */}
            {report.suggestions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold text-slate-450 uppercase tracking-widest font-mono block">
                  💡 Suggestions ({report.suggestions.length})
                </span>
                <ul className="space-y-1 list-disc pl-4 text-[10px] text-slate-600 font-sans leading-relaxed">
                  {report.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {report.blockers.length === 0 && report.warnings.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span className="text-[11px] text-slate-700 font-bold uppercase tracking-wider font-mono">
                  Zero Warnings Detected
                </span>
                <p className="text-[10px] text-slate-450 max-w-xs">
                  Your current hardware planning model matches all automated validation tests perfectly.
                </p>
              </div>
            )}

          </CardContent>
        </Card>

      </div>

    </div>
  );
};
