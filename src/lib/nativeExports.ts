import { Project } from '../types';
import { calculateReadinessScore } from './readinessScore';

// Helper to escape CSV quotes
const csvCell = (val: string | number | boolean | null | undefined): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

// 1. exportEditorLayoutsJson
export const exportEditorLayoutsJson = (project: Project): string => {
  const data = {
    projectName: project.projectName,
    updatedAt: project.updatedAt,
    editorLayouts: project.editorLayouts || {},
    editorConnections: project.editorConnections || [],
    disclaimer: "CONCEPTUAL DRAWING WORKSPACE LAYOUT PACK ONLY - ECAD/MCAD DATABASE REQUIRED"
  };
  return JSON.stringify(data, null, 2);
};

// 2. exportConceptualPlacementCsv
export const exportConceptualPlacementCsv = (project: Project): string => {
  const headers = [
    "Reference Designator",
    "Component Name",
    "Component Type",
    "Side / Mount Layer",
    "Placement X (mm/unit)",
    "Placement Y (mm/unit)",
    "Rotation (deg)",
    "Footprint Package",
    "Package Size",
    "Placement Criticality",
    "Notes"
  ];

  const rows = (project.boardComponents || []).map(c => [
    csvCell(c.referenceDesignator),
    csvCell(c.componentName),
    csvCell(c.componentType),
    csvCell(c.side || 'Top'),
    csvCell(c.placementX || 0),
    csvCell(c.placementY || 0),
    csvCell(c.rotationDeg || 0),
    csvCell(c.footprint || 'TBD'),
    csvCell(c.packageName || 'TBD'),
    csvCell(c.placementCriticality || 'Medium'),
    csvCell(c.notes || '')
  ]);

  const headerRow = headers.join(",");
  const bodyRows = rows.map(r => r.join(",")).join("\n");

  const disclaimer = [
    "# DISCLAIMER: CONCEPTUAL COMPONENT PLACEMENT ONLY",
    "# NOT A CERTIFIED PICK-AND-PLACE CPL FILE FOR FACTORY SMD ASSEMBLY MACHINERY",
    "# VERIFY ALL ROTATIONS AND COLLISION TOLERANCES IN Altium/KiCad PRE-PRODUCTION REVIEW",
    ""
  ].join("\n");

  return disclaimer + headerRow + "\n" + bodyRows;
};

// 3. exportConceptualSchematicJson
export const exportConceptualSchematicJson = (project: Project): string => {
  const circuits = (project.circuitBlocks || []).map(c => {
    // Collect components linked to this circuit
    const linkedComponents = (project.boardComponents || [])
      .filter(bc => bc.referenceDesignator.startsWith(c.referenceDesignators.split(',')[0].trim().replace(/\d+/, '')))
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
      disclaimer: "Conceptual schematic module blocks only - certified electrical schema logic required."
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
  const zones = (project.editorLayouts?.mechanical || []).map(obj => ({
    zoneId: obj.id,
    label: obj.label,
    symbolKind: obj.kind,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    locked: !!obj.locked,
    layer: obj.layer || "Default",
    material: obj.metadata?.material || "TBD Enclosure Resin",
    notes: obj.metadata?.notes || "No mechanical notes."
  }));

  const data = {
    projectName: project.projectName,
    boardDimensionOutline: (project.boards || []).map(b => ({
      boardName: b.name,
      dimensionsMm: b.dimensionsMm,
      substrate: b.substrate
    })),
    mechanicalZones: zones,
    disclaimer: "CONCEPTUAL CASING KEEP-OUTS ONLY - FINAL DESIGN REQUIRES MCAD STEP MODEL INTERFACE CHECK"
  };

  return JSON.stringify(data, null, 2);
};

// 5. exportConceptualNetRoutingJson
export const exportConceptualNetRoutingJson = (project: Project): string => {
  const nets = (project.nets || []).map(n => ({
    netName: n.netName,
    netType: n.netType,
    voltage: n.voltage,
    sourceComponent: n.sourceComponent,
    sourcePin: n.sourcePin,
    targetComponent: n.targetComponent,
    targetPin: n.targetPin,
    protocol: n.protocol,
    currentEstimate: n.currentEstimate,
    impedanceRequirement: n.impedanceRequirement,
    notes: n.notes
  }));

  const hasGnd = nets.some(n => n.netName.toUpperCase() === 'GND');

  return JSON.stringify({
    projectName: project.projectName,
    netsList: nets,
    warnings: [
      !hasGnd ? "GND net is missing in electrical connections list." : null,
      ...nets.filter(n => n.protocol === 'GPIO' && n.netName.toUpperCase().includes('RF')).map(n => `Net [${n.netName}] mapped as general GPIO lacks high-frequency RF impedance matched notes.`)
    ].filter(Boolean),
    disclaimer: "Logical net paths only - physical trace length matching and trace width sizing required in ECAD."
  }, null, 2);
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
    disclaimer: "Conceptual firmware architecture blocks - verify scheduler thread sizes and port configurations on actual target MCU."
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
    disclaimer: "Conceptual QA checklist only - safety and thermal certifications must be verified by accredited lab."
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
  md += `This report evaluates the availability of physical manufacturing files required to submit board artwork or product dimensions to assembly houses. All files listed as 'Not Generated' must be generated using professional ECAD/MCAD tools.\n\n`;
  
  md += `| File Name / Key | Handoff Status | Tool/Source | Description / Instructions for Completion |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;

  Object.entries(fFiles).forEach(([key, val]) => {
    const title = key.replace(/([A-Z])/g, ' $1');
    const statusVal = val.status;
    const sourceVal = val.source || "External Tools";
    const notesVal = val.notes || "No notes.";

    md += `| ${title} | **${statusVal}** | ${sourceVal} | ${notesVal} |\n`;
  });

  md += `\n## Recommended Manual Verification Steps Before Direct Fabrication:\n\n`;
  md += `1. **Gerber ZIP Artwork**: Open exported Gerber copper routing layers in a Gerber Viewer (e.g. Gerbv, Reference Viewers) to audit drills alignment.\n`;
  md += `2. **NC Drill Files**: Ensure drill files are exported in Excellon metric format with decimal precision set correctly.\n`;
  md += `3. **BOM Verification**: Match parts sourcing manufacturer codes (e.g. DigiKey/Mouser SKU) to verify active stocking status.\n`;
  md += `4. **CPL Centroid Placement**: Audit XY coordinates, component rotation offset, and board side mounting (Top vs Bottom) on pick-and-place files.\n`;
  md += `5. **DFM Analysis**: Submit Gerber layout layers to fab house online checkers for clearance error rule reports (minimum trace space/via diameter).\n`;

  md += `\n> [!CAUTION]\n`;
  md += `> Hardware Studio is a pre-layout engineering planner. It does **not** generate final physical copper artwork, schematic net lists, or mechanical enclosure files. Manual review inside professional software is mandatory prior to factory production.\n`;

  return md;
};

// 10. exportHandoffManifestJson
export const exportHandoffManifestJson = (project: Project): string => {
  const report = calculateReadinessScore(project);
  const fFiles = project.factoryFiles || {};

  const generatedInAppList: string[] = [];
  const notGeneratedList: string[] = [];

  Object.entries(fFiles).forEach(([key, val]) => {
    if (val.status === 'Generated In App' || val.status === 'Conceptual') {
      generatedInAppList.push(key);
    } else {
      notGeneratedList.push(key);
    }
  });

  const manifest = {
    manifestVersion: "1.0.0",
    projectName: project.projectName,
    generatedAt: new Date().toISOString(),
    overallReadinessIndex: report.overallScore,
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
      pendingVerification: notGeneratedList
    },
    disclaimer: "Conceptual Handoff Manifest - Verify coordinates and files manually prior to assembly submission."
  };

  return JSON.stringify(manifest, null, 2);
};
