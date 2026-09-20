import { describe, expect, it } from 'vitest';
import type { CustomEdge, CustomNode, Project } from '../types';
import { previewLegacyArchitectureAdoption } from '../lib/product/legacyArchitectureAdoption';
import {
  buildLegacyArchitectureAdoptionApplyPlan,
  projectPatchFromLegacyArchitectureApplyPlan,
} from '../lib/product/legacyArchitectureAdoptionApply';
import {
  previewLegacyArchitectureReconciliation,
} from '../lib/product/legacyArchitectureReconciliation';

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

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'reconcile-project',
    projectName: 'Reconciliation Fixture',
    description: '',
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    version: '12',
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

async function adopt(source: Project): Promise<Project> {
  const preview = await previewLegacyArchitectureAdoption(source);
  const nodeResolutions = preview.nodeProposals.map((proposal) => ({
    sourceNodeId: proposal.sourceNodeId,
    decision: 'adopt' as const,
  }));
  const connectionResolutions = preview.connectionProposals.map((proposal) => ({
    sourceEdgeId: proposal.sourceEdgeId,
    decision: 'adopt' as const,
  }));

  const plan = buildLegacyArchitectureAdoptionApplyPlan(
    source,
    preview,
    nodeResolutions,
    connectionResolutions,
    {
      reviewerId: 'reviewer-reconcile',
      reviewedAt: '2026-09-20T01:00:00.000Z',
    },
  );

  if (!plan.canApply) {
    throw new Error(`Test fixture could not be adopted: ${JSON.stringify(plan.issues)}`);
  }

  return {
    ...source,
    ...projectPatchFromLegacyArchitectureApplyPlan(plan),
  };
}

describe('legacy architecture reconciliation preview', () => {
  it('is mutation-free and classifies unchanged adopted nodes', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('power', 'Battery Power', 'Power')],
    }));
    const before = JSON.stringify(adopted);

    const result = await previewLegacyArchitectureReconciliation(adopted);

    expect(JSON.stringify(adopted)).toBe(before);
    expect(result.mutationFree).toBe(true);
    expect(result.summary.unchanged).toBe(1);
    expect(result.summary.conflict).toBe(0);
    expect(result.items[0]).toMatchObject({
      kind: 'node',
      classification: 'unchanged',
      sourceEntityId: 'power',
      sourceContentChanged: false,
      localSemanticChanged: false,
      sourceSemanticChanged: false,
      sourceSemanticsResolved: true,
    });
  });

  it('classifies a source-only semantic change when canonical state stayed at baseline', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('sensor', 'Temperature Sensor', 'Input')],
    }));

    const updatedSourceNode = {
      ...(adopted.nodes?.[0] as CustomNode),
      data: {
        ...(adopted.nodes?.[0] as CustomNode).data,
        name: 'Environmental Sensor',
        description: 'Updated source description',
      },
    };

    const result = await previewLegacyArchitectureReconciliation({
      ...adopted,
      nodes: [updatedSourceNode],
    });

    const item = result.items.find((candidate) => candidate.sourceEntityId === 'sensor');
    expect(item).toMatchObject({
      classification: 'source-only-change',
      sourceContentChanged: true,
      localSemanticChanged: false,
      sourceSemanticChanged: true,
    });
    expect(item?.fieldDiffs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        field: 'name',
        baseline: 'Temperature Sensor',
        currentCanonical: 'Temperature Sensor',
        currentSource: 'Environmental Sensor',
        localChanged: false,
        sourceChanged: true,
      }),
    ]));
  });

  it('classifies a local-only semantic change when the source stayed at baseline', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('controller', 'Main Controller', 'Processing')],
    }));
    const canonical = adopted.architectureNodes?.[0];
    if (!canonical) throw new Error('missing canonical fixture');

    const result = await previewLegacyArchitectureReconciliation({
      ...adopted,
      architectureNodes: [{
        ...canonical,
        name: 'Locally Renamed Controller',
      }],
    });

    const item = result.items.find((candidate) => candidate.sourceEntityId === 'controller');
    expect(item).toMatchObject({
      classification: 'local-only-change',
      sourceContentChanged: false,
      localSemanticChanged: true,
      sourceSemanticChanged: false,
    });
  });

  it('classifies source and local changes after the same baseline as an explicit conflict', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('controller', 'Main Controller', 'Processing')],
    }));
    const canonical = adopted.architectureNodes?.[0];
    const source = adopted.nodes?.[0] as CustomNode;
    if (!canonical || !source) throw new Error('missing conflict fixture');

    const result = await previewLegacyArchitectureReconciliation({
      ...adopted,
      nodes: [{
        ...source,
        data: {
          ...source.data,
          name: 'Source Renamed Controller',
        },
      }],
      architectureNodes: [{
        ...canonical,
        name: 'Locally Renamed Controller',
      }],
    });

    const item = result.items.find((candidate) => candidate.sourceEntityId === 'controller');
    expect(item).toMatchObject({
      classification: 'conflict',
      sourceContentChanged: true,
      localSemanticChanged: true,
      sourceSemanticChanged: true,
    });
    expect(result.hasConflicts).toBe(true);
  });

  it('does not silently match a renamed source id by similar name', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('power-old', 'Battery Power', 'Power')],
    }));
    const renamed = legacyNode('power-new', 'Battery Power', 'Power');

    const result = await previewLegacyArchitectureReconciliation({
      ...adopted,
      nodes: [renamed],
    });

    expect(result.items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'node',
        sourceEntityId: 'power-old',
        classification: 'source-deleted',
      }),
      expect.objectContaining({
        kind: 'node',
        sourceEntityId: 'power-new',
        classification: 'new-source',
      }),
    ]));
    expect(result.summary['source-deleted']).toBe(1);
    expect(result.summary['new-source']).toBe(1);
  });

  it('classifies adopted source deletion without deleting canonical state', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('feedback', 'Status LED', 'Feedback')],
    }));
    const beforeCanonical = JSON.stringify(adopted.architectureNodes);

    const result = await previewLegacyArchitectureReconciliation({
      ...adopted,
      nodes: [],
    });

    expect(result.items).toEqual(expect.arrayContaining([
      expect.objectContaining({
        sourceEntityId: 'feedback',
        classification: 'source-deleted',
      }),
    ]));
    expect(JSON.stringify(adopted.architectureNodes)).toBe(beforeCanonical);
  });

  it('classifies connection changes through preserved source identity and baseline', async () => {
    const edge: CustomEdge = {
      id: 'power-edge',
      source: 'power',
      target: 'controller',
      label: '3V3 rail',
      data: {
        semanticType: 'Power',
        direction: 'Forward',
        voltage: 3.3,
      },
    };
    const adopted = await adopt(project({
      nodes: [
        legacyNode('power', 'Battery Power', 'Power'),
        legacyNode('controller', 'Main Controller', 'Processing'),
      ],
      edges: [edge],
    }));
    const sourceEdge = adopted.edges?.[0] as CustomEdge;

    const result = await previewLegacyArchitectureReconciliation({
      ...adopted,
      edges: [{
        ...sourceEdge,
        label: '3V3 regulated rail',
      }],
    });

    const item = result.items.find((candidate) => candidate.kind === 'connection');
    expect(item).toMatchObject({
      classification: 'source-only-change',
      sourceEntityId: 'power-edge',
      sourceContentChanged: true,
      localSemanticChanged: false,
      sourceSemanticChanged: true,
    });
  });

  it('reports missing reconciliation baseline as a conflict instead of guessing', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('power', 'Battery Power', 'Power')],
    }));
    const canonical = adopted.architectureNodes?.[0];
    if (!canonical) throw new Error('missing baseline fixture');

    const result = await previewLegacyArchitectureReconciliation({
      ...adopted,
      architectureNodes: [{
        ...canonical,
        reconciliationBaseline: undefined,
      }],
    });

    expect(result.items[0].classification).toBe('conflict');
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'missing-reconciliation-baseline',
        canonicalEntityId: canonical.id,
      }),
    ]));
  });

  it('reports duplicate canonical source identity as an integrity conflict', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('power', 'Battery Power', 'Power')],
    }));
    const canonical = adopted.architectureNodes?.[0];
    if (!canonical) throw new Error('missing duplicate fixture');

    const result = await previewLegacyArchitectureReconciliation({
      ...adopted,
      architectureNodes: [
        canonical,
        { ...canonical, id: 'duplicate-canonical-node' },
      ],
    });

    expect(result.hasConflicts).toBe(true);
    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'duplicate-canonical-source-identity',
        sourceEntityId: 'power',
      }),
    ]));
  });

  it('keeps source changes with unresolved semantics visible rather than fabricating a mapping', async () => {
    const adopted = await adopt(project({
      nodes: [legacyNode('power', 'Battery Power', 'Power')],
    }));
    const source = adopted.nodes?.[0] as CustomNode;

    const result = await previewLegacyArchitectureReconciliation({
      ...adopted,
      nodes: [{
        ...source,
        data: {
          ...source.data,
          category: 'Integration',
        },
      }],
    });

    const item = result.items[0];
    expect(item).toMatchObject({
      classification: 'source-only-change',
      sourceContentChanged: true,
      sourceSemanticsResolved: false,
      localSemanticChanged: false,
    });
    expect(item.sourceIssues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: 'legacy-node-category-unmapped',
        severity: 'blocker',
      }),
    ]));
  });
});
