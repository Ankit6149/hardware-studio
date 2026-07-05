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
    mechanical: number;
    netsPinMap: number;
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

  const isRing = project.projectName.toLowerCase().includes("ring") || project.templateName?.toLowerCase().includes("ring");
  const hasBatteryNode = nodes.some(n => n.data?.name.toLowerCase().includes('battery') || n.id.includes('battery') || n.id.includes('lipo'));
  const hasMCU = nodes.some(n => n.data?.name.toLowerCase().includes('mcu') || n.data?.name.toLowerCase().includes('controller') || n.id.includes('mcu') || n.id.includes('esp32') || n.id.includes('nrf'));

  // 1. ARCHITECTURE SCORE (Max 100)
  let archScore = 100;
  if (nodes.length > 0) {
    const hasInput = nodes.some(n => 
      n.data?.status === 'MVP' && 
      (n.data?.name.toLowerCase().includes('button') || n.data?.name.toLowerCase().includes('touch') || n.data?.name.toLowerCase().includes('gesture') || n.data?.name.toLowerCase().includes('input') || n.data?.name.toLowerCase().includes('sensor'))
    );
    const hasFeedback = nodes.some(n => 
      n.data?.status === 'MVP' && 
      (n.data?.name.toLowerCase().includes('haptic') || n.data?.name.toLowerCase().includes('led') || n.data?.name.toLowerCase().includes('buzzer') || n.data?.name.toLowerCase().includes('display'))
    );

    if (!hasInput) {
      blockers.push("Architecture lacks user input block (e.g. Button, Touch sensor).");
      archScore -= 40;
    }
    if (!hasFeedback) {
      blockers.push("Architecture lacks user feedback block (e.g. LED, Haptic motor).");
      archScore -= 40;
    }
    
    // Check if electronics product has firmware node/relation
    const hasFwNode = nodes.some(n => n.data?.category?.toLowerCase().includes('firmware') || n.id.toLowerCase().includes('firmware'));
    if (hasMCU && !hasFwNode) {
      warnings.push("Active MCU is planned, but no firmware subsystem exists on the canvas.");
      archScore -= 20;
    }
  } else {
    archScore = 0;
    blockers.push("NO PRODUCT ARCHITECTURE DEFINED. Add blocks to your canvas.");
  }

  // 2. MECHANICAL SCORE (Max 100)
  let mechanicalScore = 100;
  const hasOuterDesign = nodes.some(n => n.data?.views?.includes('outer') || n.id.includes('outer') || n.id.includes('casing') || n.id.includes('shell'));
  const hasInternalLayout = nodes.some(n => n.data?.views?.includes('internal') || n.id.includes('internal') || n.id.includes('stack') || n.id.includes('assembly'));
  
  if (nodes.length > 0) {
    if (!hasOuterDesign) {
      warnings.push("No mechanical outer design/shell specifications defined.");
      mechanicalScore -= 45;
    }
    if (!hasInternalLayout) {
      warnings.push("No internal layout stackup placement specified.");
      mechanicalScore -= 45;
    }
  } else {
    mechanicalScore = 0;
  }

  // 3. ELECTRONICS SCORE (Max 100)
  let electronicsScore = 100;
  if (circuitBlocks.length > 0) {
    const hasMCUBlock = circuitBlocks.some(c => c.circuitType === 'MCU');
    const hasPowerBlock = circuitBlocks.some(c => c.circuitType === 'Power' || c.circuitType === 'Charger');
    
    if (!hasMCUBlock) {
      warnings.push("No central MCU processor block configured in Circuit Planner.");
      electronicsScore -= 40;
    }
    if (!hasPowerBlock) {
      warnings.push("No active voltage regulation or charging circuit block defined in Circuit Planner.");
      electronicsScore -= 40;
    }
  } else {
    electronicsScore = 0;
    warnings.push("No circuit blocks mapped. Setup board circuit layout.");
  }

  // 4. BOARD / PCB PREP SCORE (Max 100)
  let boardPrepScore = 100;
  if (boards.length > 0) {
    boards.forEach(b => {
      if (!b.dimensionsMm || b.dimensionsMm.trim() === "" || b.dimensionsMm.toLowerCase().includes("required") || b.dimensionsMm === "0 x 0") {
        warnings.push(`Board outline dimensions are required for "${b.name}".`);
        boardPrepScore -= 20;
      }
      if (!b.layerCount || b.layerCount <= 0) {
        warnings.push(`Board "${b.name}" has no PCB copper layer count specified.`);
        boardPrepScore -= 10;
      }
      if (!b.substrate) {
        warnings.push(`Board "${b.name}" has no substrate material specified.`);
        boardPrepScore -= 10;
      }
      
      const isFlex = b.substrate.toLowerCase().includes("flex");
      const hasBend = pcbConstraints.some(c => c.constraintType === 'Flex Bend' && c.boardId === b.id);
      if (isFlex && !hasBend) {
        warnings.push(`Flex PCB "${b.name}" lacks a minimum dynamic bend radius constraint.`);
        boardPrepScore -= 25;
      }
    });

    const hasRFCircuit = circuitBlocks.some(c => c.circuitType === 'RF');
    const hasRFConstraint = pcbConstraints.some(c => c.constraintType === 'RF Keepout' || c.constraintType === 'Antenna');
    if (hasRFCircuit && !hasRFConstraint) {
      warnings.push("RF wireless module planned, but no antenna keepout region constraint exists.");
      boardPrepScore -= 20;
    }
  } else {
    boardPrepScore = 0;
    blockers.push("No physical PCBs defined in Board Studio.");
  }

  // 5. COMPONENTS / BOM SCORE (Max 100)
  let compScore = 100;
  if (bom.length > 0 || boardComponents.length > 0) {
    const sourcedCount = bom.filter(item => ['Sourced', 'Ordered', 'Received', 'Tested'].includes(item.status)).length;
    const bomSourcingRatio = bom.length > 0 ? (sourcedCount / bom.length) : 1.0;
    
    // Components details
    const missingFootprint = boardComponents.filter(bc => !bc.footprint || !bc.packageName || bc.footprint.toUpperCase().includes("REQUIRED"));
    const missingDatasheet = boardComponents.filter(bc => !bc.datasheetUrl || bc.datasheetUrl.trim() === "" || bc.datasheetUrl.toLowerCase().includes("required"));
    
    let penalty = 0;
    if (missingFootprint.length > 0) {
      warnings.push(`${missingFootprint.length} board components lack footprint packages.`);
      penalty += Math.min(25, missingFootprint.length * 5);
    }
    if (missingDatasheet.length > 0) {
      suggestions.push(`${missingDatasheet.length} components lack manufacturer datasheet URLs.`);
      penalty += Math.min(15, missingDatasheet.length * 3);
    }
    
    const isOnlyConceptual = boardComponents.length > 0 && boardComponents.every(c => c.notes?.toLowerCase().includes("conceptual") || c.notes?.toLowerCase().includes("tbd"));
    if (isOnlyConceptual) {
      warnings.push("Board component placements are flagged as conceptual only.");
      penalty += 15;
    }

    compScore = Math.round(bomSourcingRatio * 60 + (1.0 - (penalty / 100)) * 40);
    compScore = Math.max(0, Math.min(100, compScore));
  } else {
    compScore = 0;
    suggestions.push("BOM components list is empty. Map components to board layouts.");
  }

  // 6. NETS / PIN MAP SCORE (Max 100)
  let netsPinMapScore = 100;
  if (nets.length > 0 || pinMap.length > 0) {
    if (nets.length === 0) {
      warnings.push("Board Netlist is empty. Link schematic pins to trace copper routing.");
      netsPinMapScore -= 30;
    } else {
      const hasGND = nets.some(n => n.netName.toUpperCase() === 'GND' || n.netType === 'Ground');
      const hasPower = nets.some(n => n.netType === 'Power' || n.netName.toUpperCase().includes('VCC') || n.netName.toUpperCase().includes('3V3') || n.netName.toUpperCase().includes('VBAT'));
      
      if (!hasGND) {
        blockers.push("System Netlist lacks Ground (GND) reference plane paths.");
        netsPinMapScore -= 35;
      }
      if (!hasPower) {
        blockers.push("System Netlist lacks regulated voltage power rail connections.");
        netsPinMapScore -= 35;
      }

      // Conflict checks
      const netVoltages: Record<string, string> = {};
      const conflictingNets = new Set<string>();
      nets.forEach(n => {
        const nameUpper = n.netName.toUpperCase().trim();
        if (nameUpper && n.voltage && n.voltage !== "N/A" && n.voltage !== "TBD") {
          if (netVoltages[nameUpper] && netVoltages[nameUpper] !== n.voltage) {
            conflictingNets.add(n.netName);
          } else {
            netVoltages[nameUpper] = n.voltage;
          }
        }
      });
      if (conflictingNets.size > 0) {
        blockers.push(`Voltage conflict on Net "${Array.from(conflictingNets)[0]}": conflicting supply rails mapped.`);
        netsPinMapScore -= 30;
      }
    }

    if (pinMap.length === 0) {
      warnings.push("MCU Controller Pin assignments are empty.");
      netsPinMapScore -= 20;
    } else {
      const pinCounts: Record<string, number> = {};
      pinMap.forEach(p => {
        const pin = p.mcuPin.trim();
        if (pin && pin !== "TBD" && pin !== "REQUIRED") {
          pinCounts[pin] = (pinCounts[pin] || 0) + 1;
        }
      });
      const conflicts = Object.keys(pinCounts).filter(p => pinCounts[p] > 1);
      if (conflicts.length > 0) {
        blockers.push(`MCU Pin collision: Multiple active lines tied to pin: ${conflicts.join(', ')}`);
        netsPinMapScore -= 25;
      }
    }
    
    netsPinMapScore = Math.max(0, netsPinMapScore);
  } else {
    netsPinMapScore = 0;
    blockers.push("No net traces or controller pins mapped. Pinout is empty.");
  }

  // 7. POWER BUDGET SCORE (Max 100)
  let pwrScore = 100;
  if (powerBudget.length > 0) {
    const hasRegulator = circuitBlocks.some(c => c.circuitType === 'Power') || nodes.some(n => n.data?.name.toLowerCase().includes('ldo') || n.data?.name.toLowerCase().includes('buck') || n.data?.name.toLowerCase().includes('regulator') || n.id.includes('regulator') || n.id.includes('ldo'));
    const hasCharger = circuitBlocks.some(c => c.circuitType === 'Charger') || nodes.some(n => n.data?.name.toLowerCase().includes('charger') || n.id.includes('charger'));
    
    if (hasMCU && !hasRegulator) {
      blockers.push("Active MCU is planned, but no voltage regulator or LDO stage is configured.");
      pwrScore -= 35;
    }
    
    if (hasBatteryNode && !hasCharger) {
      warnings.push("Lithium cell battery is planned, but no Charger PMIC circuit is configured.");
      pwrScore -= 25;
    }

    const missingEstimates = powerBudget.some(item => item.activeCurrentMa === 0);
    if (missingEstimates) {
      warnings.push("Power budget has items with unconfigured active current draw (0 mA).");
      pwrScore -= 15;
    }
    
    pwrScore = Math.max(0, pwrScore);
  } else {
    pwrScore = 0;
    suggestions.push("Create a power budget to calculate active loop runtime estimates.");
  }

  // 8. FIRMWARE SCORE (Max 100)
  let fwScore = 100;
  if (fwTasks.length > 0) {
    const doneCount = fwTasks.filter(t => t.status === 'Done').length;
    const progressCount = fwTasks.filter(t => t.status === 'In Progress').length;
    const completionRatio = (doneCount + progressCount * 0.5) / fwTasks.length;
    
    const hasSleepTask = fwTasks.some(t => t.type === 'Power' || t.name.toLowerCase().includes('sleep') || t.name.toLowerCase().includes('low power'));
    const hasSafetyTask = fwTasks.some(t => t.type === 'Safety' || t.name.toLowerCase().includes('safety') || t.name.toLowerCase().includes('protection') || t.name.toLowerCase().includes('fault'));
    
    let penalty = 0;
    if (!hasSleepTask) {
      suggestions.push("Add a low-power driver/sleep task to extend runtime.");
      penalty += 15;
    }
    if (!hasSafetyTask) {
      warnings.push("No safety watchdog or critical fault vector task planned in firmware.");
      penalty += 20;
    }
    
    const blockedFw = fwTasks.filter(t => t.status === 'Blocked');
    if (blockedFw.length > 0) {
      warnings.push(`Firmware scheduling blocker: "${blockedFw[0].name}" is currently blocked.`);
      penalty += 15;
    }

    fwScore = Math.round(completionRatio * 60 + (1.0 - (penalty / 100)) * 40);
    fwScore = Math.max(0, Math.min(100, fwScore));
  } else {
    fwScore = 0;
    warnings.push("No firmware tasks defined. Initialize a scheduled driver task.");
  }

  // 9. TESTING / VALIDATION SCORE (Max 100)
  let testScore = 100;
  if (testing.length > 0) {
    const passedCount = testing.filter(t => t.status === 'Passed').length;
    const failedCount = testing.filter(t => t.status === 'Failed').length;
    const blockedCount = testing.filter(t => t.status === 'Blocked').length;
    
    if (failedCount > 0) {
      blockers.push(`${failedCount} MVP test protocols are failing. Must verify logic rules.`);
    }
    if (blockedCount > 0) {
      warnings.push(`${blockedCount} validation test stages are currently blocked.`);
    }
    
    const missingEvidence = testing.filter(t => t.status === 'Passed' && (!t.evidenceLink || t.evidenceLink.trim() === ""));
    if (missingEvidence.length > 0) {
      warnings.push(`${missingEvidence.length} passed tests lack verification or scope log links.`);
      testScore -= 15;
    }
    
    const hasPowerTest = testing.some(t => t.name.toLowerCase().includes('power') || t.goal.toLowerCase().includes('current') || t.goal.toLowerCase().includes('voltage'));
    if (!hasPowerTest) {
      suggestions.push("Add board-level power regulation and active current bring-up tests.");
      testScore -= 10;
    }

    const passRatio = passedCount / testing.length;
    testScore = Math.round(passRatio * 70 + (1.0 - (failedCount * 0.15 + blockedCount * 0.10)) * 30);
    testScore = Math.max(0, Math.min(100, testScore));
  } else {
    testScore = 0;
    warnings.push("No prototype validation tests configured.");
  }

  // 10. MANUFACTURING CHECKLIST SCORE (Max 100)
  let mfgScore = 100;
  if (mfgChecklist.length > 0) {
    const done = mfgChecklist.filter(m => m.status === 'Done').length;
    const inProgress = mfgChecklist.filter(m => m.status === 'In Progress').length;
    const blockedItems = mfgChecklist.filter(m => m.status === 'Blocked');
    
    const completionRatio = (done + inProgress * 0.5) / mfgChecklist.length;
    mfgScore = Math.round(completionRatio * 100);

    if (blockedItems.length > 0) {
      blockers.push(`Checklist item blocked: "${blockedItems[0].item}"`);
      mfgScore = Math.max(0, mfgScore - 20);
    }
  } else {
    mfgScore = 0;
    suggestions.push("Initialize pre-layout fabrication check checklist.");
  }

  // 11. SAFETY & COMPLIANCE SCORE (Max 100)
  let safetyScore = 100;
  const hasFuse = nodes.some(n => n.data?.name.toLowerCase().includes('fuse') || n.data?.name.toLowerCase().includes('protection') || n.id.includes('fuse') || n.id.includes('pcm') || n.data?.name.toLowerCase().includes('tvs'));
  const hasThermalWatchdog = nodes.some(n => n.data?.name.toLowerCase().includes('thermal') || n.data?.description?.toLowerCase().includes('thermal') || n.data?.notes?.toLowerCase().includes('temp') || circuitBlocks.some(c => c.circuitType === 'Protection' && c.description.toLowerCase().includes('thermal')));
  const hasMicNode = nodes.some(n => n.data?.name.toLowerCase().includes('microphone') || n.id.toLowerCase().includes('mic'));
  const hasPrivacyMute = nodes.some(n => n.data?.name.toLowerCase().includes('privacy') || n.data?.name.toLowerCase().includes('mute') || n.data?.description?.toLowerCase().includes('mute'));

  if (!hasFuse) {
    warnings.push("No overcurrent fuse or transient protection device mapped in layout.");
    safetyScore -= 30;
  }
  if (!hasThermalWatchdog) {
    suggestions.push("Implement a firmware thermal cutoff threshold to prevent overheating.");
    safetyScore -= 20;
  }
  if (hasMicNode && !hasPrivacyMute) {
    warnings.push("Microphone sensor planned, but no hardware privacy disable or switch exists.");
    safetyScore -= 30;
  }

  if (isRing) {
    const isSkinComfortDone = mfgChecklist.some(m => m.item.toLowerCase().includes('skin') && m.status === 'Done');
    if (!isSkinComfortDone) {
      warnings.push("Hypoallergenic material biocompatibility review is pending for skin wearable.");
      safetyScore -= 20;
    }
  }

  if (hasBatteryNode) {
    const isBatterySafetyDone = mfgChecklist.some(m => m.item.toLowerCase().includes('battery') && m.status === 'Done');
    if (!isBatterySafetyDone) {
      warnings.push("Lithium safety certification and thermal pocket review is pending.");
      safetyScore -= 20;
    }
  }

  safetyScore = Math.max(0, safetyScore);

  // 12. DOCUMENTATION SCORE (Max 100)
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
      suggestions.push(`Complete description specs on ${incomplete} undocumented blueprint nodes.`);
    }
  } else {
    docScore = 0;
  }

  // Calculate Weighted Overall Score (12 categories)
  const overallScore = Math.round(
    archScore * 0.08 +
    mechanicalScore * 0.08 +
    electronicsScore * 0.08 +
    boardPrepScore * 0.08 +
    compScore * 0.08 +
    netsPinMapScore * 0.08 +
    pwrScore * 0.08 +
    fwScore * 0.08 +
    testScore * 0.08 +
    mfgScore * 0.08 +
    docScore * 0.08 +
    safetyScore * 0.12
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
      electronics: electronicsScore,
      boardPrep: boardPrepScore,
      power: pwrScore,
      firmware: fwScore,
      testing: testScore,
      manufacturing: mfgScore,
      safety: safetyScore,
      documentation: docScore,
      mechanical: mechanicalScore,
      netsPinMap: netsPinMapScore
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
