import { Project } from '../types';
import { calculateReadinessScore } from './readinessScore';

export const exportBlueprintSheetsJson = (project: Project): string => {
  const report = calculateReadinessScore(project);
  const data = {
    generator: "Hardware Studio Blueprint Sheets Compiler",
    generatedAt: new Date().toISOString(),
    projectName: project.projectName,
    version: project.version || "1.0",
    readinessScore: report.overallScore,
    sheets: [
      { id: "overview", name: "Product Overview Sheet", elements: project.nodes?.length || 0 },
      { id: "outer", name: "Outer Design Sheet", substrate: project.boards?.[0]?.substrate || "Flex" },
      { id: "internal", name: "Internal Layout Sheet", boardsCount: project.boards?.length || 0 },
      { id: "assembly", name: "Exploded Assembly Sheet", componentsCount: project.boardComponents?.length || 0 },
      { id: "board", name: "Board Blueprint Sheet", boardSpecs: project.boards || [] },
      { id: "components", name: "Component Placement Sheet", components: project.boardComponents || [] },
      { id: "circuits", name: "Circuit Map Sheet", circuits: project.circuitBlocks || [] },
      { id: "nets", name: "Net Routing Sheet", nets: project.nets || [] },
      { id: "power", name: "Power Tree Sheet", budget: project.powerBudget || [] },
      { id: "firmware", name: "Firmware Flow Sheet", tasks: project.firmwareTasks || [] },
      { id: "testing", name: "Testing Flow Sheet", protocols: project.testing || [] },
      { id: "mfg", name: "Manufacturing Handoff Sheet", checks: project.manufacturingChecklist || [] }
    ]
  };
  return JSON.stringify(data, null, 2);
};

export const exportBlueprintSheetsMarkdown = (project: Project): string => {
  const report = calculateReadinessScore(project);
  const { projectName, boards = [], boardComponents = [], nets = [] } = project;

  return `# MANUFACTURING BLUEPRINT PACKAGE (CONCEPT PREPARATION)
**Project**: ${projectName}
**Date Generated**: ${new Date().toLocaleDateString()}
**Workspace Version**: ${project.version || "1.0"}
**Readiness Index**: ${report.overallScore}/100

---

## SHEET 1: PRODUCT OVERVIEW ARCHITECTURE
- Active block nodes: ${project.nodes?.length || 0}
- Connection links: ${project.edges?.length || 0}
- Readiness gate checks:
  * ECAD ready: ${report.canMoveToEcad ? 'Passed' : 'Pending'}
  * Prototype ready: ${report.canMoveToPrototype ? 'Passed' : 'Pending'}
  * Factory handoff: ${report.canMoveToFactoryHandoff ? 'Passed' : 'Pending'}

## SHEET 2: OUTER DESIGN SHELL
- Physical contour type: ${projectName.toLowerCase().includes("ring") ? 'Curved circular ring' : 'Rectangular case'}
- Wearable skin protection certification: ${project.manufacturingChecklist?.some(m => m.item.includes("skin") && m.status === 'Done') ? 'Completed' : 'Pending'}

## SHEET 3: INTERNAL ASSEMBLY SCHEMATIC
- Defined boards outlines: ${boards.map(b => b.name).join(', ') || 'None'}
- Assembly layers: Outer enclosure shell, Flex circuitry layer, battery cell, inner backing.

## SHEET 4: BOARD PLAN SPECIFICATION
${boards.map((b, idx) => `
### Board ${idx + 1}: ${b.name}
- Type: ${b.boardType}
- Dimensions: ${b.dimensionsMm || 'TBD'} mm
- Layer count: ${b.layerCount || 'TBD'} layers
- Substrate: ${b.substrate}
- Mounting: ${b.mountingNotes || 'TBD'}
`).join('\n')}

## SHEET 5: COMPONENT PLACEMENT CONCEPT
- Components to place: ${boardComponents.length} parts
${boardComponents.map(bc => `- **${bc.referenceDesignator}**: ${bc.componentName} (${bc.packageName}, Side: ${bc.side})`).join('\n')}

## SHEET 6: CIRCUIT NETLIST SCHEMATICS
- Netlist items: ${nets.length} lines
- Signaling tracks:
${nets.map(n => `- **${n.netName}** (${n.netType}, Voltage: ${n.voltage || 'TBD'}): Source ${n.sourceComponent}:${n.sourcePin} -> Target ${n.targetComponent}:${n.targetPin}`).join('\n')}

## SHEET 7: POWER TREE SPECIFICATION
- Average Current load: ${project.powerBudget?.reduce((sum, item) => sum + (item.activeCurrentMa * (item.dutyCyclePercent / 100) * (item.quantity || 1)), 0).toFixed(2) || '0'} mA
- Estimated run hours: ${project.batteryCapacityMah && project.powerBudget?.length > 0 ? (project.batteryCapacityMah / project.powerBudget.reduce((sum, item) => sum + (item.activeCurrentMa * (item.dutyCyclePercent / 100) * (item.quantity || 1)), 0)).toFixed(1) : 'TBD'} hours
`;
};

export const exportBlueprintSheetsHtml = (project: Project): string => {
  const report = calculateReadinessScore(project);
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Blueprint Pack - ${project.projectName}</title>
  <style>
    body { font-family: monospace; padding: 40px; background: #fafafa; color: #333; line-height: 1.5; }
    .sheet { background: #fff; border: 2px solid #334155; padding: 40px; margin-bottom: 40px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); position: relative; }
    .grid { position: absolute; top: 0; left: 0; right: 0; bottom: 0; pointer-events: none; opacity: 0.05; background-size: 20px 20px; background-image: linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px); }
    h1, h2, h3 { color: #0f172a; text-transform: uppercase; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .title-block { border: 2px solid #334155; padding: 15px; display: flex; justify-content: space-between; font-size: 11px; margin-top: 50px; font-weight: bold; background: #f8fafc; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
    th { background: #f1f5f9; }
    .badge { padding: 2px 6px; font-weight: bold; border-radius: 3px; font-size: 9px; border: 1px solid #ccc; }
    .badge-pass { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
    .badge-fail { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="grid"></div>
    <h1>Factory Handoff Preparation Blueprint</h1>
    <p><strong>Project Name</strong>: ${project.projectName}</p>
    <p><strong>Description</strong>: ${project.description || 'N/A'}</p>
    <p><strong>Generated Date</strong>: ${new Date().toLocaleDateString()}</p>
    <p><strong>Readiness Score</strong>: ${report.overallScore}/100</p>
    
    <h2>Gateway Releases status</h2>
    <table>
      <thead>
        <tr>
          <th>Gate Name</th>
          <th>Status</th>
          <th>Requirement Heuristics</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>ECAD Ready Gate</td>
          <td><span class="badge ${report.canMoveToEcad ? 'badge-pass' : 'badge-fail'}">${report.canMoveToEcad ? 'PASSED' : 'LOCKED'}</span></td>
          <td>Requires active boards, circuits, components, netlist and 0 blockers.</td>
        </tr>
        <tr>
          <td>Prototype Ready Gate</td>
          <td><span class="badge ${report.canMoveToPrototype ? 'badge-pass' : 'badge-fail'}">${report.canMoveToPrototype ? 'PASSED' : 'LOCKED'}</span></td>
          <td>Requires BOM, Power budget, Pin router, Testing list, and readiness score >70.</td>
        </tr>
        <tr>
          <td>Factory Ready Gate</td>
          <td><span class="badge ${report.canMoveToFactoryHandoff ? 'badge-pass' : 'badge-fail'}">${report.canMoveToFactoryHandoff ? 'PASSED' : 'LOCKED'}</span></td>
          <td>Requires completed pre-layout checklist review and readiness score >85.</td>
        </tr>
      </tbody>
    </table>

    <div class="title-block">
      <div>
        <span>PROJECT: ${project.projectName}</span><br>
        <span>REVISION: ${project.version || '1.0'}</span>
      </div>
      <div>
        <span>COMPILED BY SYSTEM ALPHA BUILDER</span><br>
        <span>STATUS: CONCEPTUAL PREPARATION</span>
      </div>
    </div>
  </div>
</body>
</html>
`;
};
