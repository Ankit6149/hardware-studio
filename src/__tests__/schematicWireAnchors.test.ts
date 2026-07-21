import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { BoardComponent } from '../types';

describe('Slice 3 Complete Schematic Wire Anchor & Workflow Tests', () => {
  it('should execute complete pin-anchored schematic workflow through store actions', () => {
    const store = useProjectStore.getState();

    // 1. Create two components
    const compA: BoardComponent = {
      id: 'comp_u1_mcu',
      libraryId: 'lib_mcu',
      boardId: 'board_main',
      circuitBlockId: 'block_0',
      referenceDesignator: 'U1',
      componentName: 'Microcontroller',
      componentType: 'Microcontroller',
      value: 'ESP32-S3',
      packageName: 'QFN_56',
      footprint: 'QFN_56',
      partNumber: 'ESP32_S3_QFN',
      pins: [
        { id: 'pin_u1_1', componentId: 'comp_u1_mcu', pinNumber: '1', pinName: 'GPIO1', electricalType: 'Output', netName: '' },
        { id: 'pin_u1_2', componentId: 'comp_u1_mcu', pinNumber: '2', pinName: 'GPIO2', electricalType: 'Input', netName: '' }
      ],
      quantity: 1,
      side: 'Top',
      placementCriticality: 'Low',
      notes: '',
      placementStatus: 'Placed',
      schematic: { placed: true, x: 100, y: 100, rotation: 0, locked: false }
    };

    const compB: BoardComponent = {
      id: 'comp_u2_sensor',
      libraryId: 'lib_sensor',
      boardId: 'board_main',
      circuitBlockId: 'block_0',
      referenceDesignator: 'U2',
      componentName: 'Temperature Sensor',
      componentType: 'Sensor',
      value: 'TMP117',
      packageName: 'SOT_23',
      footprint: 'SOT_23',
      partNumber: 'TMP117_SOT23',
      pins: [
        { id: 'pin_u2_1', componentId: 'comp_u2_sensor', pinNumber: '1', pinName: 'SDA', electricalType: 'Bidirectional', netName: '' }
      ],
      quantity: 1,
      side: 'Top',
      placementCriticality: 'Low',
      notes: '',
      placementStatus: 'Placed',
      schematic: { placed: true, x: 400, y: 100, rotation: 0, locked: false }
    };

    useProjectStore.setState({
      boardComponents: [compA, compB],
      schematicWires: [],
      nets: [],
      padNetAssignments: []
    });

    // 2. Place symbols on schematic
    store.placeComponentOnSchematic('comp_u1_mcu', 150, 150);
    store.placeComponentOnSchematic('comp_u2_sensor', 450, 150);

    const sState = useProjectStore.getState();
    expect(sState.boardComponents?.find(c => c.id === 'comp_u1_mcu')?.schematic?.x).toBe(150);
    expect(sState.boardComponents?.find(c => c.id === 'comp_u2_sensor')?.schematic?.x).toBe(450);

    // 3. Connect two pins via store action
    const connResult = store.connectComponentPins('comp_u1_mcu', '1', 'comp_u2_sensor', '1', 'SENSOR_SDA');
    expect(connResult.wire).toBeDefined();

    // 4. Verify structured pin anchors created
    const createdWire = useProjectStore.getState().schematicWires?.[0];
    expect(createdWire?.sourceAnchor).toEqual({ type: 'pin', componentId: 'comp_u1_mcu', pinNumber: '1' });
    expect(createdWire?.targetAnchor).toEqual({ type: 'pin', componentId: 'comp_u2_sensor', pinNumber: '1' });
    expect(createdWire?.status).toBe('Connected');

    // 5. Move source symbol
    store.placeComponentOnSchematic('comp_u1_mcu', 200, 250);
    const movedState = useProjectStore.getState();
    expect(movedState.boardComponents?.find(c => c.id === 'comp_u1_mcu')?.schematic?.x).toBe(200);

    // 6. Move target symbol
    store.placeComponentOnSchematic('comp_u2_sensor', 500, 250);
    expect(useProjectStore.getState().boardComponents?.find(c => c.id === 'comp_u2_sensor')?.schematic?.x).toBe(500);

    // 7. Rotate symbol
    useProjectStore.setState({
      boardComponents: useProjectStore.getState().boardComponents?.map(c => 
        c.id === 'comp_u1_mcu' ? { ...c, schematic: { ...c.schematic!, rotation: 90 } } : c
      )
    });
    expect(useProjectStore.getState().boardComponents?.find(c => c.id === 'comp_u1_mcu')?.schematic?.rotation).toBe(90);

    // 8. Export and import JSON round-trip
    const jsonStr = store.exportProjectJSON();
    expect(jsonStr).toContain('comp_u1_mcu');
    expect(jsonStr).toContain('SENSOR_SDA');

    store.importProjectJSON(jsonStr);
    const restoredWire = useProjectStore.getState().schematicWires?.[0];
    expect(restoredWire?.sourceAnchor?.type).toBe('pin');
    if (restoredWire?.sourceAnchor?.type === 'pin') {
      expect(restoredWire.sourceAnchor.componentId).toBe('comp_u1_mcu');
    }

    // 9. Delete one component and confirm affected wire is safely updated
    store.deleteProjectComponent('comp_u2_sensor', 'entire-product');
    const finalWires = useProjectStore.getState().schematicWires || [];
    const remainingCompWires = finalWires.filter(w => 
      w.sourceAnchor?.type === 'pin' && w.sourceAnchor.componentId === 'comp_u2_sensor' ||
      w.targetAnchor?.type === 'pin' && w.targetAnchor.componentId === 'comp_u2_sensor'
    );
    expect(remainingCompWires.length).toBe(0);
  });
});
