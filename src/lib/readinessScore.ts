import { Project } from '../types';

export interface ReadinessReport {
  overallScore: number;
  categories: {
    architecture: number;
    mechanical: number;
    assembly: number;
    boardPrep: number;
    components: number;
    electronics: number;
    nets: number;
    power: number;
    pinMap: number;
    firmware: number;
    testing: number;
    manufacturing: number;
    nativeExports: number;
    factoryFiles: number;
    safety: number;
  };
  blockers: string[];
  warnings: string[];
  suggestions: string[];
  nextActions: string[];
  isPlanningReady: boolean;
  isBlueprintPackReady: boolean;
  isEditorLayoutReady: boolean;
  isSchematicDraftReady: boolean;
  isPcbLayoutDraftReady: boolean;
  isRoutingDraftReady: boolean;
  canMoveToPrototype: boolean;
  canMoveToFactoryHandoff: boolean;
  isDirectFabReviewRequired: boolean;
  canMoveToFabrication: boolean;
}

export const calculateReadinessScore = (project: Project): ReadinessReport => {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const nextActions: string[] = [];

  const nodes = project.nodes || [];
  const bom = project.bom || [];
  const powerBudget = project.powerBudget || [];
  const pinMap = project.pinMap || [];
  const fwTasks = project.firmwareTasks || [];
  const testing = project.testing || [];
  const boards = project.boards || [];
  const circuitBlocks = project.circuitBlocks || [];
  const boardComponents = project.boardComponents || [];
  const nets = project.nets || [];
  const mfgChecklist = project.manufacturingChecklist || [];
  const fFiles = project.factoryFiles || {};
  const schematicSymbols = project.schematicSymbols || [];
  const boardOutlines = project.boardOutlines || [];
  const traces = project.traces || [];

  const isRing = project.projectName.toLowerCase().includes("ring") || project.templateName?.toLowerCase().includes("ring");

  // 1. PRODUCT ARCHITECTURE
  let archScore = 100;
  if (nodes.length > 0) {
    const hasInput = nodes.some(n => n.data?.name.toLowerCase().includes('button') || n.data?.name.toLowerCase().includes('touch') || n.data?.name.toLowerCase().includes('input'));
    const hasFeedback = nodes.some(n => n.data?.name.toLowerCase().includes('haptic') || n.data?.name.toLowerCase().includes('led') || n.data?.name.toLowerCase().includes('vibe'));
    if (!hasInput) {
      warnings.push("Architecture lacks user input node (Button/Touch).");
      archScore -= 30;
    }
    if (!hasFeedback) {
      warnings.push("Architecture lacks user feedback node (LED/Haptics).");
      archScore -= 30;
    }
  } else {
    archScore = 0;
    blockers.push("Product architecture map has no active blocks.");
  }

  // 2. MECHANICAL LAYOUT
  let mechanicalScore = 100;
  const mObjs = project.editorLayouts?.mechanical || [];
  if (mObjs.length === 0) {
    warnings.push("No mechanical volume zones configured in the editor.");
    mechanicalScore -= 50;
  }
  if (isRing) {
    const shell = mObjs.find(o => o.label.toLowerCase().includes('shell') || o.label.toLowerCase().includes('outline'));
    if (!shell) {
      warnings.push("Flagship ring mechanical layout requires outer casing shell circles.");
      mechanicalScore -= 30;
    }
  }

  // 3. ASSEMBLY LAYOUT
  let assemblyScore = 100;
  const aObjs = project.editorLayouts?.assembly || [];
  if (aObjs.length === 0) {
    suggestions.push("Assembly layers checklist has no steps generated.");
    assemblyScore -= 40;
  }

  // 4. BOARD LAYOUT PREP
  let boardPrepScore = 100;
  if (boards.length > 0) {
    boards.forEach(b => {
      if (!b.dimensionsMm || b.dimensionsMm.toLowerCase().includes('required') || b.dimensionsMm === '0 x 0') {
        blockers.push(`Board [${b.name}] dimensions not configured.`);
        boardPrepScore -= 40;
      }
    });
  } else {
    boardPrepScore = 0;
    blockers.push("No active boards defined in database.");
  }

  // 5. COMPONENT PLACEMENT
  let compScore = 100;
  if (boardComponents.length > 0) {
    const unplaced = boardComponents.filter(c => !c.placementX || !c.placementY);
    if (unplaced.length > 0) {
      warnings.push(`${unplaced.length} SMT footprints have no placement coordinates.`);
      compScore -= Math.min(60, unplaced.length * 15);
    }
  } else {
    compScore = 0;
    warnings.push("SMT components placement coordinates list is empty.");
  }

  // 6. CIRCUIT/SCHEMATIC PREP
  let electronicsScore = 100;
  if (circuitBlocks.length > 0) {
    circuitBlocks.forEach(cb => {
      if (!cb.powerNets || cb.powerNets.toLowerCase().includes('required')) {
        warnings.push(`Circuit block [${cb.name}] missing power connection nets.`);
        electronicsScore -= 20;
      }
    });
  } else {
    electronicsScore = 0;
    blockers.push("No functional circuit blocks configured in Circuit Planner.");
  }

  // 7. NET ROUTING
  let netsScore = 100;
  if (nets.length > 0) {
    const hasGnd = nets.some(n => n.netName.toUpperCase() === 'GND');
    if (!hasGnd) {
      blockers.push("ERC Block: GND reference net path required.");
      netsScore -= 50;
    }
  } else {
    netsScore = 0;
    warnings.push("Net routing tracks matrix is empty.");
  }

  // 8. POWER BUDGET
  let pwrScore = 100;
  if (powerBudget.length > 0) {
    const capacity = project.batteryCapacityMah || 0;
    if (capacity <= 0) {
      warnings.push("Battery cell capacity not configured (0mAh).");
      pwrScore -= 40;
    }
  } else {
    pwrScore = 0;
  }

  // 9. PIN MAP
  let pinMapScore = 100;
  if (pinMap.length === 0) {
    warnings.push("MCU interface pin configuration is empty.");
    pinMapScore -= 50;
  }

  // 10. FIRMWARE
  let fwScore = 100;
  if (fwTasks.length > 0) {
    const blocked = fwTasks.filter(t => t.status === 'Blocked');
    if (blocked.length > 0) {
      warnings.push(`${blocked.length} driver tasks are blocked.`);
      fwScore -= 30;
    }
  } else {
    fwScore = 0;
  }

  // 11. TESTING
  let testScore = 100;
  if (testing.length > 0) {
    const failed = testing.filter(t => t.status === 'Failed');
    if (failed.length > 0) {
      blockers.push(`${failed.length} test procedures failed.`);
      testScore -= 40;
    }
  } else {
    testScore = 0;
  }

  // 12. MANUFACTURING HANDOFF
  let mfgScore = 100;
  if (mfgChecklist.length > 0) {
    const blockedCheck = mfgChecklist.filter(m => m.status === 'Blocked');
    if (blockedCheck.length > 0) {
      blockers.push(`${blockedCheck.length} handoff checks are blocked.`);
      mfgScore -= 30;
    }
  } else {
    mfgScore = 0;
  }

  // 13. NATIVE EXPORTS
  let exportsScore = 100;
  const layoutData = project.editorLayouts || {};
  const totalLayoutObjs = Object.values(layoutData).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  if (totalLayoutObjs === 0) {
    exportsScore -= 50;
    suggestions.push("Generate drawing layouts in editor to prepare native coordinates exports.");
  }

  // 14. FACTORY FILE STATUS
  let fileScore = 100;
  const keys = Object.keys(fFiles);
  if (keys.length > 0) {
    const notGen = Object.values(fFiles).filter(f => f.status === 'Not Generated');
    fileScore = Math.max(0, 100 - notGen.length * 10);
    if (notGen.length > 0) {
      suggestions.push(`${notGen.length} production factory files are missing (Not Generated).`);
    }
  } else {
    fileScore = 0;
  }

  // 15. SAFETY / COMPLIANCE
  let safetyScore = 100;
  if (isRing) {
    const skinCheck = mfgChecklist.find(m => m.item.toLowerCase().includes('skin') || m.item.toLowerCase().includes('material'));
    if (!skinCheck || skinCheck.status !== 'Done') {
      warnings.push("Safety: Skin hypoallergenic comfort verification is pending.");
      safetyScore -= 30;
    }
  }

  // Calculate Weighted Overall score (15 categories)
  const overallScore = Math.round(
    archScore * 0.06 +
    mechanicalScore * 0.06 +
    assemblyScore * 0.06 +
    boardPrepScore * 0.06 +
    compScore * 0.06 +
    electronicsScore * 0.06 +
    netsScore * 0.06 +
    pwrScore * 0.06 +
    pinMapScore * 0.06 +
    fwScore * 0.06 +
    testScore * 0.06 +
    mfgScore * 0.06 +
    exportsScore * 0.06 +
    fileScore * 0.06 +
    safetyScore * 0.16
  );

  // V3 10 Gates logic computation
  const isPlanningReady = nodes.length > 0 && bom.length > 0 && powerBudget.length > 0 && pinMap.length > 0 && fwTasks.length > 0;
  const isBlueprintPackReady = isPlanningReady && boards.length > 0;
  const isEditorLayoutReady = totalLayoutObjs > 0;
  
  const isSchematicDraftReady = circuitBlocks.length > 0 && (schematicSymbols.length > 0 || project.editorLayouts?.circuits?.length ? true : false);
  const isPcbLayoutDraftReady = boards.length > 0 && (boardOutlines.length > 0 || project.editorLayouts?.board?.length ? true : false);
  const isRoutingDraftReady = traces.length > 0 || project.editorLayouts?.nets?.length ? true : false;
  
  const canMoveToPrototype = isBlueprintPackReady && isEditorLayoutReady && testing.length > 0 && overallScore >= 70 && blockers.length === 0;
  const canMoveToFactoryHandoff = canMoveToPrototype && mfgChecklist.length > 0 && mfgChecklist.every(m => m.status === 'Done') && overallScore >= 85 && blockers.length === 0;

  // Strict fabrication release verification checks
  const gerberOk = fFiles.gerberZip?.status === 'Verified';
  const drillOk = fFiles.drillFiles?.status === 'Verified';
  const bomOk = fFiles.bomCsv?.status === 'Verified';
  const cplOk = fFiles.cplCsv?.status === 'Verified';
  
  const canMoveToFabrication = canMoveToFactoryHandoff && gerberOk && drillOk && bomOk && cplOk && blockers.length === 0;

  // Review package requirements checks
  const hasAppGeneratedFiles = fFiles.gerberZip?.status === 'Generated In App' || fFiles.drillFiles?.status === 'Generated In App';
  const isDirectFabReviewRequired = canMoveToFactoryHandoff && hasAppGeneratedFiles && !canMoveToFabrication;

  // Next Priority Actions builder
  if (blockers.length > 0) {
    nextActions.push(...blockers.slice(0, 3).map(b => `Blocker: ${b}`));
  }
  if (warnings.length > 0) {
    nextActions.push(...warnings.slice(0, 2).map(w => `Warning: ${w}`));
  }
  if (nextActions.length < 5 && suggestions.length > 0) {
    nextActions.push(...suggestions.slice(0, 5 - nextActions.length).map(s => `Suggestion: ${s}`));
  }
  if (nextActions.length === 0) {
    nextActions.push("Factory handoff ready. Export your Handoff Manifest JSON to submit pre-fab plans!");
  }

  return {
    overallScore,
    categories: {
      architecture: archScore,
      mechanical: mechanicalScore,
      assembly: assemblyScore,
      boardPrep: boardPrepScore,
      components: compScore,
      electronics: electronicsScore,
      nets: netsScore,
      power: pwrScore,
      pinMap: pinMapScore,
      firmware: fwScore,
      testing: testScore,
      manufacturing: mfgScore,
      nativeExports: exportsScore,
      factoryFiles: fileScore,
      safety: safetyScore
    },
    blockers,
    warnings,
    suggestions,
    nextActions: nextActions.slice(0, 5),
    isPlanningReady,
    isBlueprintPackReady,
    isEditorLayoutReady,
    isSchematicDraftReady,
    isPcbLayoutDraftReady,
    isRoutingDraftReady,
    canMoveToPrototype,
    canMoveToFactoryHandoff,
    isDirectFabReviewRequired,
    canMoveToFabrication
  };
};
