import { beforeEach, describe, expect, it } from 'vitest';
import type { CustomEdge, CustomNode, Project } from '../types';
import { previewLegacyArchitectureAdoption } from '../lib/product/legacyArchitectureAdoption';
import {
  buildLegacyArchitectureAdoptionApplyPlan,
  projectPatchFromLegacyArchitectureApplyPlan,
} from '../lib/product/legacyArchitectureAdoptionApply';
import { useProjectStore } from '../store/projectStore';

function legacyNode(id: string, name: string, category: string, status: CustomNode['data']['status'] = 'MVP'): CustomNode {
  return {
    id,
    type: 'default',
    position: { x: 10, y: 20 },
    data: {
      name,
      category,
      status,
      description: '',
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

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'apply-project',
    projectName: 'Apply Fixture',
    description: '',
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    version: '9',
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
    ...overrides,
  } as Project;
}

describe('reviewed legacy architecture apply', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('requires explicit resolution for ambiguous semantics and persists provenance', async () => {
    const source = project({
      nodes: [legacyNode('integration', 'Integration', 'Integration', 'Complete')],
    });
    const preview = await previewLegacyArchitectureAdoption(source);

    const unresolved = buildLegacyArchitectureAdoptionApplyPlan(
      source,
      preview,
      [{ sourceNodeId: 'integration', decision: 'adopt' }],
      [],
      { reviewerId: 'reviewer-1', reviewedAt: '2026-09-20T00:10:00.000Z' },
    );
    expect(unresolved.canApply).toBe(false);
    expect(unresolved.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'node-resolution-incomplete' }),
    ]));

    const resolved = buildLegacyArchitectureAdoptionApplyPlan(
      source,
      preview,
      [{
        sourceNodeId: 'integration',
        decision: 'adopt',
        category: 'Processing',
        status: 'Later',
      }],
      [],
      { reviewerId: 'reviewer-1', reviewedAt: '2026-09-20T00:10:00.000Z' },
    );

    expect(resolved.canApply).toBe(true);
    const patch = projectPatchFromLegacyArchitectureApplyPlan(resolved);
    expect(patch.architectureNodes?.[0]).toMatchObject({
      name: 'Integration',
      category: 'Processing',
      status: 'Later',
      sourceIdentity: {
        system: 'hardware-studio-legacy-react-flow',
        documentId: 'apply-project',
        entityId: 'node:integration',
      },
      provenance: {
        origin: 'imported',
        qualification: 'provisional',
        reviewedBy: 'reviewer-1',
        reviewedAt: '2026-09-20T00:10:00.000Z',
      },
      reconciliationBaseline: {
        adoptionSessionId: preview.adoptionSessionId,
        adoptedAt: '2026-09-20T00:10:00.000Z',
        canonicalSnapshot: {
          name: 'Integration',
          category: 'Processing',
          status: 'Later',
        },
      },
    });
    expect(patch.architectureNodes?.[0].reconciliationBaseline?.sourceContentHash)
      .toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('requires explicit edge type/direction and adopted endpoints', async () => {
    const edge: CustomEdge = {
      id: 'edge-1',
      source: 'power',
      target: 'controller',
      label: 'rail',
    };
    const source = project({
      nodes: [
        legacyNode('power', 'Battery', 'Power'),
        legacyNode('controller', 'Controller', 'Processing'),
      ],
      edges: [edge],
    });
    const preview = await previewLegacyArchitectureAdoption(source);

    const plan = buildLegacyArchitectureAdoptionApplyPlan(
      source,
      preview,
      [
        { sourceNodeId: 'power', decision: 'adopt' },
        { sourceNodeId: 'controller', decision: 'adopt' },
      ],
      [{
        sourceEdgeId: 'edge-1',
        decision: 'adopt',
        type: 'Power',
        direction: 'Forward',
        voltage: 3.3,
      }],
      { reviewerId: 'reviewer-1', reviewedAt: '2026-09-20T00:10:00.000Z' },
    );

    expect(plan.canApply).toBe(true);
    expect(plan.commands.find((command) => command.kind === 'add-architecture-connection')).toMatchObject({
      payload: {
        type: 'Power',
        direction: 'Forward',
        voltage: 3.3,
      },
    });
  });

  it('rejects stale previews after project revision changes', async () => {
    const source = project({ nodes: [legacyNode('power', 'Battery', 'Power')] });
    const preview = await previewLegacyArchitectureAdoption(source);
    const changed = { ...source, version: '10' };

    const plan = buildLegacyArchitectureAdoptionApplyPlan(
      changed,
      preview,
      [{ sourceNodeId: 'power', decision: 'adopt' }],
      [],
      { reviewerId: 'reviewer-1', reviewedAt: '2026-09-20T00:10:00.000Z' },
    );

    expect(plan.canApply).toBe(false);
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'preview-revision-stale' }),
    ]));
  });

  it('applies as one command and undo restores the pre-adoption graph', async () => {
    const source = project({
      nodes: [
        legacyNode('power', 'Battery', 'Power'),
        legacyNode('controller', 'Controller', 'Processing'),
      ],
      edges: [{
        id: 'edge-1',
        source: 'power',
        target: 'controller',
        data: { semanticType: 'Power', direction: 'Forward' },
      } as CustomEdge],
    });

    useProjectStore.setState({
      ...useProjectStore.getState(),
      ...source,
      pastCommands: [],
      futureCommands: [],
    });

    const preview = await previewLegacyArchitectureAdoption(source);
    const plan = buildLegacyArchitectureAdoptionApplyPlan(
      source,
      preview,
      [
        { sourceNodeId: 'power', decision: 'adopt' },
        { sourceNodeId: 'controller', decision: 'adopt' },
      ],
      [{ sourceEdgeId: 'edge-1', decision: 'adopt' }],
      { reviewerId: 'reviewer-1', reviewedAt: '2026-09-20T00:10:00.000Z' },
    );

    const result = useProjectStore.getState().applyLegacyArchitectureAdoptionPlan(plan);
    expect(result).toEqual({ success: true });

    let state = useProjectStore.getState();
    expect(state.architectureNodes).toHaveLength(2);
    expect(state.architectureConnections).toHaveLength(1);
    expect(state.nodes).toHaveLength(2);
    expect(state.edges).toHaveLength(1);
    expect(state.pastCommands).toHaveLength(1);
    expect(state.pastCommands[0].type).toBe('ADOPT_LEGACY_ARCHITECTURE');

    state.undoProjectCommand();
    state = useProjectStore.getState();
    expect(state.architectureNodes).toHaveLength(0);
    expect(state.architectureConnections).toHaveLength(0);
    expect(state.nodes).toHaveLength(2);
    expect(state.edges).toHaveLength(1);

    state.redoProjectCommand();
    state = useProjectStore.getState();
    expect(state.architectureNodes).toHaveLength(2);
    expect(state.architectureConnections).toHaveLength(1);
  });

  it('store refuses plans after canonical state appears', async () => {
    const source = project({ nodes: [legacyNode('power', 'Battery', 'Power')] });
    const preview = await previewLegacyArchitectureAdoption(source);
    const plan = buildLegacyArchitectureAdoptionApplyPlan(
      source,
      preview,
      [{ sourceNodeId: 'power', decision: 'adopt' }],
      [],
      { reviewerId: 'reviewer-1', reviewedAt: '2026-09-20T00:10:00.000Z' },
    );

    useProjectStore.setState({
      ...useProjectStore.getState(),
      ...source,
      architectureNodes: [{
        id: 'existing',
        name: 'Existing',
        category: 'Power',
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
      }],
      pastCommands: [],
      futureCommands: [],
    });

    const result = useProjectStore.getState().applyLegacyArchitectureAdoptionPlan(plan);
    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/reconciliation/i);
    expect(useProjectStore.getState().pastCommands).toHaveLength(0);
  });
});
