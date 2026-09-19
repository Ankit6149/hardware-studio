import { describe, expect, it } from 'vitest';
import type { Project } from '../types';
import {
  architectureUsesLegacyCompatibility,
  resolveArchitectureProjection,
} from '../lib/product/architectureAuthority';
import { runDesignReview } from '../lib/designReview';
import {
  autoCreateFirmwareTasksFromHardware,
  generateEditorLayouts,
} from '../lib/editorLayoutGenerators';

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'architecture-authority-fixture',
    projectName: 'Architecture Authority Fixture',
    description: '',
    createdAt: '2026-09-19T00:00:00.000Z',
    updatedAt: '2026-09-19T00:00:00.000Z',
    version: '1',
    schemaVersion: 6,
    activeView: 'product',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    requirements: [],
    architectureNodes: [],
    architectureConnections: [],
    boards: [],
    boardComponents: [],
    nets: [],
    pcbConstraints: [],
    manufacturingChecklist: [],
    mechanicalZones: [],
    assemblyLayers: [],
    schematicSymbols: [],
    schematicConnections: [],
    schematicWires: [],
    pcbLayers: [],
    copperShapes: [],
    traces: [],
    vias: [],
    drillHoles: [],
    boardOutlines: [],
    pcbRules: [],
    padNetAssignments: [],
    keepoutZones: [],
    reviewResults: [],
    exportHistory: [],
    mechanicalObjects: [],
    mechanicalDimensions: [],
    mechanicalBodies: [],
    firmwareModules: [],
    firmwareStates: [],
    firmwareTransitions: [],
    validationTests: [],
    validationRuns: [],
    ...overrides,
  } as Project;
}

const legacyInputNode: Project['nodes'][number] = {
  id: 'legacy-input',
  type: 'default',
  position: { x: 10, y: 20 },
  data: {
    name: 'Legacy Touch Input',
    category: 'Input',
    status: 'MVP',
    description: 'Legacy-only input',
    purpose: '',
    requirements: '',
    candidateComponents: '',
    risks: '',
    notes: '',
    testingNotes: '',
    views: ['master'],
  },
};

const legacyFeedbackNode: Project['nodes'][number] = {
  id: 'legacy-feedback',
  type: 'default',
  position: { x: 30, y: 40 },
  data: {
    name: 'Legacy Haptic Feedback',
    category: 'Feedback',
    status: 'MVP',
    description: 'Legacy-only feedback',
    purpose: '',
    requirements: '',
    candidateComponents: '',
    risks: '',
    notes: '',
    testingNotes: '',
    views: ['master'],
  },
};

const canonicalPowerNode = {
  id: 'canonical-power',
  name: 'Battery Power',
  category: 'Power' as const,
  description: 'Canonical power source',
  x: 100,
  y: 120,
  width: 160,
  height: 72,
  linkedRequirementIds: [],
  linkedCircuitIds: [],
  linkedComponentIds: [],
  linkedFirmwareModuleIds: [],
  linkedTestIds: [],
  status: 'MVP' as const,
};

const canonicalInputNode = {
  id: 'canonical-input',
  name: 'Capacitive Touch',
  category: 'Input' as const,
  description: 'Canonical input',
  x: 200,
  y: 160,
  width: 160,
  height: 72,
  linkedRequirementIds: [],
  linkedCircuitIds: [],
  linkedComponentIds: [],
  linkedFirmwareModuleIds: [],
  linkedTestIds: [],
  status: 'MVP' as const,
};

describe('architecture authority', () => {
  it('prefers canonical architecture whenever canonical graph state exists', () => {
    const result = resolveArchitectureProjection(project({
      nodes: [legacyInputNode],
      architectureNodes: [canonicalPowerNode],
    }));

    expect(result.source).toBe('canonical');
    expect(result.nodes.map((node) => node.id)).toEqual(['canonical-power']);
    expect(result.nodes[0]).toMatchObject({
      name: 'Battery Power',
      category: 'Power',
      source: 'canonical',
    });
    expect(architectureUsesLegacyCompatibility(project({
      nodes: [legacyInputNode],
      architectureNodes: [canonicalPowerNode],
    }))).toBe(false);
  });

  it('uses legacy nodes only as an explicit compatibility projection', () => {
    const result = resolveArchitectureProjection(project({
      nodes: [legacyInputNode],
      edges: [{
        id: 'legacy-edge',
        source: 'legacy-input',
        target: 'legacy-feedback',
        label: 'legacy signal',
      }],
    }));

    expect(result.source).toBe('legacy-compatibility');
    expect(result.nodes[0]).toMatchObject({
      id: 'legacy-input',
      name: 'Legacy Touch Input',
      category: 'Input',
      source: 'legacy-compatibility',
    });
    expect(result.connections[0]).toMatchObject({
      id: 'legacy-edge',
      sourceNodeId: 'legacy-input',
      targetNodeId: 'legacy-feedback',
      name: 'legacy signal',
      source: 'legacy-compatibility',
    });
  });

  it('does not consult contradictory legacy nodes during design review', () => {
    const review = runDesignReview(project({
      nodes: [legacyInputNode],
      architectureNodes: [canonicalPowerNode],
    }));

    expect(review.some((item) => item.id === 'rev_arch_input')).toBe(true);
    expect(review.some((item) => item.id === 'rev_arch_power')).toBe(false);
  });

  it('projects canonical architecture into generic editor layout without reviving legacy nodes', () => {
    const { layouts, connections } = generateEditorLayouts(project({
      nodes: [legacyInputNode],
      edges: [{
        id: 'legacy-edge',
        source: 'legacy-input',
        target: 'legacy-feedback',
        label: 'legacy',
      }],
      architectureNodes: [canonicalPowerNode, canonicalInputNode],
      architectureConnections: [{
        id: 'canonical-connection',
        sourceNodeId: 'canonical-power',
        targetNodeId: 'canonical-input',
        name: 'Power feed',
        type: 'Power',
        direction: 'Forward',
      }],
    }));

    const productObjects = layouts.product || [];
    expect(productObjects.some((object) => object.sourceId === 'legacy-input')).toBe(false);
    expect(productObjects.some((object) => object.sourceId === 'canonical-power')).toBe(true);
    expect(productObjects.some((object) => object.sourceId === 'canonical-input')).toBe(true);

    const architectureConnection = connections.find((connection) => connection.id === 'conn_p_canonical-connection');
    expect(architectureConnection).toMatchObject({
      sourceObjectId: 'obj_p_canonical-power',
      targetObjectId: 'obj_p_canonical-input',
      label: 'Power feed',
    });
    expect(connections.some((connection) => connection.id === 'conn_p_legacy-edge')).toBe(false);
  });

  it('derives firmware tasks from canonical architecture rather than legacy feedback nodes', () => {
    const tasks = autoCreateFirmwareTasksFromHardware(project({
      nodes: [legacyFeedbackNode],
      architectureNodes: [canonicalInputNode],
    }));

    expect(tasks.some((task) => task.linkedBlock === 'canonical-input')).toBe(true);
    expect(tasks.some((task) => task.linkedBlock === 'legacy-feedback')).toBe(false);
    expect(tasks.some((task) => task.name.toLowerCase().includes('feedback'))).toBe(false);
  });

  it('keeps genuinely empty architecture empty', () => {
    expect(resolveArchitectureProjection(project())).toEqual({
      source: 'empty',
      nodes: [],
      connections: [],
    });
  });
});
