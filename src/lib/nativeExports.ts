import { Project } from '../types';
import { calculateReadinessScore } from './readinessScore';
import { getFootprint, FOOTPRINT_LIBRARY } from './footprints';

// Helper to escape CSV cells
const csvCell = (val: string | number | boolean | null | undefined): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// Conversions
const mmToInch = 0.0393701;
const scaleGerber = (val: number) => Math.round(val * 10000).toString(); // scale for 3.4 decimal coordinate format

// 1. exportEditorLayoutsJson
export const exportEditorLayoutsJson = (project: Project): string => {
  const data = {
    projectName: project.projectName,
    updatedAt: project.updatedAt,
    editorLayouts: project.editorLayouts || {},
    editorConnections: project.editorConnections || [],
    disclaimer: "CONCEPTUAL DRAWING WORKSPACE LAYOUT PACK ONLY - FINAL ENGINEERING REVIEW REQUIRED"
  };
  return JSON.stringify(data, null, 2);
};

// 2. exportConceptualPlacementCsv (Legacy alias, keep for compatibility but redirect to advanced CPL generator or keep as simpler view)
export const exportConceptualPlacementCsv = (project: Project): string => {
  return generateNativeCplDraftCsv(project);
};

// 3. exportConceptualSchematicJson
export const exportConceptualSchematicJson = (project: Project): string => {
  const circuits = (project.circuitBlocks || []).map(c => {
    const linkedComponents = (project.boardComponents || [])
      .filter(bc => bc.circuitBlockId === c.id)
      .map(bc => ({
        refdes: bc.referenceDesignator,
        name: bc.componentName,
        footprint: bc.footprint
      }));

    return {
      circuitName: c.name,
      circuitType: c.circuitType,
      requiredComponents: c.requiredComponents,
      referenceDesignators: c.referenceDesignators,
      powerNets: c.powerNets,
      signalNets: c.signalNets,
      interfaceType: c.interfaceType,
      status: c.status,
      linkedComponents,
      disclaimer: "Conceptual schematic module blocks only - final engineering review and fab-house validation required."
    };
  });

  return JSON.stringify({
    projectName: project.projectName,
    compiledCircuits: circuits,
    warnings: circuits.filter(c => !c.powerNets || c.powerNets.toLowerCase().includes('required')).map(c => `Circuit [${c.circuitName}] lacks power net connections.`)
  }, null, 2);
};

// 4. exportConceptualMechanicalLayoutJson
export const exportConceptualMechanicalLayoutJson = (project: Project): string => {
  const zones = (project.mechanicalZones || []).map(obj => ({
    zoneId: obj.id,
    label: obj.name,
    zoneType: obj.zoneType,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    material: obj.material,
    notes: obj.notes || "No mechanical notes."
  }));

  const data = {
    projectName: project.projectName,
    boardDimensionOutline: (project.boards || []).map(b => ({
      boardName: b.name,
      dimensionsMm: b.dimensionsMm,
      substrate: b.substrate
    })),
    mechanicalZones: zones,
    disclaimer: "CONCEPTUAL CASING KEEP-OUTS ONLY - FINAL MECHANICAL GEOMETRY REVIEW REQUIRED BEFORE ENCLOSURE FABRICATION"
  };

  return JSON.stringify(data, null, 2);
};

// 5. exportConceptualNetRoutingJson
export const exportConceptualNetRoutingJson = (project: Project): string => {
  return generateNativeNetlistJson(project);
};

// 6. exportFirmwareArchitectureJson
export const exportFirmwareArchitectureJson = (project: Project): string => {
  const tasks = (project.firmwareTasks || []).map(t => ({
    taskName: t.name,
    taskType: t.type,
    linkedHardwareBlock: t.linkedBlock || 'System Clock',
    priority: t.priority,
    status: t.status,
    description: t.description,
    acceptanceCriteria: t.acceptanceCriteria || "System boots cleanly.",
    notes: t.notes || ""
  }));

  return JSON.stringify({
    projectName: project.projectName,
    tasks,
    stateMachine: {
      initialState: "INIT",
      states: ["BOOT", "INIT", "STANDBY_IDLE", "ACTIVE_DISPATCH", "LOW_POWER_SLEEP", "PANIC_SAFE"],
      transitions: [
        { from: "BOOT", to: "INIT", on: "RESET_COMPLETE" },
        { from: "INIT", to: "STANDBY_IDLE", on: "HARDWARE_CHECK_PASSED" },
        { from: "STANDBY_IDLE", to: "ACTIVE_DISPATCH", on: "INTERRUPT_TRIGGER" },
        { from: "ACTIVE_DISPATCH", to: "STANDBY_IDLE", on: "PROCESS_DONE" },
        { from: "STANDBY_IDLE", to: "LOW_POWER_SLEEP", on: "TIMEOUT_NO_ACTIVITY" },
        { from: "LOW_POWER_SLEEP", to: "BOOT", on: "WAKEUP_PIN_IRQ" },
        { from: "*", to: "PANIC_SAFE", on: "BATTERY_UNDERVOLT_OR_WATCHDOG_FAULT" }
      ]
    },
    disclaimer: "Conceptual firmware architecture blocks - final engineering review and fab-house validation required."
  }, null, 2);
};

// 7. exportTestingPlanJson
export const exportTestingPlanJson = (project: Project): string => {
  const tests = (project.testing || []).map(t => ({
    name: t.name,
    category: t.category || "EVT",
    goal: t.goal,
    steps: t.steps,
    passCriteria: t.passCriteria,
    evidenceLink: t.evidenceLink || "No link provided",
    status: t.status,
    notes: t.notes
  }));

  return JSON.stringify({
    projectName: project.projectName,
    testProtocols: tests,
    disclaimer: "Conceptual QA checklist only - final engineering review required."
  }, null, 2);
};

// 8. exportFactoryReadinessJson
export const exportFactoryReadinessJson = (project: Project): string => {
  const report = calculateReadinessScore(project);
  return JSON.stringify({
    projectName: project.projectName,
    readinessScore: report.overallScore,
    categoriesBreakdown: report.categories,
    blockers: report.blockers,
    warnings: report.warnings,
    isPlanningReady: report.isPlanningReady,
    isBlueprintPackReady: report.isBlueprintPackReady,
    isEditorLayoutReady: report.isEditorLayoutReady,
    canMoveToPrototype: report.canMoveToPrototype,
    canMoveToFactoryHandoff: report.canMoveToFactoryHandoff,
    canMoveToFabrication: report.canMoveToFabrication,
    compiledTimestamp: new Date().toISOString(),
    disclaimer: "CONCEPTUAL FILE VERIFICATION AND COMPLIANCE HEURISTICS CHECK - PRE-FABRICATION ONLY"
  }, null, 2);
};

// 9. exportMissingFactoryFilesMarkdown
export const exportMissingFactoryFilesMarkdown = (project: Project): string => {
  const fFiles = project.factoryFiles || {};
  
  let md = `# Factory Readiness File Pack Checklist - ${project.projectName}\n\n`;
  md += `This report evaluates the availability of physical manufacturing files required to submit board artwork or product dimensions to assembly houses. All files listed as 'Not Generated' must be generated in-app or uploaded.\n\n`;
  
  md += `| File Name / Key | Handoff Status | Tool/Source | Description / Instructions for Completion |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;
  
  Object.entries(fFiles).forEach(([key, val]) => {
    const title = key.replace(/([A-Z])/g, ' $1');
    const statusVal = val ? val.status : 'Not Generated';
    const sourceVal = (val && val.source) || "In App Generator";
    const notesVal = (val && val.notes) || "No notes.";

    md += `| ${title} | **${statusVal}** | ${sourceVal} | ${notesVal} |\n`;
  });

  md += `\n## Recommended Manual Verification Steps Before Direct Fabrication:\n\n`;
  md += `1. **Gerber Viewer Artwork Audit**: Open exported Gerber copper routing layers in an independent Gerber Viewer to audit drill alignment.\n`;
  md += `2. **NC Drill Files**: Ensure drill files are exported in Excellon metric format with decimal precision set correctly.\n`;
  md += `3. **BOM Verification**: Match parts sourcing manufacturer codes to verify active stocking status.\n`;
  md += `4. **CPL Centroid Placement**: Audit XY coordinates, component rotation offset, and board side mounting on pick-and-place files.\n`;
  md += `5. **DFM Analysis**: Submit Gerber layout layers to fab house checkers for design rule clearance verification.\n`;
  
  md += `\n> [!CAUTION]\n`;
  md += `> Hardware Studio is a pre-layout engineering planner. It does **not** guarantee final physical copper tolerances automatically. Final engineering review, independent Gerber viewer review, and fab-house DFM validation are mandatory prior to mass factory production.\n`;

  return md;
};

// 10. exportHandoffManifestJson
export const exportHandoffManifestJson = (project: Project): string => {
  const report = calculateReadinessScore(project);
  const fFiles = project.factoryFiles || {};

  const generatedInAppList: string[] = [];
  const pendingVerificationList: string[] = [];

  Object.entries(fFiles).forEach(([key, val]) => {
    if (val && (val.status === 'Generated In App' || val.status === 'Verified' || val.status === 'Needs Final Review')) {
      generatedInAppList.push(key);
    } else {
      pendingVerificationList.push(key);
    }
  });

  const manifest = {
    manifestVersion: "1.0.0",
    projectName: project.projectName,
    generatedAt: new Date().toISOString(),
    overallReadinessIndex: report.overallScore,
    packageStatus: project.factoryPackageStatus || "Draft",
    gatingState: {
      planningReady: report.isPlanningReady,
      blueprintPackReady: report.isBlueprintPackReady,
      editorLayoutReady: report.isEditorLayoutReady,
      prototypeReady: report.canMoveToPrototype,
      factoryHandoffReady: report.canMoveToFactoryHandoff,
      directFabricationReady: report.canMoveToFabrication
    },
    manufacturingChecklistCoverage: {
      total: (project.manufacturingChecklist || []).length,
      done: (project.manufacturingChecklist || []).filter(m => m.status === 'Done').length
    },
    artifactsList: {
      generatedInApp: generatedInAppList,
      pendingVerification: pendingVerificationList
    },
    disclaimer: "Draft Handoff Manifest generated in app. Final engineering review, independent Gerber viewer review, and fab-house DFM validation required."
  };

  return JSON.stringify(manifest, null, 2);
};

// --- NATIVE SERIALIZERS WORKSPACE ---

// Gerber Dimensions Resolver
const getBoardDimensions = (project: Project) => {
  const b = project.boards?.[0];
  const dimStr = b?.dimensionsMm || "50 x 50";
  const parts = dimStr.toLowerCase().split('x').map(s => parseFloat(s.trim()));
  const w = isNaN(parts[0]) ? 50 : parts[0];
  const h = isNaN(parts[1]) ? 50 : parts[1];
  return { w, h };
};

// Component Placement Resolver
const getPlacedComponents = (project: Project) => {
  const comps = project.boardComponents || [];
  const canvasComps = project.editorLayouts?.components || [];
  
  return comps.map(c => {
    let px = c.placementX;
    let py = c.placementY;
    const rot = c.rotationDeg || 0;
    
    // Fallback to canvas editor coordinates if database placement is missing
    if (px === undefined || py === undefined || px === 0 || py === 0) {
      const match = canvasComps.find(o => o.id === c.id || o.label === c.referenceDesignator);
      if (match) {
        px = (match.x + match.width / 2) / 10;
        py = (match.y + match.height / 2) / 10;
      } else {
        px = 25; // center fallbacks
        py = 25;
      }
    }
    return {
      ...c,
      placementX: px,
      placementY: py,
      rotationDeg: rot
    };
  });
};

// A. generateNativeGerberCopperTop
export const generateNativeGerberCopperTop = (project: Project): string => {
  let gbr = "";
  gbr += "G04 Gerber RS-274X Top Copper artwork layer - Generated In App by Hardware Studio v4*\n";
  gbr += "G04 WARNING: Generated manufacturing files require final engineering review, independent Gerber viewer review, and fab-house DFM validation before production.*\n";
  gbr += "%FSLAX34Y34*%\n";
  gbr += "%MOIN*%\n";
  gbr += "%ADD10C,0.0080*%\n"; // Aperture D10: Trace line drawing (8mils)
  gbr += "%ADD11C,0.0400*%\n"; // Aperture D11: Vias (40mils)
  gbr += "%ADD12C,0.0500*%\n"; // Aperture D12: Standard round pad (50mils)
  gbr += "%ADD13R,0.0600X0.0300*%\n"; // Aperture D13: Rectangular SMD pads (60x30mils)

  // 1. Draw Traces
  gbr += "G54D10*\n";
  const topTraces = (project.traces || []).filter(t => t.layerId?.toLowerCase() !== 'bottom');
  if (topTraces.length > 0) {
    topTraces.forEach(t => {
      if (t.points && t.points.length > 1) {
        const start = t.points[0];
        gbr += `X${scaleGerber(start.x * mmToInch)}Y${scaleGerber(start.y * mmToInch)}D02*\n`;
        for (let i = 1; i < t.points.length; i++) {
          const pt = t.points[i];
          gbr += `X${scaleGerber(pt.x * mmToInch)}Y${scaleGerber(pt.y * mmToInch)}D01*\n`;
        }
      }
    });
  } else {
    // Fallback: draw nets from editor layout
    const editorTraces = project.editorLayouts?.nets || [];
    editorTraces.forEach(tr => {
      const sx = (tr.x / 10) * mmToInch;
      const sy = (tr.y / 10) * mmToInch;
      const ex = ((tr.x + 40) / 10) * mmToInch;
      const ey = ((tr.y + 40) / 10) * mmToInch;
      gbr += `X${scaleGerber(sx)}Y${scaleGerber(sy)}D02*\n`;
      gbr += `X${scaleGerber(ex)}Y${scaleGerber(ey)}D01*\n`;
    });
  }

  // 2. Draw Pads using Footprint Presets
  const placed = getPlacedComponents(project).filter(c => c.side?.toLowerCase() !== 'bottom');
  placed.forEach(c => {
    const fp = getFootprint(c.footprint || '');
    gbr += "G54D13*\n"; // standard SMD rect pads
    fp.pads.forEach(pad => {
      // Rotation transformations
      const rad = (c.rotationDeg * Math.PI) / 180;
      const rx = pad.xMm * Math.cos(rad) - pad.yMm * Math.sin(rad);
      const ry = pad.xMm * Math.sin(rad) + pad.yMm * Math.cos(rad);
      
      const px = (c.placementX! + rx) * mmToInch;
      const py = (c.placementY! + ry) * mmToInch;
      gbr += `X${scaleGerber(px)}Y${scaleGerber(py)}D03*\n`; // flash pad
    });
  });

  // 3. Draw Vias
  gbr += "G54D11*\n";
  const vias = project.vias || [];
  vias.forEach(v => {
    if (v.x !== undefined && v.y !== undefined) {
      gbr += `X${scaleGerber(v.x * mmToInch)}Y${scaleGerber(v.y * mmToInch)}D03*\n`;
    }
  });

  gbr += "M02*\n";
  return gbr;
};

// B. generateNativeGerberCopperBottom
export const generateNativeGerberCopperBottom = (project: Project): string => {
  let gbr = "";
  gbr += "G04 Gerber RS-274X Bottom Copper artwork layer - Generated In App by Hardware Studio v4*\n";
  gbr += "G04 WARNING: Generated manufacturing files require final engineering review, independent Gerber viewer review, and fab-house DFM validation before production.*\n";
  gbr += "%FSLAX34Y34*%\n";
  gbr += "%MOIN*%\n";
  gbr += "%ADD10C,0.0100*%\n"; // Aperture D10: Trace line drawing (10mils)
  gbr += "%ADD11C,0.0400*%\n"; // Aperture D11: Vias (40mils)
  gbr += "%ADD12C,0.0500*%\n"; // Aperture D12: Standard round pad (50mils)

  // 1. Draw bottom copper traces
  gbr += "G54D10*\n";
  const bottomTraces = (project.traces || []).filter(t => t.layerId?.toLowerCase() === 'bottom');
  bottomTraces.forEach(t => {
    if (t.points && t.points.length > 1) {
      const start = t.points[0];
      gbr += `X${scaleGerber(start.x * mmToInch)}Y${scaleGerber(start.y * mmToInch)}D02*\n`;
      for (let i = 1; i < t.points.length; i++) {
        const pt = t.points[i];
        gbr += `X${scaleGerber(pt.x * mmToInch)}Y${scaleGerber(pt.y * mmToInch)}D01*\n`;
      }
    }
  });

  // 2. Draw Bottom-side component pads
  const placed = getPlacedComponents(project).filter(c => c.side?.toLowerCase() === 'bottom');
  placed.forEach(c => {
    const fp = getFootprint(c.footprint || '');
    gbr += "G54D12*\n";
    fp.pads.forEach(pad => {
      const rad = (c.rotationDeg * Math.PI) / 180;
      const rx = pad.xMm * Math.cos(rad) - pad.yMm * Math.sin(rad);
      const ry = pad.xMm * Math.sin(rad) + pad.yMm * Math.cos(rad);
      const px = (c.placementX! + rx) * mmToInch;
      const py = (c.placementY! + ry) * mmToInch;
      gbr += `X${scaleGerber(px)}Y${scaleGerber(py)}D03*\n`;
    });
  });

  // 3. Draw Vias (Bottom Pads)
  gbr += "G54D11*\n";
  const vias = project.vias || [];
  vias.forEach(v => {
    if (v.x !== undefined && v.y !== undefined) {
      gbr += `X${scaleGerber(v.x * mmToInch)}Y${scaleGerber(v.y * mmToInch)}D03*\n`;
    }
  });

  gbr += "M02*\n";
  return gbr;
};

// C. generateNativeGerberBoardOutline
export const generateNativeGerberBoardOutline = (project: Project): string => {
  const { w, h } = getBoardDimensions(project);
  const wInch = w * mmToInch;
  const hInch = h * mmToInch;

  let gbr = "";
  gbr += "G04 Gerber RS-274X Board physical contour outline - Generated In App by Hardware Studio v4*\n";
  gbr += "G04 WARNING: Generated manufacturing files require final engineering review, independent Gerber viewer review, and fab-house DFM validation before production.*\n";
  gbr += "%FSLAX34Y34*%\n";
  gbr += "%MOIN*%\n";
  gbr += "%ADD10C,0.0080*%\n"; // Edge line profile 8mils width

  gbr += "G54D10*\n";
  const outlines = project.boardOutlines || [];
  if (outlines.length > 0 && outlines[0].points && outlines[0].points.length > 1) {
    const pts = outlines[0].points;
    gbr += `X${scaleGerber(pts[0].x * mmToInch)}Y${scaleGerber(pts[0].y * mmToInch)}D02*\n`;
    for (let i = 1; i < pts.length; i++) {
      gbr += `X${scaleGerber(pts[i].x * mmToInch)}Y${scaleGerber(pts[i].y * mmToInch)}D01*\n`;
    }
    // close loop
    gbr += `X${scaleGerber(pts[0].x * mmToInch)}Y${scaleGerber(pts[0].y * mmToInch)}D01*\n`;
  } else {
    // draw rectangle based on dimensions
    gbr += "X0Y0D02*\n";
    gbr += `X${scaleGerber(wInch)}Y0D01*\n`;
    gbr += `X${scaleGerber(wInch)}Y${scaleGerber(hInch)}D01*\n`;
    gbr += `X0Y${scaleGerber(hInch)}D01*\n`;
    gbr += "X0Y0D01*\n";
  }

  gbr += "M02*\n";
  return gbr;
};

// D. generateNativeGerberTopSilkscreen
export const generateNativeGerberTopSilkscreen = (project: Project): string => {
  let gbr = "";
  gbr += "G04 Gerber RS-274X Top Silkscreen layers - Generated In App by Hardware Studio v4*\n";
  gbr += "G04 WARNING: Generated manufacturing files require final engineering review, independent Gerber viewer review, and fab-house DFM validation before production.*\n";
  gbr += "%FSLAX34Y34*%\n";
  gbr += "%MOIN*%\n";
  gbr += "%ADD10C,0.0050*%\n"; // Silkscreen pen width 5mils

  gbr += "G54D10*\n";
  const placed = getPlacedComponents(project).filter(c => c.side?.toLowerCase() !== 'bottom');
  placed.forEach(c => {
    const fp = getFootprint(c.footprint || '');
    // Draw body bounding box on silkscreen
    const bx = fp.bodyWidthMm / 2;
    const by = fp.bodyHeightMm / 2;
    const rad = (c.rotationDeg * Math.PI) / 180;
    
    const rotateAndScale = (x: number, y: number) => {
      const rx = x * Math.cos(rad) - y * Math.sin(rad);
      const ry = x * Math.sin(rad) + y * Math.cos(rad);
      return {
        x: scaleGerber((c.placementX! + rx) * mmToInch),
        y: scaleGerber((c.placementY! + ry) * mmToInch)
      };
    };

    const p1 = rotateAndScale(-bx, -by);
    const p2 = rotateAndScale(bx, -by);
    const p3 = rotateAndScale(bx, by);
    const p4 = rotateAndScale(-bx, by);

    gbr += `X${p1.x}Y${p1.y}D02*\n`;
    gbr += `X${p2.x}Y${p2.y}D01*\n`;
    gbr += `X${p3.x}Y${p3.y}D01*\n`;
    gbr += `X${p4.x}Y${p4.y}D01*\n`;
    gbr += `X${p1.x}Y${p1.y}D01*\n`;
  });

  gbr += "M02*\n";
  return gbr;
};

// E. generateNativeGerberTopMask
export const generateNativeGerberTopMask = (project: Project): string => {
  let gbr = "";
  gbr += "G04 Gerber RS-274X Top Solder Mask voids - Generated In App by Hardware Studio v4*\n";
  gbr += "G04 WARNING: Generated manufacturing files require final engineering review, independent Gerber viewer review, and fab-house DFM validation before production.*\n";
  gbr += "%FSLAX34Y34*%\n";
  gbr += "%MOIN*%\n";
  gbr += "%ADD10C,0.0540*%\n"; // Pad clearance aperture (pad size 50mils + 4mils mask expansion)

  gbr += "G54D10*\n";
  const placed = getPlacedComponents(project).filter(c => c.side?.toLowerCase() !== 'bottom');
  placed.forEach(c => {
    const fp = getFootprint(c.footprint || '');
    fp.pads.forEach(pad => {
      const rad = (c.rotationDeg * Math.PI) / 180;
      const rx = pad.xMm * Math.cos(rad) - pad.yMm * Math.sin(rad);
      const ry = pad.xMm * Math.sin(rad) + pad.yMm * Math.cos(rad);
      const px = (c.placementX! + rx) * mmToInch;
      const py = (c.placementY! + ry) * mmToInch;
      gbr += `X${scaleGerber(px)}Y${scaleGerber(py)}D03*\n`;
    });
  });

  gbr += "M02*\n";
  return gbr;
};

// F. generateNativeGerberBottomMask
export const generateNativeGerberBottomMask = (project: Project): string => {
  let gbr = "";
  gbr += "G04 Gerber RS-274X Bottom Solder Mask voids - Generated In App by Hardware Studio v4*\n";
  gbr += "G04 WARNING: Generated manufacturing files require final engineering review, independent Gerber viewer review, and fab-house DFM validation before production.*\n";
  gbr += "%FSLAX34Y34*%\n";
  gbr += "%MOIN*%\n";
  gbr += "%ADD10C,0.0540*%\n";

  gbr += "G54D10*\n";
  const placed = getPlacedComponents(project).filter(c => c.side?.toLowerCase() === 'bottom');
  placed.forEach(c => {
    const fp = getFootprint(c.footprint || '');
    fp.pads.forEach(pad => {
      const rad = (c.rotationDeg * Math.PI) / 180;
      const rx = pad.xMm * Math.cos(rad) - pad.yMm * Math.sin(rad);
      const ry = pad.xMm * Math.sin(rad) + pad.yMm * Math.cos(rad);
      const px = (c.placementX! + rx) * mmToInch;
      const py = (c.placementY! + ry) * mmToInch;
      gbr += `X${scaleGerber(px)}Y${scaleGerber(py)}D03*\n`;
    });
  });

  gbr += "M02*\n";
  return gbr;
};

// G. generateNativeGerberTopPaste
export const generateNativeGerberTopPaste = (project: Project): string => {
  let gbr = "";
  gbr += "G04 Gerber RS-274X Top Solder Paste stencil voids - Generated In App by Hardware Studio v4*\n";
  gbr += "%FSLAX34Y34*%\n";
  gbr += "%MOIN*%\n";
  gbr += "%ADD10C,0.0500*%\n";

  gbr += "G54D10*\n";
  const placed = getPlacedComponents(project).filter(c => c.side?.toLowerCase() !== 'bottom');
  placed.forEach(c => {
    const fp = getFootprint(c.footprint || '');
    fp.pads.forEach(pad => {
      const rad = (c.rotationDeg * Math.PI) / 180;
      const rx = pad.xMm * Math.cos(rad) - pad.yMm * Math.sin(rad);
      const ry = pad.xMm * Math.sin(rad) + pad.yMm * Math.cos(rad);
      const px = (c.placementX! + rx) * mmToInch;
      const py = (c.placementY! + ry) * mmToInch;
      gbr += `X${scaleGerber(px)}Y${scaleGerber(py)}D03*\n`;
    });
  });

  gbr += "M02*\n";
  return gbr;
};

// H. generateNativeGerberBottomPaste
export const generateNativeGerberBottomPaste = (project: Project): string => {
  let gbr = "";
  gbr += "G04 Gerber RS-274X Bottom Solder Paste stencil voids - Generated In App by Hardware Studio v4*\n";
  gbr += "%FSLAX34Y34*%\n";
  gbr += "%MOIN*%\n";
  gbr += "%ADD10C,0.0500*%\n";

  gbr += "G54D10*\n";
  const placed = getPlacedComponents(project).filter(c => c.side?.toLowerCase() === 'bottom');
  placed.forEach(c => {
    const fp = getFootprint(c.footprint || '');
    fp.pads.forEach(pad => {
      const rad = (c.rotationDeg * Math.PI) / 180;
      const rx = pad.xMm * Math.cos(rad) - pad.yMm * Math.sin(rad);
      const ry = pad.xMm * Math.sin(rad) + pad.yMm * Math.cos(rad);
      const px = (c.placementX! + rx) * mmToInch;
      const py = (c.placementY! + ry) * mmToInch;
      gbr += `X${scaleGerber(px)}Y${scaleGerber(py)}D03*\n`;
    });
  });

  gbr += "M02*\n";
  return gbr;
};

// I. generateNativeExcellonDrills
export const generateNativeExcellonDrills = (project: Project): string => {
  const vias = project.vias || [];
  const drillHoles = project.drillHoles || [];

  const scaleExcellon = (val: number) => {
    const v = Math.round(val * 100);
    return v.toString().padStart(5, '0');
  };

  let drl = "";
  drl += "; Excellon NC Drill File - Generated In App by Hardware Studio v4\n";
  drl += "; WARNING: Generated manufacturing files require final engineering review, independent Gerber viewer review, and fab-house DFM validation before production.\n";
  drl += "M48\n";
  drl += "METRIC,LZ\n";
  drl += "T01C0.300\n"; // Tool 01: 0.3mm plated vias
  drl += "T02C1.000\n"; // Tool 02: 1.0mm mounting drill holes
  drl += "%\n";

  // Drill Plated Vias (T01)
  drl += "T01\n";
  if (vias.length > 0) {
    vias.forEach(v => {
      if (v.x !== undefined && v.y !== undefined) {
        drl += `X${scaleExcellon(v.x)}Y${scaleExcellon(v.y)}\n`;
      }
    });
  } else {
    // fallback test pins
    const layoutPins = project.editorLayouts?.pins || [];
    layoutPins.forEach(p => {
      drl += `X${scaleExcellon(p.x / 10)}Y${scaleExcellon(p.y / 10)}\n`;
    });
  }

  // Drill Non-Plated Mounting Holes (T02)
  drl += "T02\n";
  if (drillHoles.length > 0) {
    drillHoles.forEach(dh => {
      if (dh.x !== undefined && dh.y !== undefined) {
        drl += `X${scaleExcellon(dh.x)}Y${scaleExcellon(dh.y)}\n`;
      }
    });
  } else {
    // fallback default holes
    drl += `X${scaleExcellon(5.0)}Y${scaleExcellon(5.0)}\n`;
    drl += `X${scaleExcellon(45.0)}Y${scaleExcellon(5.0)}\n`;
  }

  drl += "M30\n";
  return drl;
};

// J. generateNativeCplDraftCsv
export const generateNativeCplDraftCsv = (project: Project): string => {
  const headers = [
    "Designator",
    "Comment / Component Name",
    "Footprint",
    "Mid X",
    "Mid Y",
    "Rotation",
    "Layer / Side",
    "Board",
    "Source",
    "Status",
    "Notes"
  ];

  const warnings: string[] = [];
  const placed = getPlacedComponents(project);
  
  const rows = placed.map(c => {
    // Validation checks
    if (!c.footprint || !FOOTPRINT_LIBRARY[c.footprint]) {
      warnings.push(`Missing library footprint spec for component [${c.referenceDesignator}].`);
    }
    if (c.placementX === undefined || c.placementY === undefined || c.placementX === 0 || c.placementY === 0) {
      warnings.push(`Missing physical coordinate offsets for component [${c.referenceDesignator}].`);
    }

    return [
      csvCell(c.referenceDesignator),
      csvCell(c.componentName),
      csvCell(c.footprint || 'CUSTOM_RECT'),
      csvCell(c.placementX || 0),
      csvCell(c.placementY || 0),
      csvCell(c.rotationDeg || 0),
      csvCell(c.side || 'Top'),
      csvCell("Main Board"),
      csvCell("App Generated"),
      csvCell(c.lockedPlacement ? "Locked" : "Draft"),
      csvCell(c.notes || '')
    ];
  });

  let output = "";
  output += "# Draft CPL Pick-and-Place generated in app.\n";
  output += "# WARNING: Verify rotations and origin alignment before SMD assembly.\n";
  if (warnings.length > 0) {
    warnings.forEach(w => {
      output += `# WARNING: ${w}\n`;
    });
  }
  output += "\n";
  output += headers.join(",") + "\n";
  output += rows.map(r => r.join(",")).join("\n");

  return output;
};

// K. generateNativeNetlistJson
export const generateNativeNetlistJson = (project: Project): string => {
  const nets = (project.nets || []).map(n => ({
    netName: n.netName,
    netType: n.netType,
    voltage: n.voltage,
    source: `${n.sourceComponent}:${n.sourcePin}`,
    target: `${n.targetComponent}:${n.targetPin}`,
    protocol: n.protocol,
    currentEstimate: n.currentEstimate,
    impedanceRequirement: n.impedanceRequirement,
    notes: n.notes
  }));

  const warnings: string[] = [];
  const hasGnd = nets.some(n => n.netName.toUpperCase() === 'GND');
  if (!hasGnd) {
    warnings.push("GND reference net path not found.");
  }

  const output = {
    generatedAt: new Date().toISOString(),
    format: "Hardware Studio Netlist JSON v1.0",
    warnings,
    netsList: nets,
    disclaimer: "Logical net connections list. Physical impedance match tuning and routing clearance check required."
  };

  return JSON.stringify(output, null, 2);
};

// L. generateNativeBoardLayoutJson
export const generateNativeBoardLayoutJson = (project: Project): string => {
  const data = {
    generatedAt: new Date().toISOString(),
    projectName: project.projectName,
    boards: project.boards || [],
    boardOutlines: project.boardOutlines || [],
    pcbLayers: project.pcbLayers || [],
    boardComponents: getPlacedComponents(project),
    traces: project.traces || [],
    vias: project.vias || [],
    drillHoles: project.drillHoles || [],
    copperShapes: project.copperShapes || [],
    pcbRules: project.pcbRules || [],
    disclaimer: "App-generated native board layouts metadata document. Final mechanical review required."
  };
  return JSON.stringify(data, null, 2);
};

// M. generateFactoryReviewReadme
export const generateFactoryReviewReadme = (project: Project): string => {
  let rm = "";
  rm += `# Factory Review Guide - ${project.projectName}\n\n`;
  rm += `Generated At: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
  rm += `Current Package Status: **${project.factoryPackageStatus || 'Draft'}**\n\n`;
  
  rm += `> [!IMPORTANT]\n`;
  rm += `> **Direct Fabrication Disclaimer**:\n`;
  rm += `> Generated manufacturing files require final engineering review, independent Gerber viewer review, and fab-house DFM validation before production.\n\n`;
  
  rm += `## 10-Point Checklist Verification Progress:\n\n`;
  const checks = project.factoryReviewChecks || {};
  const items = [
    { key: "gerber_viewer", label: "Open in Gerber viewer" },
    { key: "board_dims", label: "Verify board outline dimensions" },
    { key: "pad_positions", label: "Verify footprint pad layout clearances" },
    { key: "drill_align", label: "Verify Excellon drill alignment voids" },
    { key: "rotations", label: "Verify component SMD rotations" },
    { key: "bom_quantities", label: "Verify BOM parts sourcing quantities" },
    { key: "cpl_rotations", label: "Verify pick-and-place side and rotation offsets" },
    { key: "dfm_run", label: "Run DFM verification rules check" },
    { key: "drc_erc", label: "Resolve DRC/ERC blockers listings" },
    { key: "verified", label: "Mark release files as verified" }
  ];

  items.forEach((item, idx) => {
    const isChecked = checks[item.key] === true;
    rm += `${idx + 1}. [${isChecked ? 'x' : ' '}] ${item.label}\n`;
  });

  rm += `\n## Supported In-App Fabrication Assets:\n`;
  rm += `- Top Copper Gerber artwork\n`;
  rm += `- Bottom Copper Gerber artwork\n`;
  rm += `- Board Outline contour edge file\n`;
  rm += `- Excellon metric drill file\n`;
  rm += `- BOM CSV parts list\n`;
  rm += `- CPL centroid Pick-and-Place coordinates CSV\n`;

  return rm;
};
