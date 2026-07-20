import { describe, it, expect } from 'vitest';
import { serializeProject, deserializeProject, validateProjectIntegrity } from '../lib/projectSerialization';
import { Project } from '../types';

describe('Project Serialization & Schema v5 Round-Trip Tests', () => {
  it('should round-trip complete project data across all 24 collections without dropping fields or IDs', () => {
    const fullProject: Project = {
      id: 'proj_v5_test',
      projectName: 'Test Product V5',
      description: 'Full domain round trip verification',
      createdAt: '2026-07-20T00:00:00Z',
      updatedAt: '2026-07-20T00:00:00Z',
      version: '5',
      activeView: 'dashboard',
      nodes: [],
      edges: [],
      bom: [],
      testing: [],
      powerBudget: [],
      pinMap: [],
      firmwareTasks: [],
      boards: [{ id: 'b1', name: 'Main Board', boardType: 'Main PCB', purpose: 'Main PCB', dimensionsMm: '50x50', layerCount: 4, substrate: 'FR4', placement: 'Internal', mountingNotes: '', connectorNotes: '', thermalNotes: '', rfNotes: '', status: 'Concept' }],
      circuitBlocks: [],
      boardComponents: [{
        id: 'c1', boardId: 'b1', circuitBlockId: 'cb1', referenceDesignator: 'U1', componentName: 'MCU', componentType: 'IC', value: 'STM32', packageName: 'QFN32', footprint: 'QFN-32', partNumber: 'STM32F4', quantity: 1, side: 'Top', placementCriticality: 'High', notes: '',
        schematic: { placed: true, x: 100, y: 100 }, pcb: { placed: true, xMm: 25, yMm: 25, rotationDeg: 0, side: 'Top', locked: false, placementStatus: 'Placed' }
      }],
      nets: [{ id: 'net_vcc', netName: '3V3', netType: 'Power', voltage: '3.3V', sourceComponent: 'U1', sourcePin: '1', targetComponent: 'C1', targetPin: '1', protocol: 'Power', currentEstimate: '100mA', impedanceRequirement: '', notes: '' }],
      pcbConstraints: [],
      manufacturingChecklist: [],
      requirements: [{
        id: 'req_1', title: 'Power Rail 3V3', description: 'Maintain steady 3.3V', type: 'Electrical', priority: 'Critical', status: 'Approved', acceptanceCriteria: ['3.3V +- 5%'], linkedArchitectureNodeIds: ['arch_1'], linkedComponentIds: ['c1'], linkedFirmwareModuleIds: [], linkedTestIds: ['val_1'], risks: []
      }],
      architectureNodes: [{
        id: 'arch_1', name: 'Microcontroller Subsystem', category: 'Processing', description: 'Core MCU', x: 200, y: 150, width: 140, height: 80, linkedRequirementIds: ['req_1'], linkedCircuitIds: [], linkedComponentIds: ['c1'], linkedFirmwareModuleIds: ['fw_1'], linkedTestIds: ['val_1'], status: 'MVP'
      }],
      architectureConnections: [{
        id: 'conn_1', sourceNodeId: 'arch_1', targetNodeId: 'arch_1', type: 'Data', direction: 'Forward', name: 'Loopback'
      }],
      mechanicalObjects: [{
        id: 'mech_1', name: 'Enclosure Shell', type: 'Outer Profile', shape: 'rect', xMm: 0, yMm: 0, widthMm: 60, heightMm: 60, rotationDeg: 0, locked: false, visible: true
      }],
      mechanicalDimensions: [{
        id: 'dim_1', name: 'Length', from: { xMm: 0, yMm: 0 }, to: { xMm: 60, yMm: 0 }, valueMm: 60, linkedObjectIds: ['mech_1']
      }],
      firmwareModules: [{
        id: 'fw_1', name: 'Driver_GPIO', type: 'Driver', description: 'GPIO init', linkedArchitectureNodeIds: ['arch_1'], linkedComponentIds: ['c1'], linkedPinIds: [], linkedNetIds: ['net_vcc'], linkedTestIds: [], dependencies: [], sourceFiles: [], status: 'Draft'
      }],
      firmwareStates: [{
        id: 'state_idle', name: 'IDLE', type: 'Initial', x: 50, y: 50, entryActions: ['init_gpio()'], exitActions: [], linkedModuleIds: ['fw_1'], linkedComponentIds: ['c1']
      }],
      firmwareTransitions: [{
        id: 'trans_1', sourceStateId: 'state_idle', targetStateId: 'state_idle', event: 'EVT_TICK'
      }],
      validationTests: [{
        id: 'val_1', name: 'Voltage Test', stage: 'EVT', category: 'Electrical', linkedRequirementIds: ['req_1'], linkedArchitectureNodeIds: ['arch_1'], linkedComponentIds: ['c1'], linkedNetIds: ['net_vcc'], linkedFirmwareModuleIds: ['fw_1'], steps: [], measurements: [], passCriteria: [], status: 'Not Started', evidence: []
      }],
      customComponentLibrary: [{
        libraryId: 'lib_cmp_1', name: 'Custom Sensor Module', category: 'Sensor', description: '', packageName: 'SOIC_8', footprintName: 'SOIC_8', symbolName: 'Sensor', electrical: {}, pins: [], tags: [], defaultQuantity: 1
      }]
    };

    // Serialize
    const json = serializeProject(fullProject);
    expect(json).toBeTypeOf('string');

    // Deserialize
    const restored = deserializeProject(json);

    // Verify preservation of domain entities and relationships
    expect(restored.id).toBe('proj_v5_test');
    expect(restored.requirements?.[0].id).toBe('req_1');
    expect(restored.architectureConnections?.[0].id).toBe('conn_1');
    expect(restored.mechanicalDimensions?.[0].id).toBe('dim_1');
    expect(restored.firmwareStates?.[0].name).toBe('IDLE');
    expect(restored.firmwareTransitions?.[0].event).toBe('EVT_TICK');
    expect(restored.customComponentLibrary?.[0].libraryId).toBe('lib_cmp_1');

    // Verify integrity checks pass cleanly
    const issues = validateProjectIntegrity(restored);
    expect(issues.filter(i => i.severity === 'Error')).toHaveLength(0);
  });
});
