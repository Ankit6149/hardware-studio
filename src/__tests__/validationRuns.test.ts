import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { runValidationTest } from '../lib/validationRunner';
import { ValidationTest } from '../types';

describe('Slice 9 Real Validation Run Engine Tests', () => {
  it('should execute validation runs, record Pass/Fail status, capture logs & measured values, and persist history', () => {
    const store = useProjectStore.getState();

    // 1. Setup project state with zero errors
    store.importProjectJSON({
      id: 'proj_validation_test',
      projectName: 'Validation Run System Test',
      activeBoardId: 'board_main',
      boards: [{ id: 'board_main', name: 'Main Board', boardType: 'Rigid', layerCount: 2, status: 'Draft' }],
      boardOutlines: [{ id: 'out_1', boardId: 'board_main', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 80 }, { x: 0, y: 80 }] }],
      validationTests: [
        {
          id: 'val_test_drc_1',
          testName: 'Board Design Rules Verification',
          category: 'DRC',
          passCriteria: '0 Blocker DRC errors',
          status: 'Untested'
        }
      ],
      validationRuns: []
    });

    // 2. Execute validation run on clean design -> expect Pass
    const { run: run1, updatedRuns: runs1 } = runValidationTest(useProjectStore.getState(), 'val_test_drc_1');
    store.updateProjectState({ validationRuns: runs1 });

    expect(run1.status).toBe('Pass');
    expect(run1.logs.length).toBeGreaterThan(0);
    expect(useProjectStore.getState().validationRuns?.length).toBe(1);

    // 3. Introduce DRC violation (invalid zero dimensions board outline)
    store.updateProjectState({
      boardOutlines: [{ id: 'out_1', boardId: 'board_main', points: [{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }] }]
    });

    // 4. Re-run validation test -> expect Fail
    const { run: run2, updatedRuns: runs2 } = runValidationTest(useProjectStore.getState(), 'val_test_drc_1');
    store.updateProjectState({ validationRuns: runs2 });

    expect(run2.status).toBe('Fail');
    expect(run2.logs.some(l => l.includes('FAILED'))).toBe(true);
    expect(useProjectStore.getState().validationRuns?.length).toBe(2);

    // 5. Export / Import JSON round-trip
    const jsonStr = store.exportProjectJSON();
    expect(jsonStr).toContain('Board Design Rules Verification');

    store.importProjectJSON(jsonStr);
    const restoredRuns = useProjectStore.getState().validationRuns || [];
    expect(restoredRuns.length).toBe(2);
    expect(restoredRuns[0].status).toBe('Fail');
    expect(restoredRuns[1].status).toBe('Pass');
  });
});
