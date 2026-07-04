import { Project } from '../types';

export interface ReadinessReport {
  overallScore: number;
  categories: {
    architecture: number;
    components: number;
    electronics: number;
    boardPrep: number;
    power: number;
    firmware: number;
    testing: number;
    manufacturing: number;
    safety: number;
    documentation: number;
  };
  blockers: string[];
  warnings: string[];
  suggestions: string[];
  nextActions: string[];
  canMoveToEcad: boolean;
  canMoveToPrototype: boolean;
  canMoveToFactoryHandoff: boolean;
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

  // 1. ARCHITECTURE SCORE (Max 100)
  let archScore = 50;
  const hasInput = nodes.some(n => 
    n.data?.status === 'MVP' && 
    (n.data?.name.toLowerCase().includes('button') || n.data?.name.toLowerCase().includes('touch') || n.data?.name.toLowerCase().includes('gesture') || n.data?.name.toLowerCase().includes('input'))
  );
  const hasFeedback = nodes.some(n => 
    n.data?.status === 'MVP' && 
    (n.data?.name.toLowerCase().includes('haptic') || n.data?.name.toLowerCase().includes('led') || n.data?.name.toLowerCase().includes('buzzer') || n.data?.name.toLowerCase().includes('display'))
  );
  
  if (nodes.length > 0) {
    archScore = 50;
    if (hasInput) archScore += 25;
    else blockers.push("MVP architecture has no user input block defined (e.g. Button or Touch sensor).");

    if (hasFeedback) archScore += 25;
    else blockers.push("MVP architecture has no user feedback block defined (e.g. LED or Haptic motor).");
  } else {
    archScore = 0;
    suggestions.push("Create initial architecture blocks on the blueprint canvas.");
  }

  // 2. ELECTRONICS / COMPONENTS SCORE (Max 100)
  let compScore = 100;
  if (bom.length > 0) {
    const sourcedCount = bom.filter(item => ['Sourced', 'Ordered', 'Received', 'Tested'].includes(item.status)).length;
    const sourcingRatio = sourcedCount / bom.length;
    compScore = Math.round(sourcingRatio * 100);

    const missingSupplier = bom.some(item => !item.supplier || !item.datasheetUrl);
    if (missingSupplier) {
      warnings.push("Some BOM rows are missing supplier links or datasheet URLs.");
    }
    
    bom.forEach(b => {
      if (!b.partNumber) {
        warnings.push(`BOM part "${b.blockName}" lacks a manufacturer part number.`);
      }
    });
  } else {
    compScore = 0;
    suggestions.push("Add items to your Bill of Materials (BOM) or generate them from blueprint.");
  }

  // 3. POWER SCORE (Max 100)
  let pwrScore = 100;
  const hasBattery = nodes.some(n => n.data?.name.toLowerCase().includes('battery') || n.id.includes('battery') || n.id.includes('lipo'));
  const hasRegulator = nodes.some(n => n.data?.name.toLowerCase().includes('ldo') || n.data?.name.toLowerCase().includes('buck') || n.data?.name.toLowerCase().includes('regulator') || n.id.includes('ldo'));
  const hasMCU = nodes.some(n => n.data?.name.toLowerCase().includes('mcu') || n.data?.name.toLowerCase().includes('controller') || n.id.includes('mcu'));
  const hasCharger = nodes.some(n => n.data?.name.toLowerCase().includes('charger') || n.data?.name.toLowerCase().includes('charging') || n.id.includes('charger'));

  if (hasMCU && !hasRegulator) {
    blockers.push("Controller is mapped, but no voltage regulator or power block is defined.");
    pwrScore -= 30;
  }
  if (hasBattery && !hasCharger) {
    warnings.push("A battery is planned, but no charging circuit is present in the architecture.");
    pwrScore -= 20;
  }

  if (powerBudget.length > 0) {
    const missingEstimates = powerBudget.some(item => item.activeCurrentMa === 0);
    if (missingEstimates) {
      warnings.push("Power budget has items with unconfigured current values (0 mA).");
      pwrScore -= 20;
    }
  } else {
    pwrScore = Math.max(0, pwrScore - 40);
    suggestions.push("Setup a Power Budget to estimate battery operating lifetimes.");
  }

  // 4. FIRMWARE SCORE (Max 100)
  let fwScore = 100;
  if (fwTasks.length > 0) {
    const doneCount = fwTasks.filter(t => t.status === 'Done').length;
    const progressCount = fwTasks.filter(t => t.status === 'In Progress').length;
    const ratio = (doneCount + progressCount * 0.5) / fwTasks.length;
    fwScore = Math.round(ratio * 100);

    const blockedFW = fwTasks.filter(t => t.status === 'Blocked');
    if (blockedFW.length > 0) {
      warnings.push(`Firmware task "${blockedFW[0].name}" is currently blocked.`);
    }
  } else {
    fwScore = 0;
    suggestions.push("Create a Firmware Plan outlining driver states and protocols.");
  }

  // 5. TESTING SCORE (Max 100)
  let testScore = 100;
  if (testing.length > 0) {
    const total = testing.length;
    const passed = testing.filter(t => t.status === 'Passed').length;
    const blocked = testing.filter(t => t.status === 'Blocked').length;
    const failed = testing.filter(t => t.status === 'Failed').length;

    testScore = Math.round((passed / total) * 100);

    if (failed > 0) {
      blockers.push(`${failed} MVP test stage(s) are failing. Must verify logic before prototyping.`);
    }
    if (blocked > 0) {
      warnings.push(`${blocked} test stage(s) are currently blocked.`);
    }
    
    testing.forEach(t => {
      if (t.status === 'Passed' && !t.evidenceLink) {
        warnings.push(`Passed test "${t.name}" lacks evidentiary verification URLs.`);
      }
    });
  } else {
    testScore = 0;
    warnings.push("No test protocols are defined. Add tests to guarantee prototype verification.");
  }

  // 6. BOARD / PCB PREP SCORE (Max 100)
  let boardPrepScore = 100;
  if (boards.length > 0) {
    boards.forEach(b => {
      if (!b.dimensionsMm || b.dimensionsMm === "0 x 0" || b.dimensionsMm === "") {
        warnings.push(`Board "${b.name}" has no outline dimensions configured.`);
        boardPrepScore -= 10;
      }
      if (!b.layerCount || b.layerCount <= 0) {
        warnings.push(`Board "${b.name}" layer count is not defined.`);
        boardPrepScore -= 10;
      }
      if (b.substrate.toLowerCase().includes("flex") && (!b.mountingNotes || (!b.mountingNotes.toLowerCase().includes("bend") && !pcbConstraints.some(c => c.constraintType === 'Flex Bend')))) {
        warnings.push(`Flex board "${b.name}" is missing flex bend parameters or constraints.`);
        boardPrepScore -= 10;
      }
    });

    const hasRFCircuit = circuitBlocks.some(c => c.circuitType === 'RF');
    const hasRFConstraint = pcbConstraints.some(c => c.constraintType === 'RF Keepout' || c.constraintType === 'Antenna');
    if (hasRFCircuit && !hasRFConstraint) {
      warnings.push("RF wireless circuit exists, but no RF keepout or antenna clearance is constrainted.");
      boardPrepScore -= 15;
    }

    if (boardComponents.length > 0) {
      const missingFootprint = boardComponents.filter(bc => !bc.footprint || !bc.packageName);
      if (missingFootprint.length > 0) {
        warnings.push(`${missingFootprint.length} board components are missing footprint packages.`);
        boardPrepScore -= Math.min(20, missingFootprint.length * 5);
      }
    } else {
      warnings.push("No components mapped to board layouts inside Board Studio.");
      boardPrepScore -= 20;
    }

    if (nets.length > 0) {
      const netVoltages: Record<string, string> = {};
      const conflictingNets = new Set<string>();
      nets.forEach(n => {
        const netNameUpper = n.netName.toUpperCase().trim();
        if (netNameUpper && n.voltage) {
          if (netVoltages[netNameUpper] && netVoltages[netNameUpper] !== n.voltage) {
            conflictingNets.add(n.netName);
          } else {
            netVoltages[netNameUpper] = n.voltage;
          }
        }
      });

      if (conflictingNets.size > 0) {
        blockers.push(`Impedance/Signaling conflict: Net "${Array.from(conflictingNets)[0]}" is mapped to conflicting voltage levels.`);
        boardPrepScore -= 30;
      }

      const hasGND = nets.some(n => n.netName.toUpperCase() === 'GND' || n.netType === 'Ground');
      const hasPower = nets.some(n => n.netType === 'Power');
      if (!hasGND) {
        blockers.push("Netlist lacks Ground (GND) reference plane paths.");
        boardPrepScore -= 20;
      }
      if (!hasPower) {
        blockers.push("Netlist lacks regulated voltage power rail lines.");
        boardPrepScore -= 20;
      }
    } else {
      warnings.push("PCB Netlist is empty. Map pin routing to create net traces.");
      boardPrepScore -= 20;
    }

    boardPrepScore = Math.max(0, boardPrepScore);
  } else {
    boardPrepScore = 0;
    suggestions.push("Define physical PCBs and board dimensions in Board Studio.");
  }

  // 7. MANUFACTURING SCORE (Max 100)
  let mfgScore = 100;
  if (mfgChecklist.length > 0) {
    const done = mfgChecklist.filter(m => m.status === 'Done').length;
    const inProgress = mfgChecklist.filter(m => m.status === 'In Progress').length;
    const blockedItems = mfgChecklist.filter(m => m.status === 'Blocked');

    const completionRatio = (done + inProgress * 0.5) / mfgChecklist.length;
    mfgScore = Math.round(completionRatio * 100);

    if (blockedItems.length > 0) {
      blockers.push(`Checklist blocker: "${blockedItems[0].item}" is blocked: ${blockedItems[0].blockingReason || 'No notes provided'}`);
      mfgScore = Math.max(0, mfgScore - blockedItems.length * 15);
    }
    if (done < mfgChecklist.length && blockedItems.length === 0) {
      warnings.push("Manufacturing release pack checklist is incomplete.");
    }

    // Safety safety triggers checks
    const hasBatteryItem = nodes.some(n => n.data?.name.toLowerCase().includes('battery') || n.id.includes('battery'));
    const isBatteryCheckDone = mfgChecklist.some(m => m.item.toLowerCase().includes('battery') && m.status === 'Done');
    if (hasBatteryItem && !isBatteryCheckDone) {
      warnings.push("Battery safety protection checklist items are pending review.");
      mfgScore = Math.max(0, mfgScore - 10);
    }

    const isWearableProduct = project.templateName?.toLowerCase().includes("ring") || project.templateName?.toLowerCase().includes("wearable");
    const isSkinContactDone = mfgChecklist.some(m => m.item.toLowerCase().includes('skin') && m.status === 'Done');
    if (isWearableProduct && !isSkinContactDone) {
      warnings.push("Skin contact and hypoallergenic material certifications are pending.");
      mfgScore = Math.max(0, mfgScore - 10);
    }

    const hasMicrophoneItem = nodes.some(n => n.data?.name.toLowerCase().includes('microphone') || n.id.includes('mic'));
    const isPrivacyCheckDone = mfgChecklist.some(m => m.item.toLowerCase().includes('privacy') && m.status === 'Done');
    if (hasMicrophoneItem && !isPrivacyCheckDone) {
      warnings.push("Hardware audio privacy guidelines checklists are pending review.");
      mfgScore = Math.max(0, mfgScore - 10);
    }

  } else {
    mfgScore = 0;
    suggestions.push("Initialize the manufacturing handoff check checklist.");
  }

  // 8. SAFETY & COMPLIANCE SCORE (Max 100)
  let safetyScore = 100;
  const hasFuse = nodes.some(n => n.data?.name.toLowerCase().includes('fuse') || n.data?.name.toLowerCase().includes('protection') || n.id.includes('fuse') || n.id.includes('pcm'));
  const hasThermalShutdown = nodes.some(n => n.data?.name.toLowerCase().includes('thermal') || n.data?.description?.toLowerCase().includes('thermal') || n.data?.notes?.toLowerCase().includes('temperature'));
  const hasMic = nodes.some(n => n.data?.name.toLowerCase().includes('microphone') || n.id.includes('mic'));
  const hasPrivacy = nodes.some(n => n.data?.name.toLowerCase().includes('privacy') || n.data?.name.toLowerCase().includes('permission') || n.data?.notes?.toLowerCase().includes('privacy'));

  if (!hasFuse) {
    warnings.push("No overcurrent protection or battery safety fuse mapped.");
    safetyScore -= 30;
  }
  if (!hasThermalShutdown) {
    suggestions.push("Implement a thermal watchdog cutoff rule in safety specs.");
    safetyScore -= 20;
  }
  if (hasMic && !hasPrivacy) {
    warnings.push("Microphone is planned but no physical activation switch or privacy mute exists.");
    safetyScore -= 30;
  }

  // 9. DOCUMENTATION SCORE (Max 100)
  let docScore = 100;
  if (nodes.length > 0) {
    let incomplete = 0;
    nodes.forEach(node => {
      if (!node.data?.description || !node.data?.purpose || !node.data?.requirements) {
        incomplete++;
      }
    });
    docScore = Math.round(((nodes.length - incomplete) / nodes.length) * 100);
    if (incomplete > 0) {
      suggestions.push(`Add description, purpose, or specs to ${incomplete} undocumented blueprint nodes.`);
    }
  } else {
    docScore = 0;
  }

  // Pin Map Collision checking
  if (pinMap.length > 0) {
    const pinCounts: Record<string, number> = {};
    pinMap.forEach(p => {
      const pin = p.mcuPin.trim();
      if (pin) {
        pinCounts[pin] = (pinCounts[pin] || 0) + 1;
      }
    });
    const conflicts = Object.keys(pinCounts).filter(p => pinCounts[p] > 1);
    if (conflicts.length > 0) {
      blockers.push(`MCU Pin Map conflict detected! Multiple signals connected to: ${conflicts.join(', ')}`);
    }
  }

  // Calculate Weighted Overall Score (9 categories)
  const overallScore = Math.round(
    archScore * 0.10 +      // Product Architecture
    compScore * 0.15 +      // Electronics (Components)
    boardPrepScore * 0.15 + // Board/PCB Prep
    pwrScore * 0.10 +       // Power
    fwScore * 0.10 +        // Firmware
    testScore * 0.10 +      // Testing
    mfgScore * 0.10 +       // Manufacturing
    docScore * 0.10 +       // Documentation
    safetyScore * 0.10      // Safety/Compliance
  );

  // Gates logic computation
  const canMoveToEcad = boards.length > 0 && circuitBlocks.length > 0 && boardComponents.length > 0 && nets.length > 0 && pcbConstraints.length > 0 && blockers.length === 0;
  const canMoveToPrototype = nodes.filter(n => n.type === 'blockNode').length > 0 && bom.length > 0 && powerBudget.length > 0 && pinMap.length > 0 && fwTasks.length > 0 && testing.length > 0 && overallScore >= 70 && blockers.length === 0 && testing.filter(t => t.status === 'Failed').length === 0;
  const canMoveToFactoryHandoff = overallScore >= 85 && boards.length > 0 && mfgChecklist.length > 0 && mfgChecklist.every(m => m.status === 'Done') && blockers.length === 0;

  // Generate Next 5 Actions List
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
    nextActions.push("All systems clear. Compile documentation and start schematic layout!");
  }

  return {
    overallScore,
    categories: {
      architecture: archScore,
      components: compScore,
      electronics: compScore,
      boardPrep: boardPrepScore,
      power: pwrScore,
      firmware: fwScore,
      testing: testScore,
      manufacturing: mfgScore,
      safety: safetyScore,
      documentation: docScore
    },
    blockers,
    warnings,
    suggestions,
    nextActions: nextActions.slice(0, 5),
    canMoveToEcad,
    canMoveToPrototype,
    canMoveToFactoryHandoff
  };
};
