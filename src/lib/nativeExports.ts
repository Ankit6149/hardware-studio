import crypto from 'crypto';
import { Project } from '../types';
import { calculateReadinessScore } from './readinessScore';
import { evaluateManufacturingContext, assertManufacturingContext } from './manufacturing/manufacturingContext';
import {
  exportBomCsv,
  generateNativeBoardLayoutJson,
  generateNativeCplDraftCsv,
  generateNativeExcellonDrills,
  generateNativeGerberCopperTop,
  generateNativeNetlistJson,
} from './manufacturing/nativePcbExports';

export {
  exportBomCsv,
  exportHardwareStudioBoardJson,
  generateNativeBoardLayoutJson,
  generateNativeCplDraftCsv,
  generateNativeExcellonDrills,
  generateNativeGerberBoardOutline,
  generateNativeGerberBottomMask,
  generateNativeGerberBottomPaste,
  generateNativeGerberCopperBottom,
  generateNativeGerberCopperTop,
  generateNativeGerberTopMask,
  generateNativeGerberTopPaste,
  generateNativeGerberTopSilkscreen,
  generateNativeNetlistJson,
} from './manufacturing/nativePcbExports';

function sha256(content: string): string {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

function byteLength(content: string): number {
  return new TextEncoder().encode(content).length;
}

export const exportEditorLayoutsJson = (project: Project): string => JSON.stringify({
  projectName: project.projectName,
  updatedAt: project.updatedAt,
  editorLayouts: project.editorLayouts || {},
  editorConnections: project.editorConnections || [],
  qualification: 'UI workspace layout only',
  disclaimer: 'Editor canvas coordinates are presentation state and must never be interpreted as CAD, PCB placement, drill, or manufacturing geometry.',
}, null, 2);

export const exportConceptualPlacementCsv = (project: Project): string => generateNativeCplDraftCsv(project);

export const exportConceptualSchematicJson = (project: Project): string => JSON.stringify({
  projectName: project.projectName,
  circuitBlocks: project.circuitBlocks || [],
  components: (project.boardComponents || []).map((component) => ({
    id: component.id,
    referenceDesignator: component.referenceDesignator,
    name: component.componentName,
    circuitBlockId: component.circuitBlockId,
    pins: component.pins || [],
  })),
  symbols: project.schematicSymbols || [],
  wires: project.schematicWires || [],
  connections: project.schematicConnections || [],
  nets: project.nets || [],
  disclaimer: 'Structured schematic project data. Independent ERC and interchange qualification are required before release claims.',
}, null, 2);

export const exportConceptualMechanicalLayoutJson = (project: Project): string => JSON.stringify({
  projectName: project.projectName,
  boards: project.boards || [],
  boardOutlines: project.boardOutlines || [],
  mechanicalZones: project.mechanicalZones || [],
  mechanicalObjects: project.mechanicalObjects || [],
  mechanicalDimensions: project.mechanicalDimensions || [],
  mechanicalBodies: project.mechanicalBodies || [],
  assemblyLayers: project.assemblyLayers || [],
  disclaimer: 'Recorded mechanical project data. Visualization objects are not automatically exact CAD solids.',
}, null, 2);

export const exportConceptualNetRoutingJson = (project: Project): string => generateNativeNetlistJson(project);

export const exportFirmwareArchitectureJson = (project: Project): string => JSON.stringify({
  projectName: project.projectName,
  configuration: project.firmwareConfiguration || null,
  modules: project.firmwareModules || [],
  states: project.firmwareStates || [],
  transitions: project.firmwareTransitions || [],
  sourceFiles: project.firmwareSourceFiles || [],
  buildRecords: project.firmwareBuildRecords || [],
  legacyTasks: project.firmwareTasks || [],
  disclaimer: 'Export contains only recorded firmware project state. No state machine, device result, or build evidence is synthesized.',
}, null, 2);

export const exportTestingPlanJson = (project: Project): string => JSON.stringify({
  projectName: project.projectName,
  validationTests: project.validationTests || [],
  validationRuns: project.validationRuns || [],
  legacyTesting: project.testing || [],
  disclaimer: 'Validation definitions and recorded runs only. Missing measurements, evidence, operator identity, or review remain unresolved.',
}, null, 2);

export const exportFactoryReadinessJson = (project: Project): string => {
  const report = calculateReadinessScore(project);
  const manufacturing = evaluateManufacturingContext(project);
  return JSON.stringify({
    projectName: project.projectName,
    readinessScore: report.overallScore,
    categoriesBreakdown: report.categories,
    blockers: [...report.blockers, ...manufacturing.blockers.map((blocker) => blocker.message)],
    warnings: report.warnings,
    planningReady: report.isPlanningReady,
    blueprintPackReady: report.isBlueprintPackReady,
    prototypeReady: report.canMoveToPrototype,
    factoryHandoffReady: report.canMoveToFactoryHandoff && manufacturing.ready,
    directFabricationReady: report.canMoveToFabrication && manufacturing.ready,
    manufacturingPreflight: manufacturing,
    generatedAt: new Date().toISOString(),
    disclaimer: 'Readiness is a planning gate, not independent engineering qualification. Manufacturing output remains draft until external review evidence is recorded.',
  }, null, 2);
};

export const exportMissingFactoryFilesMarkdown = (project: Project): string => {
  const manufacturing = evaluateManufacturingContext(project);
  const factoryFiles = project.factoryFiles || {};
  let markdown = `# Factory Handoff Audit — ${project.projectName}\n\n`;
  markdown += `Manufacturing preflight: **${manufacturing.ready ? 'PASS FOR DRAFT GENERATION' : 'BLOCKED'}**\n\n`;
  if (manufacturing.blockers.length > 0) {
    markdown += '## Engineering blockers\n\n';
    manufacturing.blockers.forEach((blocker) => { markdown += `- ${blocker.message}\n`; });
    markdown += '\n';
  }
  markdown += '## Declared artifact statuses\n\n';
  markdown += '| Artifact | Declared status | Source | Notes |\n|---|---|---|---|\n';
  Object.entries(factoryFiles).forEach(([key, file]) => {
    markdown += `| ${key} | ${file?.status || 'Not Generated'} | ${file?.source || '—'} | ${(file?.notes || '').replace(/\|/g, '\\|')} |\n`;
  });
  markdown += '\n> Declared status is project metadata. It is not proof that a file was generated, parsed, DFM-checked, or independently verified.\n';
  return markdown;
};

export const exportHandoffManifestJson = (project: Project): string => {
  const report = calculateReadinessScore(project);
  const manufacturing = evaluateManufacturingContext(project);
  const factoryFiles = project.factoryFiles || {};
  return JSON.stringify({
    manifestVersion: '2.0.0',
    projectName: project.projectName,
    projectVersion: project.version,
    generatedAt: new Date().toISOString(),
    declaredPackageStatus: project.factoryPackageStatus || 'Draft',
    manufacturingPreflight: manufacturing,
    readiness: {
      planningReady: report.isPlanningReady,
      prototypeReady: report.canMoveToPrototype,
      factoryHandoffReady: report.canMoveToFactoryHandoff && manufacturing.ready,
      directFabricationReady: report.canMoveToFabrication && manufacturing.ready,
    },
    declaredArtifacts: factoryFiles,
    disclaimer: 'Manifest records application state and draft-generation eligibility. Verification requires recorded independent evidence, not a manual status toggle.',
  }, null, 2);
};

export const generateFactoryReviewReadme = (project: Project): string => {
  const manufacturing = evaluateManufacturingContext(project);
  let markdown = `# Factory Review Guide — ${project.projectName}\n\n`;
  markdown += `Project version: **${project.version || 'Unversioned'}**\n\n`;
  markdown += `Manufacturing draft preflight: **${manufacturing.ready ? 'PASS' : 'BLOCKED'}**\n\n`;
  if (manufacturing.blockers.length > 0) {
    markdown += '## Resolve before generating a manufacturing package\n\n';
    manufacturing.blockers.forEach((blocker) => { markdown += `- [ ] ${blocker.message}\n`; });
    markdown += '\n';
  }
  markdown += '## Independent review required\n\n';
  markdown += '- [ ] Open every Gerber layer in an independent viewer.\n';
  markdown += '- [ ] Verify board origin, contour and physical dimensions.\n';
  markdown += '- [ ] Verify every footprint, component side and rotation.\n';
  markdown += '- [ ] Verify drill diameters, plating intent and alignment.\n';
  markdown += '- [ ] Run independent ERC/DRC/DFM checks appropriate to the board.\n';
  markdown += '- [ ] Reconcile BOM manufacturer part numbers and quantities.\n';
  markdown += '- [ ] Compare CPL centroid/origin/rotation against the assembly house convention.\n';
  markdown += '- [ ] Record external qualification evidence before release.\n\n';
  markdown += '> Hardware Studio-generated files are draft engineering outputs until independently qualified. Manual checkboxes alone do not change qualification state.\n';
  return markdown;
};

export function generateReleasePackageManifest(project: Project): string {
  const context = assertManufacturingContext(project);
  const artifacts = [
    { filename: 'gerber_copper_top.gbr', content: generateNativeGerberCopperTop(project) },
    { filename: 'drill_holes.drl', content: generateNativeExcellonDrills(project) },
    { filename: 'board_netlist.json', content: generateNativeNetlistJson(project) },
    { filename: 'cpl_placement.csv', content: generateNativeCplDraftCsv(project) },
    { filename: 'bom_components.csv', content: exportBomCsv(project) },
  ].map((artifact) => ({
    filename: artifact.filename,
    sizeBytes: byteLength(artifact.content),
    sha256: sha256(artifact.content),
  }));

  return JSON.stringify({
    releaseManifestVersion: '2.0.0',
    projectName: project.projectName,
    projectVersion: project.version,
    boardId: context.boardId,
    boardName: context.board.name,
    generatedAt: new Date().toISOString(),
    qualification: 'Draft package generated from explicit canonical project state; independent review pending',
    artifacts,
  }, null, 2);
}

function stlFacet(normal: [number, number, number], a: [number, number, number], b: [number, number, number], c: [number, number, number]): string {
  return `  facet normal ${normal.join(' ')}\n    outer loop\n      vertex ${a.join(' ')}\n      vertex ${b.join(' ')}\n      vertex ${c.join(' ')}\n    endloop\n  endfacet\n`;
}

function boxStl(x: number, y: number, z: number, width: number, height: number, depth: number): string {
  const x2 = x + width;
  const y2 = y + height;
  const z2 = z + depth;
  const p000: [number, number, number] = [x, y, z];
  const p100: [number, number, number] = [x2, y, z];
  const p110: [number, number, number] = [x2, y2, z];
  const p010: [number, number, number] = [x, y2, z];
  const p001: [number, number, number] = [x, y, z2];
  const p101: [number, number, number] = [x2, y, z2];
  const p111: [number, number, number] = [x2, y2, z2];
  const p011: [number, number, number] = [x, y2, z2];

  return [
    stlFacet([0, 0, -1], p000, p110, p100), stlFacet([0, 0, -1], p000, p010, p110),
    stlFacet([0, 0, 1], p001, p101, p111), stlFacet([0, 0, 1], p001, p111, p011),
    stlFacet([0, -1, 0], p000, p100, p101), stlFacet([0, -1, 0], p000, p101, p001),
    stlFacet([0, 1, 0], p010, p011, p111), stlFacet([0, 1, 0], p010, p111, p110),
    stlFacet([-1, 0, 0], p000, p001, p011), stlFacet([-1, 0, 0], p000, p011, p010),
    stlFacet([1, 0, 0], p100, p110, p111), stlFacet([1, 0, 0], p100, p111, p101),
  ].join('');
}

export function exportEnclosureSTL(project: Project): string {
  const objects = project.mechanicalObjects || [];
  if (objects.length === 0) {
    throw new Error('STL export is blocked because no explicit mechanical objects exist.');
  }

  const solidName = `${project.projectName.replace(/\s+/g, '_')}_DRAFT`;
  let stl = `solid ${solidName}\n`;

  for (const object of objects) {
    if (object.shape !== 'rect') {
      throw new Error(`STL export is blocked because ${object.name} uses unsupported ${object.shape} geometry.`);
    }
    if (object.rotationDeg !== 0) {
      throw new Error(`STL export is blocked because ${object.name} has rotation that the current draft mesh serializer cannot preserve.`);
    }
    const { xMm, yMm, widthMm, heightMm, depthMm } = object;
    if (![xMm, yMm, widthMm, heightMm, depthMm].every((value) => typeof value === 'number' && Number.isFinite(value))) {
      throw new Error(`STL export is blocked because ${object.name} has unresolved 3D dimensions.`);
    }
    if ((widthMm as number) <= 0 || (heightMm as number) <= 0 || (depthMm as number) <= 0) {
      throw new Error(`STL export is blocked because ${object.name} has non-positive 3D dimensions.`);
    }
    stl += boxStl(xMm, yMm, 0, widthMm as number, heightMm as number, depthMm as number);
  }

  stl += `endsolid ${solidName}\n`;
  return stl;
}

export { generateNativeBoardLayoutJson as generateNativeBoardLayoutDraftJson };
