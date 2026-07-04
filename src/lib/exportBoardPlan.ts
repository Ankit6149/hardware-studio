import { Project, ManufacturingChecklistItem } from '../types';

const escapeCsv = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

const escapeMarkdown = (text: string | number | undefined | null): string => {
  if (text === undefined || text === null) return '';
  return String(text).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
};

export const exportBoardPlanMarkdown = (project: Project): string => {
  const { projectName, boards = [], circuitBlocks = [], boardComponents = [], nets = [], pcbConstraints = [], manufacturingChecklist = [] } = project;
  
  const md = `# ECAD PREP / PCB PLANNING DOSSIER
**Project**: ${projectName}
**Date Generated**: ${new Date().toLocaleDateString()}
**Status**: PLANNING & ROUTING PREPARATION

---

> [!NOTE]
> **ECAD PREPARATION DISCLAIMER**: This document contains high-level physical PCB stackup specs, board outline limits, schematic-prep tables, logical nets routing, and factory manufacturing checklists. This is **NOT** a Gerber-ready or CAD board release file. It should be used to prepare layouts in Altium Designer, KiCad, or EasyEDA.

---

## 1. PCB BOARDS SPECIFICATIONS
| Board Name | Type | Substrate | Layers | Dimensions | Placement | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${boards.map(b => (
  `| **${escapeMarkdown(b.name)}** | ${b.boardType} | ${b.substrate} | ${b.layerCount} | ${escapeMarkdown(b.dimensionsMm)} mm | ${b.placement} | \`${b.status}\` |`
)).join('\n')}

---

## 2. SCHEMATIC CIRCUIT BLOCKS
| Circuit Block | Category | Required Parts | Reference Designators | Power Rails | Signal Rails | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${circuitBlocks.map(cb => (
  `| **${escapeMarkdown(cb.name)}** | ${cb.circuitType} | ${escapeMarkdown(cb.requiredComponents)} | \`${escapeMarkdown(cb.referenceDesignators)}\` | ${escapeMarkdown(cb.powerNets)} | ${escapeMarkdown(cb.signalNets)} | \`${cb.status}\` |`
)).join('\n')}

---

## 3. COMPONENT PLACEMENT MATRIX
| Ref Des | Component Name | Package | Footprint | Part Number | Side | Criticality | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${boardComponents.map(bc => (
  `| **${escapeMarkdown(bc.referenceDesignator)}** | ${escapeMarkdown(bc.componentName)} | ${escapeMarkdown(bc.packageName)} | \`${escapeMarkdown(bc.footprint)}\` | ${escapeMarkdown(bc.partNumber)} | ${bc.side} | \`${bc.placementCriticality}\` | ${escapeMarkdown(bc.notes)} |`
)).join('\n')}

---

## 4. ROUTING NETLIST SCHEMES
| Net Name | Type | Voltage | Source | Target | Impedance | Current | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
${nets.map(n => (
  `| **${escapeMarkdown(n.netName)}** | ${n.netType} | ${escapeMarkdown(n.voltage)} | \`${escapeMarkdown(n.sourceComponent)}-${escapeMarkdown(n.sourcePin)}\` | \`${escapeMarkdown(n.targetComponent)}-${escapeMarkdown(n.targetPin)}\` | ${escapeMarkdown(n.impedanceRequirement)} | ${escapeMarkdown(n.currentEstimate)} | ${escapeMarkdown(n.notes)} |`
)).join('\n')}

---

## 5. PCB MANUFACTURING CONSTRAINTS
| Constraint Type | Value | Unit | Severity | Description |
| :--- | :--- | :--- | :--- | :--- |
${pcbConstraints.map(c => (
  `| **${c.constraintType}** | ${escapeMarkdown(c.value)} | ${c.unit} | \`${c.severity}\` | ${escapeMarkdown(c.description)} |`
)).join('\n')}

---

## 6. MANUFACTURING PACK CHECKLIST
| Checklist Item | Category | Status | Notes |
| :--- | :--- | :--- | :--- |
${manufacturingChecklist.map(mc => (
  `| **${escapeMarkdown(mc.item)}** | ${mc.category} | \`${mc.status}\` | ${escapeMarkdown(mc.ownerNotes)} |`
)).join('\n')}

*End of Board Plan document.*
`;

  return md;
};

export const exportBoardPlanJson = (project: Project): string => {
  const { projectName, boards = [], circuitBlocks = [], boardComponents = [], nets = [], pcbConstraints = [], manufacturingChecklist = [] } = project;
  
  const raw = {
    generator: "Hardware Studio ECAD Planner",
    generatedAt: new Date().toISOString(),
    projectName,
    boards,
    circuitBlocks,
    boardComponents,
    nets,
    pcbConstraints,
    manufacturingChecklist
  };

  return JSON.stringify(raw, null, 2);
};

export const exportNetlistCsv = (project: Project): string => {
  const { nets = [] } = project;
  
  let csv = "Net Name,Net Type,Voltage,Source Component,Source Pin,Target Component,Target Pin,Protocol,Current Estimate,Impedance Requirement,Notes\n";
  
  nets.forEach(n => {
    csv += [
      escapeCsv(n.netName),
      escapeCsv(n.netType),
      escapeCsv(n.voltage),
      escapeCsv(n.sourceComponent),
      escapeCsv(n.sourcePin),
      escapeCsv(n.targetComponent),
      escapeCsv(n.targetPin),
      escapeCsv(n.protocol),
      escapeCsv(n.currentEstimate),
      escapeCsv(n.impedanceRequirement),
      escapeCsv(n.notes)
    ].join(',') + '\n';
  });

  return csv;
};

export const exportBoardComponentsCsv = (project: Project): string => {
  const { boardComponents = [] } = project;
  
  let csv = "Reference Designator,Component Name,Component Type,Value,Package,Footprint,Part Number,Quantity,Side,Placement Criticality,Notes\n";
  
  boardComponents.forEach(bc => {
    csv += [
      escapeCsv(bc.referenceDesignator),
      escapeCsv(bc.componentName),
      escapeCsv(bc.componentType),
      escapeCsv(bc.value),
      escapeCsv(bc.packageName),
      escapeCsv(bc.footprint),
      escapeCsv(bc.partNumber),
      escapeCsv(bc.quantity),
      escapeCsv(bc.side),
      escapeCsv(bc.placementCriticality),
      escapeCsv(bc.notes)
    ].join(',') + '\n';
  });

  return csv;
};

export const exportManufacturingChecklistMarkdown = (project: Project): string => {
  const { projectName, manufacturingChecklist = [] } = project;
  
  let md = `# MANUFACTURING RELEASE PACK CHECKLIST
**Project**: ${projectName}
**Date Compiled**: ${new Date().toLocaleDateString()}

---

`;

  const categories: ManufacturingChecklistItem['category'][] = ["Schematic", "PCB Layout", "BOM", "Assembly", "Testing", "Compliance", "Mechanical", "Export"];
  
  categories.forEach(cat => {
    const items = manufacturingChecklist.filter(mc => mc.category === cat);
    if (items.length === 0) return;

    md += `## ${cat} Verification Checks\n`;
    items.forEach(mc => {
      let checkChar = " ";
      if (mc.status === 'Done') checkChar = "x";
      else if (mc.status === 'Blocked') checkChar = "!";
      
      md += `- [${checkChar}] **${mc.item}** (Owner Notes: ${mc.ownerNotes || 'None'})\n`;
      if (mc.status === 'Blocked' && mc.blockingReason) {
        md += `  > **[!WARNING]** BLOCKER: ${mc.blockingReason}\n`;
      }
    });
    md += `\n`;
  });

  return md;
};
