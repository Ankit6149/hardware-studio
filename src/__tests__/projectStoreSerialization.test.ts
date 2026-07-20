import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { Project } from '../types';

describe('Canonical Store-Level Serialization Tests', () => {
  it('should export complete project JSON and restore every domain on store import', () => {
    const store = useProjectStore.getState();

    // Create rich data across all domains
    const testProject: Partial<Project> = {
      id: 'store_test_proj_v5',
      projectName: 'Full Store Integration System',
      description: 'Store-level serialization test',
      schemaVersion: 5,
      productVersion: '1.0.0',
      requirements: [{
        id: 'req_store_1',
        title: 'Battery Efficiency',
        description: 'Run 24 hours on 300mAh battery',
        category: 'Power',
        priority: 'High',
        status: 'Open',
        targetValue: '24h',
        verificationMethod: 'Test'
      }],
      architectureNodes: [{
        id: 'arch_store_1',
        name: 'MCU Core',
        category: 'Microcontroller',
        description: 'ESP32-S3 Subsystem',
        subsystem: 'Main Processor',
        linkedRequirementIds: ['req_store_1']
      }],
      architectureConnections: [{
        id: 'conn_store_1',
        sourceNodeId: 'arch_store_1',
        targetNodeId: 'arch_store_1',
        protocol: 'I2C',
        voltageV: 3.3,
        dataRateMbps: 0.4,
        safetyClass: 'Class B'
      }],
      mechanicalObjects: [{
        id: 'mech_store_1',
        name: 'Enclosure Shell',
        shape: 'rectangle',
        x: 10,
        y: 10,
        width: 100,
        height: 60,
        color: '#475569',
        layer: 'Outer Enclosure',
        locked: false,
        visible: true,
        isBoardZone: false,
        isKeepout: false
      }],
      mechanicalDimensions: [{
        id: 'dim_store_1',
        sourceObjectId: 'mech_store_1',
        dimensionType: 'horizontal',
        valueMm: 100,
        label: 'Outer Width 100mm'
      }],
      boardComponents: [{
        id: 'cmp_store_1',
        libraryId: 'lib_sensor_1',
        boardId: 'board_main',
        circuitBlockId: 'block_0',
        referenceDesignator: 'U100',
        componentName: 'IMU Sensor',
        componentType: 'Sensor',
        value: 'BMI270',
        packageName: 'LGA_14',
        footprint: 'LGA_14',
        partNumber: 'BMI270_TR',
        pins: [{
          id: 'pin_cmp_store_1_1',
          componentId: 'cmp_store_1',
          pinNumber: '1',
          pinName: 'VDD',
          electricalType: 'PowerIn',
          netName: '3V3'
        }],
        quantity: 1,
        schematic: { placed: true, x: 200, y: 150, rotation: 0 },
        pcb: { placed: true, xMm: 30, yMm: 25, rotationDeg: 0, side: 'Top', locked: false, placementStatus: 'Placed' },
        status: 'Verified',
        notes: 'Main motion sensor'
      }],
      schematicWires: [{
        id: 'wire_store_1',
        netId: 'net_3v3',
        sourcePinId: 'cmp_store_1_1',
        targetPinId: 'cmp_store_1_1',
        points: [{ x: 200, y: 150 }, { x: 250, y: 150 }],
        status: 'Connected'
      }],
      firmwareStates: [{
        id: 'state_store_idle',
        name: 'IDLE',
        type: 'Initial',
        x: 100,
        y: 100,
        entryActions: ['gpio_init()'],
        exitActions: [],
        linkedModuleIds: ['fw_store_1'],
        linkedComponentIds: ['cmp_store_1']
      }],
      firmwareTransitions: [{
        id: 'trans_store_1',
        sourceStateId: 'state_store_idle',
        targetStateId: 'state_store_idle',
        event: 'EVT_TIMER_EXPIRED'
      }],
      validationTests: [{
        id: 'val_store_1',
        name: 'Sensor I2C Ping Test',
        stage: 'EVT',
        category: 'Functional',
        linkedRequirementIds: ['req_store_1'],
        linkedArchitectureNodeIds: ['arch_store_1'],
        linkedComponentIds: ['cmp_store_1'],
        linkedNetIds: ['net_3v3'],
        linkedFirmwareModuleIds: ['fw_store_1'],
        steps: [],
        measurements: [],
        passCriteria: [],
        status: 'Not Started',
        evidence: []
      }]
    };

    // Load test project into store and export
    store.importProjectJSON(testProject);
    const jsonOutput = store.exportProjectJSON();
    expect(jsonOutput).toBeTypeOf('string');

    // Re-import exported JSON
    const result = store.importProjectJSON(jsonOutput);
    expect(result.success).toBe(true);

    // Verify complete data preservation across store state
    const current = useProjectStore.getState();
    expect(current.id).toBe('store_test_proj_v5');
    expect(current.requirements?.[0].id).toBe('req_store_1');
    expect(current.architectureNodes?.[0].name).toBe('MCU Core');
    expect(current.architectureConnections?.[0].protocol).toBe('I2C');
    expect(current.mechanicalObjects?.[0].id).toBe('mech_store_1');
    expect(current.mechanicalDimensions?.[0].valueMm).toBe(100);
    expect(current.boardComponents?.[0].referenceDesignator).toBe('U100');
    expect(current.schematicWires?.[0].id).toBe('wire_store_1');
    expect(current.firmwareStates?.[0].name).toBe('IDLE');
    expect(current.firmwareTransitions?.[0].event).toBe('EVT_TIMER_EXPIRED');
    expect(current.validationTests?.[0].name).toBe('Sensor I2C Ping Test');
  });
});
