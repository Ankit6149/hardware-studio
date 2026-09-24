import { describe, expect, it } from 'vitest';
import type { CustomNode, Project } from '../types';
import { previewLegacyRequirementsAdoption } from '../lib/product/legacyRequirementsAdoption';
import {
  buildLegacyRequirementsAdoptionApplyPlan,
  projectPatchFromLegacyRequirementsApplyPlan,
} from '../lib/product/legacyRequirementsAdoptionApply';
import {
  fingerprintLegacyRequirementsReconciliation,
  previewLegacyRequirementsReconciliation,
} from '../lib/product/legacyRequirementsReconciliation';

function legacyNode(id: string, name: string, requirements: string): CustomNode {
  return {
    id,
    type: 'default',
    position: { x: 0, y: 0 },
    data: {
      name,
      category: 'Processing',
      status: 'MVP',
      description: '',
      purpose: '',
      requirements,
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
    id: 'requirements-reconcile-project',
    projectName: 'Requirements Reconcile Fixture',
    description: '',
    createdAt: '2026-09-25T00:00:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
    version: '8',
    schemaVersion: 6,
    activeView: 'requirements',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    requirements: [],
    requirementsReconciliationSuppressions: [],
    architectureNodes: [],
    architectureConnections: [],
    ...overrides,
  } as Project;
}

async function adoptedProject(): Promise<Project> {
  const source = project({
    nodes: [legacyNode('controller', 'Controller', 'Original source requirement.')],
  });
  const preview = await previewLegacyRequirementsAdoption(source);
  const plan = buildLegacyRequirementsAdoptionApplyPlan(
    source,
    preview,
    [{
      sourceNodeId: 'controller',
      decision: 'adopt',
      type: 'Functional',
      priority: 'Medium',
    }],
    { reviewerId: 'reviewer-1', reviewedAt: '2026-09-25T00:05:00.000Z' },
  );
  expect(plan.canApply).toBe(true);
  return { ...source, ...projectPatchFromLegacyRequirementsApplyPlan(plan) };
}

describe('legacy requirements three-way reconciliation preview', () => {
  it('classifies unchanged adopted requirements deterministically without mutation', async () => {
    const source = await adoptedProject();
    const before = JSON.stringify(source);

    const first = await previewLegacyRequirementsReconciliation(source);
    const second = await previewLegacyRequirementsReconciliation(source);

    expect(JSON.stringify(source)).toBe(before);
    expect(first.summary.unchanged).toBe(1);
    expect(first.items[0].classification).toBe('unchanged');
    expect(await fingerprintLegacyRequirementsReconciliation(first))
      .toBe(await fingerprintLegacyRequirementsReconciliation(second));
  });

  it('classifies a changed legacy note as source-only when canonical semantics stayed at baseline', async () => {
    const source = await adoptedProject();
    source.nodes = [legacyNode('controller', 'Controller', 'Updated source requirement.')];

    const preview = await previewLegacyRequirementsReconciliation(source);

    expect(preview.items[0]).toMatchObject({
      classification: 'source-only-change',
      sourceContentChanged: true,
      localSemanticChanged: false,
    });
    expect(preview.items[0].fieldDiffs).toEqual(expect.arrayContaining([
      expect.objectContaining({
        field: 'description',
        sourceChanged: true,
        localChanged: false,
      }),
    ]));
  });

  it('classifies canonical edits as local-only while the legacy source remains unchanged', async () => {
    const source = await adoptedProject();
    source.requirements = source.requirements?.map((requirement) => ({
      ...requirement,
      priority: 'High',
    }));

    const preview = await previewLegacyRequirementsReconciliation(source);

    expect(preview.items[0]).toMatchObject({
      classification: 'local-only-change',
      localSemanticChanged: true,
      sourceContentChanged: false,
    });
    expect(preview.items[0].fieldDiffs).toEqual(expect.arrayContaining([
      expect.objectContaining({ field: 'priority', localChanged: true }),
    ]));
  });

  it('classifies simultaneous source and canonical edits as a conflict', async () => {
    const source = await adoptedProject();
    source.nodes = [legacyNode('controller', 'Controller', 'Changed source text.')];
    source.requirements = source.requirements?.map((requirement) => ({
      ...requirement,
      priority: 'High',
    }));

    const preview = await previewLegacyRequirementsReconciliation(source);

    expect(preview.items[0].classification).toBe('conflict');
    expect(preview.hasConflicts).toBe(true);
  });

  it('never infers deletion when the legacy source disappears', async () => {
    const source = await adoptedProject();
    source.nodes = [];

    const preview = await previewLegacyRequirementsReconciliation(source);

    expect(preview.items[0]).toMatchObject({
      classification: 'source-deleted',
      canonicalEntityId: source.requirements?.[0].id,
    });
    expect(source.requirements).toHaveLength(1);
  });

  it('surfaces a new source note separately from already adopted requirements', async () => {
    const source = await adoptedProject();
    source.nodes = [
      legacyNode('controller', 'Controller', 'Original source requirement.'),
      legacyNode('sensor', 'Sensor', 'New sensor requirement.'),
    ];

    const preview = await previewLegacyRequirementsReconciliation(source);

    expect(preview.summary.unchanged).toBe(1);
    expect(preview.summary['new-source']).toBe(1);
    expect(preview.items.find((item) => item.sourceEntityId === 'sensor')).toMatchObject({
      classification: 'new-source',
      canonicalEntityId: undefined,
    });
  });

  it('reports duplicate canonical source identity as integrity conflict', async () => {
    const source = await adoptedProject();
    const adopted = source.requirements?.[0];
    expect(adopted?.sourceIdentity).toBeDefined();
    source.requirements = [
      adopted!,
      { ...adopted!, id: 'duplicate-canonical-requirement' },
    ];

    const preview = await previewLegacyRequirementsReconciliation(source);

    expect(preview.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'duplicate-canonical-source-identity' }),
    ]));
    expect(preview.items[0].classification).toBe('conflict');
  });
});
