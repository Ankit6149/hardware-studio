import { Project } from '../types';
import { calculateReadinessScore } from './readinessScore';

const escapeMarkdown = (text: string | number | undefined | null): string => {
  if (text === undefined || text === null) return '';
  return String(text).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
};

export const exportBlueprintDossierMarkdown = (project: Project) => {
  const { 
    projectName, 
    description, 
    nodes, 
    edges, 
    bom, 
    testing, 
    powerBudget, 
    pinMap, 
    firmwareTasks, 
    batteryCapacityMah,
    boards = [],
    circuitBlocks = [],
    boardComponents = [],
    nets = [],
    pcbConstraints = [],
    manufacturingChecklist = []
  } = project;
  const report = calculateReadinessScore(project);
  
  // Prototype Gate status
  let gateStatus = "Needs Review";
  if (report.overallScore >= 85 && report.blockers.length === 0) {
    gateStatus = "Prototype Ready";
  } else if (report.blockers.length > 0) {
    gateStatus = "Blocked";
  }

  const md = `# CONCEPT / PROTOTYPE BLUEPRINT DOSSIER
**Project**: ${projectName}
**Date Generated**: ${new Date().toLocaleDateString()}
**Version**: ${project.version || '1.0'}
**Status**: CONCEPT PREPARATION

---

> [!WARNING]
> **CONCEPT/PROTOTYPE DISCLAIMER**: This document contains high-level blueprint descriptions, electrical layouts, pin configurations, and firmware states designed for conceptual planning and prototype validation. It is **NOT** a production-ready ECAD/MCAD release and does not replace professional CAD/PCB manufacturing output.

---

## 1. PROJECT METADATA
- **Project Name**: ${projectName}
- **Description**: ${description || 'No description provided.'}
- **Template Source**: ${project.templateName || 'Custom Slate'}
- **Readiness Score**: ${report.overallScore}/100
- **Prototype Release Gate**: **${gateStatus}**

---

## 2. MASTER SYSTEM ARCHITECTURE BLUEPRINT
Contains the core logical blocks that formulate the hardware product architecture.

| Block Name | Category | Status | Purpose / Goal | Candidate Parts | Priority | Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${nodes.filter(n => n.type !== 'boundaryNode').map(n => {
  const d = n.data;
  return `| **${escapeMarkdown(d.name)}** | ${escapeMarkdown(d.category)} | \`${escapeMarkdown(d.status)}\` | ${escapeMarkdown(d.purpose || d.description)} | ${escapeMarkdown(d.candidateComponents)} | ${escapeMarkdown(d.priority || 'Medium')} | ${escapeMarkdown(d.risks)} |`;
}).join('\n')}

### Master Interconnections
Logical connections mapping signal, power, data, and command lines.

| Source Block | Target Block | Relationship / Protocol | Connection Details |
| :--- | :--- | :--- | :--- |
${edges.map(e => {
  const srcNode = nodes.find(n => n.id === e.source)?.data?.name || e.source;
  const tgtNode = nodes.find(n => n.id === e.target)?.data?.name || e.target;
  return `| ${escapeMarkdown(srcNode)} | ${escapeMarkdown(tgtNode)} | ${escapeMarkdown(e.label || 'Direct link')} | View Visibility: \`${(e.views || []).join(', ')}\` |`;
}).join('\n')}

---

## 3. OUTER DESIGN BLUEPRINT
Physical placement constraints, materials, and user interactions.

### Labeled Casing Requirements
- **Touch / Button Interface**: Capacitive ring shell bands, mechanical buttons, or gesture area keepouts.
- **Visual Feedback**: Light-guide acrylic windows, LED status guides, and charging indicator ports.
- **Contact Interfaces**: Pogo pin micro-contacts, USB receptacles, and comfort-fit curves.
- **Radio Keepouts**: Clear plastic window areas adjacent to antennas to prevent shielding.

### Outer View Components Details
| Block Name | Outer Role | Mechanical Notes | Material & Fit Notes |
| :--- | :--- | :--- | :--- |
${nodes.filter(n => n.data.category === 'Interaction' || n.data.category === 'Mechanical').map(n => {
  const d = n.data;
  return `| **${escapeMarkdown(d.name)}** | ${escapeMarkdown(d.status)} | ${escapeMarkdown(d.description)} | ${escapeMarkdown(d.mechanicalNotes || 'Not defined')} |`;
}).join('\n')}

---

## 4. INTERNAL LAYOUT BLUEPRINT
Physical stackup layers and thermal/electromagnetic boundaries.

### Stackup Zone Configuration
1. **Battery Compartment**: Safely isolated zone to prevent puncture and manage expansion.
2. **Flexible/Rigid PCB Paths**: Minimum curvature traces, decoupling capacitor positioning, and grounding layers.
3. **Sensor Constraints**: IMUs centered on layout origin, thermal insulation on thermistors.
4. **Haptic Cavities**: Mechanical isolation brackets to transfer vibration to user casing rather than damaging components.

### Layout Constraint Trace
| Block Name | Internal Coordinates Notes | Thermal / Keepout Zones |
| :--- | :--- | :--- |
${nodes.filter(n => n.data.category === 'Electronics' || n.data.category === 'Power' || n.data.category === 'Mechanical').map(n => {
  const d = n.data;
  return `| **${escapeMarkdown(d.name)}** | Positions: \`${JSON.stringify(d.positions || {})}\` | Keepouts: ${escapeMarkdown(d.risks || 'No standard constraints')} |`;
}).join('\n')}

---

## 5. ELECTRONICS BLUEPRINT
Component categorization mapping and circuit design sanity checks.

### Active Components Registry
| Block | Component Category | Sourcing Component | Datasheet Reference |
| :--- | :--- | :--- | :--- |
${nodes.filter(n => n.data.category === 'Electronics' || n.data.category === 'Power').map(n => {
  const d = n.data;
  return `| ${escapeMarkdown(d.name)} | ${escapeMarkdown(d.category)} | ${escapeMarkdown(d.candidateComponents || 'TBD')} | ${escapeMarkdown(d.datasheetUrl || 'No datasheet url linked')} |`;
}).join('\n')}

### Conceptual Circuit Warnings
${(() => {
  const warnings: string[] = [];
  const names = nodes.map(n => n.data.name.toLowerCase());
  
  const hasMCU = names.some(n => n.includes("mcu") || n.includes("controller") || n.includes("soc"));
  const hasRegulator = names.some(n => n.includes("regulator") || n.includes("ldo") || n.includes("buck") || n.includes("boost"));
  const hasBattery = names.some(n => n.includes("battery") || n.includes("cell") || n.includes("li-po"));
  const hasCharger = names.some(n => n.includes("charger") || n.includes("charging") || n.includes("tp4056"));
  const hasProtection = names.some(n => n.includes("protection") || n.includes("fuse") || n.includes("bms"));
  const hasHaptic = names.some(n => n.includes("haptic") || n.includes("vibrat"));
  const hasHapticDriver = names.some(n => n.includes("driver") || n.includes("drv2605"));
  const hasMic = names.some(n => n.includes("mic") || n.includes("microphone"));
  const hasPrivacy = names.some(n => n.includes("switch") || n.includes("privacy") || n.includes("gate") || n.includes("cut"));
  const hasBLE = names.some(n => n.includes("ble") || n.includes("bluetooth") || n.includes("antenna"));
  const hasAntenna = names.some(n => n.includes("antenna") || n.includes("keepout"));
  const hasDebug = names.some(n => n.includes("debug") || n.includes("jtag") || n.includes("swd") || n.includes("pogo") || n.includes("header"));

  if (hasMCU && !hasRegulator) warnings.push("- **Warning**: Controller block lacks direct power regulation (LDO/Buck-Boost Labeled).");
  if (hasBattery && (!hasCharger || !hasProtection)) warnings.push("- **Warning**: Battery storage present without explicit charging controller or BMS protection circuit.");
  if (hasHaptic && !hasHapticDriver) warnings.push("- **Warning**: Solenoid/Haptic motor linked directly without current-amplifying driver gates.");
  if (hasMic && !hasPrivacy) warnings.push("- **Warning**: Audio inputs lack hardwired privacy gate switches or hardware indicators.");
  if (hasBLE && !hasAntenna) warnings.push("- **Warning**: RF transceiver present without labeled antenna trace or ground keepout window.");
  if (!hasDebug) warnings.push("- **Warning**: No debugging interface header (SWD/JTAG/Pogo pads) labeled in architecture.");

  return warnings.length === 0 ? "*All conceptual electrical rules passed.*" : warnings.join('\n');
})()}

---

## 6. POWER BLUEPRINT
Duty cycle current consumption simulations.

- **System Operating Voltage**: 3.3 V / 3.7 V
- **Battery Capacity**: ${batteryCapacityMah || 0} mAh

### Current Loads Table
| Load Block Name | Operating Voltage | Active Current | Sleep Current | Duty Cycle | Average Current | Quantity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${powerBudget.map(p => {
  const active = Number(p.activeCurrentMa) || 0;
  const sleep = Number(p.sleepCurrentUa) || 0;
  const duty = Number(p.dutyCyclePercent) || 0;
  const qty = Number(p.quantity) || 1;
  const avg = (active * (duty / 100) + (sleep / 1000) * (1 - duty / 100)) * qty;
  return `| ${escapeMarkdown(p.blockName)} | ${escapeMarkdown(p.voltage)} | ${active} mA | ${sleep} uA | ${duty} % | ${avg.toFixed(3)} mA | ${qty} |`;
}).join('\n')}

### Load Simulator Calculations
- **Total Power Consumption**: ${(() => {
  const total = powerBudget.reduce((sum, p) => {
    const active = Number(p.activeCurrentMa) || 0;
    const sleep = Number(p.sleepCurrentUa) || 0;
    const duty = Number(p.dutyCyclePercent) || 0;
    const qty = Number(p.quantity) || 1;
    return sum + (active * (duty / 100) + (sleep / 1000) * (1 - duty / 100)) * qty;
  }, 0);
  return total.toFixed(3);
})()} mA
- **Estimated Runtime**: ${(() => {
  const total = powerBudget.reduce((sum, p) => {
    const active = Number(p.activeCurrentMa) || 0;
    const sleep = Number(p.sleepCurrentUa) || 0;
    const duty = Number(p.dutyCyclePercent) || 0;
    const qty = Number(p.quantity) || 1;
    return sum + (active * (duty / 100) + (sleep / 1000) * (1 - duty / 100)) * qty;
  }, 0);
  if (total <= 0) return 'Infinite (No load configured)';
  const hrs = (batteryCapacityMah || 0) / total;
  return `${hrs.toFixed(1)} Hours (${(hrs / 24).toFixed(1)} Days)`;
})()}

---

## 7. MCU PIN MAP BLUEPRINT
Signal routing mapping configurations.

| Pin Label | Signal / Channel Name | Labeled Connection Target | Direction | Interface Protocol | Signal Voltage | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${pinMap.map(pin => {
  return `| **${escapeMarkdown(pin.mcuPin || 'Unassigned')}** | ${escapeMarkdown(pin.signalName)} | ${escapeMarkdown(pin.connectedBlock)} | ${escapeMarkdown(pin.direction)} | ${escapeMarkdown(pin.protocol)} | ${escapeMarkdown(pin.voltage)} | ${escapeMarkdown(pin.notes)} |`;
}).join('\n')}

### Routing Map Warnings
${(() => {
  const warnings: string[] = [];
  const assignedPins = pinMap.map(p => p.mcuPin).filter(Boolean);
  const duplicates = assignedPins.filter((p, i) => assignedPins.indexOf(p) !== i);
  const uniqueDuplicates = Array.from(new Set(duplicates));

  if (uniqueDuplicates.length > 0) {
    warnings.push(`- **Conflict**: Multiple signals mapped to pin(s) \`${uniqueDuplicates.join(', ')}\``);
  }

  const unassigned = pinMap.filter(p => !p.mcuPin);
  if (unassigned.length > 0) {
    warnings.push(`- **Warning**: ${unassigned.length} signal connections are floating/unassigned to MCU pins.`);
  }

  const missingVolt = pinMap.filter(p => !p.voltage);
  if (missingVolt.length > 0) {
    warnings.push(`- **Warning**: ${missingVolt.length} pins lack target voltage references.`);
  }

  return warnings.length === 0 ? "*All signal routing verified.*" : warnings.join('\n');
})()}

---

## 8. FIRMWARE BLUEPRINT
Driver logic specifications and state machine mapping.

### Active Firmware Tasks
| Task Name | Subsystem / Type | Target Block Interface | Run Priority | Verification Status | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
${firmwareTasks.map(t => {
  return `| **${escapeMarkdown(t.name)}** | \`${escapeMarkdown(t.type)}\` | ${escapeMarkdown(t.linkedBlock || 'Core Loop')} | \`${escapeMarkdown(t.priority)}\` | ${escapeMarkdown(t.status)} | ${escapeMarkdown(t.description)} |`;
}).join('\n')}

### Core Firmware Loop Logic
- **Initialization Stage**: Checks hardware connections, starts SPI/I2C buses, and initializes BLE profiles.
- **Standby Sleep State**: Shuts down feedback rails, configures wake-on-interrupt triggers, and transitions to low-power state.
- **Wake Interrupt Trigger**: Processes touch inputs or IMU thresholds to return to advertising or active calculations.

---

## 9. SYSTEM ALPHA INTEGRATION BLUEPRINT
External software bridge and cloud services layer mapping.

> [!NOTE]
> **EXTERNAL INFRASTRUCTURE**: All System Alpha execution systems, permissions managers, command structures, and companion mobile apps reside **OUTSIDE** the physical ring wearable client. Communication occurs via encrypted Bluetooth command packets.

- **Mobile Client Host**: Handshakes with the local host system.
- **Intent Gateway API**: Maps physical gestures to active external actions.
- **Permission Firewall**: Limits ring control triggers from accessing root host actions without companion app screen confirmations.

---

## 10. SYSTEM TESTING & QA BLUEPRINT
Dossier of testing scripts, categories, and evidence reports.

${["Interaction", "Electronics", "Power", "Firmware", "Mechanical", "Safety", "Integration"].map(category => {
  const categoryTests = testing.filter(t => (t.category || 'General').toLowerCase() === category.toLowerCase() || (category === 'Interaction' && !t.category));
  if (categoryTests.length === 0) return '';

  return `### ${category} Verification Protocols
| Test Name | Target Verification Blocks | Goals & Parameters | Steps & Pass Criteria | Evidentiary Log Links | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
${categoryTests.map(t => {
  const blocks = (t.linkedBlocks || []).map(id => nodes.find(n => n.id === id)?.data?.name || id).join(', ');
  return `| **${escapeMarkdown(t.name)}** | ${escapeMarkdown(blocks || 'Entire System')} | Goal: ${escapeMarkdown(t.goal)} | Steps: ${escapeMarkdown(t.steps)} <br> Pass: ${escapeMarkdown(t.passCriteria)} | Link: ${escapeMarkdown(t.evidenceLink || 'No link')} <br> Notes: ${escapeMarkdown(t.resultNotes)} | \`${escapeMarkdown(t.status)}\` |`;
}).join('\n')}
`;
}).join('\n')}

---

## 11. BILL OF MATERIALS (BOM) BLUEPRINT
Procurement registry and sourcing cost estimation.

| Component Block | Sourced Part | Part Number | Sourcing Stage | Quantity | Target Cost | Supplier Link | Sourcing Status | Sourcing Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${bom.map(b => {
  return `| **${escapeMarkdown(b.blockName)}** | ${escapeMarkdown(b.candidateComponent)} | ${escapeMarkdown(b.partNumber || 'TBD')} | \`${escapeMarkdown(b.stage)}\` | ${b.quantity || 1} | $${escapeMarkdown(b.costEstimate || '0.00')} | ${b.supplierUrl ? `[${escapeMarkdown(b.supplier || 'Link')}](${escapeMarkdown(b.supplierUrl)})` : 'Not linked'} | \`${escapeMarkdown(b.status)}\` | Risk: ${escapeMarkdown(b.risk)} <br> Alt: ${escapeMarkdown(b.alternative)} |`;
}).join('\n')}

### Procurement Warnings
${(() => {
  const warnings: string[] = [];
  bom.forEach(b => {
    if (!b.supplierUrl) warnings.push(`- **Warning**: Part \`${b.blockName} (${b.candidateComponent})\` lacks a supplier web link.`);
    if (!b.partNumber) warnings.push(`- **Warning**: Part \`${b.blockName}\` has no manufacturer part number.`);
    if (!b.costEstimate || b.costEstimate === '0.00' || b.costEstimate === '0') {
      warnings.push(`- **Warning**: Part \`${b.blockName}\` has a zero cost estimate.`);
    }
  });
  return warnings.length === 0 ? "*All sourcing details complete.*" : warnings.join('\n');
})()}

---

---

## 12. BOARD PLANNING & ECAD PREPARATION
This section details the PCB layouts, components mapping, schematic circuits prep, impedance traces nets, outline clearance constraints, and layout package checklist details.

### 12.1 PCB Specifications
${(() => {
  if (boards.length === 0) return '*No PCBs/boards planned yet.*';
  return `| Board Name | Type | Substrate | Layers | Dimensions | Placement | Status | Purpose / Mounting |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n` +
    boards.map(b => `| **${escapeMarkdown(b.name)}** | ${escapeMarkdown(b.boardType)} | ${escapeMarkdown(b.substrate)} | ${b.layerCount} | ${escapeMarkdown(b.dimensionsMm)} | ${escapeMarkdown(b.placement)} | \`${escapeMarkdown(b.status)}\` | Purpose: ${escapeMarkdown(b.purpose)} <br> Mount: ${escapeMarkdown(b.mountingNotes)} |`).join('\n');
})()}

### 12.2 Sourcing Footprints & Placement (ECAD Prep)
${(() => {
  if (boardComponents.length === 0) return '*No board components placed yet.*';
  return `| Ref Des | Name | Type | Value | Footprint / Package | PCB Board | Side | Criticality |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n` +
    boardComponents.map(bc => {
      const boardName = boards.find(b => b.id === bc.boardId)?.name || 'Unassigned';
      return `| **${escapeMarkdown(bc.referenceDesignator)}** | ${escapeMarkdown(bc.componentName)} | ${escapeMarkdown(bc.componentType)} | ${escapeMarkdown(bc.value)} | ${escapeMarkdown(bc.footprint)} / ${escapeMarkdown(bc.packageName)} | ${escapeMarkdown(boardName)} | ${escapeMarkdown(bc.side)} | \`${escapeMarkdown(bc.placementCriticality)}\` |`;
    }).join('\n');
})()}

### 12.3 Circuit Blocks Planning
${(() => {
  if (circuitBlocks.length === 0) return '*No circuit blocks configured yet.*';
  return `| Circuit Block | Category / Type | Target PCB | Description | Interface | Design & Sourcing Notes |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n` +
    circuitBlocks.map(c => {
      const boardName = boards.find(b => b.id === c.boardId)?.name || 'Unassigned';
      return `| **${escapeMarkdown(c.name)}** | \`${escapeMarkdown(c.circuitType)}\` | ${escapeMarkdown(boardName)} | ${escapeMarkdown(c.description)} | ${escapeMarkdown(c.interfaceType || 'Direct Pin')} | RefDes: \`${escapeMarkdown(c.referenceDesignators)}\` <br> Notes: ${escapeMarkdown(c.designNotes)} |`;
    }).join('\n');
})()}

### 12.4 Signaling Nets & Netlist Prep
${(() => {
  if (nets.length === 0) return '*No signal/power nets mapped yet.*';
  return `| Net Name | Type | Target Voltage | Source Pin | Destination Pin | Current Est. | Impedance |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n` +
    nets.map(n => `| **${escapeMarkdown(n.netName)}** | \`${escapeMarkdown(n.netType)}\` | ${escapeMarkdown(n.voltage || 'N/A')} | ${escapeMarkdown(n.sourceComponent)}:${escapeMarkdown(n.sourcePin)} | ${escapeMarkdown(n.targetComponent)}:${escapeMarkdown(n.targetPin)} | ${escapeMarkdown(n.currentEstimate || 'N/A')} | ${escapeMarkdown(n.impedanceRequirement || 'N/A')} |`).join('\n');
})()}

### 12.5 Electrical & Mechanical Constraints
${(() => {
  if (pcbConstraints.length === 0) return '*No PCB constraints defined yet.*';
  return `| Target PCB | Constraint Type | Parameter Value | Unit | Severity | Description / Details |\n| :--- | :--- | :--- | :--- | :--- | :--- |\n` +
    pcbConstraints.map(pc => {
      const boardName = boards.find(b => b.id === pc.boardId)?.name || 'All boards';
      return `| ${escapeMarkdown(boardName)} | **${escapeMarkdown(pc.constraintType)}** | ${escapeMarkdown(pc.value)} | ${escapeMarkdown(pc.unit)} | \`${escapeMarkdown(pc.severity)}\` | ${escapeMarkdown(pc.description)} |`;
    }).join('\n');
})()}

### 12.6 Pre-Layout Verification Checklist
${(() => {
  if (manufacturingChecklist.length === 0) return '*No pre-layout checklist items created.*';
  return `| Check Category | Task Verification Item | Assigned Status | Owner Notes & Blockers |\n| :--- | :--- | :--- | :--- |\n` +
    manufacturingChecklist.map(ch => `| **${escapeMarkdown(ch.category)}** | ${escapeMarkdown(ch.item)} | \`${escapeMarkdown(ch.status)}\` | ${escapeMarkdown(ch.ownerNotes)} ${ch.blockingReason ? `<br>**Blocker**: ${escapeMarkdown(ch.blockingReason)}` : ''} |`).join('\n');
})()}

---

## 13. PROTOTYPE READY REVIEW & ACTION ITEMS
Summary dashboard and gating review checks.

- **Readiness Score Index**: ${report.overallScore} / 100
- **Gating Status**: **${gateStatus}**

### Critical Blockers Checked
${report.blockers.length === 0 ? "*Zero critical blockers found.*" : report.blockers.map(b => `- **Blocker**: ${b}`).join('\n')}

### General Engineering Warnings
${report.warnings.length === 0 ? "*Zero engineering warnings found.*" : report.warnings.map(w => `- **Warning**: ${w}`).join('\n')}

### Next 5 Gating Actions
${report.nextActions.slice(0, 5).map((act, index) => `${index + 1}. **${act}**`).join('\n')}

---
*End of Conceptual Blueprint Dossier document.*
`;

  return md;
};

export const exportBlueprintDossierJson = (project: Project) => {
  const { 
    projectName, 
    description, 
    nodes, 
    edges, 
    bom, 
    testing, 
    powerBudget, 
    pinMap, 
    firmwareTasks, 
    batteryCapacityMah,
    boards = [],
    circuitBlocks = [],
    boardComponents = [],
    nets = [],
    pcbConstraints = [],
    manufacturingChecklist = []
  } = project;
  const report = calculateReadinessScore(project);
  
  const rawObj = {
    dossierMetadata: {
      generator: "Hardware Studio Dossier compiler",
      generatedAt: new Date().toISOString(),
      projectName,
      description,
      readinessScore: report.overallScore,
      blockersCount: report.blockers.length,
      warningsCount: report.warnings.length,
      version: project.version || "1.0"
    },
    projectData: {
      projectName,
      description,
      activeView: "dossier",
      batteryCapacityMah,
      nodes,
      edges,
      bom,
      testing,
      powerBudget,
      pinMap,
      firmwareTasks,
      boards,
      circuitBlocks,
      boardComponents,
      nets,
      pcbConstraints,
      manufacturingChecklist
    }
  };
  
  return JSON.stringify(rawObj, null, 2);
};
