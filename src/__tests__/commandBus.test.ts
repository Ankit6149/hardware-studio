import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';

describe('Slice 2 Reversible Pointer Command Lifecycle Tests', () => {
  it('should capture exact pointer-down state, handle transient preview without stack pollution, and restore coordinates on undo/redo', () => {
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

    const mechObj = useProjectStore.getState().mechanicalObjects?.[0];
    expect(mechObj).toBeDefined();
    const mechanicalObjId = mechObj!.id;

    // Verify initial pointer-down coordinates
    expect(mechObj?.xMm).toBe(50);
    expect(mechObj?.yMm).toBe(50);

    const initialPastCount = useProjectStore.getState().pastCommands?.length || 0;

    // 2. Pointer-Down: begin transaction
    useProjectStore.getState().beginCommand('MOVE_MECH_OBJ', 'Move battery plate to (120, 90)');
    expect(useProjectStore.getState().activeTransaction).toBeDefined();

    // 3. Mouse-Move: update transient preview multiple times
    const objCurrent = useProjectStore.getState().mechanicalObjects || [];
    useProjectStore.getState().updateTransientPreview({
      mechanicalObjects: objCurrent.map(o => o.id === mechanicalObjId ? { ...o, xMm: 80, yMm: 70 } : o)
    });

    // Verify preview coordinates updated
    expect(useProjectStore.getState().mechanicalObjects?.[0]?.xMm).toBe(80);
    expect(useProjectStore.getState().mechanicalObjects?.[0]?.yMm).toBe(70);
    // Verify stack was NOT polluted during preview
    expect(useProjectStore.getState().pastCommands?.length || 0).toBe(initialPastCount);

    // Second Mouse-Move preview
    const objCurrent2 = useProjectStore.getState().mechanicalObjects || [];
    useProjectStore.getState().updateTransientPreview({
      mechanicalObjects: objCurrent2.map(o => o.id === mechanicalObjId ? { ...o, xMm: 120, yMm: 90 } : o)
    });
    expect(useProjectStore.getState().mechanicalObjects?.[0]?.xMm).toBe(120);

    // 4. Pointer-Up: commit transaction once
    useProjectStore.getState().commitCommand();

    // Verify exactly ONE command was added to pastCommands
    expect(useProjectStore.getState().pastCommands?.length || 0).toBe(initialPastCount + 1);
    expect(useProjectStore.getState().mechanicalObjects?.[0]?.xMm).toBe(120);
    expect(useProjectStore.getState().mechanicalObjects?.[0]?.yMm).toBe(90);

    // 5. Undo: restores exact pointer-down state (50, 50)
    useProjectStore.getState().undoProjectCommand();
    expect(useProjectStore.getState().mechanicalObjects?.[0]?.xMm).toBe(50);
    expect(useProjectStore.getState().mechanicalObjects?.[0]?.yMm).toBe(50);

    // 6. Redo: restores exact pointer-up state (120, 90)
    useProjectStore.getState().redoProjectCommand();
    expect(useProjectStore.getState().mechanicalObjects?.[0]?.xMm).toBe(120);
    expect(useProjectStore.getState().mechanicalObjects?.[0]?.yMm).toBe(90);
  });

  it('should restore original state on cancelCommand without stack pollution', () => {
    const store = useProjectStore.getState();
    const initialPastCount = store.pastCommands?.length || 0;

    const mechObj = store.mechanicalObjects?.[0];
    const initialX = mechObj?.xMm || 120;

    store.beginCommand('MOVE_MECH_OBJ', 'Cancelled drag move');
    store.updateTransientPreview({
      mechanicalObjects: (store.mechanicalObjects || []).map(o => o.id === mechObj?.id ? { ...o, xMm: 999 } : o)
    });
    expect(useProjectStore.getState().mechanicalObjects?.[0]?.xMm).toBe(999);

    // Cancel transaction
    store.cancelCommand();

    // Verify original coordinates restored and no history entry added
    expect(useProjectStore.getState().mechanicalObjects?.[0]?.xMm).toBe(initialX);
    expect(useProjectStore.getState().pastCommands?.length || 0).toBe(initialPastCount);
  });
});
