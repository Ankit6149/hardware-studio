import { describe, it, expect } from 'vitest';
import { createNamedRevision, createBranch, createReleaseCandidate, approveRelease, validateReleaseEligibility } from '../lib/releaseEngine';
import { Project } from '../types';

describe('Versioned Revision and Release Engine Tests', () => {
  const sampleProject: Project = {
    id: 'proj_rel_test',
    projectName: 'Release Test Project',
    description: '',
    createdAt: '',
    updatedAt: '',
    version: '5',
    activeView: 'dashboard',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    boards: [{ id: 'b1', name: 'Main PCB', boardType: 'Main PCB', purpose: 'Main', dimensionsMm: '50x50', layerCount: 2, substrate: 'FR4', placement: 'Internal', mountingNotes: '', connectorNotes: '', thermalNotes: '', rfNotes: '', status: 'Concept' }],
    boardOutlines: [{ id: 'bo1', boardId: 'b1', points: [{ x: 0, y: 0 }, { x: 50, y: 0 }, { x: 50, y: 50 }, { x: 0, y: 50 }] }]
  };

  it('should create a named revision snapshot', () => {
    const rev = createNamedRevision(sampleProject, 'v1.0.0-alpha', 'Initial alpha snapshot');
    expect(rev.name).toBe('v1.0.0-alpha');
    expect(rev.status).toBe('Named Version');
    expect(rev.projectSnapshot.id).toBe('proj_rel_test');
  });

  it('should create a branch from snapshot', () => {
    const rev = createNamedRevision(sampleProject, 'v1.0.0', 'Base');
    const branch = createBranch(rev, 'feature-power-mod');
    expect(branch.branchName).toBe('feature-power-mod');
    expect(branch.parentRevisionId).toBe(rev.id);
  });

  it('should promote snapshot to Release Candidate and approve immutable release', () => {
    const rev = createNamedRevision(sampleProject, 'v1.0.0-rc1', 'RC 1');
    const rc = createReleaseCandidate(rev);
    expect(rc.status).toBe('Release Candidate');

    const released = approveRelease(rc, 'Lead Engineer Signoff');
    expect(released.status).toBe('Released');
    expect(released.releaseArtifacts?.approvalSignoff).toBe('Lead Engineer Signoff');
  });

  it('should throw error when approving a non-RC revision', () => {
    const rev = createNamedRevision(sampleProject, 'v1.0.0-draft', 'Draft');
    expect(() => approveRelease(rev, 'Signoff')).toThrow('Only Release Candidates can be approved as Released');
  });
});
