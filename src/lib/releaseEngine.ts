import { Project, ProductRevision } from '../types';
export type { ProductRevision };
import { runBoardDRC } from './boardDRC';
import { calculateRequirementCoverage } from './validation/validationCoverage';
import { fingerprintSnapshot } from './releaseIntegrity';

export interface ReleaseBlocker {
  domain: string;
  severity: 'Blocker' | 'Critical' | 'Warning';
  message: string;
}

export interface ReleaseIntegrityMetadata {
  snapshotSha256: string;
  sourceRevisionId: string;
  candidateId: string;
  candidateCreatedAt: string;
  validationRunIds: string[];
  releasedAt?: string;
}

export type ReleaseRevision = ProductRevision & {
  integrity?: ReleaseIntegrityMetadata;
};

export interface ReleaseIntegrityCheck {
  valid: boolean;
  expectedSha256?: string;
  actualSha256?: string;
  reason?: string;
}

export interface MergeConflict {
  entityType: string;
  id: string;
  sourceValue: unknown;
  targetValue: unknown;
}

export interface MergeResult {
  success: boolean;
  conflicts: MergeConflict[];
  mergedProject?: Project;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function latestRunForTest(project: Project, testId: string) {
  return (project.validationRuns || [])
    .filter((run) => run.testId === testId)
    .slice()
    .sort((a, b) => (b.runNumber || 0) - (a.runNumber || 0) || Date.parse(b.timestamp || '') - Date.parse(a.timestamp || ''))[0];
}

/** Check if project state is eligible for Release Candidate approval. */
export function validateReleaseEligibility(project: Project): ReleaseBlocker[] {
  const blockers: ReleaseBlocker[] = [];

  const drc = runBoardDRC(project);
  const blockerDrc = drc.filter((result) => result.severity === 'Blocker' || result.severity === 'Error');
  if (blockerDrc.length > 0) {
    blockers.push({
      domain: 'PCB DRC',
      severity: 'Blocker',
      message: `${blockerDrc.length} PCB DRC errors must be resolved before release.`
    });
  }

  const coverage = calculateRequirementCoverage(project.requirements || [], project.validationTests || []);
  const failedReqs = coverage.filter((entry) => entry.status === 'Failed' || entry.status === 'Not Covered');
  if (failedReqs.length > 0) {
    blockers.push({
      domain: 'Requirements & Validation',
      severity: 'Critical',
      message: `${failedReqs.length} requirements are not covered or have failing validation tests.`
    });
  }

  const passedWithoutRunEvidence = (project.validationTests || []).filter((test) => {
    if (test.status !== 'Passed') return false;
    const latest = latestRunForTest(project, test.id);
    return !latest || (latest.status !== 'Pass' && latest.status !== 'Passed');
  });
  if (passedWithoutRunEvidence.length > 0) {
    blockers.push({
      domain: 'Validation Evidence',
      severity: 'Critical',
      message: `${passedWithoutRunEvidence.length} validation test${passedWithoutRunEvidence.length === 1 ? '' : 's'} claim Passed without a latest passing run record.`
    });
  }

  const latestFailedRuns = (project.validationTests || []).filter((test) => {
    const latest = latestRunForTest(project, test.id);
    return latest?.status === 'Fail' || latest?.status === 'Failed';
  });
  if (latestFailedRuns.length > 0) {
    blockers.push({
      domain: 'Validation Evidence',
      severity: 'Blocker',
      message: `${latestFailedRuns.length} validation test${latestFailedRuns.length === 1 ? '' : 's'} have a failing latest run.`
    });
  }

  return blockers;
}

/** Create a named snapshot revision from working project state. */
export function createNamedRevision(project: Project, name: string, description: string, branchName: string = 'main'): ProductRevision {
  return {
    id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name,
    branchName,
    createdAt: new Date().toISOString(),
    description,
    projectSnapshot: clone(project),
    status: 'Named Version'
  };
}

/** Create a new branch from a snapshot revision. */
export function createBranch(sourceRevision: ProductRevision, newBranchName: string): ProductRevision {
  return {
    id: `rev_branch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: `Branch: ${newBranchName}`,
    parentRevisionId: sourceRevision.id,
    branchName: newBranchName,
    createdAt: new Date().toISOString(),
    description: `Branched from ${sourceRevision.name}`,
    projectSnapshot: clone(sourceRevision.projectSnapshot),
    status: 'Working'
  };
}

/** Create a new working branch from a Released revision. */
export function createWorkingBranchFromRelease(
  releasedRevision: ProductRevision,
  newBranchName: string
): ProductRevision {
  if (releasedRevision.status !== 'Released') {
    throw new Error('Working branch can only be created from a Released revision.');
  }

  return {
    id: `rev_branch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: `Working Branch: ${newBranchName}`,
    parentRevisionId: releasedRevision.id,
    branchName: newBranchName,
    createdAt: new Date().toISOString(),
    description: `Branched from release ${releasedRevision.name}`,
    projectSnapshot: clone(releasedRevision.projectSnapshot),
    status: 'Working'
  };
}

/** Switch branch by retrieving target branch revision snapshot and restoring project data. */
export function switchBranchState(
  project: Project,
  targetBranchName: string
): { success: boolean; updatedProject?: Project; error?: string } {
  const revisions = project.revisions || [];
  const branchRevs = revisions.filter((revision) => revision.branchName === targetBranchName);
  if (branchRevs.length === 0 && targetBranchName !== 'main') {
    return { success: false, error: `Branch '${targetBranchName}' not found.` };
  }

  const latestRev = branchRevs[branchRevs.length - 1];
  if (latestRev?.projectSnapshot) {
    const restored = clone(latestRev.projectSnapshot) as Project;
    return {
      success: true,
      updatedProject: {
        ...restored,
        activeBranch: targetBranchName,
        activeBranchName: targetBranchName,
        revisions: project.revisions
      }
    };
  }

  return {
    success: true,
    updatedProject: {
      ...project,
      activeBranch: targetBranchName,
      activeBranchName: targetBranchName
    }
  };
}

/** Merge source branch snapshot into target branch snapshot. */
export function mergeBranches(
  sourceRevision: ProductRevision,
  targetProject: Project
): MergeResult {
  const sourceProject = sourceRevision.projectSnapshot as Project | undefined;
  if (!sourceProject) {
    return { success: false, conflicts: [{ entityType: 'Revision', id: sourceRevision.id, sourceValue: null, targetValue: 'Missing snapshot' }] };
  }

  const conflicts: MergeConflict[] = [];
  const merged: Project = clone(targetProject);
  const targetMechs = merged.mechanicalObjects || [];
  const sourceMechs = sourceProject.mechanicalObjects || [];

  sourceMechs.forEach((sourceObject) => {
    const targetObject = targetMechs.find((candidate) => candidate.id === sourceObject.id);
    if (!targetObject) {
      targetMechs.push(sourceObject);
    } else if (JSON.stringify(targetObject) !== JSON.stringify(sourceObject)) {
      conflicts.push({ entityType: 'MechanicalObject', id: sourceObject.id, sourceValue: sourceObject, targetValue: targetObject });
    }
  });

  const targetComps = merged.boardComponents || [];
  const sourceComps = sourceProject.boardComponents || [];
  sourceComps.forEach((sourceComponent) => {
    const targetComponent = targetComps.find((candidate) => candidate.id === sourceComponent.id);
    if (!targetComponent) {
      targetComps.push(sourceComponent);
    } else if (JSON.stringify(targetComponent) !== JSON.stringify(sourceComponent)) {
      conflicts.push({ entityType: 'BoardComponent', id: sourceComponent.id, sourceValue: sourceComponent, targetValue: targetComponent });
    }
  });

  if (conflicts.length > 0) return { success: false, conflicts };
  merged.mechanicalObjects = targetMechs;
  merged.boardComponents = targetComps;
  return { success: true, conflicts: [], mergedProject: merged };
}

/** Freeze a named revision into a separately identified Release Candidate snapshot. */
export function createReleaseCandidate(revision: ProductRevision, candidateName?: string): ReleaseRevision {
  if (!revision.projectSnapshot) {
    throw new Error('Release Candidate requires a named revision with a project snapshot.');
  }
  const projectSnapshot = clone(revision.projectSnapshot) as Project;
  const createdAt = new Date().toISOString();
  const candidateId = `rc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const integrity: ReleaseIntegrityMetadata = {
    snapshotSha256: fingerprintSnapshot(projectSnapshot),
    sourceRevisionId: revision.id,
    candidateId,
    candidateCreatedAt: createdAt,
    validationRunIds: (projectSnapshot.validationRuns || []).map((run) => run.id),
  };

  return {
    ...clone(revision),
    id: candidateId,
    parentRevisionId: revision.id,
    name: candidateName?.trim() || revision.name,
    createdAt,
    description: `Release Candidate frozen from ${revision.name}. Working-state changes do not alter this snapshot.`,
    projectSnapshot,
    status: 'Release Candidate',
    integrity,
  };
}

export function verifyReleaseCandidateIntegrity(revision: ProductRevision): ReleaseIntegrityCheck {
  const releaseRevision = revision as ReleaseRevision;
  if (!releaseRevision.integrity?.snapshotSha256) {
    return { valid: false, reason: 'Release Candidate has no recorded snapshot fingerprint.' };
  }
  if (!releaseRevision.projectSnapshot) {
    return { valid: false, expectedSha256: releaseRevision.integrity.snapshotSha256, reason: 'Release Candidate snapshot is missing.' };
  }

  const actualSha256 = fingerprintSnapshot(releaseRevision.projectSnapshot);
  return {
    valid: actualSha256 === releaseRevision.integrity.snapshotSha256,
    expectedSha256: releaseRevision.integrity.snapshotSha256,
    actualSha256,
    reason: actualSha256 === releaseRevision.integrity.snapshotSha256 ? undefined : 'Release Candidate snapshot no longer matches its frozen fingerprint.'
  };
}

/** Approve a Release Candidate only when its frozen snapshot is intact and eligible. */
export function approveRelease(rc: ProductRevision, signoff: string): ReleaseRevision {
  if (rc.status !== 'Release Candidate') {
    throw new Error('Only Release Candidates can be approved as Released');
  }
  const approvalSignoff = signoff.trim();
  if (!approvalSignoff) {
    throw new Error('Release approval requires an explicit reviewer sign-off.');
  }

  const integrityCheck = verifyReleaseCandidateIntegrity(rc);
  if (!integrityCheck.valid) {
    throw new Error(integrityCheck.reason || 'Release Candidate integrity check failed.');
  }

  const candidate = rc as ReleaseRevision;
  const snapshot = candidate.projectSnapshot as Project;
  const blockers = validateReleaseEligibility(snapshot).filter((blocker) => blocker.severity !== 'Warning');
  if (blockers.length > 0) {
    throw new Error(`Release Candidate is blocked: ${blockers.map((blocker) => blocker.message).join(' ')}`);
  }

  const releasedAt = new Date().toISOString();
  return {
    ...clone(candidate),
    id: `release_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    parentRevisionId: candidate.id,
    createdAt: releasedAt,
    status: 'Released',
    projectSnapshot: clone(candidate.projectSnapshot),
    integrity: candidate.integrity ? { ...candidate.integrity, releasedAt } : undefined,
    releaseArtifacts: {
      ...candidate.releaseArtifacts,
      approvalSignoff,
    }
  };
}
