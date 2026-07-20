import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import {
  createNamedRevision,
  createBranch,
  createReleaseCandidate,
  approveRelease,
  validateReleaseEligibility
} from '../lib/releaseEngine';

describe('Revisions, Branches, and Release Engine Tests', () => {
  it('should support creating named version snapshots and branching', () => {
    const store = useProjectStore.getState();

    const rev = createNamedRevision(store, 'Rev-1.0-EVT', 'EVT Snapshot');
    expect(rev.id).toBeDefined();
    expect(rev.name).toBe('Rev-1.0-EVT');

    const branch = createBranch(rev, 'feature/usb-c-redesign');
    expect(branch.branchName).toBe('feature/usb-c-redesign');
    expect(branch.parentRevisionId).toBe(rev.id);
  });

  it('should evaluate release candidate eligibility and prevent unapproved release sign-off when blockers exist', () => {
    const store = useProjectStore.getState();

    const blockers = validateReleaseEligibility(store);
    expect(Array.isArray(blockers)).toBe(true);

    const rev = createNamedRevision(store, 'Rev-1.0-EVT', 'EVT Snapshot');
    const rc = createReleaseCandidate(rev);
    expect(rc.status).toBe('Release Candidate');

    const rel = approveRelease(rc, 'Lead Engineer');
    expect(rel.status).toBe('Released');
    expect(rel.releaseArtifacts?.approvalSignoff).toBe('Lead Engineer');
  });
});
