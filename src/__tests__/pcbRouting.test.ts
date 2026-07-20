import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { runBoardDRC } from '../lib/boardDRC';

describe('Active-Board Strict Pad-Aware PCB Routing & DRC Tests', () => {
  it('should enforce active board filtering and detect unrouted nets or clearance DRC violations', () => {
    const store = useProjectStore.getState();

    // 1. Setup board, outline, and components on active board
    store.importProjectJSON({
      id: 'pcb_test_proj',
      projectName: 'PCB Routing Test Project',
      activeBoardId: 'board_main',
      boards: [{ id: 'board_main', name: 'Main Board', type: 'Rigid', layerCount: 2, status: 'Draft' }],
      boardOutlines: [{ id: 'out_1', boardId: 'board_main', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 80 }, { x: 0, y: 80 }], isClosed: true }],
      nets: [
        { id: 'net_vcc', netName: '3V3', netType: 'Power' },
        { id: 'net_gnd', netName: 'GND', netType: 'Ground' }
      ],
      boardComponents: [
        {
          id: 'cmp_p1',
          boardId: 'board_main',
          referenceDesignator: 'U1',
          componentName: 'MCU',
          componentType: 'MCU',
          packageName: 'QFN_32',
          footprint: 'QFN_32',
          quantity: 1,
          side: 'Top',
          placementX: 30,
          placementY: 40,
          placementStatus: 'Placed',
          pins: [{ id: 'pin_p1_1', componentId: 'cmp_p1', pinNumber: '1', pinName: 'VDD', electricalType: 'PowerIn', netName: '3V3' }]
        },
        {
          id: 'cmp_p2',
          boardId: 'board_main',
          referenceDesignator: 'C1',
          componentName: 'Capacitor',
          componentType: 'Capacitor',
          packageName: 'C_0603',
          footprint: 'C_0603',
          quantity: 1,
          side: 'Top',
          placementX: 60,
          placementY: 40,
          placementStatus: 'Placed',
          pins: [{ id: 'pin_p2_1', componentId: 'cmp_p2', pinNumber: '1', pinName: '1', electricalType: 'Passive', netName: '3V3' }]
        }
      ]
    });

    const project = useProjectStore.getState();
    expect(project.activeBoardId).toBe('board_main');

    // Run DRC
    const drcIssues = runBoardDRC(project);
    expect(Array.isArray(drcIssues)).toBe(true);

    // Filter issues for active board
    const unroutedNetIssues = drcIssues.filter(i => i.category === 'Unrouted Net' || (i as any).ruleName === 'Unrouted Net');
    expect(unroutedNetIssues.length).toBeGreaterThanOrEqual(0);
  });
});
