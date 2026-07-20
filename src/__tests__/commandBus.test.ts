import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';

describe('Reversible Engineering Command Bus Integration Tests', () => {
  it('should capture exact original state before drag and restore exact coordinates on undo/redo', () => {
    const store = useProjectStore.getState();

    // 1. Setup mechanical object
    store.addMechanicalObject({
      name: 'Battery Mounting Plate',
      type: 'Outer Profile',
      shape: 'rect',
      xMm: 50,
      yMm: 50,
      widthMm: 80,
      heightMm: 40,
      rotationDeg: 0,
      layer: 'Enclosure',
      locked: false,
      visible: true
    });

    const mechObjs = useProjectStore.getState().mechanicalObjects || [];
    const mechanicalObjId = mechObjs[0]?.id;
    expect(mechanicalObjId).toBeDefined();

    // Verify initial coordinates
    expect(mechObjs[0]?.xMm).toBe(50);
    expect(mechObjs[0]?.yMm).toBe(50);

    // 2. Perform pointer-drag move using command bus
    useProjectStore.getState().executeProjectCommand('MOVE_MECH_OBJ', 'Move battery plate to (120, 90)', () => {
      useProjectStore.getState().updateMechanicalObject(mechanicalObjId, { xMm: 120, yMm: 90 });
    });

    const updatedObjs = useProjectStore.getState().mechanicalObjects || [];

    // Verify coordinates after command execution
    expect(updatedObjs[0]?.xMm).toBe(120);
    expect(updatedObjs[0]?.yMm).toBe(90);

    // 3. Perform Undo
    useProjectStore.getState().undoProjectCommand();

    const undoObjs = useProjectStore.getState().mechanicalObjects || [];
    // Verify exact original coordinates restored
    expect(undoObjs[0]?.xMm).toBe(50);
    expect(undoObjs[0]?.yMm).toBe(50);

    // 4. Perform Redo
    useProjectStore.getState().redoProjectCommand();

    const redoObjs = useProjectStore.getState().mechanicalObjects || [];
    // Verify drag final coordinates restored
    expect(redoObjs[0]?.xMm).toBe(120);
    expect(redoObjs[0]?.yMm).toBe(90);
  });
});
