import { beforeEach, describe, expect, it } from 'vitest';
import type { CustomNode, Project } from '../types';
import { previewLegacyRequirementsAdoption } from '../lib/product/legacyRequirementsAdoption';
import {
  buildLegacyRequirementsAdoptionApplyPlan,
  projectPatchFromLegacyRequirementsApplyPlan,
} from '../lib/product/legacyRequirementsAdoptionApply';
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
    id: 'requirements-apply-project',
    projectName: 'Requirements Apply Fixture',
    description: '',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z',
    version: '5',
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
    architectureNodes: [],
    architectureConnections: [],
    ...overrides,
  } as Project;
}

describe('reviewed legacy requirements adoption apply', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('requires explicit type and priority and creates only Draft provisional requirements', async () => {
    const source = project({
      nodes: [legacyNode('controller', 'Controller', 'Must report status within the accepted latency.')],
    });
    const preview = await previewLegacyRequirementsAdoption(source);

    const unresolved = buildLegacyRequirementsAdoptionApplyPlan(
      source,
      preview,
      [{ sourceNodeId: 'controller', decision: 'adopt' }],
      { reviewerId: 'reviewer-1', reviewedAt: '2026-09-24T00:10:00.000Z' },
    );
    expect(unresolved.canApply).toBe(false);
    expect(unresolved.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'requirement-resolution-incomplete' }),
    ]));

    const resolved = buildLegacyRequirementsAdoptionApplyPlan(
      source,
      preview,
      [{
        sourceNodeId: 'controller',
        decision: 'adopt',
        type: 'Functional',
        priority: 'High',
      }],
      { reviewerId: 'reviewer-1', reviewedAt: '2026-09-24T00:10:00.000Z' },
    );

    expect(resolved.canApply).toBe(true);
    const requirement = projectPatchFromLegacyRequirementsApplyPlan(resolved).requirements?.[0];
    expect(requirement).toMatchObject({
      title: 'Controller requirement notes',
      description: 'Must report status within the accepted latency.',
      type: 'Functional',
      priority: 'High',
      status: 'Draft',
      acceptanceCriteria: [],
      linkedArchitectureNodeIds: [],
      linkedComponentIds: [],
      linkedFirmwareModuleIds: [],
      linkedTestIds: [],
      risks: [],
      provenance: {
        origin: 'imported',
        qualification: 'provisional',
        reviewedBy: 'reviewer-1',
      },
      sourceIdentity: {
        system: 'hardware-studio-legacy-node-requirements',
        entityId: 'node:controller:requirements',
      },
    });
    expect(requirement?.reconciliationBaseline?.sourceContentHash).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(requirement?.reconciliationBaseline?.canonicalSnapshot).toMatchObject({
      type: 'Functional',
      priority: 'High',
      status: 'Draft',
    });
  });

  it('rejects stale previews and existing canonical requirements', async () => {
    const source = project({
      nodes: [legacyNode('controller', 'Controller', 'Legacy text')],
    });
    const preview = await previewLegacyRequirementsAdoption(source);

    const stale = buildLegacyRequirementsAdoptionApplyPlan(
      { ...source, version: '6' },
      preview,
      [{ sourceNodeId: 'controller', decision: 'adopt', type: 'Functional', priority: 'Medium' }],
      { reviewerId: 'reviewer-1', reviewedAt: '2026-09-24T00:10:00.000Z' },
    );
    expect(stale.canApply).toBe(false);
    expect(stale.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'preview-revision-stale' }),
    ]));
  });

  it('applies as one command and undo/redo preserves the legacy source', async () => {
    const source = project({
      nodes: [legacyNode('controller', 'Controller', 'Legacy requirement text')],
    });
    useProjectStore.setState({
      ...useProjectStore.getState(),
      ...source,
      pastCommands: [],
      futureCommands: [],
    });

    const preview = await previewLegacyRequirementsAdoption(source);
    const plan = buildLegacyRequirementsAdoptionApplyPlan(
      source,
      preview,
      [{ sourceNodeId: 'controller', decision: 'adopt', type: 'Functional', priority: 'Medium' }],
      { reviewerId: 'reviewer-1', reviewedAt: '2026-09-24T00:10:00.000Z' },
    );

    expect(useProjectStore.getState().applyLegacyRequirementsAdoptionPlan(plan)).toEqual({ success: true });
    let state = useProjectStore.getState();
    expect(state.requirements).toHaveLength(1);
    expect(state.nodes[0].data.requirements).toBe('Legacy requirement text');
    expect(state.pastCommands.at(-1)?.type).toBe('ADOPT_LEGACY_REQUIREMENTS');

    state.undoProjectCommand();
    state = useProjectStore.getState();
    expect(state.requirements).toHaveLength(0);
    expect(state.nodes[0].data.requirements).toBe('Legacy requirement text');

    state.redoProjectCommand();
    state = useProjectStore.getState();
    expect(state.requirements).toHaveLength(1);
  });
});
