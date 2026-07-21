import { Project, ProductRevision } from '../types';
export type { ProductRevision };
import { runBoardDRC } from './boardDRC';
import { calculateRequirementCoverage } from './validation/validationCoverage';

export interface ReleaseBlocker {
  domain: string;
  severity: 'Blocker' | 'Critical' | 'Warning';
  message: string;
}

export interface MergeConflict {
  entityType: string;
  id: string;
  sourceValue: any;
  targetValue: any;
}

export interface MergeResult {
  success: boolean;
  conflicts: MergeConflict[];
  mergedProject?: Project;
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

/** Create a new working branch from a Released revision */
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
    projectSnapshot: JSON.parse(JSON.stringify(releasedRevision.projectSnapshot)),
    status: 'Working'
  };
}

/** Switch branch by retrieving target branch revision snapshot and restoring project data */
export function switchBranchState(
  project: Project,
  targetBranchName: string
): { success: boolean; updatedProject?: Project; error?: string } {
  const revisions = project.revisions || [];
  const branchRevs = revisions.filter(r => r.branchName === targetBranchName);
  if (branchRevs.length === 0 && targetBranchName !== 'main') {
    return { success: false, error: `Branch '${targetBranchName}' not found.` };
  }

  const latestRev = branchRevs[branchRevs.length - 1];
  if (latestRev && latestRev.projectSnapshot) {
    const restored = JSON.parse(JSON.stringify(latestRev.projectSnapshot));
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

/** Merge source branch snapshot into target branch snapshot */
export function mergeBranches(
  sourceRevision: ProductRevision,
  targetProject: Project
): MergeResult {
  const sourceProject = sourceRevision.projectSnapshot;
  if (!sourceProject) {
    return { success: false, conflicts: [{ entityType: 'Revision', id: sourceRevision.id, sourceValue: null, targetValue: 'Missing snapshot' }] };
  }

  const conflicts: MergeConflict[] = [];
  const merged: Project = JSON.parse(JSON.stringify(targetProject));

  const targetMechs = merged.mechanicalObjects || [];
  const sourceMechs = sourceProject.mechanicalObjects || [];

  sourceMechs.forEach((sObj: any) => {
    const tObj = targetMechs.find((t: any) => t.id === sObj.id);
    if (!tObj) {
      targetMechs.push(sObj);
    } else if (JSON.stringify(tObj) !== JSON.stringify(sObj)) {
      conflicts.push({
        entityType: 'MechanicalObject',
        id: sObj.id,
        sourceValue: sObj,
        targetValue: tObj
      });
    }
  });

  const targetComps = merged.boardComponents || [];
  const sourceComps = sourceProject.boardComponents || [];

  sourceComps.forEach((sComp: any) => {
    const tComp = targetComps.find((t: any) => t.id === sComp.id);
    if (!tComp) {
      targetComps.push(sComp);
    } else if (JSON.stringify(tComp) !== JSON.stringify(sComp)) {
      conflicts.push({
        entityType: 'BoardComponent',
        id: sComp.id,
        sourceValue: sComp,
        targetValue: tComp
      });
    }
  });

  if (conflicts.length > 0) {
    return { success: false, conflicts };
  }

  merged.mechanicalObjects = targetMechs;
  merged.boardComponents = targetComps;

  return {
    success: true,
    conflicts: [],
    mergedProject: merged
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
