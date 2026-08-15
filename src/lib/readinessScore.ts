import { Project } from '../types';
import { runDesignReview } from './designReview';

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

function pushUnique(target: string[], message: string): void {
  if (!target.includes(message)) target.push(message);
}

function hasGeneratedFactoryFile(file: { status?: string } | undefined): boolean {
  return Boolean(file && file.status && file.status !== 'Not Generated');
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

  const isRing = project.projectName.toLowerCase().includes('ring') || project.templateName?.toLowerCase().includes('ring');

  // 1. PRODUCT ARCHITECTURE
  let archScore = 100;
  if (nodes.length > 0) {
    const hasInput = nodes.some((node) => node.data?.name.toLowerCase().includes('button') || node.data?.name.toLowerCase().includes('touch') || node.data?.name.toLowerCase().includes('input'));
    const hasFeedback = nodes.some((node) => node.data?.name.toLowerCase().includes('haptic') || node.data?.name.toLowerCase().includes('led') || node.data?.name.toLowerCase().includes('vibe'));
    if (!hasInput) {
      warnings.push('Architecture lacks user input node (Button/Touch).');
      archScore -= 30;
    }
    if (!hasFeedback) {
      warnings.push('Architecture lacks user feedback node (LED/Haptics).');
      archScore -= 30;
    }
  } else {
    archScore = 0;
    blockers.push('Product architecture map has no active blocks.');
  }

  // 2. MECHANICAL LAYOUT
  let mechanicalScore = 100;
  const mechanicalLayoutObjects = project.editorLayouts?.mechanical || [];
  if (mechanicalLayoutObjects.length === 0) {
    warnings.push('No mechanical volume zones configured in the editor.');
    mechanicalScore -= 50;
  }
  if (isRing) {
    const shell = mechanicalLayoutObjects.find((object) => object.label.toLowerCase().includes('shell') || object.label.toLowerCase().includes('outline'));
    if (!shell) {
      warnings.push('Flagship ring mechanical layout requires outer casing shell circles.');
      mechanicalScore -= 30;
    }
  }

  // 3. ASSEMBLY LAYOUT
  let assemblyScore = 100;
  const assemblyObjects = project.editorLayouts?.assembly || [];
  if (assemblyObjects.length === 0) {
    suggestions.push('Assembly layers checklist has no steps generated.');
    assemblyScore -= 40;
  }

  // 4. BOARD LAYOUT PREP
  let boardPrepScore = 100;
  if (boards.length > 0) {
    boards.forEach((board) => {
      if (!board.dimensionsMm || board.dimensionsMm.toLowerCase().includes('required') || board.dimensionsMm === '0 x 0') {
        blockers.push(`Board [${board.name}] dimensions not configured.`);
        boardPrepScore -= 40;
      }
    });
  } else {
    boardPrepScore = 0;
    blockers.push('No active boards defined in database.');
  }

  // 5. COMPONENT PLACEMENT
  let compScore = 100;
  if (boardComponents.length > 0) {
    // Zero is a valid engineering coordinate. Only null/undefined means unplaced.
    const unplaced = boardComponents.filter((component) => component.placementX == null || component.placementY == null);
    if (unplaced.length > 0) {
      warnings.push(`${unplaced.length} SMT footprints have no placement coordinates.`);
      compScore -= Math.min(60, unplaced.length * 15);
    }
  } else {
    compScore = 0;
    warnings.push('SMT components placement coordinates list is empty.');
  }

  // 6. CIRCUIT/SCHEMATIC PREP
  let electronicsScore = 100;
  if (circuitBlocks.length > 0) {
    circuitBlocks.forEach((block) => {
      if (!block.powerNets || block.powerNets.toLowerCase().includes('required')) {
        warnings.push(`Circuit block [${block.name}] missing power connection nets.`);
        electronicsScore -= 20;
      }
    });
  } else {
    electronicsScore = 0;
    blockers.push('No functional circuit blocks configured in Circuit Planner.');
  }

  // 7. NET ROUTING
  let netsScore = 100;
  if (nets.length > 0) {
    const hasGround = nets.some((net) => net.netName.toUpperCase() === 'GND');
    if (!hasGround) {
      blockers.push('ERC Block: GND reference net path required.');
      netsScore -= 50;
    }
  } else {
    netsScore = 0;
    warnings.push('Net routing tracks matrix is empty.');
  }

  // 8. POWER BUDGET
  let powerScore = 100;
  if (powerBudget.length > 0) {
    const capacity = project.batteryCapacityMah || 0;
    if (capacity <= 0) {
      warnings.push('Battery cell capacity not configured (0mAh).');
      powerScore -= 40;
    }
  } else {
    powerScore = 0;
  }

  // 9. PIN MAP
  let pinMapScore = 100;
  if (pinMap.length === 0) {
    warnings.push('MCU interface pin configuration is empty.');
    pinMapScore -= 50;
  }

  // 10. FIRMWARE
  let firmwareScore = 100;
  if (fwTasks.length > 0) {
    const blockedTasks = fwTasks.filter((task) => task.status === 'Blocked');
    if (blockedTasks.length > 0) {
      warnings.push(`${blockedTasks.length} driver tasks are blocked.`);
      firmwareScore -= 30;
    }
  } else {
    firmwareScore = 0;
  }

  // 11. TESTING
  let testScore = 100;
  if (testing.length > 0) {
    const failed = testing.filter((test) => test.status === 'Failed');
    if (failed.length > 0) {
      blockers.push(`${failed.length} test procedures failed.`);
      testScore -= 40;
    }
  } else {
    testScore = 0;
  }

  // 12. MANUFACTURING HANDOFF
  let manufacturingScore = 100;
  if (mfgChecklist.length > 0) {
    const blockedChecks = mfgChecklist.filter((item) => item.status === 'Blocked');
    if (blockedChecks.length > 0) {
      blockers.push(`${blockedChecks.length} handoff checks are blocked.`);
      manufacturingScore -= 30;
    }
  } else {
    manufacturingScore = 0;
  }

  // 13. NATIVE EXPORTS
  let exportsScore = 100;
  const layoutData = project.editorLayouts || {};
  const totalLayoutObjects = Object.values(layoutData).reduce((sum, items) => sum + (items?.length || 0), 0);
  if (totalLayoutObjects === 0) {
    exportsScore -= 50;
    suggestions.push('Generate drawing layouts in editor to prepare native coordinates exports.');
  }

  // 14. FACTORY FILE STATUS
  let fileScore = 100;
  const fileKeys = Object.keys(fFiles);
  if (fileKeys.length > 0) {
    const notGenerated = Object.values(fFiles).filter((file) => file.status === 'Not Generated');
    fileScore = Math.max(0, 100 - notGenerated.length * 10);
    if (notGenerated.length > 0) {
      suggestions.push(`${notGenerated.length} production factory files are missing (Not Generated).`);
    }
  } else {
    fileScore = 0;
  }

  // 15. SAFETY / COMPLIANCE
  let safetyScore = 100;
  if (isRing) {
    const skinCheck = mfgChecklist.find((item) => item.item.toLowerCase().includes('skin') || item.item.toLowerCase().includes('material'));
    if (!skinCheck || skinCheck.status !== 'Done') {
      warnings.push('Safety: Skin hypoallergenic comfort verification is pending.');
      safetyScore -= 30;
    }
  }

  const overallScore = Math.round(
    archScore * 0.06
    + mechanicalScore * 0.06
    + assemblyScore * 0.06
    + boardPrepScore * 0.06
    + compScore * 0.06
    + electronicsScore * 0.06
    + netsScore * 0.06
    + powerScore * 0.06
    + pinMapScore * 0.06
    + firmwareScore * 0.06
    + testScore * 0.06
    + manufacturingScore * 0.06
    + exportsScore * 0.06
    + fileScore * 0.06
    + safetyScore * 0.16
  );

  // ERC / DRC findings are release evidence, not a hidden scoring detail.
  const reviewResults = runDesignReview(project);
  const schematicBlockers = reviewResults.filter((result) => result.category === 'Schematic ERC' && (result.severity === 'Error' || result.severity === 'Blocker'));
  const pcbBlockers = reviewResults.filter((result) => result.category === 'PCB DRC' && (result.severity === 'Error' || result.severity === 'Blocker'));
  schematicBlockers.forEach((result) => pushUnique(blockers, `Schematic ERC: ${result.title}`));
  pcbBlockers.forEach((result) => pushUnique(blockers, `PCB DRC: ${result.title}`));

  // Gate computation. A score alone never authorizes a lifecycle transition.
  const isPlanningReady = nodes.length > 0 && bom.length > 0 && powerBudget.length > 0 && pinMap.length > 0 && fwTasks.length > 0;
  const isBlueprintPackReady = isPlanningReady && boards.length > 0;
  const isEditorLayoutReady = totalLayoutObjects > 0;
  const isSchematicDraftReady = Boolean(circuitBlocks.length > 0 || schematicSymbols.length > 0 || project.editorLayouts?.circuits?.length) && schematicBlockers.length === 0;
  const isPcbLayoutDraftReady = boards.length > 0 && boardOutlines.length > 0 && boardComponents.length > 0 && pcbBlockers.length === 0;
  const isRoutingDraftReady = Boolean(traces.length > 0 || project.editorLayouts?.nets?.length);

  const canMoveToPrototype = isBlueprintPackReady
    && isEditorLayoutReady
    && testing.length > 0
    && overallScore >= 70
    && blockers.length === 0;

  const factoryGenerated = hasGeneratedFactoryFile(fFiles.gerberZip)
    && hasGeneratedFactoryFile(fFiles.drillFiles)
    && hasGeneratedFactoryFile(fFiles.bomCsv)
    && hasGeneratedFactoryFile(fFiles.cplCsv);
  const canMoveToFactoryHandoff = canMoveToPrototype
    && mfgChecklist.length > 0
    && mfgChecklist.every((item) => item.status === 'Done')
    && factoryGenerated
    && overallScore >= 80;

  const gerberOk = fFiles.gerberZip?.status === 'Verified';
  const drillOk = fFiles.drillFiles?.status === 'Verified';
  const bomOk = fFiles.bomCsv?.status === 'Verified';
  const cplOk = fFiles.cplCsv?.status === 'Verified';
  const isPackageVerified = project.factoryPackageStatus === 'Verified';
  const canMoveToFabrication = canMoveToFactoryHandoff
    && isPackageVerified
    && gerberOk
    && drillOk
    && bomOk
    && cplOk
    && blockers.length === 0;

  const isDirectFabReviewRequired = (project.factoryPackageStatus === 'Generated' || project.factoryPackageStatus === 'Needs Review') && !canMoveToFabrication;

  if (blockers.length > 0) {
    nextActions.push(...blockers.slice(0, 3).map((blocker) => `Blocker: ${blocker}`));
  }
  if (warnings.length > 0) {
    nextActions.push(...warnings.slice(0, 2).map((warning) => `Warning: ${warning}`));
  }
  if (nextActions.length < 5 && suggestions.length > 0) {
    nextActions.push(...suggestions.slice(0, 5 - nextActions.length).map((suggestion) => `Suggestion: ${suggestion}`));
  }
  if (nextActions.length === 0) {
    nextActions.push(canMoveToFabrication
      ? 'Decision: fabrication evidence gates are satisfied. Review the frozen release candidate before external handoff.'
      : 'Review the next locked lifecycle gate and record the missing evidence before advancing.');
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
      power: powerScore,
      pinMap: pinMapScore,
      firmware: firmwareScore,
      testing: testScore,
      manufacturing: manufacturingScore,
      nativeExports: exportsScore,
      factoryFiles: fileScore,
      safety: safetyScore,
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
    canMoveToFabrication,
  };
};
