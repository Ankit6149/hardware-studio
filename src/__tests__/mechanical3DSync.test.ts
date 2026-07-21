import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { checkMechanicalInterference } from '../lib/mechanical/mechanicalGeometry';

describe('Slice 4 Canonical WebGL / 3D Synchronization & Roundtrip', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
    useProjectStore.setState({
      mechanicalObjects: [],
      boardComponents: [],
      boards: []
    });
  });

  it('should calculate 3D spatial collisions with overlap per axis details', () => {
    const store = useProjectStore.getState();

    // Add enclosure body (0,0,0) width=100, height=60, depth=20
    store.addMechanicalObject({
      name: 'Enclosure Outer Shell',
      type: 'Outer Profile',
      shape: 'rect',
      xMm: 0,
      yMm: 0,
      widthMm: 100,
      heightMm: 60,
      depthMm: 20,
      layer: 'Enclosure',
      rotationDeg: 0,
      locked: false,
      visible: true
    });

    // Add internal component protruding outside enclosure (X max 110 vs enclosure 100)
    store.addMechanicalObject({
      name: 'Protruding Connector',
      type: 'Connector Opening',
      shape: 'rect',
      xMm: 90,
      yMm: 10,
      widthMm: 20, // extends from X=90 to X=110
      heightMm: 15,
      depthMm: 10,
      layer: 'Internal',
      rotationDeg: 0,
      locked: false,
      visible: true
    });

    const result = checkMechanicalInterference(useProjectStore.getState());
    expect(result.hasCollision).toBe(true);
    expect(result.collisions.length).toBeGreaterThan(0);

    const boundaryCollision = result.collisions.find(c => c.bodyB.includes('Boundary Protrusion'));
    expect(boundaryCollision).toBeDefined();
    expect(boundaryCollision?.overlapX).toBe(10); // 110 - 100 = 10mm protrusion
  });

  it('should preserve all mechanical objects and properties across export/import JSON round-trip', () => {
    const store = useProjectStore.getState();

    // 1. Add mechanical objects with custom properties
    store.addMechanicalObject({
      id: 'mech_custom_1',
      name: 'LiPo Battery Retainer',
      type: 'Battery Cavity',
      shape: 'rect',
      xMm: 15.5,
      yMm: 25.0,
      widthMm: 45.0,
      heightMm: 30.0,
      depthMm: 8.5,
      material: 'Polycarbonate',
      notes: 'Custom battery tray with ESD shield',
      rotationDeg: 45,
      layer: 'Battery',
      locked: true,
      visible: true
    });

    // 2. Export project JSON
    const exportedJSON = store.exportProjectJSON();
    expect(exportedJSON).toBeDefined();
    expect(typeof exportedJSON).toBe('string');

    // 3. Reset store and re-import JSON
    store.resetProject();
    const importRes = store.importProjectJSON(exportedJSON);
    expect(importRes.success).toBe(true);

    // 4. Verify mechanical object is fully restored
    const reimported = useProjectStore.getState().mechanicalObjects?.find(o => o.id === 'mech_custom_1');
    expect(reimported).toBeDefined();
    expect(reimported?.name).toBe('LiPo Battery Retainer');
    expect(reimported?.type).toBe('Battery Cavity');
    expect(reimported?.xMm).toBe(15.5);
    expect(reimported?.yMm).toBe(25.0);
    expect(reimported?.widthMm).toBe(45.0);
    expect(reimported?.heightMm).toBe(30.0);
    expect(reimported?.depthMm).toBe(8.5);
    expect(reimported?.material).toBe('Polycarbonate');
    expect(reimported?.notes).toBe('Custom battery tray with ESD shield');
    expect(reimported?.rotationDeg).toBe(45);
    expect(reimported?.locked).toBe(true);
    expect(reimported?.visible).toBe(true);
  });
});
