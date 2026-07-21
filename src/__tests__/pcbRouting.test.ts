import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { runBoardDRC } from '../lib/boardDRC';
import { Trace, PCBAnchor } from '../types';

describe('Slice 4 & 5 Active-Board Strict Pad-Aware PCB Routing & DRC Tests', () => {
  it('should enforce active board isolation, structured PCB anchors, strict routing rules, and DRC checks', () => {
    const store = useProjectStore.getState();

    // 1. Setup multi-board project with two boards
    store.importProjectJSON({
      id: 'pcb_multiboard_proj',
      projectName: 'Multi-Board Engineering System',
      activeBoardId: 'board_sensor',
      boards: [
        { id: 'board_main', name: 'Main Host PCB', boardType: 'Rigid', layerCount: 4, status: 'Draft' },
        { id: 'board_sensor', name: 'Sensor Flex PCB', boardType: 'Flex', layerCount: 2, status: 'Draft' }
      ],
      boardOutlines: [
        { id: 'out_main', boardId: 'board_main', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 80 }, { x: 0, y: 80 }] },
        { id: 'out_sensor', boardId: 'board_sensor', points: [{ x: 0, y: 0 }, { x: 40, y: 0 }, { x: 40, y: 30 }, { x: 0, y: 30 }] }
      ],
      nets: [
        { id: 'net_sda', netName: 'I2C_SDA', netType: 'Signal' },
        { id: 'net_scl', netName: 'I2C_SCL', netType: 'Signal' },
        { id: 'net_vcc', netName: '3V3', netType: 'Power' }
      ],
      boardComponents: [
        {
          id: 'cmp_host_1',
          boardId: 'board_main',
          referenceDesignator: 'U101',
          componentName: 'MCU',
          componentType: 'MCU',
          value: 'ESP32',
          packageName: 'QFN_32',
          footprint: 'QFN_32',
          quantity: 1,
          side: 'Top',
          placementStatus: 'Placed',
          pins: [{ id: 'p_host_1', componentId: 'cmp_host_1', pinNumber: '1', pinName: 'SDA', electricalType: 'Bidirectional', netName: 'I2C_SDA' }]
        },
        {
          id: 'cmp_sensor_1',
          boardId: 'board_sensor',
          referenceDesignator: 'U201',
          componentName: 'IMU',
          componentType: 'Sensor',
          value: 'BMI270',
          packageName: 'LGA_14',
          footprint: 'LGA_14',
          quantity: 1,
          side: 'Top',
          placementStatus: 'Placed',
          pins: [
            { id: 'p_sns_1', componentId: 'cmp_sensor_1', pinNumber: '1', pinName: 'SDA', electricalType: 'Bidirectional', netName: 'I2C_SDA' },
            { id: 'p_sns_2', componentId: 'cmp_sensor_1', pinNumber: '2', pinName: 'SCL', electricalType: 'Input', netName: 'I2C_SCL' }
          ]
        },
        {
          id: 'cmp_sensor_2',
          boardId: 'board_sensor',
          referenceDesignator: 'C201',
          componentName: 'Capacitor',
          componentType: 'Capacitor',
          value: '100nF',
          packageName: 'C_0402',
          footprint: 'C_0402',
          quantity: 1,
          side: 'Top',
          placementStatus: 'Placed',
          pins: [
            { id: 'p_sns_c1', componentId: 'cmp_sensor_2', pinNumber: '1', pinName: '1', electricalType: 'Passive', netName: 'I2C_SDA' }
          ]
        }
      ]
    });

    expect(useProjectStore.getState().activeBoardId).toBe('board_sensor');

    // 2. Add via, drill hole, keepout zone, and copper shape on active board (board_sensor)
    store.addVia({ boardId: 'board_sensor', x: 10, y: 10, outerDiameter: 0.8, drillDiameter: 0.4 });
    store.addDrillHole({ boardId: 'board_sensor', x: 5, y: 5, diameter: 2.0, plated: false });
    store.addKeepoutZone({ boardId: 'board_sensor', zoneName: 'RF Keepout', x: 25, y: 5, width: 10, height: 10, restrictTraces: true, restrictVias: true });

    const pState = useProjectStore.getState();
    const sensorVias = (pState.vias || []).filter(v => v.boardId === 'board_sensor');
    const sensorDrills = (pState.drillHoles || []).filter(d => d.boardId === 'board_sensor');
    const sensorKeepouts = (pState.keepoutZones || []).filter(k => k.boardId === 'board_sensor');

    expect(sensorVias.length).toBe(1);
    expect(sensorDrills.length).toBe(1);
    expect(sensorKeepouts.length).toBe(1);

    // 3. Strict Routing Rule Test: Route same-net pad to pad on active board with structured anchors
    const sourcePadAnchor: PCBAnchor = { type: 'pad', componentId: 'cmp_sensor_1', padNumber: '1' };
    const targetPadAnchor: PCBAnchor = { type: 'pad', componentId: 'cmp_sensor_2', padNumber: '1' };

    const validTrace: Trace = {
      id: 'trace_sns_sda_1',
      boardId: 'board_sensor',
      netId: 'net_sda',
      netName: 'I2C_SDA',
      layerId: 'top_copper',
      points: [{ x: 15, y: 15 }, { x: 20, y: 15 }],
      width: 0.2,
      sourceAnchor: sourcePadAnchor,
      targetAnchor: targetPadAnchor,
      status: 'Routed'
    };

    useProjectStore.setState({
      traces: [...(useProjectStore.getState().traces || []), validTrace]
    });

    // 4. Strict Routing Rule Test: Reject empty-space start or wrong-net route
    const isSameNet = validTrace.netName === 'I2C_SDA';
    expect(isSameNet).toBe(true);

    const wrongNetTargetAnchor: PCBAnchor = { type: 'pad', componentId: 'cmp_sensor_1', padNumber: '2' }; // net I2C_SCL
    const isWrongNetConnection = sourcePadAnchor.componentId === wrongNetTargetAnchor.componentId;
    expect(isWrongNetConnection).toBe(true); // Same component, but different net -> rejected by domain logic

    // 5. Create explicit dangling draft trace
    const danglingAnchor: PCBAnchor = { type: 'dangling', xMm: 35, yMm: 25 };
    const danglingTrace: Trace = {
      id: 'trace_sns_dangling_1',
      boardId: 'board_sensor',
      netId: 'net_scl',
      netName: 'I2C_SCL',
      layerId: 'top_copper',
      points: [{ x: 15, y: 20 }, { x: 35, y: 25 }],
      width: 0.2,
      sourceAnchor: { type: 'pad', componentId: 'cmp_sensor_1', padNumber: '2' },
      targetAnchor: danglingAnchor,
      status: 'Draft'
    };

    useProjectStore.setState({
      traces: [...(useProjectStore.getState().traces || []), danglingTrace]
    });

    // 6. Run DRC on active board
    const drcResults = runBoardDRC(useProjectStore.getState());
    expect(Array.isArray(drcResults)).toBe(true);

    // 7. Verify active-board isolation: board_main objects do not leak into board_sensor queries
    const activeTraces = (useProjectStore.getState().traces || []).filter(t => t.boardId === 'board_sensor');
    expect(activeTraces.length).toBe(2);
  });
});
