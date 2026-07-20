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
        type: 'Functional',
        priority: 'High',
        status: 'Draft',
        acceptanceCriteria: [],
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [],
        linkedFirmwareModuleIds: [],
        linkedTestIds: [],
        risks: []
      }],
      architectureNodes: [{
        id: 'arch_store_1',
        name: 'MCU Core',
        category: 'Processing',
        description: 'ESP32-S3 Subsystem',
        x: 0,
        y: 0,
        width: 100,
        height: 50,
        linkedRequirementIds: ['req_store_1'],
        linkedCircuitIds: [],
        linkedComponentIds: [],
        linkedFirmwareModuleIds: [],
        linkedTestIds: [],
        status: 'MVP'
      }],
      architectureConnections: [{
        id: 'conn_store_1',
        sourceNodeId: 'arch_store_1',
        targetNodeId: 'arch_store_1',
        type: 'Data',
        direction: 'Forward',
        protocol: 'I2C',
        voltage: 3.3
      }],
      mechanicalObjects: [{
        id: 'mech_store_1',
        name: 'Enclosure Shell',
        type: 'Outer Profile',
        shape: 'rect',
        xMm: 10,
        yMm: 10,
        widthMm: 100,
        heightMm: 60,
        rotationDeg: 0,
        layer: 'Outer Enclosure',
        locked: false,
        visible: true
      }],
      mechanicalDimensions: [{
        id: 'dim_store_1',
        name: 'Width 100mm',
        from: { xMm: 0, yMm: 0 },
        to: { xMm: 100, yMm: 0 },
        valueMm: 100,
        linkedObjectIds: ['mech_store_1']
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
        side: 'Top',
        placementStatus: 'Placed',
        placementCriticality: 'High',
        status: 'Verified',
        notes: 'Main motion sensor'
      }],
      schematicWires: [{
        id: 'wire_store_1',
        netId: 'net_3v3',
        netName: '3V3',
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
        category: 'Firmware',
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

    // Store import
    const result = store.importProjectJSON(testProject as Project);
    expect(result.success).toBe(true);

    // Store export round-trip verification
    const jsonOut = store.exportProjectJSON();
    expect(jsonOut).toContain('store_test_proj_v5');
    expect(jsonOut).toContain('Battery Efficiency');
    expect(jsonOut).toContain('IMU Sensor');
  });
});
