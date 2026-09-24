import { describe, expect, it } from 'vitest';
import type { CustomNode, Project } from '../types';
import { previewLegacyRequirementsAdoption } from '../lib/product/legacyRequirementsAdoption';

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
      risks: 'Legacy risk context',
      mitigation: 'Legacy mitigation context',
      notes: '',
      testingNotes: 'Legacy test context',
      views: ['master'],
    },
  };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'requirements-adoption-project',
    projectName: 'Requirements Adoption Fixture',
    description: '',
    createdAt: '2026-09-24T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z',
    version: '4',
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

describe('legacy requirements adoption preview', () => {
  it('is deterministic and mutation-free', async () => {
    const source = project({
      nodes: [legacyNode('controller', 'Controller', 'Must report status within the accepted latency.')],
    });
    const before = JSON.stringify(source);

    const first = await previewLegacyRequirementsAdoption(source);
    const second = await previewLegacyRequirementsAdoption(source);

    expect(JSON.stringify(source)).toBe(before);
    expect(first.adoptionSessionId).toBe(second.adoptionSessionId);
    expect(first.proposals[0].canonicalId).toBe(second.proposals[0].canonicalId);
    expect(first.proposals[0].sourceIdentity.contentHash).toBe(second.proposals[0].sourceIdentity.contentHash);
    expect(first.proposals[0].sourceIdentity.contentHash).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('preserves the legacy field as one source note and refuses to infer semantics', async () => {
    const text = 'Must run for 8 hours; maybe IP54; battery target TBD.';
    const preview = await previewLegacyRequirementsAdoption(project({
      nodes: [legacyNode('controller', 'Controller', text)],
    }));

    expect(preview.proposals).toHaveLength(1);
    expect(preview.proposals[0]).toMatchObject({
      sourceNodeId: 'controller',
      proposedTitle: 'Controller requirement notes',
      sourceDescription: text,
      canAdoptWithoutResolution: false,
      sourceIdentity: {
        system: 'hardware-studio-legacy-node-requirements',
        documentId: 'requirements-adoption-project',
        entityId: 'node:controller:requirements',
        revision: '4',
        adapterId: 'legacy-requirements-adoption',
        adapterVersion: '1',
      },
    });
    expect(preview.proposals[0].issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'legacy-requirement-type-unresolved',
      'legacy-requirement-priority-unresolved',
      'legacy-requirement-context-unmapped',
    ]));
    expect(preview.canApplyWithoutResolution).toBe(false);
  });

  it('does not split or parse free text into acceptance criteria, priority, or status', async () => {
    const preview = await previewLegacyRequirementsAdoption(project({
      nodes: [legacyNode('power', 'Power', 'Critical: battery > 8 hours; verify with load test.')],
    }));

    const proposal = preview.proposals[0];
    expect(proposal.sourceDescription).toBe('Critical: battery > 8 hours; verify with load test.');
    expect(proposal).not.toHaveProperty('type');
    expect(proposal).not.toHaveProperty('priority');
    expect(proposal).not.toHaveProperty('acceptanceCriteria');
  });

  it('blocks one-way adoption once canonical requirements exist', async () => {
    const preview = await previewLegacyRequirementsAdoption(project({
      nodes: [legacyNode('controller', 'Controller', 'Legacy text')],
      requirements: [{
        id: 'canonical',
        title: 'Canonical',
        description: 'Already reviewed',
        type: 'Functional',
        priority: 'High',
        status: 'Draft',
        acceptanceCriteria: [],
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [],
        linkedFirmwareModuleIds: [],
        linkedTestIds: [],
        risks: [],
      }],
    }));

    expect(preview.canonicalStatePresent).toBe(true);
    expect(preview.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'canonical-requirements-already-present', severity: 'blocker' }),
    ]));
  });
});
