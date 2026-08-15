import { describe, expect, it } from 'vitest';
import {
  approveRelease,
  createBranch,
  createNamedRevision,
  createReleaseCandidate,
  validateReleaseEligibility,
  verifyReleaseCandidateIntegrity,
} from '../lib/releaseEngine';
import { sha256Hex } from '../lib/releaseIntegrity';
import type { Project } from '../types';

function sampleProject(): Project {
  return {
    id: 'proj_rel_test',
    projectName: 'Release Test Project',
    description: '',
    createdAt: '',
    updatedAt: '',
    version: '5',
    activeView: 'dashboard',
    activeBoardId: 'b1',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    boards: [{ id: 'b1', name: 'Main PCB', boardType: 'Main PCB', purpose: 'Main', dimensionsMm: '50x50', layerCount: 2, substrate: 'FR4', placement: 'Internal', mountingNotes: '', connectorNotes: '', thermalNotes: '', rfNotes: '', status: 'Concept' }],
    boardOutlines: [{ id: 'bo1', boardId: 'b1', points: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 50 }, { x: 0, y: 50 }] }],
    validationTests: [],
    validationRuns: [],
  };
}

describe('Versioned Revision and Release Engine Tests', () => {
  it('uses a browser-safe SHA-256 implementation for snapshot fingerprints', () => {
    expect(sha256Hex('abc')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });

  it('creates a named revision snapshot and a branch from it', () => {
    const project = sampleProject();
    const revision = createNamedRevision(project, 'v1.0.0-alpha', 'Initial alpha snapshot');
    expect(revision.name).toBe('v1.0.0-alpha');
    expect(revision.status).toBe('Named Version');
    expect(revision.projectSnapshot.id).toBe('proj_rel_test');

    const branch = createBranch(revision, 'feature-power-mod');
    expect(branch.branchName).toBe('feature-power-mod');
    expect(branch.parentRevisionId).toBe(revision.id);
  });

  it('freezes a separately identified Release Candidate with integrity evidence', () => {
    const revision = createNamedRevision(sampleProject(), 'v1.0.0', 'Base');
    const candidate = createReleaseCandidate(revision, 'RC-1.0.0');

    expect(candidate.status).toBe('Release Candidate');
    expect(candidate.name).toBe('RC-1.0.0');
    expect(candidate.id).not.toBe(revision.id);
    expect(candidate.parentRevisionId).toBe(revision.id);
    expect(candidate.integrity?.snapshotSha256).toHaveLength(64);
    expect(verifyReleaseCandidateIntegrity(candidate).valid).toBe(true);
  });

  it('detects candidate snapshot mutation and refuses release approval', () => {
    const revision = createNamedRevision(sampleProject(), 'v1.0.0', 'Base');
    const candidate = createReleaseCandidate(revision, 'RC-1.0.0');
    (candidate.projectSnapshot as Project).description = 'mutated after freeze';

    expect(verifyReleaseCandidateIntegrity(candidate).valid).toBe(false);
    expect(() => approveRelease(candidate, 'Lead Engineer')).toThrow('snapshot no longer matches');
  });

  it('publishes only the frozen snapshot with explicit signoff and no fabricated artifact IDs', () => {
    const revision = createNamedRevision(sampleProject(), 'v1.0.0', 'Base');
    const candidate = createReleaseCandidate(revision, 'RC-1.0.0');
    const released = approveRelease(candidate, 'Lead Engineer');

    expect(released.status).toBe('Released');
    expect(released.id).not.toBe(candidate.id);
    expect(released.parentRevisionId).toBe(candidate.id);
    expect(released.releaseArtifacts?.approvalSignoff).toBe('Lead Engineer');
    expect(released.releaseArtifacts?.manufacturingPackageId).toBeUndefined();
    expect(released.releaseArtifacts?.blueprintPackVersion).toBeUndefined();
    expect(verifyReleaseCandidateIntegrity(released).valid).toBe(true);
  });

  it('requires an explicit reviewer signoff', () => {
    const revision = createNamedRevision(sampleProject(), 'v1.0.0', 'Base');
    const candidate = createReleaseCandidate(revision, 'RC-1.0.0');
    expect(() => approveRelease(candidate, '   ')).toThrow('explicit reviewer sign-off');
  });

  it('blocks Passed test labels that have no latest passing run evidence', () => {
    const project = sampleProject();
    project.validationTests = [{
      id: 'test_claimed_pass',
      name: 'Claimed pass',
      stage: 'EVT',
      category: 'Electrical',
      linkedRequirementIds: [],
      linkedArchitectureNodeIds: [],
      linkedComponentIds: [],
      linkedNetIds: [],
      linkedFirmwareModuleIds: [],
      steps: [],
      measurements: [],
      passCriteria: ['Bench evidence reviewed'],
      status: 'Passed',
      evidence: [],
    }];

    const blockers = validateReleaseEligibility(project);
    expect(blockers.some((blocker) => blocker.domain === 'Validation Evidence')).toBe(true);
  });
});
