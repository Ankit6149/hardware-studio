import { Project, ProductRevision } from '../types';
export type { ProductRevision };
import { runBoardDRC } from './boardDRC';
import { calculateRequirementCoverage } from './validation/validationCoverage';

export interface ReleaseBlocker {
  domain: string;
  severity: 'Blocker' | 'Critical' | 'Warning';
  message: string;
}

/** Check if project state is eligible for Release Candidate approval */
export function validateReleaseEligibility(project: Project): ReleaseBlocker[] {
  const blockers: ReleaseBlocker[] = [];

  // DRC check
  const drc = runBoardDRC(project);
  const blockerDrc = drc.filter((r) => r.severity === 'Blocker' || r.severity === 'Error');
  if (blockerDrc.length > 0) {
    blockers.push({
      domain: 'PCB DRC',
      severity: 'Blocker',
      message: `${blockerDrc.length} PCB DRC errors must be resolved before release.`
    });
  }

  // Requirement coverage check
  const coverage = calculateRequirementCoverage(project.requirements || [], project.validationTests || []);
  const failedReqs = coverage.filter((c) => c.status === 'Failed' || c.status === 'Not Covered');
  if (failedReqs.length > 0) {
    blockers.push({
      domain: 'Requirements & Validation',
      severity: 'Critical',
      message: `${failedReqs.length} requirements are not covered or have failing validation tests.`
    });
  }

  return blockers;
}

/** Create a named snapshot revision from working project state */
export function createNamedRevision(project: Project, name: string, description: string, branchName: string = 'main'): ProductRevision {
  return {
    id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name,
    branchName,
    createdAt: new Date().toISOString(),
    description,
    projectSnapshot: JSON.parse(JSON.stringify(project)),
    status: 'Named Version'
  };
}

/** Create a new branch from a snapshot revision */
export function createBranch(sourceRevision: ProductRevision, newBranchName: string): ProductRevision {
  return {
    id: `rev_branch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: `Branch: ${newBranchName}`,
    parentRevisionId: sourceRevision.id,
    branchName: newBranchName,
    createdAt: new Date().toISOString(),
    description: `Branched from ${sourceRevision.name}`,
    projectSnapshot: JSON.parse(JSON.stringify(sourceRevision.projectSnapshot)),
    status: 'Working'
  };
}

/** Promote named version to Release Candidate */
export function createReleaseCandidate(revision: ProductRevision): ProductRevision {
  return {
    ...revision,
    status: 'Release Candidate'
  };
}

/** Approve Release Candidate and mark immutable */
export function approveRelease(rc: ProductRevision, signoff: string): ProductRevision {
  if (rc.status !== 'Release Candidate') {
    throw new Error('Only Release Candidates can be approved as Released');
  }

  return {
    ...rc,
    status: 'Released',
    releaseArtifacts: {
      ...rc.releaseArtifacts,
      approvalSignoff: signoff,
      blueprintPackVersion: `v${rc.name}`,
      manufacturingPackageId: `mfg_pkg_${rc.id}`
    }
  };
}
