import { describe, expect, it } from 'vitest';
import type { Project } from '../types';
import { deserializeProject, serializeProject } from '../lib/projectSerialization';

describe('requirements reconciliation persistence', () => {
  it('preserves requirement source identity, baseline, and exact-hash suppression', () => {
    const project = {
      id: 'requirements-persistence-project',
      projectName: 'Persistence',
      description: '',
      createdAt: '2026-09-25T00:00:00.000Z',
      updatedAt: '2026-09-25T00:00:00.000Z',
      version: '1',
      schemaVersion: 6,
      activeView: 'requirements',
      nodes: [],
      edges: [],
      bom: [],
      testing: [],
      powerBudget: [],
      pinMap: [],
      firmwareTasks: [],
      requirements: [{
        id: 'req-1',
        title: 'Controller requirement notes',
        description: 'Source text',
        type: 'Functional',
        priority: 'Medium',
        status: 'Draft',
        acceptanceCriteria: [],
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [],
        linkedFirmwareModuleIds: [],
        linkedTestIds: [],
        risks: [],
        sourceIdentity: {
          system: 'hardware-studio-legacy-node-requirements',
          documentId: 'requirements-persistence-project',
          entityId: 'node:controller:requirements',
          revision: '1',
          contentHash: 'sha256:abc',
          adapterId: 'legacy-requirements-adoption',
          adapterVersion: '1',
        },
        reconciliationBaseline: {
          adoptionSessionId: 'session-1',
          sourceContentHash: 'sha256:abc',
          adoptedAt: '2026-09-25T00:00:00.000Z',
          canonicalSnapshot: { title: 'Controller requirement notes' },
          sourceSnapshot: { title: 'Controller requirement notes', description: 'Source text' },
          sourcePresence: 'present',
          resolution: 'adopted',
        },
      }],
      requirementsReconciliationSuppressions: [{
        sourceIdentity: {
          system: 'hardware-studio-legacy-node-requirements',
          documentId: 'requirements-persistence-project',
          entityId: 'node:sensor:requirements',
          revision: '1',
          contentHash: 'sha256:def',
          adapterId: 'legacy-requirements-adoption',
          adapterVersion: '1',
        },
        sourceContentHash: 'sha256:def',
        decision: 'reject-new-source',
        reviewedAt: '2026-09-25T00:10:00.000Z',
        reviewedBy: 'reviewer-1',
      }],
    } as Project;

    const restored = deserializeProject(serializeProject(project));

    expect(restored.requirements?.[0].sourceIdentity).toMatchObject({
      entityId: 'node:controller:requirements',
      contentHash: 'sha256:abc',
    });
    expect(restored.requirements?.[0].reconciliationBaseline).toMatchObject({
      sourceContentHash: 'sha256:abc',
      sourcePresence: 'present',
    });
    expect(restored.requirementsReconciliationSuppressions?.[0]).toMatchObject({
      sourceContentHash: 'sha256:def',
      decision: 'reject-new-source',
      reviewedBy: 'reviewer-1',
    });
  });
});
