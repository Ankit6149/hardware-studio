import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';

describe('Reversible Engineering Command Bus Integration Tests', () => {
  it('should capture exact original state before drag and restore exact coordinates on undo/redo', () => {
    const store = useProjectStore.getState();

    // 1. Setup mechanical object
    store.addMechanicalObject({
      name: 'Battery Mounting Plate',
      shape: 'rectangle',
      x: 50,
      y: 50,
      width: 80,
      height: 40,
      color: '#334155',
      layer: 'Enclosure',
      locked: false,
      visible: true,
      isBoardZone: false,
      isKeepout: false
    });

    const mechanicalObjId = useProjectStore.getState().mechanicalObjects[0].id;
    expect(mechanicalObjId).toBeDefined();

    // Verify initial coordinates
    expect(useProjectStore.getState().mechanicalObjects[0].x).toBe(50);
    expect(useProjectStore.getState().mechanicalObjects[0].y).toBe(50);

    // 2. Perform pointer-drag move using command bus
    useProjectStore.getState().executeProjectCommand('MOVE_MECH_OBJ', 'Move battery plate to (120, 90)', () => {
      useProjectStore.getState().updateMechanicalObject(mechanicalObjId, { x: 120, y: 90 });
    });

    // Verify coordinates after command execution
    expect(useProjectStore.getState().mechanicalObjects[0].x).toBe(120);
    expect(useProjectStore.getState().mechanicalObjects[0].y).toBe(90);

    // 3. Perform Undo
    useProjectStore.getState().undoProjectCommand();

    // Verify exact original coordinates restored
    expect(useProjectStore.getState().mechanicalObjects[0].x).toBe(50);
    expect(useProjectStore.getState().mechanicalObjects[0].y).toBe(50);

    // 4. Perform Redo
    useProjectStore.getState().redoProjectCommand();

    // Verify drag final coordinates restored
    expect(useProjectStore.getState().mechanicalObjects[0].x).toBe(120);
    expect(useProjectStore.getState().mechanicalObjects[0].y).toBe(90);
  });
});
