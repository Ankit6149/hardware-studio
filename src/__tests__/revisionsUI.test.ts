import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import {
  createNamedRevision,
  createBranch,
  createReleaseCandidate,
  approveRelease,
  validateReleaseEligibility
} from '../lib/releaseEngine';

describe('Slice 10 Revisions, Branches, Immutable Releases, and Release Candidates Workflow Tests', () => {
  it('should execute complete branching, tagged revisions, release candidate, immutable release, and edit protection workflow', () => {
    const store = useProjectStore.getState();

    // 1. Initial state check on main branch
    useProjectStore.setState({ activeBranch: 'main', isFrozen: false });
    expect(useProjectStore.getState().activeBranch).toBe('main');

    // 2. Create branch "feature-mesh"
    const initialRev = createNamedRevision(store, 'v1.0-base', 'Base Commit', 'main');
    const branchRev = createBranch(initialRev, 'feature-mesh');

    useProjectStore.setState({
      branches: ['main', 'feature-mesh'],
      revisions: [initialRev, branchRev],
      activeBranch: 'feature-mesh'
    });
    expect(useProjectStore.getState().activeBranch).toBe('feature-mesh');

    // 3. Make edits on "feature-mesh"
    store.addMechanicalObject({
      id: 'mech_mesh_ant',
      name: 'Mesh Antenna Zone',
      type: 'Keepout Zone',
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
    expect(useProjectStore.getState().mechanicalObjects?.some(o => o.id === 'mech_mesh_ant')).toBe(true);

    // 4. Create tag revision "v1.0-alpha"
    const alphaRev = createNamedRevision(useProjectStore.getState(), 'v1.0-alpha', 'Tagged Alpha Release', 'feature-mesh');
    useProjectStore.setState({
      revisions: [...(useProjectStore.getState().revisions || []), alphaRev]
    });
    expect(useProjectStore.getState().revisions?.length).toBe(3);

    // 5. Merge "feature-mesh" back into "main"
    useProjectStore.setState({ activeBranch: 'main' });
    expect(useProjectStore.getState().activeBranch).toBe('main');

    // 6. Create release candidate "RC-1"
    const rc = createReleaseCandidate(alphaRev);
    expect(rc.status).toBe('Release Candidate');

    useProjectStore.setState({
      releaseCandidates: [...(useProjectStore.getState().releaseCandidates || []), { id: rc.id, tag: 'RC-1', notes: 'First candidate' }]
    });
    expect(useProjectStore.getState().releaseCandidates?.length).toBe(1);

    // 7. Freeze immutable release "v1.0.0"
    const released = approveRelease(rc, 'Lead Engineer Sign-off');
    expect(released.status).toBe('Released');

    useProjectStore.setState({
      releases: [...(useProjectStore.getState().releases || []), { id: released.id, tag: 'v1.0.0', frozenAt: new Date().toISOString() }],
      isFrozen: true
    });

    // 8. Verify edit rejection on frozen release
    expect(() => {
      useProjectStore.getState().addMechanicalObject({
        id: 'illegal_edit_object',
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
