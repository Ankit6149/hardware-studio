import { Project } from '../types';

export interface ReadinessReport {
  overallScore: number;
  categories: {
    architecture: number;
    mechanical: number;
    assembly: number;
    boardPrep: number;
    constraints: number;
    components: number;
    electronics: number;
    nets: number;
    pinMap: number;
    power: number;
    firmware: number;
    testing: number;
    manufacturing: number;
    factoryFiles: number;
    documentation: number;
    safety: number;
  };
  blockers: string[];
  warnings: string[];
  suggestions: string[];
  nextActions: string[];
  isPlanningComplete: boolean;
  isBlueprintPackComplete: boolean;
  canMoveToEcad: boolean;
  canMoveToMcad: boolean;
  canMoveToPrototype: boolean;
  canMoveToFactoryHandoff: boolean;
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
  const pcbConstraints = project.pcbConstraints || [];
  const mfgChecklist = project.manufacturingChecklist || [];
  const fFiles = project.factoryFiles || {};

  const isRing = project.projectName.toLowerCase().includes("ring") || project.templateName?.toLowerCase().includes("ring");

  // 1. PRODUCT ARCHITECTURE (Max 100)
  let archScore = 100;
  if (nodes.length > 0) {
    const hasInput = nodes.some(n => n.data?.name.toLowerCase().includes('button') || n.data?.name.toLowerCase().includes('touch') || n.data?.name.toLowerCase().includes('input'));
    const hasFeedback = nodes.some(n => n.data?.name.toLowerCase().includes('haptic') || n.data?.name.toLowerCase().includes('led') || n.data?.name.toLowerCase().includes('vibe'));
    if (!hasInput) {
      warnings.push("Architecture lacks user input node (Button, Touch).");
      archScore -= 30;
    }
    if (!hasFeedback) {
      warnings.push("Architecture lacks user feedback node (LED, Haptics).");
      archScore -= 30;
    }
  } else {
    archScore = 0;
    blockers.push("No product architecture nodes configured.");
  }

  // 2. MECHANICAL LAYOUT (Max 100)
  let mechanicalScore = 100;
  const hasZones = !!(project.editorLayouts?.mechanical && project.editorLayouts.mechanical.length > 0);
  if (!hasZones) {
    warnings.push("No mechanical layout zones configured in Blueprint Editor.");
    mechanicalScore -= 50;
  }
  if (isRing) {
    const hasWaterproofNote = project.editorLayouts?.mechanical?.some(o => o.label.toLowerCase().includes('seal') || o.label.toLowerCase().includes('waterproof'));
    if (!hasWaterproofNote) {
      warnings.push("Wearable ring lacks waterproofing or encapsulation seal note.");
      mechanicalScore -= 20;
    }
  }

  // 3. ASSEMBLY LAYOUT (Max 100)
  let assemblyScore = 100;
  const hasAssemblyLayers = !!(project.editorLayouts?.assembly && project.editorLayouts.assembly.length > 0);
  if (!hasAssemblyLayers) {
    suggestions.push("Exploded assembly steps stack not defined.");
    assemblyScore -= 40;
  }

  // 4. BOARD/PCB PREP (Max 100)
  let boardPrepScore = 100;
  if (boards.length > 0) {
    boards.forEach(b => {
      if (!b.dimensionsMm || b.dimensionsMm.toLowerCase().includes('required')) {
        blockers.push(`Board [${b.name}] dimensions are missing.`);
        boardPrepScore -= 40;
      }
    });
  } else {
    boardPrepScore = 0;
    blockers.push("No active boards defined in Board Studio.");
  }

  // 5. PCB CONSTRAINTS (Max 100)
  let constraintScore = 100;
  if (pcbConstraints.length === 0) {
    suggestions.push("No manufacturing clearance or trace constraints set.");
    constraintScore -= 50;
  }

  // 6. COMPONENT PLACEMENT (Max 100)
  let compScore = 100;
  if (boardComponents.length > 0) {
    const unplaced = boardComponents.filter(c => !c.placementX || !c.placementY);
    if (unplaced.length > 0) {
      warnings.push(`${unplaced.length} SMT footprints have no active coordinates.`);
      compScore -= Math.min(60, unplaced.length * 15);
    }
  } else {
    compScore = 0;
    warnings.push("Component placement coordinates database is empty.");
  }

  // 7. CIRCUIT/SCHEMATIC PREP (Max 100)
  let electronicsScore = 100;
  if (circuitBlocks.length > 0) {
    circuitBlocks.forEach(cb => {
      if (!cb.powerNets || cb.powerNets.toLowerCase().includes('required')) {
        warnings.push(`Circuit block [${cb.name}] missing power connections.`);
        electronicsScore -= 15;
      }
    });
  } else {
    electronicsScore = 0;
    blockers.push("No functional circuits configured in Circuit Planner.");
  }

  // 8. NETS (Max 100)
  let netsScore = 100;
  if (nets.length > 0) {
    const hasGround = nets.some(n => n.netName.toUpperCase() === 'GND' || n.netType === 'Ground');
    if (!hasGround) {
      blockers.push("Missing GND reference loop path.");
      netsScore -= 40;
    }
  } else {
    netsScore = 0;
    warnings.push("Netlist routing tracks are empty.");
  }

  // 9. PIN MAP (Max 100)
  let pinMapScore = 100;
  if (pinMap.length === 0) {
    warnings.push("Microcontroller port pin map lacks signals mapping.");
    pinMapScore -= 50;
  }

  // 10. POWER (Max 100)
  let pwrScore = 100;
  if (powerBudget.length > 0) {
    const zeroLoads = powerBudget.filter(p => p.activeCurrentMa === 0);
    if (zeroLoads.length > 0) {
      suggestions.push("Some power loads list average current as 0mA.");
      pwrScore -= 20;
    }
  } else {
    pwrScore = 0;
  }

  // 11. FIRMWARE (Max 100)
  let fwScore = 100;
  if (fwTasks.length > 0) {
    const blocked = fwTasks.filter(t => t.status === 'Blocked');
    if (blocked.length > 0) {
      warnings.push(`${blocked.length} firmware tasks are blocked.`);
      fwScore -= 30;
    }
  } else {
    fwScore = 0;
  }

  // 12. TESTING (Max 100)
  let testScore = 100;
  if (testing.length > 0) {
    const failed = testing.filter(t => t.status === 'Failed');
    if (failed.length > 0) {
      blockers.push(`${failed.length} hardware validation tests failed.`);
      testScore -= 40;
    }
  } else {
    testScore = 0;
  }

  // 13. MANUFACTURING HANDOFF (Max 100)
  let mfgScore = 100;
  if (mfgChecklist.length > 0) {
    const blockedCheck = mfgChecklist.filter(m => m.status === 'Blocked');
    if (blockedCheck.length > 0) {
      blockers.push(`${blockedCheck.length} critical checklist items are blocked.`);
      mfgScore -= 30;
    }
  } else {
    mfgScore = 0;
  }

  // 14. FACTORY FILES (Max 100)
  let fileScore = 100;
  if (Object.keys(fFiles).length > 0) {
    const notGen = Object.values(fFiles).filter(f => f.status === 'Not Generated');
    fileScore = Math.max(0, 100 - notGen.length * 10);
  } else {
    fileScore = 0;
    suggestions.push("Generate factory release check files list.");
  }

  // 15. DOCUMENTATION / BLUEPRINTS (Max 100)
  let docScore = 100;
  const layoutData = project.editorLayouts || {};
  const totalLayoutObjs = Object.values(layoutData).reduce((sum, arr) => sum + (arr?.length || 0), 0);
  if (totalLayoutObjs === 0) {
    warnings.push("Blueprint sheets lack drawing layouts.");
    docScore -= 50;
  }

  // 16. SAFETY / COMPLIANCE (Max 100)
  let safetyScore = 100;
  if (isRing) {
    const skinCheck = mfgChecklist.find(m => m.item.toLowerCase().includes('skin'));
    if (!skinCheck || skinCheck.status !== 'Done') {
      warnings.push("Safety: Wearable ring skin biocompatibility checks pending.");
      safetyScore -= 30;
    }
  }

  // Calculate overall average
  const overallScore = Math.round(
    archScore * 0.06 +
    mechanicalScore * 0.06 +
    assemblyScore * 0.06 +
    boardPrepScore * 0.06 +
    constraintScore * 0.06 +
    compScore * 0.06 +
    electronicsScore * 0.06 +
    netsScore * 0.06 +
    pinMapScore * 0.06 +
    pwrScore * 0.06 +
    fwScore * 0.06 +
    testScore * 0.06 +
    mfgScore * 0.06 +
    fileScore * 0.06 +
    docScore * 0.06 +
    safetyScore * 0.10
  );

  // Gates logic computation
  const isPlanningComplete = nodes.length > 0 && bom.length > 0 && powerBudget.length > 0 && pinMap.length > 0 && fwTasks.length > 0;
  const isBlueprintPackComplete = isPlanningComplete && totalLayoutObjs > 0;
  const canMoveToEcad = boards.length > 0 && circuitBlocks.length > 0 && boardComponents.length > 0 && nets.length > 0 && blockers.length === 0;
  const canMoveToMcad = boards.length > 0 && hasZones && blockers.length === 0;
  
  const canMoveToPrototype = canMoveToEcad && canMoveToMcad && testing.length > 0 && overallScore >= 70 && blockers.length === 0;
  const canMoveToFactoryHandoff = canMoveToPrototype && mfgChecklist.length > 0 && mfgChecklist.every(m => m.status === 'Done') && blockers.length === 0;

  // Direct Fabrication check (strict honesty!)
  const gerberOk = fFiles.gerberZip?.status === 'Verified' || fFiles.gerberZip?.status === 'Uploaded';
  const drillOk = fFiles.drillFiles?.status === 'Verified' || fFiles.drillFiles?.status === 'Uploaded';
  const schematicOk = fFiles.schematicPdf?.status === 'Verified' || fFiles.schematicPdf?.status === 'Uploaded';
  const cplOk = fFiles.cplCsv?.status === 'Verified' || fFiles.cplCsv?.status === 'Uploaded';
  const bomOk = fFiles.bomCsv?.status === 'Verified' || fFiles.bomCsv?.status === 'Uploaded';
  const dfmOk = fFiles.dfmReport?.status === 'Verified' || fFiles.dfmReport?.status === 'Uploaded';

  const canMoveToFabrication = canMoveToFactoryHandoff && gerberOk && drillOk && schematicOk && cplOk && bomOk && dfmOk && blockers.length === 0;

  // Action items priority builder
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
    nextActions.push("Direct Fabrication files check is clean. Ready to push release pack to factory floor!");
  }

  return {
    overallScore,
    categories: {
      architecture: archScore,
      mechanical: mechanicalScore,
      assembly: assemblyScore,
      boardPrep: boardPrepScore,
      constraints: constraintScore,
      components: compScore,
      electronics: electronicsScore,
      nets: netsScore,
      pinMap: pinMapScore,
      power: pwrScore,
      firmware: fwScore,
      testing: testScore,
      manufacturing: mfgScore,
      factoryFiles: fileScore,
      documentation: docScore,
      safety: safetyScore
    },
    blockers,
    warnings,
    suggestions,
    nextActions: nextActions.slice(0, 5),
    isPlanningComplete,
    isBlueprintPackComplete,
    canMoveToEcad,
    canMoveToMcad,
    canMoveToPrototype,
    canMoveToFactoryHandoff,
    canMoveToFabrication
  };
};
