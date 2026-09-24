import { beforeEach, describe, expect, it } from 'vitest';
import type { CustomNode, Project } from '../types';
import { previewLegacyRequirementsAdoption } from '../lib/product/legacyRequirementsAdoption';
import {
  buildLegacyRequirementsAdoptionApplyPlan,
  projectPatchFromLegacyRequirementsApplyPlan,
} from '../lib/product/legacyRequirementsAdoptionApply';
import {
  previewLegacyRequirementsReconciliation,
} from '../lib/product/legacyRequirementsReconciliation';
import {
  buildLegacyRequirementsReconciliationApplyPlan,
  projectPatchFromRequirementsReconciliationPlan,
} from '../lib/product/legacyRequirementsReconciliationApply';
import { useProjectStore } from '../store/projectStore';

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
    id: 'requirements-reconcile-apply',
    projectName: 'Requirements Reconcile Apply Fixture',
    description: '',
    createdAt: '2026-09-25T00:00:00.000Z',
    updatedAt: '2026-09-25T00:00:00.000Z',
    version: '9',
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
    nodes: [legacyNode('controller', 'Controller', 'Original requirement.')],
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
  return { ...source, ...projectPatchFromLegacyRequirementsApplyPlan(plan) };
}

describe('reviewed requirements reconciliation apply', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('take-source updates only source-backed text and preserves reviewed canonical semantics', async () => {
    const source = await adoptedProject();
    source.nodes = [legacyNode('controller', 'Controller', 'Updated source text.')];
    source.requirements = source.requirements?.map((requirement) => ({
      ...requirement,
      priority: 'High',
      status: 'Approved',
      acceptanceCriteria: ['Latency is measured against an approved threshold.'],
    }));

    const preview = await previewLegacyRequirementsReconciliation(source);
    expect(preview.items[0].classification).toBe('conflict');

    const plan = await buildLegacyRequirementsReconciliationApplyPlan(
      source,
      preview,
      [{ sourceEntityId: 'controller', action: 'take-source' }],
      { reviewerId: 'reviewer-2', reviewedAt: '2026-09-25T00:10:00.000Z' },
    );

    expect(plan.canApply).toBe(true);
    const next = projectPatchFromRequirementsReconciliationPlan(plan).requirements?.[0];
    expect(next).toMatchObject({
      description: 'Updated source text.',
      priority: 'High',
      status: 'Approved',
      acceptanceCriteria: ['Latency is measured against an approved threshold.'],
    });
    expect(next?.reconciliationBaseline).toMatchObject({
      sourcePresence: 'present',
      resolution: 'take-source',
      reviewedBy: 'reviewer-2',
    });
  });

  it('keep-local acknowledges the new source baseline without overwriting canonical edits', async () => {
    const source = await adoptedProject();
    source.nodes = [legacyNode('controller', 'Controller', 'Changed legacy source.')];
    const originalDescription = source.requirements?.[0].description;

    const preview = await previewLegacyRequirementsReconciliation(source);
    const plan = await buildLegacyRequirementsReconciliationApplyPlan(
      source,
      preview,
      [{ sourceEntityId: 'controller', action: 'keep-local' }],
      { reviewerId: 'reviewer-2', reviewedAt: '2026-09-25T00:10:00.000Z' },
    );
    expect(plan.canApply).toBe(true);

    const reconciled = { ...source, ...projectPatchFromRequirementsReconciliationPlan(plan) };
    expect(reconciled.requirements?.[0].description).toBe(originalDescription);

    const nextPreview = await previewLegacyRequirementsReconciliation(reconciled);
    expect(nextPreview.items[0].classification).toBe('unchanged');
  });

  it('reviews source deletion without silently deleting the canonical requirement', async () => {
    const source = await adoptedProject();
    source.nodes = [];

    const preview = await previewLegacyRequirementsReconciliation(source);
    const plan = await buildLegacyRequirementsReconciliationApplyPlan(
      source,
      preview,
      [{ sourceEntityId: 'controller', action: 'keep-canonical' }],
      { reviewerId: 'reviewer-2', reviewedAt: '2026-09-25T00:10:00.000Z' },
    );
    expect(plan.canApply).toBe(true);

    const reconciled = { ...source, ...projectPatchFromRequirementsReconciliationPlan(plan) };
    expect(reconciled.requirements).toHaveLength(1);
    expect(reconciled.requirements?.[0].reconciliationBaseline?.sourcePresence).toBe('deleted');

    const nextPreview = await previewLegacyRequirementsReconciliation(reconciled);
    expect(nextPreview.items[0].classification).toBe('unchanged');
  });

  it('suppresses an explicitly rejected new source only for its exact source hash', async () => {
    const source = await adoptedProject();
    source.nodes = [
      legacyNode('controller', 'Controller', 'Original requirement.'),
      legacyNode('sensor', 'Sensor', 'First sensor source text.'),
    ];

    const preview = await previewLegacyRequirementsReconciliation(source);
    const plan = await buildLegacyRequirementsReconciliationApplyPlan(
      source,
      preview,
      [{ sourceEntityId: 'sensor', action: 'reject-source' }],
      { reviewerId: 'reviewer-2', reviewedAt: '2026-09-25T00:10:00.000Z' },
    );
    expect(plan.canApply).toBe(true);

    const reconciled = { ...source, ...projectPatchFromRequirementsReconciliationPlan(plan) };
    expect(reconciled.requirementsReconciliationSuppressions).toHaveLength(1);

    const suppressedPreview = await previewLegacyRequirementsReconciliation(reconciled);
    expect(suppressedPreview.items.find((item) => item.sourceEntityId === 'sensor')).toMatchObject({
      classification: 'unchanged',
      suppressed: true,
    });

    reconciled.nodes = [
      legacyNode('controller', 'Controller', 'Original requirement.'),
      legacyNode('sensor', 'Sensor', 'Changed sensor source text.'),
    ];
    const changedPreview = await previewLegacyRequirementsReconciliation(reconciled);
    expect(changedPreview.items.find((item) => item.sourceEntityId === 'sensor')).toMatchObject({
      classification: 'new-source',
      suppressed: false,
    });
  });

  it('requires explicit type and priority when a new source is adopted', async () => {
    const source = await adoptedProject();
    source.nodes = [
      legacyNode('controller', 'Controller', 'Original requirement.'),
      legacyNode('sensor', 'Sensor', 'New source.'),
    ];
    const preview = await previewLegacyRequirementsReconciliation(source);

    const incomplete = await buildLegacyRequirementsReconciliationApplyPlan(
      source,
      preview,
      [{ sourceEntityId: 'sensor', action: 'adopt-source' }],
      { reviewerId: 'reviewer-2', reviewedAt: '2026-09-25T00:10:00.000Z' },
    );
    expect(incomplete.canApply).toBe(false);
    expect(incomplete.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'manual-resolution-incomplete' }),
    ]));

    const resolved = await buildLegacyRequirementsReconciliationApplyPlan(
      source,
      preview,
      [{
        sourceEntityId: 'sensor',
        action: 'adopt-source',
        manualRequirement: { type: 'Electrical', priority: 'High' },
      }],
      { reviewerId: 'reviewer-2', reviewedAt: '2026-09-25T00:10:00.000Z' },
    );
    expect(resolved.canApply).toBe(true);
    expect(resolved.requirements.find((requirement) => requirement.title === 'Sensor requirement notes')).toMatchObject({
      type: 'Electrical',
      priority: 'High',
      status: 'Draft',
      acceptanceCriteria: [],
    });
  });

  it('store rejects a reviewed plan if source changes after preview and performs zero mutation', async () => {
    const source = await adoptedProject();
    source.nodes = [legacyNode('controller', 'Controller', 'Changed source before review.')];
    const preview = await previewLegacyRequirementsReconciliation(source);
    const plan = await buildLegacyRequirementsReconciliationApplyPlan(
      source,
      preview,
      [{ sourceEntityId: 'controller', action: 'keep-local' }],
      { reviewerId: 'reviewer-2', reviewedAt: '2026-09-25T00:10:00.000Z' },
    );

    useProjectStore.setState({
      ...useProjectStore.getState(),
      ...source,
      nodes: [legacyNode('controller', 'Controller', 'Changed again after review.')],
      pastCommands: [],
      futureCommands: [],
    });

    const before = JSON.stringify(useProjectStore.getState().requirements);
    const result = await useProjectStore.getState().applyLegacyRequirementsReconciliationPlan(plan);

    expect(result.success).toBe(false);
    expect(result.reason).toMatch(/stale/i);
    expect(JSON.stringify(useProjectStore.getState().requirements)).toBe(before);
    expect(useProjectStore.getState().pastCommands).toHaveLength(0);
  });

  it('store applies reconciliation as one undoable command', async () => {
    const source = await adoptedProject();
    source.nodes = [legacyNode('controller', 'Controller', 'Updated source.')];

    useProjectStore.setState({
      ...useProjectStore.getState(),
      ...source,
      pastCommands: [],
      futureCommands: [],
    });

    const preview = await previewLegacyRequirementsReconciliation(source);
    const plan = await buildLegacyRequirementsReconciliationApplyPlan(
      source,
      preview,
      [{ sourceEntityId: 'controller', action: 'take-source' }],
      { reviewerId: 'reviewer-2', reviewedAt: '2026-09-25T00:10:00.000Z' },
    );

    expect(await useProjectStore.getState().applyLegacyRequirementsReconciliationPlan(plan))
      .toEqual({ success: true });

    let state = useProjectStore.getState();
    expect(state.requirements?.[0].description).toBe('Updated source.');
    expect(state.pastCommands.at(-1)?.type).toBe('RECONCILE_LEGACY_REQUIREMENTS');

    state.undoProjectCommand();
    state = useProjectStore.getState();
    expect(state.requirements?.[0].description).toBe('Original requirement.');

    state.redoProjectCommand();
    state = useProjectStore.getState();
    expect(state.requirements?.[0].description).toBe('Updated source.');
  });
});
