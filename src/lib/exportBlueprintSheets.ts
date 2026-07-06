import { Project } from '../types';
import { calculateReadinessScore } from './readinessScore';

// Helper: Calculate average system current
const totalAvgCurrent = (project: Project): number => {
  if (!project.powerBudget) return 0;
  return project.powerBudget.reduce((sum, item) => {
    const active = item.activeCurrentMa || 0;
    const duty = (item.dutyCyclePercent || 0) / 100;
    const qty = item.quantity || 1;
    return sum + (active * duty * qty);
  }, 0);
};

export const exportBlueprintSheetsJson = (project: Project): string => {
  const report = calculateReadinessScore(project);
  const totalAvg = totalAvgCurrent(project);
  const runtime = totalAvg > 0 ? ((project.batteryCapacityMah || 18) / totalAvg).toFixed(1) : "0.0";

  const data = {
    generator: "Hardware Studio Blueprint Drawing Compiler v2",
    generatedAt: new Date().toISOString(),
    projectName: project.projectName,
    version: project.version || "1.0",
    readinessScore: report.overallScore,
    releaseGates: {
      planningReady: report.isPlanningReady,
      blueprintPackReady: report.isBlueprintPackReady,
      editorLayoutReady: report.isEditorLayoutReady,
      prototypeReady: report.canMoveToPrototype,
      factoryHandoffReady: report.canMoveToFactoryHandoff,
      fabricationReady: report.canMoveToFabrication
    },
    blockers: report.blockers,
    warnings: report.warnings,
    sheets: [
      {
        sheetNum: 1,
        title: "Cover / Product Release Index",
        group: "0. RELEASE INDEX",
        stats: {
          boardsCount: project.boards?.length || 0,
          circuitsCount: project.circuitBlocks?.length || 0,
          componentsCount: project.boardComponents?.length || 0,
          netsCount: project.nets?.length || 0,
          firmwareTasksCount: project.firmwareTasks?.length || 0,
          testStagesCount: project.testing?.length || 0,
          checklistCount: project.manufacturingChecklist?.length || 0
        }
      },
      {
        sheetNum: 2,
        title: "Product Architecture Blueprint",
        group: "1. MECHANICAL & ARCHITECTURE",
        nodes: project.nodes?.filter(n => n.type !== 'boundaryNode').map(n => ({
          name: n.data.name,
          category: n.data.category,
          status: n.data.status,
          priority: n.data.priority || "Medium",
          purpose: n.data.purpose || n.data.description
        })) || []
      },
      {
        sheetNum: 3,
        title: "Mechanical Outer Shell Blueprint",
        group: "1. MECHANICAL & ARCHITECTURE",
        dimensions: project.pcbConstraints?.find(c => c.constraintType === 'Board Outline')?.value || (project.projectName.toLowerCase().includes("ring") ? "18.5" : "45.0"),
        unit: project.pcbConstraints?.find(c => c.constraintType === 'Board Outline')?.unit || "mm"
      },
      {
        sheetNum: 4,
        title: "Internal Layout Blueprint",
        group: "1. MECHANICAL & ARCHITECTURE",
        boards: project.boards?.map(b => ({ name: b.name, substrate: b.substrate, placement: b.placement })) || []
      },
      {
        sheetNum: 5,
        title: "Exploded Assembly Blueprint",
        group: "1. MECHANICAL & ARCHITECTURE",
        steps: [
          "Outer Protection Metal Shell",
          "Waterproof Epoxy Gasket",
          "Main Flex / Rigid PCB Core",
          "Curved Battery Pouch (BT1)",
          "Haptic Vibration Motor",
          "Inner Comfort Sleeve"
        ]
      },
      {
        sheetNum: 6,
        title: "Board / PCB Blueprint",
        group: "2. PCB / BOARD BLUEPRINTS",
        boards: project.boards?.map(b => ({
          name: b.name,
          type: b.boardType,
          dimensions: b.dimensionsMm || "DIMENSION REQUIRED",
          substrate: b.substrate,
          layers: b.layerCount
        })) || []
      },
      {
        sheetNum: 7,
        title: "PCB Stackup & Constraint Blueprint",
        group: "2. PCB / BOARD BLUEPRINTS",
        constraints: project.pcbConstraints?.map(c => ({
          type: c.constraintType,
          value: `${c.value} ${c.unit}`,
          severity: c.severity,
          desc: c.description
        })) || []
      },
      {
        sheetNum: 8,
        title: "Component Placement Blueprint",
        group: "2. PCB / BOARD BLUEPRINTS",
        components: project.boardComponents?.map(c => ({
          refDes: c.referenceDesignator,
          name: c.componentName,
          type: c.componentType,
          package: c.packageName || c.footprint || "FOOTPRINT REQUIRED",
          side: c.side,
          criticality: c.placementCriticality
        })) || []
      },
      {
        sheetNum: 9,
        title: "Electrical Circuit Blueprint Pack",
        group: "3. ELECTRICAL & CIRCUITS",
        circuits: project.circuitBlocks?.map(c => ({
          name: c.name,
          type: c.circuitType,
          refDes: c.referenceDesignators || "REQUIRED",
          powerNets: c.powerNets || "NET REQUIRED",
          signalNets: c.signalNets || "NET REQUIRED"
        })) || []
      },
      {
        sheetNum: 10,
        title: "Net Routing Blueprint",
        group: "3. ELECTRICAL & CIRCUITS",
        nets: project.nets?.map(n => ({
          name: n.netName,
          type: n.netType,
          voltage: n.voltage || "TBD",
          source: `${n.sourceComponent || '?'}:${n.sourcePin || '?'}`,
          target: `${n.targetComponent || '?'}:${n.targetPin || '?'}`
        })) || []
      },
      {
        sheetNum: 11,
        title: "Power Tree Blueprint",
        group: "3. ELECTRICAL & CIRCUITS",
        batteryCapacityMah: project.batteryCapacityMah || 18,
        averageLoadMa: totalAvg,
        estRuntimeHours: runtime,
        budget: project.powerBudget || []
      },
      {
        sheetNum: 12,
        title: "Pin Map / MCU Interface Blueprint",
        group: "3. ELECTRICAL & CIRCUITS",
        pinout: project.pinMap?.map(p => ({
          signal: p.signalName,
          pin: p.mcuPin,
          protocol: p.protocol,
          direction: p.direction,
          block: p.connectedBlock
        })) || []
      },
      {
        sheetNum: 13,
        title: "Firmware Architecture Blueprint",
        group: "4. SOFTWARE & FIRMWARE",
        tasks: project.firmwareTasks?.map(t => ({
          name: t.name,
          type: t.type,
          priority: t.priority,
          status: t.status
        })) || []
      },
      {
        sheetNum: 14,
        title: "Testing & Validation Blueprint",
        group: "5. QUALITY & VALIDATION",
        tests: project.testing?.map(t => ({
          name: t.name,
          stage: t.category || "EVT",
          status: t.status,
          criteria: t.passCriteria
        })) || []
      },
      {
        sheetNum: 15,
        title: "Manufacturing Handoff Blueprint",
        group: "6. MANUFACTURING HANDOFF",
        checklist: project.manufacturingChecklist?.map(m => ({
          item: m.item,
          category: m.category,
          status: m.status
        })) || []
      },
      {
        sheetNum: 16,
        title: "Missing Files / Factory Readiness Sheet",
        group: "6. MANUFACTURING HANDOFF",
        missingExternalFiles: [
          "Altium / KiCad project files",
          "Gerber artwork package",
          "Excellon NC Drill code",
          "STEP enclosure mechanical CAD",
          "Pick-and-place CPL centroids",
          "DFM check report",
          "FCC emissions certificates"
        ]
      }
    ]
  };

  return JSON.stringify(data, null, 2);
};

export const exportBlueprintSheetsMarkdown = (project: Project): string => {
  const report = calculateReadinessScore(project);
  const totalAvg = totalAvgCurrent(project);
  const runtime = totalAvg > 0 ? ((project.batteryCapacityMah || 18) / totalAvg).toFixed(1) : "0.0";

  return `# SYSTEM DRAWING SPECIFICATION BLUEPRINT PACKAGE (PRE-ECAD REVIEW)
**Project Name**: ${project.projectName}
**Workspace Version**: ${project.version || "1.0"}
**readiness score**: ${report.overallScore}/100
**Release Gate Status**:
- Planning Verification Gate: **${report.isPlanningReady ? "PASSED" : "LOCKED"}**
- Blueprint Drawing Pack Gate: **${report.isBlueprintPackReady ? "PASSED" : "LOCKED"}**
- CAD Editor Layout Gate: **${report.isEditorLayoutReady ? "PASSED" : "LOCKED"}**
- Prototype Spin Gate: **${report.canMoveToPrototype ? "PASSED" : "LOCKED"}**
- Factory Handoff Gate: **${report.canMoveToFactoryHandoff ? "PASSED" : "LOCKED"}**
- Direct Fabrication Gate: **${report.canMoveToFabrication ? "PASSED" : "LOCKED"}**

> [!WARNING]
> **DISCLAIMER & ENGINEERING LIMITATION NOTICE**: This document represents conceptual schematic, wiring, mechanical, and stackup specifications. This is not factory production-ready Gerber, NC Drill, or STEP CAD artwork. All drawings require review by a certified hardware engineer before PCB procurement.

---

## SH 01: COVER / PRODUCT RELEASE INDEX
- **Template Name**: ${project.templateName || "Custom"}
- **PCBs Configured**: ${project.boards?.length || 0} boards
- **Circuits Blocks**: ${project.circuitBlocks?.length || 0} modules
- **Components Placed**: ${project.boardComponents?.length || 0} parts
- **Net Routing Paths**: ${project.nets?.length || 0} tracks

## SH 02: PRODUCT ARCHITECTURE BLUEPRINT
- **Grouped Categories**:
${project.nodes?.filter(n => n.type !== 'boundaryNode').map(n => `  * **${n.data.name}** [${n.data.category}]: status: ${n.data.status} | priority: ${n.data.priority || "Medium"}`).join('\n')}

## SH 03: MECHANICAL OUTER SHELL BLUEPRINT
- **Wearable Arc Casing**: ${project.projectName.toLowerCase().includes("ring") ? "Wearable ring outer dimensions" : "Standard box shell"}
- **Casing target Width**: ${project.pcbConstraints?.find(c => c.constraintType === 'Board Outline')?.value || "DIMENSION REQUIRED"} mm

## SH 04: INTERNAL LAYOUT BLUEPRINT
- **Stackup Zones**:
  1. Main flex board carrier slot.
  2. Curved LiPo battery cell pouch.
  3. LRA vibration haptic motor cavity.
  4. BLE antenna keepout ground copper-free window.

## SH 05: EXPLODED ASSEMBLY BLUEPRINT
- **Assembly Steps**:
  1. Outer protect metal shield loop casing.
  2. Epoxy waterproof seal gasket adhesive line.
  3. Flexible/rigid printed circuit board stack.
  4. Battery pouch and dampening spacer slot.
  5. Haptic actuator motor cavity mount.
  6. Inner bio-compatible sleeve liner insert.

## SH 06: BOARD / PCB BLUEPRINT
${project.boards?.map(b => `- **${b.name}** [${b.boardType}]: Substrate: ${b.substrate} | Layers: ${b.layerCount} | Outline: ${b.dimensionsMm || "DIMENSION REQUIRED"}`).join('\n')}

## SH 07: PCB STACKUP & CONSTRAINT BLUEPRINT
- **Active Constraints**:
${project.pcbConstraints?.map(c => `  * **${c.constraintType}**: Value: ${c.value} ${c.unit} | Severity: ${c.severity} | ${c.description}`).join('\n')}

## SH 08: COMPONENT PLACEMENT BLUEPRINT
- **Footprints directory**:
${project.boardComponents?.map(c => `  * **${c.referenceDesignator}**: ${c.componentName} | Package: ${c.packageName || c.footprint || "FOOTPRINT REQUIRED"} | Side: ${c.side} | Criticality: ${c.placementCriticality}`).join('\n')}

## SH 09: ELECTRICAL CIRCUIT BLUEPRINT PACK
- **Circuit modules list**:
${project.circuitBlocks?.map(c => `  * **${c.name}** [${c.circuitType}]: RefDes: ${c.referenceDesignators || "REQUIRED"} | power nets: ${c.powerNets || "REQUIRED"} | signals: ${c.signalNets || "REQUIRED"}`).join('\n')}

## SH 10: NET ROUTING BLUEPRINT
- **Net list connections**:
${project.nets?.map(n => `  * **${n.netName}** [${n.netType}]: ${n.sourceComponent || '?'}:${n.sourcePin || '?'} -> ${n.targetComponent || '?'}:${n.targetPin || '?'} | V: ${n.voltage}`).join('\n')}

## SH 11: POWER TREE BLUEPRINT
- **Battery Capacity**: ${project.batteryCapacityMah || 18} mAh
- **Continuous System load current**: ${totalAvg.toFixed(3)} mA Average
- **Estimated Runtime**: ${runtime} Hours
- **Loads Budget**:
${project.powerBudget?.map(p => `  * **${p.blockName}**: Active: ${p.activeCurrentMa}mA | sleep: ${p.sleepCurrentUa}uA | duty cycle: ${p.dutyCyclePercent}%`).join('\n')}

## SH 12: PIN MAP / MCU INTERFACE BLUEPRINT
- **Controller Pin Map**:
${project.pinMap?.map(p => `  * **${p.signalName}**: MCU Pin: ${p.mcuPin} | protocol: ${p.protocol} | direction: ${p.direction} | connected block: ${p.connectedBlock}`).join('\n')}

## SH 13: FIRMWARE ARCHITECTURE BLUEPRINT
- **Scheduled firmware tasks**:
${project.firmwareTasks?.map(t => `  * **${t.name}** [${t.type}]: status: ${t.status} | priority: ${t.priority}`).join('\n')}

## SH 14: TESTING & VALIDATION BLUEPRINT
- **Test protocols checklist**:
${project.testing?.map(t => `  * **${t.name}** [${t.category || "EVT"}]: status: ${t.status} | criteria: ${t.passCriteria}`).join('\n')}

## SH 15: MANUFACTURING HANDOFF BLUEPRINT
- **Completed checklist count**: ${project.manufacturingChecklist?.filter(m => m.status === 'Done').length || 0} / ${project.manufacturingChecklist?.length || 0} items
- **Blockers list**:
${report.blockers.map(b => `  * [BLOCKER] ${b}`).join('\n')}

## SH 16: MISSING FILES / FACTORY READINESS SHEET
- **Required design CAD files not generated**:
  * Gerber artwork ZIP package - **NOT GENERATED YET**
  * NC Drill files CNC code - **NOT GENERATED YET**
  * Altium / KiCad project schematic database - **NOT GENERATED YET**
  * Enclosure shell STEP mechanical model - **NOT GENERATED YET**
  * Pick-and-place coordinate CPL centroid - **CONCEPTUAL ONLY**
  * Verification schematic checklist ERC - **ECAD REVIEW REQUIRED**
  * DFM bring-up checks review - **REQUIRED BEFORE FABRICATE**
`;
};

export const exportBlueprintSheetsHtml = (project: Project): string => {
  const report = calculateReadinessScore(project);
  const totalAvg = totalAvgCurrent(project);
  const runtime = totalAvg > 0 ? ((project.batteryCapacityMah || 18) / totalAvg).toFixed(1) : "0.0";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Engineering drawings blueprint pack - ${project.projectName}</title>
  <style>
    body { font-family: monospace; padding: 20px; background: #f0f2f5; color: #1e293b; font-size: 10px; }
    .sheet { background: #ffffff; border: 3px double #1e293b; padding: 30px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); position: relative; min-height: 800px; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; box-sizing: border-box; }
    .grid-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; opacity: 0.03; background-size: 20px 20px; background-image: linear-gradient(to right, #0284c7 1px, transparent 1px), linear-gradient(to bottom, #0284c7 1px, transparent 1px); }
    h2, h3 { color: #0f172a; text-transform: uppercase; border-bottom: 2px solid #1e293b; padding-bottom: 3px; }
    .title-block { border: 2px solid #1e293b; padding: 8px; display: grid; grid-template-cols: 2fr 1fr 1fr; font-size: 9px; margin-top: 20px; font-weight: bold; background: #fff; }
    .title-block > div { border-right: 1px solid #1e293b; padding: 4px; }
    .title-block > div:last-child { border-right: none; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9px; }
    th, td { border: 1px solid #cbd5e1; padding: 5px; text-align: left; }
    th { background: #f8fafc; }
    .stamp-warning { border: 2px dashed #ef4444; color: #ef4444; padding: 4px; font-weight: bold; display: inline-block; font-size: 8px; margin-top: 10px; text-transform: uppercase; }
    .disclaimer-page { font-size: 7.5px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 5px; margin-top: 15px; text-align: center; }
    @media print {
      body { background: white; padding: 0; margin: 0; }
      .sheet { box-shadow: none; margin-bottom: 0; border: 2px solid black; }
    }
  </style>
</head>
<body>

  <!-- SHEET 1 -->
  <div class="sheet">
    <div class="grid-overlay"></div>
    <div>
      <h2>SH 01: Cover / Product Release Index</h2>
      <p>System compilation index metadata and gateway release locks audit status.</p>
      <table>
        <tr><td>Project Name</td><td><strong>${project.projectName}</strong></td></tr>
        <tr><td>Template Type</td><td>${project.templateName || "Custom"}</td></tr>
        <tr><td>Workspace Version</td><td>${project.version || "1.0"}</td></tr>
        <tr><td>Overall Readiness Index</td><td><strong>${report.overallScore} / 100</strong></td></tr>
        <tr><td>Planning Verification Gate</td><td><strong>${report.isPlanningReady ? "PASSED" : "LOCKED"}</strong></td></tr>
        <tr><td>Blueprint Drawing Pack Gate</td><td><strong>${report.isBlueprintPackReady ? "PASSED" : "LOCKED"}</strong></td></tr>
        <tr><td>CAD Editor Layout Gate</td><td><strong>${report.isEditorLayoutReady ? "PASSED" : "LOCKED"}</strong></td></tr>
        <tr><td>Prototype Spin Gate</td><td><strong>${report.canMoveToPrototype ? "PASSED" : "LOCKED"}</strong></td></tr>
        <tr><td>Factory Handoff Gate</td><td><strong>${report.canMoveToFactoryHandoff ? "PASSED" : "LOCKED"}</strong></td></tr>
        <tr><td>Direct Fabrication Gate</td><td><strong>${report.canMoveToFabrication ? "PASSED" : "LOCKED"}</strong></td></tr>
      </table>
      <div class="stamp-warning">Conceptual engineering prep only - All specifications require final hardware engineer review</div>
    </div>
    <div>
      <div class="disclaimer-page">* NOT FOR FACTORY FABRICATION RELEASE. REQUIRES OUTSIDE CAD WORKSPACE GENERATION.</div>
      <div class="title-block">
        <div>PROJECT: ${project.projectName} | TITLE: PRODUCT COVER INDEX</div>
        <div>SHEET: SH 01 OF 16</div>
        <div>REV: ${project.version || '1.0'}</div>
      </div>
    </div>
  </div>

  <!-- SHEET 2 -->
  <div class="sheet">
    <div class="grid-overlay"></div>
    <div>
      <h2>SH 02: Product Architecture Blueprint</h2>
      <p>Logical subsystem node blocks and status classifications.</p>
      <table>
        <thead>
          <tr><th>Block Node</th><th>Category</th><th>Design Status</th><th>Priority</th></tr>
        </thead>
        <tbody>
          ${project.nodes?.filter(n => n.type !== 'boundaryNode').map(n => `
            <tr>
              <td><strong>${n.data.name}</strong></td>
              <td>${n.data.category}</td>
              <td>${n.data.status}</td>
              <td>${n.data.priority || "Medium"}</td>
            </tr>
          `).join('') || "<tr><td colspan='4'>No nodes found</td></tr>"}
        </tbody>
      </table>
    </div>
    <div>
      <div class="disclaimer-page">* NOT FOR FACTORY FABRICATION RELEASE. REQUIRES OUTSIDE CAD WORKSPACE GENERATION.</div>
      <div class="title-block">
        <div>PROJECT: ${project.projectName} | TITLE: PRODUCT ARCHITECTURE</div>
        <div>SHEET: SH 02 OF 16</div>
        <div>REV: ${project.version || '1.0'}</div>
      </div>
    </div>
  </div>

  <!-- SHEET 6 -->
  <div class="sheet">
    <div class="grid-overlay"></div>
    <div>
      <h2>SH 06: Board / PCB Blueprint</h2>
      <p>Defined physical PCBs substrates and dimensions configuration.</p>
      <table>
        <thead>
          <tr><th>Board Name</th><th>PCB type</th><th>Substrate</th><th>Layers</th><th>Dimensions</th></tr>
        </thead>
        <tbody>
          ${project.boards?.map(b => `
            <tr>
              <td><strong>${b.name}</strong></td>
              <td>${b.boardType}</td>
              <td>${b.substrate}</td>
              <td>${b.layerCount}</td>
              <td><strong>${b.dimensionsMm || "DIMENSION REQUIRED"} mm</strong></td>
            </tr>
          `).join('') || "<tr><td colspan='5'>No boards configured</td></tr>"}
        </tbody>
      </table>
    </div>
    <div>
      <div class="disclaimer-page">* NOT FOR FACTORY FABRICATION RELEASE. REQUIRES OUTSIDE CAD WORKSPACE GENERATION.</div>
      <div class="title-block">
        <div>PROJECT: ${project.projectName} | TITLE: BOARD SPECIFICATIONS</div>
        <div>SHEET: SH 06 OF 16</div>
        <div>REV: ${project.version || '1.0'}</div>
      </div>
    </div>
  </div>

  <!-- SHEET 8 -->
  <div class="sheet">
    <div class="grid-overlay"></div>
    <div>
      <h2>SH 08: Component Placement Blueprint</h2>
      <p>smt footprints placement reference designators directory.</p>
      <table>
        <thead>
          <tr><th>RefDes</th><th>Part Name</th><th>Package</th><th>Mount Side</th><th>Placement Criticality</th></tr>
        </thead>
        <tbody>
          ${project.boardComponents?.map(c => `
            <tr>
              <td><strong>${c.referenceDesignator}</strong></td>
              <td>${c.componentName}</td>
              <td>${c.packageName || c.footprint || "FOOTPRINT REQUIRED"}</td>
              <td>${c.side}</td>
              <td>${c.placementCriticality}</td>
            </tr>
          `).join('') || "<tr><td colspan='5'>No components mapped</td></tr>"}
        </tbody>
      </table>
    </div>
    <div>
      <div class="disclaimer-page">* NOT FOR FACTORY FABRICATION RELEASE. REQUIRES OUTSIDE CAD WORKSPACE GENERATION.</div>
      <div class="title-block">
        <div>PROJECT: ${project.projectName} | TITLE: SMT COMPONENTS LAYOUT</div>
        <div>SHEET: SH 08 OF 16</div>
        <div>REV: ${project.version || '1.0'}</div>
      </div>
    </div>
  </div>

  <!-- SHEET 11 -->
  <div class="sheet">
    <div class="grid-overlay"></div>
    <div>
      <h2>SH 11: Power Tree Blueprint</h2>
      <p>Regulator converter stages and continuous average current loads estimates.</p>
      <p>Continuous Draw: <strong>${totalAvg.toFixed(3)} mA avg</strong> | Runtime: <strong>${runtime} Hours</strong></p>
      <table>
        <thead>
          <tr><th>Load Block</th><th>Active Draw</th><th>Sleep Draw</th><th>Duty Cycle</th><th>Qty</th></tr>
        </thead>
        <tbody>
          ${project.powerBudget?.map(p => `
            <tr>
              <td><strong>${p.blockName}</strong></td>
              <td>${p.activeCurrentMa} mA</td>
              <td>${p.sleepCurrentUa} uA</td>
              <td>${p.dutyCyclePercent}%</td>
              <td>${p.quantity}</td>
            </tr>
          `).join('') || "<tr><td colspan='5'>No power budget items</td></tr>"}
        </tbody>
      </table>
    </div>
    <div>
      <div class="disclaimer-page">* NOT FOR FACTORY FABRICATION RELEASE. REQUIRES OUTSIDE CAD WORKSPACE GENERATION.</div>
      <div class="title-block">
        <div>PROJECT: ${project.projectName} | TITLE: POWER REGULATORS TREE</div>
        <div>SHEET: SH 11 OF 16</div>
        <div>REV: ${project.version || '1.0'}</div>
      </div>
    </div>
  </div>

  <!-- SHEET 16 -->
  <div class="sheet">
    <div class="grid-overlay"></div>
    <div>
      <h2>SH 16: Missing Files / Factory Readiness Sheet</h2>
      <p>Missing external layout files audits and certifications verification checklist.</p>
      <table>
        <thead>
          <tr><th>Required CAD Asset</th><th>Audit Status</th></tr>
        </thead>
        <tbody>
          <tr><td>Altium / KiCad project schematics</td><td><span class="stamp-warning" style="margin-top:0;">NOT GENERATED YET</span></td></tr>
          <tr><td>Gerber RS-274X artwork package (copper layers L1-L4)</td><td><span class="stamp-warning" style="margin-top:0;">NOT GENERATED YET</span></td></tr>
          <tr><td>Excellon NC Drill CNC coordinates</td><td><span class="stamp-warning" style="margin-top:0;">NOT GENERATED YET</span></td></tr>
          <tr><td>STEP enclosure casing mechanical model</td><td><span class="stamp-warning" style="margin-top:0;">NOT GENERATED YET</span></td></tr>
          <tr><td>Pick-and-place coordinate CPL centroids</td><td><span class="stamp-warning" style="margin-top:0; border-color:orange; color:orange;">CONCEPTUAL ONLY</span></td></tr>
        </tbody>
      </table>
    </div>
    <div>
      <div class="disclaimer-page">* NOT FOR FACTORY FABRICATION RELEASE. REQUIRES OUTSIDE CAD WORKSPACE GENERATION.</div>
      <div class="title-block">
        <div>PROJECT: ${project.projectName} | TITLE: FACTORY FILE INDEX</div>
        <div>SHEET: SH 16 OF 16</div>
        <div>REV: ${project.version || '1.0'}</div>
      </div>
    </div>
  </div>

</body>
</html>
`;
};
