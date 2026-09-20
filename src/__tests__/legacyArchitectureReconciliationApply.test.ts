import { beforeEach, describe, expect, it } from 'vitest';
import type {
  CustomEdge,
  CustomNode,
  ProductArchitectureConnection,
  Project,
} from '../types';
import { useProjectStore } from '../store/projectStore';
import { previewLegacyArchitectureAdoption } from '../lib/product/legacyArchitectureAdoption';
import {
  buildLegacyArchitectureAdoptionApplyPlan,
  projectPatchFromLegacyArchitectureApplyPlan,
} from '../lib/product/legacyArchitectureAdoptionApply';
import {
  previewLegacyArchitectureReconciliation,
} from '../lib/product/legacyArchitectureReconciliation';
import {
  buildLegacyArchitectureReconciliationApplyPlan,
} from '../lib/product/legacyArchitectureReconciliationApply';

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
    width: 160,
    height: 72,
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

function typedEdge(
  id: string,
  source: string,
  target: string,
  label = 'link',
): CustomEdge {
  return {
    id,
    source,
    target,
    label,
    data: {
      semanticType: 'Power',
      direction: 'Forward',
    },
  } as CustomEdge;
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'reconcile-apply-project',
    projectName: 'Reconciliation Apply Fixture',
    description: '',
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    version: '21',
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
    architectureReconciliationSuppressions: [],
    ...overrides,
  } as Project;
}

async function adopt(source: Project): Promise<Project> {
  const preview = await previewLegacyArchitectureAdoption(source);
  const plan = buildLegacyArchitectureAdoptionApplyPlan(
    source,
    preview,
    preview.nodeProposals.map((proposal) => ({
      sourceNodeId: proposal.sourceNodeId,
      decision: 'adopt' as const,
    })),
    preview.connectionProposals.map((proposal) => ({
      sourceEdgeId: proposal.sourceEdgeId,
      decision: 'adopt' as const,
    })),
    {
      reviewerId: 'adoption-reviewer',
      reviewedAt: '2026-09-20T01:00:00.000Z',
    },
  );

  if (!plan.canApply) {
    throw new Error(`Fixture adoption failed: ${JSON.stringify(plan.issues)}`);
  }

  return {
    ...source,
    ...projectPatchFromLegacyArchitectureApplyPlan(plan),
  };
}

async function reconciliationPlan(
  current: Project,
  resolutions: Parameters<typeof buildLegacyArchitectureReconciliationApplyPlan>[2],
) {
  const preview = await previewLegacyArchitectureReconciliation(current);
  const plan = await buildLegacyArchitectureReconciliationApplyPlan(
    current,
    preview,
    resolutions,
    {
      reviewerId: 'reconciliation-reviewer',
      reviewedAt: '2026-09-20T02:00:00.000Z',
    },
  );
  return { preview, plan };
}

function loadStore(value: Project): void {
  useProjectStore.setState({
    ...useProjectStore.getState(),
    ...value,
    pastCommands: [],
    futureCommands: [],
  });
}

describe('reviewed architecture reconciliation apply', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('makes keep-local durable by advancing source and canonical baselines independently', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('controller', 'Main Controller', 'Processing')],
    }));
    const source = adopted.nodes?.[0] as CustomNode;
    const changed: Project = {
      ...adopted,
      nodes: [{
        ...source,
        data: {
          ...source.data,
          name: 'Source Renamed Controller',
          description: 'Changed source description',
        },
      }],
    };

    const { preview, plan } = await reconciliationPlan(changed, [{
      kind: 'node',
      sourceEntityId: 'controller',
      action: 'keep-local',
    }]);

    expect(preview.items[0].classification).toBe('source-only-change');
    expect(plan.canApply).toBe(true);
    loadStore(changed);

    const result = await useProjectStore.getState().applyLegacyArchitectureReconciliationPlan(plan);
    expect(result).toEqual({ success: true });

    const state = useProjectStore.getState();
    const canonical = state.architectureNodes?.[0];
    expect(canonical?.name).toBe('Main Controller');
    expect(canonical?.reconciliationBaseline).toMatchObject({
      sourcePresence: 'present',
      resolution: 'keep-local',
      reviewedBy: 'reconciliation-reviewer',
      canonicalSnapshot: {
        name: 'Main Controller',
      },
      sourceSnapshot: {
        name: 'Source Renamed Controller',
      },
    });

    const nextPreview = await previewLegacyArchitectureReconciliation(state as Project);
    expect(nextPreview.summary.unchanged).toBe(1);
    expect(nextPreview.summary['source-only-change']).toBe(0);
  });

  it('applies take-source and makes the reviewed source the new baseline', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('sensor', 'Temperature Sensor', 'Input')],
    }));
    const source = adopted.nodes?.[0] as CustomNode;
    const changed: Project = {
      ...adopted,
      nodes: [{
        ...source,
        data: {
          ...source.data,
          name: 'Environmental Sensor',
        },
      }],
    };

    const { plan } = await reconciliationPlan(changed, [{
      kind: 'node',
      sourceEntityId: 'sensor',
      action: 'take-source',
    }]);
    expect(plan.canApply).toBe(true);
    loadStore(changed);

    expect(
      await useProjectStore.getState().applyLegacyArchitectureReconciliationPlan(plan),
    ).toEqual({ success: true });

    const state = useProjectStore.getState();
    expect(state.architectureNodes?.[0]).toMatchObject({
      name: 'Environmental Sensor',
      reconciliationBaseline: {
        resolution: 'take-source',
        canonicalSnapshot: { name: 'Environmental Sensor' },
        sourceSnapshot: { name: 'Environmental Sensor' },
      },
    });

    const nextPreview = await previewLegacyArchitectureReconciliation(state as Project);
    expect(nextPreview.summary.unchanged).toBe(1);
  });

  it('allows an explicit manual conflict resolution without pretending it came from source', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('controller', 'Controller', 'Processing')],
    }));
    const source = adopted.nodes?.[0] as CustomNode;
    const canonical = adopted.architectureNodes?.[0];
    if (!canonical) throw new Error('missing canonical fixture');

    const changed: Project = {
      ...adopted,
      nodes: [{
        ...source,
        data: { ...source.data, name: 'Source Controller' },
      }],
      architectureNodes: [{
        ...canonical,
        name: 'Local Controller',
      }],
    };

    const { preview, plan } = await reconciliationPlan(changed, [{
      kind: 'node',
      sourceEntityId: 'controller',
      action: 'manual',
      manualNode: {
        name: 'Reviewed Controller',
      },
    }]);

    expect(preview.items[0].classification).toBe('conflict');
    expect(plan.canApply).toBe(true);
    loadStore(changed);
    await useProjectStore.getState().applyLegacyArchitectureReconciliationPlan(plan);

    const state = useProjectStore.getState();
    expect(state.architectureNodes?.[0]).toMatchObject({
      name: 'Reviewed Controller',
      reconciliationBaseline: {
        resolution: 'manual',
        canonicalSnapshot: { name: 'Reviewed Controller' },
        sourceSnapshot: { name: 'Source Controller' },
      },
    });

    const nextPreview = await previewLegacyArchitectureReconciliation(state as Project);
    expect(nextPreview.summary.unchanged).toBe(1);
  });

  it('acknowledges source deletion when canonical state is intentionally retained', async () => {
    const originalNode = legacyNode('feedback', 'Status LED', 'Feedback');
    const adopted = await adopt(project({ nodes: [originalNode] }));
    const changed: Project = { ...adopted, nodes: [] };

    const { preview, plan } = await reconciliationPlan(changed, [{
      kind: 'node',
      sourceEntityId: 'feedback',
      action: 'keep-local',
    }]);
    expect(preview.items[0].classification).toBe('source-deleted');
    expect(plan.canApply).toBe(true);

    loadStore(changed);
    await useProjectStore.getState().applyLegacyArchitectureReconciliationPlan(plan);
    let state = useProjectStore.getState();
    expect(state.architectureNodes?.[0].reconciliationBaseline).toMatchObject({
      sourcePresence: 'deleted',
      resolution: 'keep-after-source-delete',
    });

    let nextPreview = await previewLegacyArchitectureReconciliation(state as Project);
    expect(nextPreview.summary.unchanged).toBe(1);
    expect(nextPreview.summary['source-deleted']).toBe(0);

    useProjectStore.setState({ nodes: [originalNode] });
    state = useProjectStore.getState();
    nextPreview = await previewLegacyArchitectureReconciliation(state as Project);
    expect(nextPreview.summary['source-only-change']).toBe(1);
  });

  it('blocks canonical node deletion when a retained connection would become dangling', async () => {
    const adopted = await adopt(project({
      nodes: [
        legacyNode('power', 'Battery', 'Power'),
        legacyNode('controller', 'Controller', 'Processing'),
      ],
    }));
    const power = adopted.architectureNodes?.find((node) => node.sourceIdentity?.entityId === 'node:power');
    const controller = adopted.architectureNodes?.find((node) => node.sourceIdentity?.entityId === 'node:controller');
    if (!power || !controller) throw new Error('missing canonical nodes');

    const localConnection: ProductArchitectureConnection = {
      id: 'local-connection',
      sourceNodeId: power.id,
      targetNodeId: controller.id,
      name: 'Locally Authored Power Link',
      type: 'Power',
      direction: 'Forward',
    };

    const changed: Project = {
      ...adopted,
      nodes: [adopted.nodes?.find((node) => node.id === 'controller') as CustomNode],
      architectureConnections: [localConnection],
    };

    const { preview, plan } = await reconciliationPlan(changed, [{
      kind: 'node',
      sourceEntityId: 'power',
      action: 'delete-canonical',
    }]);

    expect(preview.items.find((item) => item.sourceEntityId === 'power')?.classification)
      .toBe('source-deleted');
    expect(plan.canApply).toBe(false);
    expect(plan.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'connection-endpoint-missing',
        canonicalEntityId: 'local-connection',
      }),
    ]));
  });

  it('durably rejects a new source entity by exact source fingerprint and resurfaces it after source changes', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('controller', 'Controller', 'Processing')],
    }));
    const newNode = legacyNode('optional-led', 'Optional LED', 'Feedback');
    const changed: Project = {
      ...adopted,
      nodes: [...(adopted.nodes || []), newNode],
    };

    const { preview, plan } = await reconciliationPlan(changed, [{
      kind: 'node',
      sourceEntityId: 'optional-led',
      action: 'reject-source',
    }]);
    expect(preview.items.find((item) => item.sourceEntityId === 'optional-led')?.classification)
      .toBe('new-source');
    expect(plan.canApply).toBe(true);

    loadStore(changed);
    await useProjectStore.getState().applyLegacyArchitectureReconciliationPlan(plan);
    let state = useProjectStore.getState();
    expect(state.architectureReconciliationSuppressions).toHaveLength(1);

    let nextPreview = await previewLegacyArchitectureReconciliation(state as Project);
    const suppressed = nextPreview.items.find((item) => item.sourceEntityId === 'optional-led');
    expect(suppressed).toMatchObject({
      classification: 'unchanged',
      suppressed: true,
    });

    useProjectStore.setState({
      nodes: (state.nodes || []).map((node) => node.id === 'optional-led'
        ? { ...node, data: { ...node.data, name: 'Changed Optional LED' } }
        : node),
    });
    state = useProjectStore.getState();
    nextPreview = await previewLegacyArchitectureReconciliation(state as Project);
    expect(nextPreview.items.find((item) => item.sourceEntityId === 'optional-led'))
      .toMatchObject({
        classification: 'new-source',
        suppressed: false,
      });
  });

  it('adopts a new source node and connection against the final reconciled node set', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('power', 'Battery', 'Power')],
    }));
    const controller = legacyNode('controller', 'Controller', 'Processing');
    const edge = typedEdge('power-link', 'power', 'controller', '3V3');

    const changed: Project = {
      ...adopted,
      nodes: [...(adopted.nodes || []), controller],
      edges: [edge],
    };

    const { preview, plan } = await reconciliationPlan(changed, [
      {
        kind: 'node',
        sourceEntityId: 'controller',
        action: 'adopt-source',
      },
      {
        kind: 'connection',
        sourceEntityId: 'power-link',
        action: 'adopt-source',
      },
    ]);

    expect(preview.summary['new-source']).toBe(2);
    expect(plan.canApply).toBe(true);

    loadStore(changed);
    await useProjectStore.getState().applyLegacyArchitectureReconciliationPlan(plan);
    const state = useProjectStore.getState();

    expect(state.architectureNodes).toHaveLength(2);
    expect(state.architectureConnections).toHaveLength(1);
    const ids = new Set(state.architectureNodes?.map((node) => node.id));
    expect(ids.has(state.architectureConnections?.[0].sourceNodeId || '')).toBe(true);
    expect(ids.has(state.architectureConnections?.[0].targetNodeId || '')).toBe(true);
  });

  it('rejects a stale reviewed plan and performs no mutation', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('controller', 'Controller', 'Processing')],
    }));
    const source = adopted.nodes?.[0] as CustomNode;
    const changed: Project = {
      ...adopted,
      nodes: [{
        ...source,
        data: { ...source.data, name: 'Source Controller V2' },
      }],
    };

    const { plan } = await reconciliationPlan(changed, [{
      kind: 'node',
      sourceEntityId: 'controller',
      action: 'take-source',
    }]);
    expect(plan.canApply).toBe(true);

    loadStore(changed);
    useProjectStore.setState({
      nodes: (useProjectStore.getState().nodes || []).map((node) => node.id === 'controller'
        ? { ...node, data: { ...node.data, name: 'Source Controller V3' } }
        : node),
    });

    const before = JSON.stringify({
      architectureNodes: useProjectStore.getState().architectureNodes,
      architectureConnections: useProjectStore.getState().architectureConnections,
      suppressions: useProjectStore.getState().architectureReconciliationSuppressions,
      pastCommands: useProjectStore.getState().pastCommands,
    });

    const result = await useProjectStore.getState().applyLegacyArchitectureReconciliationPlan(plan);
    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/stale/i);

    const after = JSON.stringify({
      architectureNodes: useProjectStore.getState().architectureNodes,
      architectureConnections: useProjectStore.getState().architectureConnections,
      suppressions: useProjectStore.getState().architectureReconciliationSuppressions,
      pastCommands: useProjectStore.getState().pastCommands,
    });
    expect(after).toBe(before);
  });

  it('applies all reviewed changes as one command and undo/redo restores the full reconciliation state', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('controller', 'Controller', 'Processing')],
    }));
    const source = adopted.nodes?.[0] as CustomNode;
    const changed: Project = {
      ...adopted,
      nodes: [
        {
          ...source,
          data: { ...source.data, name: 'Controller From Source' },
        },
        legacyNode('optional-led', 'Optional LED', 'Feedback'),
      ],
    };

    const { plan } = await reconciliationPlan(changed, [
      {
        kind: 'node',
        sourceEntityId: 'controller',
        action: 'take-source',
      },
      {
        kind: 'node',
        sourceEntityId: 'optional-led',
        action: 'reject-source',
      },
    ]);
    expect(plan.canApply).toBe(true);

    loadStore(changed);
    await useProjectStore.getState().applyLegacyArchitectureReconciliationPlan(plan);

    let state = useProjectStore.getState();
    expect(state.architectureNodes?.[0].name).toBe('Controller From Source');
    expect(state.architectureReconciliationSuppressions).toHaveLength(1);
    expect(state.pastCommands).toHaveLength(1);
    expect(state.pastCommands[0].type).toBe('RECONCILE_LEGACY_ARCHITECTURE');

    state.undoProjectCommand();
    state = useProjectStore.getState();
    expect(state.architectureNodes?.[0].name).toBe('Controller');
    expect(state.architectureReconciliationSuppressions || []).toHaveLength(0);

    state.redoProjectCommand();
    state = useProjectStore.getState();
    expect(state.architectureNodes?.[0].name).toBe('Controller From Source');
    expect(state.architectureReconciliationSuppressions).toHaveLength(1);
  });
});
