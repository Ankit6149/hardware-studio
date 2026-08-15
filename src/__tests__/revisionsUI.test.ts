import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import {
  createNamedRevision,
  createBranch,
  createReleaseCandidate,
  approveRelease,
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

describe('Slice 10 Revisions, Branches, Immutable Releases, and Release Candidates Workflow Tests', () => {
  it('should execute branching, tagged revisions, integrity-checked candidate release, and edit protection workflow', () => {
    useProjectStore.getState().resetProject();
    const store = useProjectStore.getState();

    useProjectStore.setState({ activeBranch: 'main', isFrozen: false });
    expect(useProjectStore.getState().activeBranch).toBe('main');

    const initialRev = createNamedRevision(store, 'v1.0-base', 'Base Commit', 'main');
    const branchRev = createBranch(initialRev, 'feature-mesh');

    useProjectStore.setState({
      branches: [initialRev, branchRev],
      revisions: [initialRev, branchRev],
      activeBranch: 'feature-mesh'
    });
    expect(useProjectStore.getState().activeBranch).toBe('feature-mesh');

    store.addMechanicalObject({
      name: 'Mesh Antenna Zone',
      type: 'Outer Profile',
      shape: 'rect',
      xMm: 10,
      yMm: 10,
      widthMm: 20,
      heightMm: 20,
      rotationDeg: 0,
      layer: 'RF',
      locked: false,
      visible: true
    });
    expect(useProjectStore.getState().mechanicalObjects?.length).toBeGreaterThan(0);

    const releasableState = releaseReadyProject(useProjectStore.getState());
    const alphaRev = createNamedRevision(releasableState, 'v1.0-alpha', 'Tagged Alpha Release', 'feature-mesh');
    useProjectStore.setState({
      revisions: [...(useProjectStore.getState().revisions || []), alphaRev]
    });
    expect(useProjectStore.getState().revisions?.length).toBe(3);

    useProjectStore.setState({ activeBranch: 'main' });
    expect(useProjectStore.getState().activeBranch).toBe('main');

    const rc = createReleaseCandidate(alphaRev, 'RC-1');
    expect(rc.status).toBe('Release Candidate');
    expect(rc.name).toBe('RC-1');

    useProjectStore.setState({
      releaseCandidates: [...(useProjectStore.getState().releaseCandidates || []), rc]
    });
    expect(useProjectStore.getState().releaseCandidates?.length).toBe(1);

    const released = approveRelease(rc, 'Lead Engineer Sign-off');
    expect(released.status).toBe('Released');
    expect(released.parentRevisionId).toBe(rc.id);

    useProjectStore.setState({
      releases: [...(useProjectStore.getState().releases || []), released],
      isFrozen: true
    });

    expect(() => {
      useProjectStore.getState().addMechanicalObject({
        name: 'Illegal Edit Object',
        type: 'Outer Profile',
        shape: 'rect',
        xMm: 0,
        yMm: 0,
        widthMm: 10,
        heightMm: 10,
        rotationDeg: 0,
        layer: 'Enclosure',
        locked: false,
        visible: true
      });
    }).toThrow('Cannot modify an immutable frozen release');
  });
});
