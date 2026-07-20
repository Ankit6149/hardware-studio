import { Project } from '../types';
import { migrateProjectSchema as migrateSchemaV4 } from './projectMigrations';

export const CURRENT_SCHEMA_VERSION = 5;

export interface ProjectIntegrityIssue {
  severity: 'Error' | 'Warning' | 'Info';
  domain: string;
  objectId?: string;
  message: string;
}

/** Serialize complete project to formatted JSON */
export function serializeProject(project: Project): string {
  const cleanProject: Project = {
    ...project,
    updatedAt: new Date().toISOString(),
    version: String(CURRENT_SCHEMA_VERSION),
    // Ensure all 24 domain collections exist
    nodes: project.nodes || [],
    edges: project.edges || [],
    bom: project.bom || [],
    testing: project.testing || [],
    powerBudget: project.powerBudget || [],
    pinMap: project.pinMap || [],
    firmwareTasks: project.firmwareTasks || [],
    boards: project.boards || [],
    circuitBlocks: project.circuitBlocks || [],
    boardComponents: project.boardComponents || [],
    nets: project.nets || [],
    pcbConstraints: project.pcbConstraints || [],
    manufacturingChecklist: project.manufacturingChecklist || [],
    editorLayouts: project.editorLayouts || {},
    editorConnections: project.editorConnections || [],
    factoryFiles: project.factoryFiles || {},
    productType: project.productType || '',
    targetUse: project.targetUse || '',
    mechanicalZones: project.mechanicalZones || [],
    assemblyLayers: project.assemblyLayers || [],
    schematicSymbols: project.schematicSymbols || [],
    schematicConnections: project.schematicConnections || [],
    schematicWires: project.schematicWires || [],
    pcbLayers: project.pcbLayers || [],
    copperShapes: project.copperShapes || [],
    traces: project.traces || [],
    vias: project.vias || [],
    drillHoles: project.drillHoles || [],
    boardOutlines: project.boardOutlines || [],
    pcbRules: project.pcbRules || [],
    reviewResults: project.reviewResults || [],
    exportHistory: project.exportHistory || [],
    padNetAssignments: project.padNetAssignments || [],
    customComponentLibrary: project.customComponentLibrary || [],
    keepoutZones: project.keepoutZones || [],
    requirements: project.requirements || [],
    architectureNodes: project.architectureNodes || [],
    architectureConnections: project.architectureConnections || [],
    mechanicalObjects: project.mechanicalObjects || [],
    mechanicalDimensions: project.mechanicalDimensions || [],
    firmwareModules: project.firmwareModules || [],
    firmwareStates: project.firmwareStates || [],
    firmwareTransitions: project.firmwareTransitions || [],
    validationTests: project.validationTests || []
  };

  return JSON.stringify(cleanProject, null, 2);
}

/** Safely deserialize JSON string into fully normalized Project object */
export function deserializeProject(json: string): Project {
  if (!json || typeof json !== 'string') {
    throw new Error('Invalid JSON string passed to deserializeProject');
  }

  const raw = JSON.parse(json);
  return migrateProjectSchema(raw);
}

/** Full schema v5 migration ensuring legacy project structures are updated */
export function migrateProjectSchema(raw: unknown): Project {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Cannot migrate non-object project payload');
  }

  // First apply v4 migrations
  const project = migrateSchemaV4(raw);

  // Apply v5 defaults
  const pRecord = project as unknown as Record<string, unknown>;
  if (!pRecord.architectureConnections) pRecord.architectureConnections = [];
  if (!pRecord.mechanicalDimensions) pRecord.mechanicalDimensions = [];
  if (!pRecord.firmwareStates) pRecord.firmwareStates = [];
  if (!pRecord.firmwareTransitions) pRecord.firmwareTransitions = [];
  if (!pRecord.customComponentLibrary) pRecord.customComponentLibrary = [];

  project.version = String(CURRENT_SCHEMA_VERSION);
  return project;
}

/** Validate project structure integrity and cross-domain links */
export function validateProjectIntegrity(project: Project): ProjectIntegrityIssue[] {
  const issues: ProjectIntegrityIssue[] = [];

  if (!project.id) {
    issues.push({ severity: 'Error', domain: 'System', message: 'Project is missing a unique ID' });
  }

  if (!project.projectName || !project.projectName.trim()) {
    issues.push({ severity: 'Warning', domain: 'System', message: 'Project has no name specified' });
  }

  // Validate requirement links
  const reqIds = new Set((project.requirements || []).map((r) => r.id));
  for (const node of project.architectureNodes || []) {
    for (const rId of node.linkedRequirementIds || []) {
      if (!reqIds.has(rId)) {
        issues.push({
          severity: 'Warning',
          domain: 'Product',
          objectId: node.id,
          message: `Architecture node "${node.name}" references non-existent requirement: ${rId}`
        });
      }
    }
  }

  // Validate architecture connection endpoints
  const archNodeIds = new Set((project.architectureNodes || []).map((n) => n.id));
  for (const conn of project.architectureConnections || []) {
    if (!archNodeIds.has(conn.sourceNodeId)) {
      issues.push({
        severity: 'Error',
        domain: 'Product',
        objectId: conn.id,
        message: `Architecture connection "${conn.id}" references missing source node: ${conn.sourceNodeId}`
      });
    }
    if (!archNodeIds.has(conn.targetNodeId)) {
      issues.push({
        severity: 'Error',
        domain: 'Product',
        objectId: conn.id,
        message: `Architecture connection "${conn.id}" references missing target node: ${conn.targetNodeId}`
      });
    }
  }

  // Validate firmware state machine links
  const stateIds = new Set((project.firmwareStates || []).map((s) => s.id));
  for (const trans of project.firmwareTransitions || []) {
    if (!stateIds.has(trans.sourceStateId)) {
      issues.push({
        severity: 'Error',
        domain: 'Firmware',
        objectId: trans.id,
        message: `Firmware transition "${trans.id}" references missing source state: ${trans.sourceStateId}`
      });
    }
    if (!stateIds.has(trans.targetStateId)) {
      issues.push({
        severity: 'Error',
        domain: 'Firmware',
        objectId: trans.id,
        message: `Firmware transition "${trans.id}" references missing target state: ${trans.targetStateId}`
      });
    }
  }

  return issues;
}
