import React, { useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import { 
  exportBlueprintPackJson, 
  exportBlueprintPackMarkdown,
  exportBlueprintPackHtml 
} from '../lib/blueprintPackExport';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Download, 
  Printer, 
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  FileText,
  Layers,
  Package
} from 'lucide-react';
import { BlueprintSheetRenderer } from './blueprints/BlueprintSheetRenderer';

export const BlueprintSheets: React.FC = () => {
  const store = useProjectStore();
  const { 
    projectName, 
    version = "1.0",
    blueprintPack,
    blueprintPackStatus,
    setActiveView,
    generateBlueprintPack,
  } = store;

  const [activeSheetIdx, setActiveSheetIdx] = useState<number>(0);
  const [copiedAlert, setCopiedAlert] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const triggerToast = (msg: string) => {
    setCopiedAlert(msg);
    setTimeout(() => setCopiedAlert(null), 4000);
  };

  const downloadTextFile = (filename: string, content: string, mimeType = "text/plain") => {
    if (typeof window === 'undefined') return;
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGeneratePack = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const result = generateBlueprintPack();
      setIsGenerating(false);
      triggerToast(`Generated ${result.sheetCount} blueprint sheets with ${result.warnings} warnings.`);
    }, 400);
  };

  const handlePrint = () => window.print();

  const handleExportJSON = () => {
    if (!blueprintPack) return;
    downloadTextFile(`${projectName.toLowerCase().replace(/\s+/g, '_')}_blueprint_pack.json`, exportBlueprintPackJson(blueprintPack), "application/json");
    triggerToast("Blueprint Pack JSON exported.");
  };

  const handleExportMD = () => {
    if (!blueprintPack) return;
    downloadTextFile(`${projectName.toLowerCase().replace(/\s+/g, '_')}_blueprint_pack.md`, exportBlueprintPackMarkdown(blueprintPack), "text/markdown");
    triggerToast("Blueprint Pack Markdown exported.");
  };

  const handleExportHTML = () => {
    if (!blueprintPack) return;
    downloadTextFile(`${projectName.toLowerCase().replace(/\s+/g, '_')}_blueprint_pack.html`, exportBlueprintPackHtml(blueprintPack), "text/html");
    triggerToast("Blueprint Pack HTML exported.");
  };

  // ── Empty State ──
  if (!blueprintPack) {
    return (
      <div className="flex-1 bg-slate-50 overflow-y-auto p-6 flex items-center justify-center h-full">
        <div className="text-center max-w-md space-y-4">
          <Layers className="w-16 h-16 text-slate-300 mx-auto" />
          <h2 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight">No Blueprint Pack Generated</h2>
          <p className="text-sm text-slate-500">
            Generate a Blueprint Pack from your project data to view professional engineering sheets. 
            Each sheet is created from your live project model — architecture, mechanical, schematic, PCB, firmware, and more.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={handleGeneratePack} disabled={isGenerating} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-sm cursor-pointer">
              <RefreshCw className={`w-4 h-4 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Generate Blueprint Pack
            </Button>
            <Button onClick={() => setActiveView('blueprint-editor')} variant="outline" className="border-slate-300 text-slate-700 cursor-pointer">
              <FileText className="w-4 h-4 mr-1.5" />
              Open Blueprint Editor
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Active sheet ──
  const sheets = blueprintPack.sheets;
  const activeSheet = sheets[activeSheetIdx] || sheets[0];

  const statusColor = blueprintPackStatus === "Generated" ? "text-emerald-600" :
    blueprintPackStatus === "Stale" ? "text-amber-600" :
    blueprintPackStatus === "Verified" ? "text-emerald-700" : "text-slate-500";

  // Group sheets by category
  const categoryGroups = [
    { label: "Product", cats: ["product"] },
    { label: "Mechanical / Assembly", cats: ["mechanical", "assembly"] },
    { label: "Electronics / Schematic", cats: ["electronics", "schematic"] },
    { label: "PCB", cats: ["pcb"] },
    { label: "Firmware", cats: ["firmware"] },
    { label: "Testing", cats: ["testing"] },
    { label: "Manufacturing / Readiness", cats: ["manufacturing", "readiness"] },
  ];

  return (
    <div className="flex-1 bg-slate-50 overflow-hidden flex flex-col h-full select-none">
      {/* Toast */}
      {copiedAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-200 text-slate-900 rounded-lg px-4 py-3 shadow-xl max-w-md flex items-start space-x-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] font-medium text-slate-600">{copiedAlert}</p>
        </div>
      )}

      {/* Stale Warning Banner */}
      {blueprintPackStatus === "Stale" && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2 text-amber-800 text-[11px] font-medium">
            <AlertTriangle className="w-4 h-4" />
            <span>Blueprint Pack is out of date. Project data has changed since last generation.</span>
          </div>
          <Button onClick={handleGeneratePack} disabled={isGenerating} className="h-7 text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer">
            <RefreshCw className={`w-3 h-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight flex items-center space-x-2">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Blueprint Pack</span>
            </h1>
            <div className="flex items-center space-x-3 text-[10px] mt-0.5">
              <span className="text-slate-400 font-mono">{blueprintPack.summary.totalSheets} sheets</span>
              <span className="text-slate-300">|</span>
              <span className={`font-bold ${statusColor}`}>{blueprintPackStatus || "Generated"}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-400 font-mono">{blueprintPack.summary.warnings} warnings</span>
              {blueprintPack.summary.blockers > 0 && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="text-rose-600 font-bold">{blueprintPack.summary.blockers} blockers</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button onClick={handleGeneratePack} disabled={isGenerating} variant="outline" className="h-7 text-[10px] border-slate-250 text-slate-700 cursor-pointer">
            <RefreshCw className={`w-3 h-3 mr-1 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
          <Button onClick={handleExportJSON} variant="outline" className="h-7 text-[10px] border-slate-250 text-slate-700 cursor-pointer">
            <Download className="w-3 h-3 mr-1" /> JSON
          </Button>
          <Button onClick={handleExportMD} variant="outline" className="h-7 text-[10px] border-slate-250 text-slate-700 cursor-pointer">
            <Download className="w-3 h-3 mr-1" /> MD
          </Button>
          <Button onClick={handleExportHTML} variant="outline" className="h-7 text-[10px] border-slate-250 text-slate-700 cursor-pointer">
            <Download className="w-3 h-3 mr-1" /> HTML
          </Button>
          <Button onClick={handlePrint} variant="outline" className="h-7 text-[10px] border-slate-250 text-slate-700 cursor-pointer print:hidden">
            <Printer className="w-3 h-3 mr-1" /> Print
          </Button>
        </div>
      </div>

      {/* Body: Sheet List + Active Sheet */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Sheet navigation */}
        <div className="w-64 border-r border-slate-200 bg-white overflow-y-auto shrink-0 print:hidden">
          <div className="p-3 space-y-3">
            {categoryGroups.map(group => {
              const groupSheets = sheets.filter(s => group.cats.includes(s.category));
              if (groupSheets.length === 0) return null;
              return (
                <div key={group.label}>
                  <h3 className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest px-2 mb-1">{group.label}</h3>
                  <div className="space-y-0.5">
                    {groupSheets.map(s => {
                      const idx = sheets.indexOf(s);
                      const isActive = idx === activeSheetIdx;
                      const sBadge = s.status === "Generated In App" ? "bg-emerald-100 text-emerald-700" :
                        s.status === "Missing Data" ? "bg-rose-100 text-rose-700" :
                        s.status === "Draft" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600";
                      return (
                        <button
                          key={s.id}
                          onClick={() => setActiveSheetIdx(idx)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-md text-[10px] font-semibold transition-all cursor-pointer flex items-center justify-between ${
                            isActive
                              ? 'bg-slate-900 text-white shadow-sm'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="flex items-center space-x-1.5 min-w-0">
                            <span className="text-[8px] font-mono opacity-60 shrink-0">{s.sheetNo}</span>
                            <span className="truncate">{s.title.replace(" Blueprint", "")}</span>
                          </div>
                          {!isActive && (
                            <Badge className={`text-[6px] px-1 py-0 shrink-0 ${sBadge}`}>
                              {s.status === "Generated In App" ? "✓" : s.status === "Missing Data" ? "✗" : "~"}
                            </Badge>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Sheet Render */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeSheet && (
            <BlueprintSheetRenderer 
              sheet={activeSheet} 
              projectName={projectName} 
              revision={version}
            />
          )}
        </div>
      </div>
    </div>
  );
};
