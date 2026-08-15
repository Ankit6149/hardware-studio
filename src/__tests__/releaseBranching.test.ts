import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import {
  createNamedRevision,
  createBranch,
  createWorkingBranchFromRelease,
  switchBranchState,
  mergeBranches,
  createReleaseCandidate,
  approveRelease,
  ProductRevision
} from '../lib/releaseEngine';
import type { Project } from '../types';

function releaseReadyProject(project: Project): Project {
  return {
    ...JSON.parse(JSON.stringify(project)),
    activeBoardId: 'board_release_ready',
    boards: [{
      id: 'board_release_ready',
      name: 'Release Ready Board',
      boardType: 'Main PCB',
      layerCount: 2,
      substrate: 'FR4',
      status: 'Reviewed',
    }],
    boardOutlines: [{
      id: 'outline_release_ready',
      boardId: 'board_release_ready',
      points: [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 30 }, { x: 0, y: 30 }],
      width: 40,
      height: 30,
      units: 'mm',
    }],
    boardComponents: [],
    traces: [],
    vias: [],
    drillHoles: [],
    keepoutZones: [],
    nets: [],
    validationTests: [],
    validationRuns: [],
  };
}

describe('Slice 7 Real Branches, Revisions & Releases Engine', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('should restore project data state when switching branches', () => {
    const store = useProjectStore.getState();

    store.addMechanicalObject({
      name: 'Main Enclosure Frame',
      type: 'Outer Profile',
      shape: 'rect',
      xMm: 10,
      yMm: 10,
      widthMm: 100,
      heightMm: 60,
      rotationDeg: 0,
      locked: false,
      visible: true
    });

    const mainRev = createNamedRevision(useProjectStore.getState(), 'v1.0-main', 'Main release snapshot', 'main');
    const branchRev = createBranch(mainRev, 'feature-flex-board');

    store.executeProjectCommand('SAVE_REVS', 'Save revisions', () => {
      useProjectStore.setState({
        revisions: [mainRev, branchRev],
        activeBranch: 'main'
      });
    });

    const switchRes = switchBranchState(useProjectStore.getState(), 'feature-flex-board');
    expect(switchRes.success).toBe(true);
    expect(switchRes.updatedProject?.activeBranch).toBe('feature-flex-board');
    expect(switchRes.updatedProject?.mechanicalObjects?.[0]?.name).toBe('Main Enclosure Frame');
  });

  it('should create a working branch from an actually eligible Released revision', () => {
    const eligible = releaseReadyProject(useProjectStore.getState());
    const namedRev = createNamedRevision(eligible, 'v1.0.0', 'Production Release v1.0.0', 'main');
    const rcRev = createReleaseCandidate(namedRev);
    const releasedRev = approveRelease(rcRev, 'Lead Hardware Engineer');

    expect(releasedRev.status).toBe('Released');
    expect(releasedRev.releaseArtifacts?.approvalSignoff).toBe('Lead Hardware Engineer');

    const featureBranchRev = createWorkingBranchFromRelease(releasedRev, 'hotfix-battery-clip');
    expect(featureBranchRev.status).toBe('Working');
    expect(featureBranchRev.branchName).toBe('hotfix-battery-clip');
    expect(featureBranchRev.parentRevisionId).toBe(releasedRev.id);
  });

  it('should merge non-conflicting branches and detect conflicts when entities overlap', () => {
    const store = useProjectStore.getState();

    const sourceProject = JSON.parse(JSON.stringify(store));
    sourceProject.boardComponents = sourceProject.boardComponents || [];
    sourceProject.boardComponents.push({
      id: 'cmp_feature_led',
      boardId: 'board_main',
      referenceDesignator: 'LED1',
      componentName: 'Status LED 0603',
      footprint: 'LED_0603'
    });

    const sourceRev: ProductRevision = {
      id: 'rev_feature',
      name: 'Feature LED',
      branchName: 'feature-led',
      createdAt: new Date().toISOString(),
      description: 'Add status LED',
      projectSnapshot: sourceProject,
      status: 'Named Version'
    };

    const mergeRes = mergeBranches(sourceRev, store);
    expect(mergeRes.success).toBe(true);
    expect(mergeRes.conflicts.length).toBe(0);
    expect(mergeRes.mergedProject?.boardComponents?.some(c => c.id === 'cmp_feature_led')).toBe(true);

    const targetWithConflict = JSON.parse(JSON.stringify(store));
    targetWithConflict.boardComponents = targetWithConflict.boardComponents || [];
    targetWithConflict.boardComponents.push({
      id: 'cmp_feature_led',
      boardId: 'board_main',
      referenceDesignator: 'LED_CONFLICT',
      componentName: 'Different LED',
      footprint: 'LED_1206'
    });

    const conflictRes = mergeBranches(sourceRev, targetWithConflict);
    expect(conflictRes.success).toBe(false);
    expect(conflictRes.conflicts.length).toBeGreaterThan(0);
    expect(conflictRes.conflicts[0].entityType).toBe('BoardComponent');
  });
});
