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

describe('Slice 7 Real Branches, Revisions & Releases Engine', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('should restore project data state when switching branches', () => {
    const store = useProjectStore.getState();

    // 1. Add mechanical object on main branch
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

    // Attach revisions to store
    store.executeProjectCommand('SAVE_REVS', 'Save revisions', () => {
      useProjectStore.setState({
        revisions: [mainRev, branchRev],
        activeBranch: 'main'
      });
    });

    // 2. Switch to feature-flex-board branch
    const switchRes = switchBranchState(useProjectStore.getState(), 'feature-flex-board');
    expect(switchRes.success).toBe(true);
    expect(switchRes.updatedProject?.activeBranch).toBe('feature-flex-board');
    expect(switchRes.updatedProject?.mechanicalObjects?.[0]?.name).toBe('Main Enclosure Frame');
  });

  it('should create a working branch from a Released revision', () => {
    const store = useProjectStore.getState();

    const namedRev = createNamedRevision(store, 'v1.0.0', 'Production Release v1.0.0', 'main');
    const rcRev = createReleaseCandidate(namedRev);
    const releasedRev = approveRelease(rcRev, 'Lead Hardware Engineer');

    expect(releasedRev.status).toBe('Released');
    expect(releasedRev.releaseArtifacts?.approvalSignoff).toBe('Lead Hardware Engineer');

    // Create working branch from release
    const featureBranchRev = createWorkingBranchFromRelease(releasedRev, 'hotfix-battery-clip');
    expect(featureBranchRev.status).toBe('Working');
    expect(featureBranchRev.branchName).toBe('hotfix-battery-clip');
    expect(featureBranchRev.parentRevisionId).toBe(releasedRev.id);
  });

  it('should merge non-conflicting branches and detect conflicts when entities overlap', () => {
    const store = useProjectStore.getState();

    // Source revision with a new component
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

    // Clean merge into target project
    const mergeRes = mergeBranches(sourceRev, store);
    expect(mergeRes.success).toBe(true);
    expect(mergeRes.conflicts.length).toBe(0);
    expect(mergeRes.mergedProject?.boardComponents?.some(c => c.id === 'cmp_feature_led')).toBe(true);

    // Conflict test: modify same component differently on target
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
