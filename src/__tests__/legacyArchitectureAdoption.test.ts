import { describe, expect, it } from 'vitest';
import type { CustomEdge, CustomNode, ProductArchitectureNode, Project } from '../types';
import {
  previewLegacyArchitectureAdoption,
} from '../lib/product/legacyArchitectureAdoption';

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'legacy-architecture-project',
    projectName: 'Legacy Architecture Fixture',
    description: '',
    createdAt: '2026-09-19T00:00:00.000Z',
    updatedAt: '2026-09-19T00:00:00.000Z',
    version: '7',
    schemaVersion: 6,
    activeView: 'master',
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

function legacyNode(
  id: string,
  name: string,
  category: string,
  status: CustomNode['data']['status'] = 'MVP',
): CustomNode {
  return {
    id,
    type: 'default',
    position: { x: 100, y: 200 },
    data: {
      name,
      category,
      status,
      description: `${name} description`,
      purpose: '',
      requirements: '',
      candidateComponents: '',
      risks: '',
      notes: '',
      testingNotes: '',
      views: ['master'],
    },
  };
}

describe('legacy architecture adoption preview', () => {
  it('is deterministic and does not mutate the live project', async () => {
    const source = project({
      nodes: [
        legacyNode('legacy-power', 'Power subsystem', 'Power'),
        legacyNode('legacy-controller', 'Main controller', 'Processing'),
      ],
    });
    const before = JSON.stringify(source);

    const first = await previewLegacyArchitectureAdoption(source);
    const second = await previewLegacyArchitectureAdoption(source);

    expect(JSON.stringify(source)).toBe(before);
    expect(first.adoptionSessionId).toBe(second.adoptionSessionId);
    expect(first.nodeProposals.map((proposal) => proposal.canonicalId)).toEqual(
      second.nodeProposals.map((proposal) => proposal.canonicalId),
    );
    expect(first.canApplyWithoutResolution).toBe(true);
  });

  it('preserves explicit source identity separately from canonical identity', async () => {
    const preview = await previewLegacyArchitectureAdoption(project({
      nodes: [legacyNode('legacy-power', 'Power subsystem', 'Power')],
    }));

    const proposal = preview.nodeProposals[0];
    expect(proposal.canonicalId).not.toBe('legacy-power');
    expect(proposal.sourceIdentity).toEqual({
      system: 'hardware-studio-legacy-react-flow',
      documentId: 'legacy-architecture-project',
      entityId: 'node:legacy-power',
      revision: '7',
      adapterId: 'legacy-architecture-adoption',
      adapterVersion: '1',
    });
    expect(proposal.proposed?.id).toBe(proposal.canonicalId);
  });

  it('maps only defensible legacy node categories and statuses', async () => {
    const preview = await previewLegacyArchitectureAdoption(project({
      nodes: [
        legacyNode('wireless', 'BLE Radio', 'Wireless', 'Later'),
        legacyNode('power', 'Battery', 'Power', 'MVP'),
      ],
    }));

    expect(preview.nodeProposals[0].proposed).toMatchObject({
      category: 'Communication',
      status: 'Later',
    });
    expect(preview.nodeProposals[1].proposed).toMatchObject({
      category: 'Power',
      status: 'MVP',
    });
    expect(preview.canApplyWithoutResolution).toBe(true);
  });

  it('keeps ambiguous legacy category and status unresolved instead of guessing', async () => {
    const preview = await previewLegacyArchitectureAdoption(project({
      nodes: [
        legacyNode('integration', 'System Integration', 'Integration', 'Complete'),
      ],
    }));

    const proposal = preview.nodeProposals[0];
    expect(proposal.canAdopt).toBe(false);
    expect(proposal.proposed).toBeUndefined();
    expect(proposal.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'legacy-node-category-unmapped',
        'legacy-node-status-unmapped',
      ]),
    );
    expect(preview.canApplyWithoutResolution).toBe(false);
  });

  it('does not promote legacy free-text enrichment into canonical links', async () => {
    const node = legacyNode('sensor', 'Environmental Sensor', 'Input');
    node.data.requirements = 'Must measure temperature';
    node.data.risks = 'Sensor self-heating';
    node.data.candidateComponents = 'BME280';

    const preview = await previewLegacyArchitectureAdoption(project({ nodes: [node] }));
    const proposal = preview.nodeProposals[0];

    expect(proposal.canAdopt).toBe(true);
    expect(proposal.proposed).toMatchObject({
      linkedRequirementIds: [],
      linkedComponentIds: [],
      linkedFirmwareModuleIds: [],
      linkedTestIds: [],
    });
    expect(proposal.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'legacy-node-enrichment-unmapped',
          severity: 'warning',
        }),
      ]),
    );
  });

  it('treats missing dimensions as display-only defaults rather than engineering geometry', async () => {
    const node = legacyNode('controller', 'Controller', 'Processing');
    node.width = undefined;
    node.height = undefined;

    const preview = await previewLegacyArchitectureAdoption(project({ nodes: [node] }));
    const proposal = preview.nodeProposals[0];

    expect(proposal.proposed).toMatchObject({
      width: 160,
      height: 72,
    });
    expect(proposal.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'display-layout-defaulted',
          severity: 'info',
        }),
      ]),
    );
  });

  it('skips boundary nodes as diagram decoration', async () => {
    const boundary = legacyNode('boundary', 'System boundary', 'Mechanical');
    boundary.type = 'boundaryNode';

    const preview = await previewLegacyArchitectureAdoption(project({
      nodes: [boundary, legacyNode('power', 'Battery', 'Power')],
    }));

    expect(preview.nodeProposals.map((proposal) => proposal.sourceNodeId)).toEqual(['power']);
    expect(preview.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'legacy-boundary-node-skipped',
          sourceEntityId: 'boundary',
        }),
      ]),
    );
  });

  it('refuses to infer semantic connection type or direction from a visual edge', async () => {
    const edge: CustomEdge = {
      id: 'legacy-edge',
      source: 'power',
      target: 'controller',
      label: '3V3 feed',
    };

    const preview = await previewLegacyArchitectureAdoption(project({
      nodes: [
        legacyNode('power', 'Battery', 'Power'),
        legacyNode('controller', 'Controller', 'Processing'),
      ],
      edges: [edge],
    }));

    const proposal = preview.connectionProposals[0];
    expect(proposal.canAdopt).toBe(false);
    expect(proposal.proposed).toBeUndefined();
    expect(proposal.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'legacy-edge-semantic-type-unresolved',
        'legacy-edge-semantic-direction-unresolved',
      ]),
    );
    expect(preview.canApplyWithoutResolution).toBe(false);
  });

  it('accepts a legacy edge only when explicit semantic metadata is present', async () => {
    const edge = {
      id: 'typed-edge',
      source: 'power',
      target: 'controller',
      label: '3V3 feed',
      data: {
        semanticType: 'Power',
        direction: 'Forward',
        voltage: 3.3,
      },
    } as CustomEdge;

    const preview = await previewLegacyArchitectureAdoption(project({
      nodes: [
        legacyNode('power', 'Battery', 'Power'),
        legacyNode('controller', 'Controller', 'Processing'),
      ],
      edges: [edge],
    }));

    const proposal = preview.connectionProposals[0];
    expect(proposal.canAdopt).toBe(true);
    expect(proposal.proposed).toMatchObject({
      name: '3V3 feed',
      type: 'Power',
      direction: 'Forward',
      voltage: 3.3,
    });
    expect(proposal.proposed?.sourceNodeId).toBe(preview.nodeProposals[0].canonicalId);
    expect(proposal.proposed?.targetNodeId).toBe(preview.nodeProposals[1].canonicalId);
    expect(preview.canApplyWithoutResolution).toBe(true);
  });

  it('blocks one-way adoption when canonical architecture already exists', async () => {
    const canonicalNode: ProductArchitectureNode = {
      id: 'existing-canonical-node',
      name: 'Existing Controller',
      category: 'Processing',
      description: '',
      x: 0,
      y: 0,
      width: 160,
      height: 72,
      linkedRequirementIds: [],
      linkedCircuitIds: [],
      linkedComponentIds: [],
      linkedFirmwareModuleIds: [],
      linkedTestIds: [],
      status: 'MVP',
    };

    const preview = await previewLegacyArchitectureAdoption(project({
      nodes: [legacyNode('power', 'Battery', 'Power')],
      architectureNodes: [canonicalNode],
    }));

    expect(preview.canonicalStatePresent).toBe(true);
    expect(preview.canApplyWithoutResolution).toBe(false);
    expect(preview.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'canonical-architecture-already-present',
          severity: 'blocker',
        }),
      ]),
    );
  });

  it('reports edges whose canonical endpoints cannot be adopted', async () => {
    const invalidNode = legacyNode('integration', 'Integration', 'Integration', 'MVP');
    const edge: CustomEdge = {
      id: 'edge-to-unmapped-node',
      source: 'power',
      target: 'integration',
      data: {
        semanticType: 'Power',
        direction: 'Forward',
      },
    };

    const preview = await previewLegacyArchitectureAdoption(project({
      nodes: [
        legacyNode('power', 'Battery', 'Power'),
        invalidNode,
      ],
      edges: [edge],
    }));

    expect(preview.connectionProposals[0].issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'legacy-edge-endpoint-missing',
          severity: 'blocker',
        }),
      ]),
    );
  });
});
