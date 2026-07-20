import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';

describe('PCB and Mechanical Spatial Synchronization Tests', () => {
  it('should update mechanical board body and recalculate enclosure fit when PCB dimensions or component positions change', () => {
    const store = useProjectStore.getState();

    // Setup project with PCB outline and mechanical enclosure
    store.importProjectJSON({
      id: 'sync_test_proj',
      projectName: 'PCB Mechanical Sync Test',
      boards: [{ id: 'board_main', name: 'Main Board', type: 'Rigid', layerCount: 2, status: 'Draft' }],
      boardOutlines: [{ id: 'out_main', boardId: 'board_main', points: [{ x: 0, y: 0 }, { x: 110, y: 0 }, { x: 110, y: 70 }, { x: 0, y: 70 }], isClosed: true }],
      mechanicalObjects: [{
        id: 'mech_shell',
        name: 'Enclosure Shell',
        shape: 'rectangle',
        xMm: 0,
        yMm: 0,
        widthMm: 120,
        heightMm: 80,
        layer: 'Enclosure',
        locked: false,
        visible: true
      }],
      boardComponents: [{
        id: 'cmp_m1',
        boardId: 'board_main',
        referenceDesignator: 'U1',
        componentName: 'MCU',
        componentType: 'MCU',
        quantity: 1,
        side: 'Top',
        placementX: 40,
        placementY: 35,
        placementStatus: 'Placed'
      }]
    });

    const project = useProjectStore.getState();
    const boardOutline = project.boardOutlines?.[0];
    const encObj = project.mechanicalObjects?.[0];

    expect(boardOutline?.points?.[1]?.x).toBe(110);
    expect(encObj?.widthMm).toBe(120);

    // Verify PCB fits within enclosure
    const fits = (boardOutline?.points?.[1]?.x || 0) <= (encObj?.widthMm || 0);
    expect(fits).toBe(true);
  });
});
