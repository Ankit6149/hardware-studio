import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { checkMechanicalInterference } from '../lib/mechanical/mechanicalGeometry';
import { MechanicalBody, BoardComponent } from '../types';

describe('Slice 6 Real Mechanical 3D Synchronization & Collision Engine Tests', () => {
  it('should detect real 3D spatial collisions between bodies/components and clear them on movement', () => {
    const store = useProjectStore.getState();

    // 1. Create enclosure body
    const encBody: MechanicalBody = {
      id: 'body_enc_main',
      name: 'Main Enclosure 3D Body',
      objectType: 'Enclosure',
      xMm: 0,
      yMm: 0,
      zMm: 0,
      widthMm: 100,
      heightMm: 60,
      depthMm: 25,
      color: '#334155',
      transparent: true,
      opacity: 0.5
    };

    // 2. Create PCB component at (10, 10) on active board with 3D package dimensions
    const compColliding: BoardComponent = {
      id: 'cmp_3d_colliding',
      boardId: 'board_main',
      referenceDesignator: 'U301',
      componentName: 'Power Management IC',
      componentType: 'IC',
      value: 'PMIC',
      packageName: 'QFN_24',
      footprint: 'QFN_24',
      packageDimensions: { widthMm: 30, heightMm: 30, heightZMm: 20 }, // Height overlaps with enclosure top
      quantity: 1,
      side: 'Top',
      placementX: 10,
      placementY: 10,
      placementStatus: 'Placed',
      pcb: { placed: true, xMm: 10, yMm: 10, rotationDeg: 0, side: 'Top', locked: false, placementStatus: 'Placed' },
      pins: []
    };

    // 3. Create battery body placed at (10, 10) in same volume
    const batteryBody: MechanicalBody = {
      id: 'body_batt_1',
      name: 'LiPo Battery Pack',
      objectType: 'Battery',
      xMm: 5,
      yMm: 5,
      zMm: 2,
      widthMm: 40,
      heightMm: 30,
      depthMm: 15,
      color: '#0284c7'
    };

    store.importProjectJSON({
      id: 'proj_3d_collision_test',
      projectName: '3D Collision Engine System',
      activeBoardId: 'board_main',
      mechanicalBodies: [encBody, batteryBody],
      boardComponents: [compColliding]
    });

    // 4. Run 3D Interference Calculation
    const collision1 = checkMechanicalInterference(useProjectStore.getState());
    expect(collision1.hasCollision).toBe(true);
    expect(collision1.collisions.length).toBeGreaterThan(0);
    expect(collision1.minClearanceMm).toBe(0);

    // 5. Move battery body safely inside enclosure without colliding with component
    useProjectStore.setState({
      mechanicalBodies: [
        encBody,
        { ...batteryBody, xMm: 50, yMm: 20, zMm: 2, widthMm: 30, heightMm: 20, depthMm: 10 } // xMax: 80 < 100, yMax: 40 < 60, zMax: 12 < 25
      ],
      boardComponents: [
        { ...compColliding, pcb: { ...compColliding.pcb!, xMm: 10, yMm: 10 }, packageDimensions: { widthMm: 8, heightMm: 8, heightZMm: 2 } } // xMax: 14 < 50
      ]
    });

    // 6. Confirm 3D Interference Clears
    const collision2 = checkMechanicalInterference(useProjectStore.getState());
    expect(collision2.hasCollision).toBe(false);
    expect(collision2.minClearanceMm).toBeGreaterThan(0);

    // 7. Persist & reload MechanicalBody objects
    const exportedJson = store.exportProjectJSON();
    expect(exportedJson).toContain('Main Enclosure 3D Body');
    expect(exportedJson).toContain('LiPo Battery Pack');

    store.importProjectJSON(exportedJson);
    const restoredState = useProjectStore.getState();
    expect(restoredState.mechanicalBodies?.length).toBe(2);
    expect(restoredState.mechanicalBodies?.[0]?.name).toBe('Main Enclosure 3D Body');
  });
});
