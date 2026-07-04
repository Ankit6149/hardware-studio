import { Project } from '../types';

export interface ReadinessReport {
  overallScore: number;
  categories: {
    architecture: number;
    components: number;
    power: number;
    firmware: number;
    testing: number;
    safety: number;
    documentation: number;
  };
  blockers: string[];
  warnings: string[];
  suggestions: string[];
  nextActions: string[];
}

export const calculateReadinessScore = (project: Project): ReadinessReport => {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const nextActions: string[] = [];

  // 1. ARCHITECTURE SCORE (Max 100)
  let archScore = 50;
  const nodes = project.nodes || [];
  
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
    else blockers.push("MVP Scope has no user input block defined (e.g. Button or Touch sensor).");

    if (hasFeedback) archScore += 25;
    else blockers.push("MVP Scope has no user feedback block defined (e.g. LED or Haptic motor).");
  } else {
    archScore = 0;
    suggestions.push("Create initial architecture blocks on the blueprint canvas.");
  }

  // 2. COMPONENTS SCORE (Max 100)
  let compScore = 100;
  const bom = project.bom || [];
  if (bom.length > 0) {
    const sourcedCount = bom.filter(item => ['Sourced', 'Ordered', 'Received', 'Tested'].includes(item.status)).length;
    const sourcingRatio = sourcedCount / bom.length;
    compScore = Math.round(sourcingRatio * 100);

    const missingSupplier = bom.some(item => !item.supplier || !item.datasheetUrl);
    if (missingSupplier) {
      warnings.push("Some BOM rows are missing supplier details or datasheet links.");
    }
  } else {
    compScore = 0;
    suggestions.push("Add items to your Bill of Materials (BOM) or generate them from blueprint.");
  }

  // 3. POWER SCORE (Max 100)
  let pwrScore = 100;
  const powerBudget = project.powerBudget || [];
  
  const hasBattery = nodes.some(n => n.data?.name.toLowerCase().includes('battery') || n.id.includes('battery') || n.id.includes('lipo'));
  const hasRegulator = nodes.some(n => n.data?.name.toLowerCase().includes('ldo') || n.data?.name.toLowerCase().includes('buck') || n.data?.name.toLowerCase().includes('regulator') || n.id.includes('ldo'));
  const hasMCU = nodes.some(n => n.data?.name.toLowerCase().includes('mcu') || n.data?.name.toLowerCase().includes('controller') || n.id.includes('mcu'));
  const hasCharger = nodes.some(n => n.data?.name.toLowerCase().includes('charger') || n.data?.name.toLowerCase().includes('charging') || n.id.includes('charger'));

  if (hasMCU && !hasRegulator) {
    blockers.push("BLE MCU is mapped, but no voltage regulator or power rails exist to power it.");
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
  const fwTasks = project.firmwareTasks || [];
  if (fwTasks.length > 0) {
    const doneCount = fwTasks.filter(t => t.status === 'Done').length;
    const progressCount = fwTasks.filter(t => t.status === 'In Progress').length;
    const ratio = (doneCount + progressCount * 0.5) / fwTasks.length;
    fwScore = Math.round(ratio * 100);
  } else {
    fwScore = 0;
    suggestions.push("Create a Firmware Plan outlining driver states and protocols.");
  }

  // 5. TESTING SCORE (Max 100)
  let testScore = 100;
  const testing = project.testing || [];
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
  } else {
    testScore = 0;
    warnings.push("No test protocols are defined. Add tests to guarantee prototype verification.");
  }

  // 6. SAFETY SCORE (Max 100)
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

  // 7. DOCUMENTATION SCORE (Max 100)
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

  // PIN MAP CHECKS (Inject into blockers / warnings)
  const pinMap = project.pinMap || [];
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

  // Calculate Weighted Overall Score
  const overallScore = Math.round(
    archScore * 0.15 +
    compScore * 0.15 +
    pwrScore * 0.15 +
    fwScore * 0.15 +
    testScore * 0.15 +
    safetyScore * 0.15 +
    docScore * 0.10
  );

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
      power: pwrScore,
      firmware: fwScore,
      testing: testScore,
      safety: safetyScore,
      documentation: docScore
    },
    blockers,
    warnings,
    suggestions,
    nextActions: nextActions.slice(0, 5)
  };
};
