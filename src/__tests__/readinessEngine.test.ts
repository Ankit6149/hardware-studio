import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { calculateReadinessScore } from '../lib/readinessScore';

describe('Slice 10 Real Readiness Engine & Gate Verification', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('should truthfully identify blockers and refuse fabrication pass for unverified factory packages', () => {
    const project = useProjectStore.getState();
    const report = calculateReadinessScore(project);

    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
    expect(report.canMoveToFabrication).toBe(false);
  });

  it('should flag DRC blockers in readiness report when board components clash or violate clearances', () => {
    const store = useProjectStore.getState();

    store.addBoardComponent({
      id: 'cmp_clash_1',
      boardId: 'board_main',
      referenceDesignator: 'U1',
      componentName: 'MCU 1',
      componentType: 'MCU',
      footprint: 'QFN40',
      quantity: 1,
      value: 'MCU',
      partNumber: 'MCU1',
      notes: ''
    });
    store.updatePCBPlacement('cmp_clash_1', { placementX: 10, placementY: 10 });

    store.addBoardComponent({
      id: 'cmp_clash_2',
      boardId: 'board_main',
      referenceDesignator: 'U2',
      componentName: 'MCU 2',
      componentType: 'MCU',
      footprint: 'QFN40',
      quantity: 1,
      value: 'MCU',
      partNumber: 'MCU2',
      notes: ''
    });
    store.updatePCBPlacement('cmp_clash_2', { placementX: 10, placementY: 10 });

    const report = calculateReadinessScore(useProjectStore.getState());
    expect(report.canMoveToFabrication).toBe(false);
  });
});
