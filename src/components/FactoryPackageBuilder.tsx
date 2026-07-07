import React from 'react';
import { useProjectStore } from '../store/projectStore';
import { 
  generateNativeGerberCopperTop,
  generateNativeGerberCopperBottom,
  generateNativeGerberBoardOutline,
  generateNativeGerberTopSilkscreen,
  generateNativeGerberTopMask,
  generateNativeGerberBottomMask,
  generateNativeGerberTopPaste,
  generateNativeGerberBottomPaste,
  generateNativeExcellonDrills,
  generateNativeCplDraftCsv,
  generateNativeNetlistJson,
  generateNativeBoardLayoutJson,
  generateFactoryReviewReadme,
  exportHandoffManifestJson
} from '../lib/nativeExports';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Hammer, 
  Download, 
  RotateCcw, 
  AlertOctagon,
  ListTodo
} from 'lucide-react';
import { Button } from '../ui/Button';

// Helper to escape CSV quotes
const csvCell = (val: string | number | boolean | null | undefined): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// Safe download trigger
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const FactoryPackageBuilder: React.FC = () => {
  const store = useProjectStore();
  const { 
    projectName,
    factoryPackageStatus = "Draft",
    factoryReviewChecks = {},
    setFactoryPackageStatus,
    setFactoryReviewCheck,
    resetFactoryReview,
    updateFactoryFileStatus
  } = store;

  // Checklist config
  const checklistItems = [
    { key: "gerber_viewer", label: "Open in Gerber viewer" },
    { key: "board_dims", label: "Verify board outline dimensions" },
    { key: "pad_positions", label: "Verify footprint pad layout clearances" },
    { key: "drill_align", label: "Verify Excellon drill alignment voids" },
    { key: "rotations", label: "Verify component SMD rotations" },
    { key: "bom_quantities", label: "Verify BOM parts sourcing quantities" },
    { key: "cpl_rotations", label: "Verify pick-and-place side and rotation offsets" },
    { key: "dfm_run", label: "Run DFM verification rules check" },
    { key: "drc_erc", label: "Review DRC/ERC blockers listings" },
    { key: "verified", label: "Mark release files as verified" }
  ];

  const handleGenerateAllDrafts = () => {
    // Generate and update statuses in the store
    updateFactoryFileStatus("gerberZip", "Needs Final Review", "Top, bottom, and outline copper Gerber layers generated in app.", "Hardware Studio", "gerbers.zip");
    updateFactoryFileStatus("drillFiles", "Needs Final Review", "Excellon NC drill coordinate hole list generated.", "Hardware Studio", "drills.drl");
    updateFactoryFileStatus("bomCsv", "Needs Final Review", "BOM parts procurement list CSV.", "Hardware Studio", "bom.csv");
    updateFactoryFileStatus("cplCsv", "Needs Final Review", "SMT Pick-and-Place centroid list CSV.", "Hardware Studio", "cpl.csv");
    updateFactoryFileStatus("boardDrawing", "Needs Final Review", "Board outline mechanical geometry profile.", "Hardware Studio", "outline.gbr");

    setFactoryPackageStatus("Generated");
  };

  const handleVerifyPackage = () => {
    // Mark files verified
    updateFactoryFileStatus("gerberZip", "Verified", "Gerbers reviewed and approved.", "Hardware Studio", "gerbers.zip");
    updateFactoryFileStatus("drillFiles", "Verified", "Excellon drills reviewed and approved.", "Hardware Studio", "drills.drl");
    updateFactoryFileStatus("bomCsv", "Verified", "BOM reviewed and approved.", "Hardware Studio", "bom.csv");
    updateFactoryFileStatus("cplCsv", "Verified", "CPL reviewed and approved.", "Hardware Studio", "cpl.csv");
    updateFactoryFileStatus("boardDrawing", "Verified", "Outline geometry reviewed and approved.", "Hardware Studio", "outline.gbr");

    // Check off all checkboxes
    checklistItems.forEach(item => {
      setFactoryReviewCheck(item.key, true);
    });

    setFactoryPackageStatus("Verified");
  };

  const handleReset = () => {
    resetFactoryReview();
    updateFactoryFileStatus("gerberZip", "Not Generated");
    updateFactoryFileStatus("drillFiles", "Not Generated");
    updateFactoryFileStatus("bomCsv", "Not Generated");
    updateFactoryFileStatus("cplCsv", "Not Generated");
    updateFactoryFileStatus("boardDrawing", "Conceptual");
  };

  // Individual exports triggers
  const handleExportFile = (key: string) => {
    if (key === 'top_copper') {
      downloadFile(generateNativeGerberCopperTop(store), 'top_copper.gbr', 'text/plain');
    } else if (key === 'bottom_copper') {
      downloadFile(generateNativeGerberCopperBottom(store), 'bottom_copper.gbr', 'text/plain');
    } else if (key === 'board_outline') {
      downloadFile(generateNativeGerberBoardOutline(store), 'board_outline.gbr', 'text/plain');
    } else if (key === 'top_silkscreen') {
      downloadFile(generateNativeGerberTopSilkscreen(store), 'top_silkscreen.gbr', 'text/plain');
    } else if (key === 'top_mask') {
      downloadFile(generateNativeGerberTopMask(store), 'top_mask.gbr', 'text/plain');
    } else if (key === 'bottom_mask') {
      downloadFile(generateNativeGerberBottomMask(store), 'bottom_mask.gbr', 'text/plain');
    } else if (key === 'top_paste') {
      downloadFile(generateNativeGerberTopPaste(store), 'top_paste.gbr', 'text/plain');
    } else if (key === 'bottom_paste') {
      downloadFile(generateNativeGerberBottomPaste(store), 'bottom_paste.gbr', 'text/plain');
    } else if (key === 'drill') {
      downloadFile(generateNativeExcellonDrills(store), 'drills.drl', 'text/plain');
    } else if (key === 'bom') {
      // Export BOM from store
      const headers = ["Designator", "Name", "Type", "Value", "Package", "Quantity"];
      const rows = (store.boardComponents || []).map(c => [
        c.referenceDesignator, c.componentName, c.componentType, c.value, c.packageName, c.quantity
      ].map(csvCell).join(","));
      const content = headers.join(",") + "\n" + rows.join("\n");
      downloadFile(content, 'bom.csv', 'text/csv');
    } else if (key === 'cpl') {
      downloadFile(generateNativeCplDraftCsv(store), 'cpl.csv', 'text/csv');
    } else if (key === 'netlist') {
      downloadFile(generateNativeNetlistJson(store), 'netlist.json', 'application/json');
    } else if (key === 'manifest') {
      downloadFile(exportHandoffManifestJson(store), 'handoff_manifest.json', 'application/json');
    } else if (key === 'readme') {
      downloadFile(generateFactoryReviewReadme(store), 'factory_review_readme.md', 'text/markdown');
    } else if (key === 'board_layout') {
      downloadFile(generateNativeBoardLayoutJson(store), 'board_layout.json', 'application/json');
    }
  };

  const statusColors = {
    Draft: "bg-slate-800 text-slate-400 border-slate-700",
    Generated: "bg-emerald-950 text-emerald-400 border-emerald-800",
    "Needs Review": "bg-amber-950 text-amber-400 border-amber-800",
    Verified: "bg-blue-950 text-blue-400 border-blue-800",
    Blocked: "bg-rose-950 text-rose-400 border-rose-800"
  };

  const isGenerated = factoryPackageStatus !== 'Draft';

  return (
    <div className="flex-1 bg-slate-950 text-slate-100 p-6 overflow-y-auto font-sans h-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-slate-900 rounded-lg text-emerald-450 border border-slate-800 shadow-inner">
              <Hammer className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Factory Package Builder</h1>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Construct, verify, and release native manufacturing draft outputs for **{projectName}**.
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <div className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${statusColors[factoryPackageStatus]}`}>
            Status: {factoryPackageStatus}
          </div>
          <Button onClick={handleReset} variant="outline" className="h-7 text-[10px] text-slate-400 hover:text-slate-200 border-slate-800 bg-slate-900 hover:bg-slate-800">
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset Release
          </Button>
        </div>
      </div>

      {/* Safety Alert */}
      <div className="bg-amber-950/20 border border-amber-900/50 rounded-xl p-4 mb-6 flex items-start space-x-3 text-amber-250">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-[11px] leading-relaxed">
          <span className="font-bold">Manufacturing Disclaimer:</span> Generated manufacturing files require final engineering review, independent Gerber viewer review, and fab-house DFM validation before mass production. Do not run fabrications unchecked.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns - Files Management */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Generation Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-450 mr-1.5" />
              1. Draft Package Generation
            </h2>
            <p className="text-[11px] text-slate-400 mb-4">
              Compile local blueprints, component XY placement offsets, and routed track lines into RS-274X copper layer vectors and tool drill coordinates.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerateAllDrafts} className="h-8 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/20">
                Generate Factory Draft Package
              </Button>
              <Button onClick={handleVerifyPackage} variant="outline" className="h-8 text-[11px] border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-300">
                Mark Package Verified
              </Button>
              <Button onClick={() => setFactoryPackageStatus("Needs Review")} variant="outline" className="h-8 text-[11px] border-slate-700 bg-slate-950 hover:bg-slate-900 text-slate-300">
                Mark Needs Review
              </Button>
            </div>
          </div>

          {/* Files List Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4">
              2. Files Compiled In App
            </h2>
            <div className="space-y-2">
              {[
                { key: 'top_copper', label: 'Top Copper Gerber', fn: 'top_copper.gbr', desc: 'Top component pads & copper trace routes.' },
                { key: 'bottom_copper', label: 'Bottom Copper Gerber', fn: 'bottom_copper.gbr', desc: 'Bottom copper ground net runs.' },
                { key: 'board_outline', label: 'Board Outline Gerber', fn: 'board_outline.gbr', desc: 'Mechanical profile boundary cutouts.' },
                { key: 'top_silkscreen', label: 'Top Silkscreen Gerber', fn: 'top_silkscreen.gbr', desc: 'Top component outlines & reference text annotations.' },
                { key: 'top_mask', label: 'Top Mask Gerber', fn: 'top_mask.gbr', desc: 'Top solder mask clearances.' },
                { key: 'bottom_mask', label: 'Bottom Mask Gerber', fn: 'bottom_mask.gbr', desc: 'Bottom solder mask clearances.' },
                { key: 'drill', label: 'Excellon Drill File', fn: 'drills.drl', desc: 'Plated vias & structural mounting drill list.' },
                { key: 'bom', label: 'BOM CSV Sourcing List', fn: 'bom.csv', desc: 'Bill of Materials part numbers spreadsheet.' },
                { key: 'cpl', label: 'CPL Pick-and-Place CSV', fn: 'cpl.csv', desc: 'Centroid XY placement coordinate rotation sheet.' },
                { key: 'netlist', label: 'Netlist JSON Map', fn: 'netlist.json', desc: 'Electrical logical connections dictionary.' },
                { key: 'board_layout', label: 'Board Layout JSON Data', fn: 'board_layout.json', desc: 'Hardware Studio ECAD layout workspace metadata.' },
                { key: 'manifest', label: 'Handoff Manifest JSON', fn: 'handoff_manifest.json', desc: 'Package readiness index manifest summary.' },
                { key: 'readme', label: 'Factory Review README', fn: 'factory_review_readme.md', desc: 'Inspection guidelines & checklist verification document.' }
              ].map(f => {
                const isFileGenerated = isGenerated;
                return (
                  <div key={f.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-900 hover:border-slate-800 transition">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${isFileGenerated ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                      <div>
                        <div className="text-[11px] font-bold text-slate-200">{f.label}</div>
                        <div className="text-[9px] text-slate-450 mt-0.5">{f.desc}</div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleExportFile(f.key)}
                      disabled={!isFileGenerated}
                      className="h-7 px-2.5 text-[9px] font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-850 disabled:opacity-40 text-slate-350 cursor-pointer"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Export
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Missing / Not Generated Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-3 text-amber-500 flex items-center">
              <AlertOctagon className="w-4 h-4 mr-1.5" />
              3. Missing / Non-App Generated Layers
            </h2>
            <p className="text-[10px] text-slate-400 mb-4 leading-normal">
              These layers represent manufacturing stencil outputs that are not generated automatically by the visual editor flow. They remain flagged for physical production review.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
              {[
                { name: "Solder Paste Top Stencil", desc: "For SMD solder stencil deposition." },
                { name: "Solder Paste Bottom Stencil", desc: "For double-sided SMD stencils." },
                { name: "Bottom Silkscreen Artwork", desc: "Text annotations on bottom copper." },
                { name: "3D Mechanical STEP Assembly", desc: "Full dimensional CAD enclosure model." },
                { name: "3D STL Casing Mesh Profile", desc: "Outer shell contours for mock modeling." }
              ].map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-slate-950/40 border border-slate-900 flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1" />
                  <div>
                    <div className="font-bold text-slate-300">{m.name}</div>
                    <div className="text-[9px] text-slate-450 mt-0.5">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Review Checklist */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-bold text-slate-350 tracking-wider uppercase mb-4 flex items-center">
              <ListTodo className="w-4 h-4 text-emerald-450 mr-1.5" />
              4. Review Checklist
            </h2>
            <p className="text-[10px] text-slate-450 mb-4">
              Tick checkpoints to sign off on specific design checks. Toggling checkpoints persists statuses to localStorage.
            </p>

            <div className="space-y-3.5">
              {checklistItems.map(item => {
                const checked = factoryReviewChecks[item.key] === true;
                return (
                  <label key={item.key} className="flex items-start space-x-3 p-2.5 rounded-lg bg-slate-950/40 border border-slate-900/50 hover:bg-slate-900/30 transition cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => setFactoryReviewCheck(item.key, e.target.checked)}
                      className="mt-0.5 rounded border-slate-800 bg-slate-900 text-emerald-500 focus:ring-emerald-600 focus:ring-offset-slate-950 w-3.5 h-3.5"
                    />
                    <span className={`text-[10px] tracking-wide font-medium ${checked ? 'text-slate-300 line-through' : 'text-slate-400'}`}>
                      {item.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Guide Card */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5">
            <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">DFM Submission Guidelines</h3>
            <ul className="list-disc pl-4 space-y-1.5 text-[9px] text-slate-450">
              <li>Open Gerber layers in independent viewers to inspect trace margins.</li>
              <li>Coordinate file metric definitions with Excellon drills configurations.</li>
              <li>Verify Pick-and-Place rotations to match actual tape-and-reel orientation.</li>
              <li>Verify supplier part availability and pricing prior to fabrications release.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
