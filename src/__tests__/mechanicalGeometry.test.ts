import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { MechanicalObject, MechanicalDimension } from '../types';
import {
  getMechanicalBoundingBox,
  isMechanicalObjectContained,
  movePolygonVertex,
  insertPolygonVertex,
  deletePolygonVertex,
  applyLightweightConstraint
} from '../lib/mechanical/mechanicalGeometry';

describe('Slice 5 Complete 2D Mechanical Geometry & Lightweight Constraints Workflow Tests', () => {
  it('should execute complete 2D mechanical polygon, vertex, dimensioning, constraint, undo/redo, and persistence workflow', () => {
    const store = useProjectStore.getState();

    // 1. Draw polygon enclosure & complete polygon
    let polyShell: MechanicalObject = {
      id: 'poly_shell_1',
      name: 'Custom Polygon Enclosure',
      type: 'Outer Profile',
      shape: 'polygon',
      xMm: 0,
      yMm: 0,
      points: [
        { x: 0, y: 0 },
        { x: 120, y: 0 },
        { x: 120, y: 80 },
        { x: 0, y: 80 }
      ],
      rotationDeg: 0,
      layer: 'Enclosure',
      locked: false,
      visible: true
    };

    store.addMechanicalObject(polyShell);
    let currentPoly = useProjectStore.getState().mechanicalObjects?.find(o => o.id === 'poly_shell_1')!;
    expect(currentPoly.points?.length).toBe(4);

    // 2. Move one vertex
    polyShell = movePolygonVertex(currentPoly, 1, { x: 130, y: 0 });
    store.updateMechanicalObject('poly_shell_1', polyShell);
    currentPoly = useProjectStore.getState().mechanicalObjects?.find(o => o.id === 'poly_shell_1')!;
    expect(currentPoly.points?.[1]?.x).toBe(130);

    // 3. Insert one vertex
    polyShell = insertPolygonVertex(currentPoly, 1, { x: 130, y: 40 });
    store.updateMechanicalObject('poly_shell_1', polyShell);
    currentPoly = useProjectStore.getState().mechanicalObjects?.find(o => o.id === 'poly_shell_1')!;
    expect(currentPoly.points?.length).toBe(5);

    // 4. Delete one vertex
    polyShell = deletePolygonVertex(currentPoly, 2);
    store.updateMechanicalObject('poly_shell_1', polyShell);
    currentPoly = useProjectStore.getState().mechanicalObjects?.find(o => o.id === 'poly_shell_1')!;
    expect(currentPoly.points?.length).toBe(4);

    // 5. Add Board Zone
    const pcbZone: MechanicalObject = {
      id: 'board_zone_1',
      name: 'Main PCB Fit Zone',
      type: 'Board Zone',
      shape: 'rect',
      xMm: 10,
      yMm: 10,
      widthMm: 100,
      heightMm: 60,
      rotationDeg: 0,
      layer: 'PCB Boundary',
      locked: false,
      visible: true
    };
    store.addMechanicalObject(pcbZone);

    // 6. Add Battery Cavity
    const battCavity: MechanicalObject = {
      id: 'batt_cavity_1',
      name: 'LiPo Battery Cavity',
      type: 'Battery Cavity',
      shape: 'rect',
      xMm: 15,
      yMm: 15,
      widthMm: 40,
      heightMm: 30,
      rotationDeg: 0,
      layer: 'Battery',
      locked: false,
      visible: true
    };
    store.addMechanicalObject(battCavity);

    // 7. Add Connector Opening
    const usbCutout: MechanicalObject = {
      id: 'usb_cutout_1',
      name: 'USB-C Port Opening',
      type: 'Connector Opening',
      shape: 'rect',
      xMm: 0,
      yMm: 35,
      widthMm: 10,
      heightMm: 8,
      rotationDeg: 0,
      layer: 'Enclosure Cutout',
      locked: false,
      visible: true
    };
    store.addMechanicalObject(usbCutout);

    // Confirm containment of PCB zone inside polyShell
    expect(isMechanicalObjectContained(pcbZone, currentPoly)).toBe(true);

    // 8. Add Width Dimension
    const widthDim: MechanicalDimension = {
      id: 'dim_width_1',
      name: 'Enclosure Width 120mm',
      from: { xMm: 0, yMm: 0 },
      to: { xMm: 120, yMm: 0 },
      valueMm: 120,
      linkedObjectIds: ['poly_shell_1']
    };
    useProjectStore.setState({
      mechanicalDimensions: [...(useProjectStore.getState().mechanicalDimensions || []), widthDim]
    });

    // 9. Apply Lightweight Constraint: Centre Alignment
    const centeredBatt = applyLightweightConstraint('centre-align', battCavity, pcbZone);
    store.executeProjectCommand('UPDATE_MECH_OBJ', 'Apply centre alignment constraint', () => {
      store.updateMechanicalObject('batt_cavity_1', centeredBatt);
    });

    const updatedBatt = useProjectStore.getState().mechanicalObjects?.find(o => o.id === 'batt_cavity_1');
    expect(updatedBatt?.xMm).toBe(40); // (10 + 100/2) - 40/2 = 60 - 20 = 40
    expect(updatedBatt?.yMm).toBe(25); // (10 + 60/2) - 30/2 = 40 - 15 = 25

    // 10. Apply Lightweight Constraint: Fixed Distance
    const fixedDistBatt = applyLightweightConstraint('fixed-distance', battCavity, pcbZone, 15);
    store.executeProjectCommand('UPDATE_MECH_OBJ', 'Apply fixed distance constraint', () => {
      store.updateMechanicalObject('batt_cavity_1', fixedDistBatt);
    });
    expect(useProjectStore.getState().mechanicalObjects?.find(o => o.id === 'batt_cavity_1')?.xMm).toBe(125); // 110 + 15 = 125

    // 11. Undo & Redo
    store.undoProjectCommand();
    expect(useProjectStore.getState().mechanicalObjects?.find(o => o.id === 'batt_cavity_1')?.xMm).toBe(40);

    store.redoProjectCommand();
    expect(useProjectStore.getState().mechanicalObjects?.find(o => o.id === 'batt_cavity_1')?.xMm).toBe(125);

    // 12. Export / Import JSON round-trip
    const jsonStr = store.exportProjectJSON();
    expect(jsonStr).toContain('poly_shell_1');
    expect(jsonStr).toContain('LiPo Battery Cavity');
    expect(jsonStr).toContain('Enclosure Width 120mm');

    store.importProjectJSON(jsonStr);
    const restoredState = useProjectStore.getState();
    expect(restoredState.mechanicalObjects?.length).toBe(4);
    expect(restoredState.mechanicalDimensions?.length).toBe(1);
    expect(restoredState.mechanicalDimensions?.[0]?.valueMm).toBe(120);
  });
});
