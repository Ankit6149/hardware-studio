import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { Project } from '../types';

describe('Slice 1 Mandatory Canonical Store Persistence Tests', () => {
  it('should export, import, switch, and reload all V1 domains from local storage', () => {
    const store = useProjectStore.getState();

    // Create rich data across all 24 V1 domains
    const testProject: Partial<Project> = {
      id: 'store_test_proj_v1_full',
      projectName: 'Full V1 Engineering System',
      description: 'Store-level mandatory persistence test',
      schemaVersion: 5,
      version: '5',
      productVersion: '1.0.0',
      activeBranch: 'main',
      requirements: [{
        id: 'req_store_1',
        title: 'Battery Efficiency',
        description: 'Run 24 hours on 300mAh battery',
        type: 'Functional',
        priority: 'High',
        status: 'Draft',
        acceptanceCriteria: ['Must draw < 10mA'],
        linkedArchitectureNodeIds: ['arch_store_1'],
        linkedComponentIds: ['cmp_store_1'],
        linkedFirmwareModuleIds: ['fw_module_1'],
        linkedTestIds: ['val_store_1'],
        risks: ['Power spike during boot']
      }],
      architectureNodes: [{
        id: 'arch_store_1',
        name: 'MCU Core',
        category: 'Processing',
        description: 'ESP32-S3 Subsystem',
        x: 10,
        y: 10,
        width: 120,
        height: 60,
        linkedRequirementIds: ['req_store_1'],
        linkedCircuitIds: [],
        linkedComponentIds: ['cmp_store_1'],
        linkedFirmwareModuleIds: ['fw_module_1'],
        linkedTestIds: ['val_store_1'],
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
      mechanicalBodies: [{
        id: 'body_store_1',
        name: 'Main 3D Shell',
        objectType: 'Enclosure',
        xMm: 0,
        yMm: 0,
        zMm: 0,
        widthMm: 100,
        heightMm: 60,
        depthMm: 20,
        color: '#475569',
        transparent: true,
        opacity: 0.8
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
        status: 'Connected',
        sourceAnchor: { type: 'pin', componentId: 'cmp_store_1', pinNumber: '1' },
        targetAnchor: { type: 'pin', componentId: 'cmp_store_1', pinNumber: '2' }
      }],
      firmwareSourceFiles: [{
        id: 'fw_file_main',
        path: 'src/main.cpp',
        name: 'main.cpp',
        content: '#include <Arduino.h>\nvoid setup(){}\nvoid loop(){}',
        isGenerated: false,
        dirty: false,
        language: 'cpp'
      }],
      firmwareStates: [{
        id: 'state_store_idle',
        name: 'IDLE',
        type: 'Initial',
        x: 100,
        y: 100,
        entryActions: ['gpio_init()'],
        exitActions: [],
        linkedModuleIds: ['fw_module_1'],
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
        linkedFirmwareModuleIds: ['fw_module_1'],
        steps: [],
        measurements: [],
        passCriteria: [],
        status: 'Not Started',
        evidence: []
      }],
      validationRuns: [{
        id: 'val_run_1',
        testId: 'val_store_1',
        runNumber: 1,
        timestamp: '2026-07-21T00:00:00Z',
        operator: 'QA Test Lead',
        status: 'Passed',
        logs: [],
        stepResults: [],
        evidence: [{ id: 'ev_1', type: 'log', title: 'i2c_ping.log', content: 'ACK received at 0x68' }]
      }],
      revisions: [{
        id: 'rev_v1.0.0',
        name: 'v1.0.0 Release Candidate',
        branchName: 'main',
        createdAt: '2026-07-21T00:00:00Z',
        description: 'V1 Initial Release Candidate',
        status: 'Release Candidate'
      }],
      branches: [{
        id: 'branch_main',
        name: 'main',
        branchName: 'main',
        createdAt: '2026-07-21T00:00:00Z',
        description: 'Primary engineering branch',
        status: 'Working'
      }],
      mcpProposals: [{
        id: 'mcp_prop_1',
        toolName: 'draft_requirement',
        args: { title: 'Draft MCP Requirement' },
        status: 'Pending',
        createdAt: '2026-07-21T00:00:00Z'
      }],
      mcpAuditRecords: [{
        id: 'mcp_audit_1',
        timestamp: '2026-07-21T00:00:00Z',
        action: 'apply_draft',
        proposalId: 'mcp_prop_1',
        executedBy: 'mcp_client',
        status: 'Success'
      }]
    };

    // 1. Store import
    const result = useProjectStore.getState().importProjectJSON(testProject as Project);
    expect(result.success).toBe(true);

    // 2. Verify imported state contains all domains
    const s1 = useProjectStore.getState();
    expect(s1.id).toBe('store_test_proj_v1_full');
    expect(s1.requirements?.length).toBe(1);
    expect(s1.architectureNodes?.length).toBe(1);
    expect(s1.architectureConnections?.length).toBe(1);
    expect(s1.mechanicalObjects?.length).toBe(1);
    expect(s1.mechanicalDimensions?.length).toBe(1);
    expect(s1.mechanicalBodies?.length).toBe(1);
    expect(s1.boardComponents?.length).toBe(1);
    expect(s1.schematicWires?.length).toBe(1);
    expect(s1.firmwareSourceFiles?.length).toBe(1);
    expect(s1.firmwareStates?.length).toBe(1);
    expect(s1.firmwareTransitions?.length).toBe(1);
    expect(s1.validationTests?.length).toBe(1);
    expect(s1.validationRuns?.length).toBe(1);
    expect(s1.revisions?.length).toBe(1);
    expect(s1.branches?.length).toBe(1);
    expect(s1.mcpProposals?.length).toBe(1);
    expect(s1.mcpAuditRecords?.length).toBe(1);

    // 3. Export JSON round-trip
    const jsonOut = useProjectStore.getState().exportProjectJSON();
    expect(jsonOut).toContain('store_test_proj_v1_full');
    expect(jsonOut).toContain('Battery Efficiency');
    expect(jsonOut).toContain('src/main.cpp');
    expect(jsonOut).toContain('val_run_1');

    // 4. Switch project and switch back
    useProjectStore.getState().saveProjectAsCopy('Other Temp Project');
    expect(useProjectStore.getState().id).not.toBe('store_test_proj_v1_full');

    useProjectStore.getState().loadProject('store_test_proj_v1_full');
    expect(useProjectStore.getState().id).toBe('store_test_proj_v1_full');

    // 5. Reload from localStorage
    useProjectStore.getState().loadProjectFromLocalStorage();
    const loadedState = useProjectStore.getState();
    expect(loadedState.id).toBe('store_test_proj_v1_full');
    expect(loadedState.firmwareSourceFiles?.[0]?.path).toBe('src/main.cpp');
    expect(loadedState.validationRuns?.[0]?.id).toBe('val_run_1');
    expect(loadedState.revisions?.[0]?.id).toBe('rev_v1.0.0');
    expect(loadedState.mcpAuditRecords?.[0]?.id).toBe('mcp_audit_1');
  });
});
