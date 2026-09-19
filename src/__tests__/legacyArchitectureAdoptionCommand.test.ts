import { describe, expect, it } from 'vitest';
import type { CustomEdge, CustomNode, Project } from '../types';
import {
  deriveEntityId,
} from '../core/domain/identity';
import {
  sourceIdentityKey,
  type CanonicalSourceMapping,
} from '../core/domain/adoption';
import {
  previewLegacyArchitectureAdoption,
  type LegacyArchitectureAdoptionResolution,
} from '../lib/product/legacyArchitectureAdoption';
import {
  applyLegacyArchitectureAdoptionCommand,
  type AdoptLegacyArchitectureCommand,
} from '../lib/product/legacyArchitectureAdoptionCommand';
import {
  deserializeProject,
  serializeProject,
  validateProjectIntegrity,
} from '../lib/projectSerialization';

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'adoption-command-project',
    projectName: 'Adoption Command Fixture',
    description: '',
    createdAt: '2026-09-19T00:00:00.000Z',
    updatedAt: '2026-09-19T18:55:00.000Z',
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
    sourceMappings: [],
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
    position: { x: 100, y: 150 },
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

async function commandFor(
  source: Project,
  resolutions: LegacyArchitectureAdoptionResolution = {},
  overrides: Partial<AdoptLegacyArchitectureCommand> = {},
): Promise<AdoptLegacyArchitectureCommand> {
  const preview = await previewLegacyArchitectureAdoption(source, resolutions);
  return {
    type: 'adoption.legacy-architecture.apply',
    schemaVersion: 1,
    projectId: source.id,
    baseUpdatedAt: source.updatedAt,
    baseProjectVersion: source.version,
    adoptionSessionId: preview.adoptionSessionId,
    recordedAt: '2026-09-19T19:00:00.000Z',
    resolutions,
    ...overrides,
  };
}

describe('legacy architecture adoption command', () => {
  it('builds one atomic patch and leaves the source project untouched', async () => {
    const source = project({
      nodes: [
        legacyNode('power', 'Battery Power', 'Power'),
        legacyNode('controller', 'Main Controller', 'Processing'),
      ],
    });
    const before = JSON.stringify(source);
    const command = await commandFor(source);

    const result = await applyLegacyArchitectureAdoptionCommand(source, command);

    expect(result.ok).toBe(true);
    expect(JSON.stringify(source)).toBe(before);

    if (!result.ok) throw new Error('Expected adoption command to succeed');

    expect(result.patch.architectureNodes).toHaveLength(2);
    expect(result.patch.architectureConnections).toHaveLength(0);
    expect(result.patch.sourceMappings).toHaveLength(2);
    expect(result.createdSourceMappings).toHaveLength(2);
    expect(result.createdSourceMappings.every((mapping) => (
      mapping.adoptionSessionId === command.adoptionSessionId
    ))).toBe(true);
  });

  it('uses explicit resolutions to convert ambiguous nodes and edges without guessing', async () => {
    const edge: CustomEdge = {
      id: 'legacy-edge',
      source: 'integration',
      target: 'controller',
      label: 'command path',
    };
    const source = project({
      nodes: [
        legacyNode('integration', 'Integration Layer', 'Integration', 'Complete'),
        legacyNode('controller', 'Main Controller', 'Processing'),
      ],
      edges: [edge],
    });
    const resolutions: LegacyArchitectureAdoptionResolution = {
      nodes: {
        integration: {
          category: 'Communication',
          status: 'Later',
        },
      },
      connections: {
        'legacy-edge': {
          type: 'Control',
          direction: 'Forward',
          protocol: 'internal-command',
        },
      },
    };

    const preview = await previewLegacyArchitectureAdoption(source, resolutions);
    expect(preview.canApply).toBe(true);
    expect(preview.canApplyWithoutResolution).toBe(false);

    const command = await commandFor(source, resolutions);
    const result = await applyLegacyArchitectureAdoptionCommand(source, command);

    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected resolved adoption to succeed');

    expect(result.patch.architectureNodes.find((node) => node.name === 'Integration Layer')).toMatchObject({
      category: 'Communication',
      status: 'Later',
    });
    expect(result.patch.architectureConnections[0]).toMatchObject({
      type: 'Control',
      direction: 'Forward',
      protocol: 'internal-command',
    });
    expect(result.patch.sourceMappings).toHaveLength(3);
  });

  it('returns no patch when the approved project base is stale', async () => {
    const source = project({
      nodes: [legacyNode('power', 'Battery', 'Power')],
    });
    const command = await commandFor(source, {}, {
      baseUpdatedAt: '2026-09-19T18:54:59.000Z',
    });

    const result = await applyLegacyArchitectureAdoptionCommand(source, command);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Expected stale command to fail');
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'stale-project-base' }),
      ]),
    );
  });

  it('returns no patch while semantic blockers remain unresolved', async () => {
    const source = project({
      nodes: [
        legacyNode('power', 'Battery', 'Power'),
        legacyNode('controller', 'Controller', 'Processing'),
      ],
      edges: [{
        id: 'ambiguous-edge',
        source: 'power',
        target: 'controller',
        label: '3V3',
      }],
    });
    const command = await commandFor(source);

    const result = await applyLegacyArchitectureAdoptionCommand(source, command);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Expected unresolved command to fail');
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'preview-not-applyable' }),
    ]);
  });

  it('rejects applying an approval from a different deterministic adoption session', async () => {
    const source = project({
      nodes: [legacyNode('power', 'Battery', 'Power')],
    });
    const wrongSession = await deriveEntityId(
      'adoption-session',
      source.id,
      'different-session',
    );
    const command = await commandFor(source, {}, {
      adoptionSessionId: wrongSession,
    });

    const result = await applyLegacyArchitectureAdoptionCommand(source, command);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Expected session mismatch to fail');
    expect(result.issues).toEqual([
      expect.objectContaining({ code: 'adoption-session-mismatch' }),
    ]);
  });

  it('rejects a source identity that already maps to a different canonical entity', async () => {
    const sourceNode = legacyNode('power', 'Battery', 'Power');
    const conflictingCanonicalId = await deriveEntityId(
      'architecture-node',
      'different-namespace',
      'different-target',
    );
    const mappingId = await deriveEntityId(
      'source-mapping',
      'adoption-command-project',
      'conflicting-source-mapping',
    );
    const adoptionSessionId = await deriveEntityId(
      'adoption-session',
      'adoption-command-project',
      'historical-session',
    );

    const existingMapping: CanonicalSourceMapping = {
      id: mappingId,
      adoptionSessionId,
      canonicalEntityId: conflictingCanonicalId,
      canonicalEntityType: 'architecture-node',
      source: {
        system: 'hardware-studio-legacy-react-flow',
        documentId: 'adoption-command-project',
        entityId: 'node:power',
        revision: '6',
        adapterId: 'legacy-architecture-adoption',
        adapterVersion: '1',
      },
      recordedAt: '2026-09-18T00:00:00.000Z',
    };

    const source = project({
      nodes: [sourceNode],
      sourceMappings: [existingMapping],
    });
    const command = await commandFor(source);

    const result = await applyLegacyArchitectureAdoptionCommand(source, command);

    expect(result.ok).toBe(false);
    if (result.ok) throw new Error('Expected source mapping conflict to fail');
    expect(result.issues).toEqual([
      expect.objectContaining({
        code: 'source-mapping-conflict',
        sourceEntityId: 'power',
      }),
    ]);
  });

  it('treats source revision as provenance metadata rather than source identity', () => {
    const oldRevision = {
      system: 'kicad',
      documentId: 'main-board',
      entityId: 'footprint:U3',
      revision: 'rev-a',
    };
    const newRevision = {
      ...oldRevision,
      revision: 'rev-b',
    };

    expect(sourceIdentityKey(oldRevision)).toBe(sourceIdentityKey(newRevision));
  });

  it('preserves source mappings across project serialization and validates them', async () => {
    const source = project({
      nodes: [legacyNode('power', 'Battery', 'Power')],
    });
    const command = await commandFor(source);
    const result = await applyLegacyArchitectureAdoptionCommand(source, command);
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error('Expected adoption command to succeed');

    const appliedProject = project({
      ...source,
      architectureNodes: result.patch.architectureNodes,
      architectureConnections: result.patch.architectureConnections,
      sourceMappings: result.patch.sourceMappings,
    });

    const restored = deserializeProject(serializeProject(appliedProject));

    expect(restored.sourceMappings).toEqual(result.patch.sourceMappings);
    expect(validateProjectIntegrity(restored).filter((issue) => issue.severity === 'Error')).toEqual([]);
  });

  it('reports duplicate logical source identities mapped to different canonical targets', async () => {
    const mappingOne: CanonicalSourceMapping = {
      id: await deriveEntityId('source-mapping', 'p', 'mapping-one'),
      adoptionSessionId: await deriveEntityId('adoption-session', 'p', 'session-one'),
      canonicalEntityId: await deriveEntityId('architecture-node', 'p', 'node-one'),
      canonicalEntityType: 'architecture-node',
      source: {
        system: 'legacy',
        documentId: 'doc',
        entityId: 'node:x',
        revision: '1',
      },
      recordedAt: '2026-09-19T00:00:00.000Z',
    };
    const mappingTwo: CanonicalSourceMapping = {
      id: await deriveEntityId('source-mapping', 'p', 'mapping-two'),
      adoptionSessionId: await deriveEntityId('adoption-session', 'p', 'session-two'),
      canonicalEntityId: await deriveEntityId('architecture-node', 'p', 'node-two'),
      canonicalEntityType: 'architecture-node',
      source: {
        system: 'legacy',
        documentId: 'doc',
        entityId: 'node:x',
        revision: '2',
      },
      recordedAt: '2026-09-19T00:00:01.000Z',
    };

    const issues = validateProjectIntegrity(project({
      sourceMappings: [mappingOne, mappingTwo],
    }));

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'Error',
          domain: 'Adoption',
          message: expect.stringContaining('maps to more than one canonical entity'),
        }),
      ]),
    );
  });
});
