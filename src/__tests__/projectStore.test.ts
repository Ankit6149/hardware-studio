import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { normalizeNetName } from '../store/projectStore';
import { normalizeProjectComponent } from '../lib/projectMigrations';
import {
  mechanicalObjectsOverlap,
  isMechanicalObjectContained,
  minimumDistanceBetweenMechanicalObjects,
  getMechanicalBoundingBox,
  snapMechanicalPoint,
} from '../lib/mechanical/mechanicalGeometry';
import { validateStateMachine, sanitizeCIdentifier } from '../lib/firmware/firmwareValidation';
import { evaluateValidationMeasurement, calculateTestStatus } from '../lib/validation/measurementEvaluation';
import { calculateRequirementCoverage } from '../lib/validation/validationCoverage';
import { findDisconnectedNodes, findRequirementsWithoutLinks } from '../lib/product/productGraph';
import { MechanicalObject, FirmwareState, FirmwareTransition, ValidationMeasurement, ValidationTest } from '../types';

// Helper to create a minimal MechanicalObject
function makeRect(id: string, x: number, y: number, w: number, h: number, type: MechanicalObject['type'] = 'Board Zone'): MechanicalObject {
  return { id, name: id, type, shape: 'rect', xMm: x, yMm: y, widthMm: w, heightMm: h, rotationDeg: 0, locked: false, visible: true };
}

function makeCircle(id: string, x: number, y: number, r: number, type: MechanicalObject['type'] = 'Mounting Point'): MechanicalObject {
  return { id, name: id, type, shape: 'circle', xMm: x, yMm: y, radiusMm: r, rotationDeg: 0, locked: false, visible: true };
}

describe('Hardware Studio Core System Tests', () => {
  beforeEach(() => {
    // Reset store
    const state = useProjectStore.getState();
    useProjectStore.setState({
      ...state,
      requirements: [],
      architectureNodes: [],
      architectureConnections: [],
      mechanicalObjects: [],
      mechanicalDimensions: [],
      firmwareModules: [],
      firmwareStates: [],
      firmwareTransitions: [],
      validationTests: [],
      pastCommands: [],
      futureCommands: [],
    });
  });

  // -----------------------------------------------
  // Net Name Normalization
  // -----------------------------------------------
  describe('Net Name Normalization', () => {
    it('should normalize common power/ground names', () => {
      expect(normalizeNetName('gnd')).toBe('GND');
      expect(normalizeNetName('  Ground  ')).toBe('GND');
      expect(normalizeNetName('3v3')).toBe('3V3');
      expect(normalizeNetName('3.3v')).toBe('3V3');
      expect(normalizeNetName('5V')).toBe('5V');
    });

    it('should preserve casing for custom signals', () => {
      expect(normalizeNetName('SPI_MISO')).toBe('SPI_MISO');
      expect(normalizeNetName('  Spi_Miso  ')).toBe('Spi_Miso');
    });
  });

  // -----------------------------------------------
  // Project Command Architecture (Undo/Redo)
  // -----------------------------------------------
  describe('Project Command Architecture', () => {
    it('should support undo/redo with correct stack sizes', () => {
      const store = useProjectStore.getState();
      expect(store.pastCommands.length).toBe(0);

      store.executeProjectCommand('TEST', 'Add requirement', () => {
        store.addRequirement({
          title: 'Req 1', description: 'Desc', type: 'Functional',
          priority: 'High', status: 'Draft', acceptanceCriteria: [],
          linkedArchitectureNodeIds: [], linkedComponentIds: [],
          linkedFirmwareModuleIds: [], linkedTestIds: [], risks: [],
        });
      });

      const after = useProjectStore.getState();
      expect(after.pastCommands.length).toBe(1);
      expect(after.requirements?.length).toBe(1);

      after.undoProjectCommand();
      const undone = useProjectStore.getState();
      expect(undone.pastCommands.length).toBe(0);
      expect(undone.futureCommands.length).toBe(1);
      expect(undone.requirements?.length).toBe(0);

      undone.redoProjectCommand();
      const redone = useProjectStore.getState();
      expect(redone.pastCommands.length).toBe(1);
      expect(redone.requirements?.length).toBe(1);
    });
  });

  // -----------------------------------------------
  // Architecture Connection CRUD
  // -----------------------------------------------
  describe('Architecture Connection CRUD', () => {
    it('should add, update, and delete architecture connections', () => {
      const store = useProjectStore.getState();
      store.addArchitectureConnection({
        sourceNodeId: 'n1', targetNodeId: 'n2', type: 'Data', direction: 'Forward',
      });

      let conns = useProjectStore.getState().architectureConnections || [];
      expect(conns.length).toBe(1);
      expect(conns[0].type).toBe('Data');

      store.updateArchitectureConnection(conns[0].id, { type: 'Power' });
      conns = useProjectStore.getState().architectureConnections || [];
      expect(conns[0].type).toBe('Power');

      store.deleteArchitectureConnection(conns[0].id);
      conns = useProjectStore.getState().architectureConnections || [];
      expect(conns.length).toBe(0);
    });
  });

  // -----------------------------------------------
  // Architecture Node Position Persistence
  // -----------------------------------------------
  describe('Architecture Node Position Persistence', () => {
    it('should persist updated x/y positions', () => {
      const store = useProjectStore.getState();
      store.addArchitectureNode({
        name: 'MCU', category: 'Processing', description: '', status: 'MVP',
        x: 100, y: 200, width: 120, height: 60,
        linkedRequirementIds: [], linkedCircuitIds: [], linkedComponentIds: [],
        linkedFirmwareModuleIds: [], linkedTestIds: [],
      });

      const nodes = useProjectStore.getState().architectureNodes || [];
      const nodeId = nodes[0].id;

      store.updateArchitectureNode(nodeId, { x: 500, y: 300 });
      const updated = useProjectStore.getState().architectureNodes || [];
      expect(updated[0].x).toBe(500);
      expect(updated[0].y).toBe(300);
    });
  });

  // -----------------------------------------------
  // Mechanical Geometry — Real Overlap Detection
  // -----------------------------------------------
  describe('Mechanical Geometry', () => {
    it('should detect overlapping rectangles', () => {
      const a = makeRect('A', 0, 0, 20, 20);
      const b = makeRect('B', 10, 10, 20, 20);
      expect(mechanicalObjectsOverlap(a, b)).toBe(true);
    });

    it('should not detect overlap for non-overlapping rectangles', () => {
      const a = makeRect('A', 0, 0, 10, 10);
      const b = makeRect('B', 50, 50, 10, 10);
      expect(mechanicalObjectsOverlap(a, b)).toBe(false);
    });

    it('should detect containment', () => {
      const outer = makeRect('outer', 0, 0, 100, 100);
      const inner = makeRect('inner', 10, 10, 20, 20);
      expect(isMechanicalObjectContained(inner, outer)).toBe(true);
    });

    it('should detect non-containment', () => {
      const outer = makeRect('outer', 0, 0, 30, 30);
      const inner = makeRect('inner', 25, 25, 20, 20);
      expect(isMechanicalObjectContained(inner, outer)).toBe(false);
    });

    it('should calculate minimum distance between non-overlapping objects', () => {
      const a = makeRect('A', 0, 0, 10, 10);
      const b = makeRect('B', 20, 0, 10, 10);
      const dist = minimumDistanceBetweenMechanicalObjects(a, b);
      expect(dist).toBe(10);
    });

    it('should return 0 distance for overlapping objects', () => {
      const a = makeRect('A', 0, 0, 20, 20);
      const b = makeRect('B', 10, 10, 20, 20);
      expect(minimumDistanceBetweenMechanicalObjects(a, b)).toBe(0);
    });

    it('should calculate bounding box for circle', () => {
      const c = makeCircle('C', 50, 50, 10);
      const bb = getMechanicalBoundingBox(c);
      expect(bb.xMin).toBe(40);
      expect(bb.yMin).toBe(40);
      expect(bb.xMax).toBe(60);
      expect(bb.yMax).toBe(60);
    });

    it('should snap points to grid', () => {
      const snapped = snapMechanicalPoint({ xMm: 7.3, yMm: 12.8 }, 5);
      expect(snapped.xMm).toBe(5);
      expect(snapped.yMm).toBe(15);
    });
  });

  // -----------------------------------------------
  // Firmware State Machine
  // -----------------------------------------------
  describe('Firmware State Machine', () => {
    it('should persist firmware states', () => {
      const store = useProjectStore.getState();
      store.addFirmwareState({
        name: 'INIT', type: 'Initial', x: 100, y: 100,
        entryActions: [], exitActions: [], linkedModuleIds: [], linkedComponentIds: [],
      });

      const states = useProjectStore.getState().firmwareStates || [];
      expect(states.length).toBe(1);
      expect(states[0].name).toBe('INIT');
      expect(states[0].type).toBe('Initial');
    });

    it('should cascade delete transitions when state is deleted', () => {
      const store = useProjectStore.getState();
      store.addFirmwareState({ name: 'A', type: 'Initial', x: 0, y: 0, entryActions: [], exitActions: [], linkedModuleIds: [], linkedComponentIds: [] });
      store.addFirmwareState({ name: 'B', type: 'Normal', x: 100, y: 0, entryActions: [], exitActions: [], linkedModuleIds: [], linkedComponentIds: [] });

      const states = useProjectStore.getState().firmwareStates || [];
      store.addFirmwareTransition({ sourceStateId: states[0].id, targetStateId: states[1].id, event: 'start' });

      expect((useProjectStore.getState().firmwareTransitions || []).length).toBe(1);

      store.deleteFirmwareState(states[0].id);
      expect((useProjectStore.getState().firmwareTransitions || []).length).toBe(0);
    });

    it('should detect missing initial state', () => {
      const states: FirmwareState[] = [
        { id: 's1', name: 'IDLE', type: 'Normal', x: 0, y: 0, entryActions: [], exitActions: [], linkedModuleIds: [], linkedComponentIds: [] },
      ];
      const issues = validateStateMachine(states, []);
      expect(issues.some(i => i.message.includes('No initial state'))).toBe(true);
    });

    it('should detect unreachable states', () => {
      const states: FirmwareState[] = [
        { id: 's1', name: 'INIT', type: 'Initial', x: 0, y: 0, entryActions: [], exitActions: [], linkedModuleIds: [], linkedComponentIds: [] },
        { id: 's2', name: 'ORPHAN', type: 'Normal', x: 100, y: 0, entryActions: [], exitActions: [], linkedModuleIds: [], linkedComponentIds: [] },
      ];
      const transitions: FirmwareTransition[] = [];
      const issues = validateStateMachine(states, transitions);
      expect(issues.some(i => i.message.includes('unreachable'))).toBe(true);
    });
  });

  // -----------------------------------------------
  // C Identifier Sanitization
  // -----------------------------------------------
  describe('C Identifier Sanitization', () => {
    it('should replace spaces and special chars', () => {
      expect(sanitizeCIdentifier('My Module')).toBe('My_Module');
      expect(sanitizeCIdentifier('3V3-Power')).toBe('_3V3_Power');
      expect(sanitizeCIdentifier('hello.world/test')).toBe('hello_world_test');
    });

    it('should handle empty input', () => {
      expect(sanitizeCIdentifier('')).toBe('_unnamed');
    });
  });

  // -----------------------------------------------
  // Validation Measurement Evaluation
  // -----------------------------------------------
  describe('Measurement Evaluation', () => {
    it('should pass numeric measurement within tolerance', () => {
      const m: ValidationMeasurement = {
        id: 'm1', name: 'Voltage', type: 'Numeric',
        expectedValue: 3.3, actualValue: 3.28,
        tolerancePlus: 0.1, toleranceMinus: 0.1,
        required: true, status: 'Untested',
      };
      expect(evaluateValidationMeasurement(m)).toBe('Pass');
    });

    it('should fail numeric measurement outside tolerance', () => {
      const m: ValidationMeasurement = {
        id: 'm2', name: 'Voltage', type: 'Numeric',
        expectedValue: 3.3, actualValue: 3.0,
        tolerancePlus: 0.1, toleranceMinus: 0.1,
        required: true, status: 'Untested',
      };
      expect(evaluateValidationMeasurement(m)).toBe('Fail');
    });

    it('should pass numeric within min/max range', () => {
      const m: ValidationMeasurement = {
        id: 'm3', name: 'Current', type: 'Numeric',
        actualValue: 15,
        minValue: 10, maxValue: 20,
        required: true, status: 'Untested',
      };
      expect(evaluateValidationMeasurement(m)).toBe('Pass');
    });

    it('should return Untested for missing actual value', () => {
      const m: ValidationMeasurement = {
        id: 'm4', name: 'Voltage', type: 'Numeric',
        expectedValue: 3.3, required: true, status: 'Untested',
      };
      expect(evaluateValidationMeasurement(m)).toBe('Untested');
    });

    it('should evaluate boolean measurement', () => {
      const m: ValidationMeasurement = {
        id: 'm5', name: 'LED On', type: 'Boolean',
        expectedValue: true, actualValue: true,
        required: true, status: 'Untested',
      };
      expect(evaluateValidationMeasurement(m)).toBe('Pass');
    });

    it('should fail boolean measurement mismatch', () => {
      const m: ValidationMeasurement = {
        id: 'm6', name: 'LED On', type: 'Boolean',
        expectedValue: true, actualValue: false,
        required: true, status: 'Untested',
      };
      expect(evaluateValidationMeasurement(m)).toBe('Fail');
    });

    it('should return Needs Review for visual inspection', () => {
      const m: ValidationMeasurement = {
        id: 'm7', name: 'Solder Quality', type: 'Visual Inspection',
        actualValue: 'Good', required: true, status: 'Untested',
      };
      expect(evaluateValidationMeasurement(m)).toBe('Needs Review');
    });
  });

  // -----------------------------------------------
  // Test Status Calculation
  // -----------------------------------------------
  describe('Test Status Calculation', () => {
    it('should not pass a test with a failed required measurement', () => {
      const test: ValidationTest = {
        id: 't1', name: 'Voltage Test', stage: 'EVT', category: 'Electrical',
        linkedRequirementIds: [], linkedArchitectureNodeIds: [], linkedComponentIds: [],
        linkedNetIds: [], linkedFirmwareModuleIds: [],
        steps: [{ stepNumber: 1, instruction: 'Measure', expectedResult: '3.3V', completed: true }],
        measurements: [{
          id: 'm1', name: 'Voltage', type: 'Numeric',
          expectedValue: 3.3, actualValue: 2.5, tolerancePlus: 0.1, toleranceMinus: 0.1,
          required: true, status: 'Untested',
        }],
        passCriteria: ['Voltage within spec'],
        status: 'Not Started',
        evidence: [{ id: 'e1', type: 'Text', value: 'Measured', createdAt: new Date().toISOString() }],
      };
      expect(calculateTestStatus(test)).toBe('Failed');
    });

    it('should not pass a test without evidence', () => {
      const test: ValidationTest = {
        id: 't2', name: 'Power Test', stage: 'EVT', category: 'Power',
        linkedRequirementIds: [], linkedArchitectureNodeIds: [], linkedComponentIds: [],
        linkedNetIds: [], linkedFirmwareModuleIds: [],
        steps: [{ stepNumber: 1, instruction: 'Check', expectedResult: 'OK', completed: true }],
        measurements: [{
          id: 'm1', name: 'Current', type: 'Numeric',
          expectedValue: 10, actualValue: 10, tolerancePlus: 1, toleranceMinus: 1,
          required: true, status: 'Untested',
        }],
        passCriteria: ['Current nominal'],
        status: 'Not Started',
        evidence: [], // No evidence!
      };
      expect(calculateTestStatus(test)).not.toBe('Passed');
    });

    it('should return Not Started for test with no activity', () => {
      const test: ValidationTest = {
        id: 't3', name: 'Empty', stage: 'EVT', category: 'Requirement',
        linkedRequirementIds: [], linkedArchitectureNodeIds: [], linkedComponentIds: [],
        linkedNetIds: [], linkedFirmwareModuleIds: [],
        steps: [], measurements: [], passCriteria: [],
        status: 'Not Started', evidence: [],
      };
      expect(calculateTestStatus(test)).toBe('Not Started');
    });
  });

  // -----------------------------------------------
  // Requirement Coverage
  // -----------------------------------------------
  describe('Requirement Coverage', () => {
    it('should report not covered for requirements without tests', () => {
      const reqs = [{ id: 'r1', title: 'Req 1', description: '', type: 'Functional' as const, priority: 'High' as const, status: 'Draft' as const, acceptanceCriteria: [], linkedArchitectureNodeIds: [], linkedComponentIds: [], linkedFirmwareModuleIds: [], linkedTestIds: [], risks: [] }];
      const tests: ValidationTest[] = [];
      const coverage = calculateRequirementCoverage(reqs, tests);
      expect(coverage[0].status).toBe('Not Covered');
      expect(coverage[0].missingTests).toBe(true);
    });
  });

  // -----------------------------------------------
  // Product Graph
  // -----------------------------------------------
  describe('Product Graph', () => {
    it('should find disconnected nodes', () => {
      const nodes = [
        { id: 'n1', name: 'MCU', category: 'Processing' as const, description: '', x: 0, y: 0, width: 100, height: 50, linkedRequirementIds: [], linkedCircuitIds: [], linkedComponentIds: [], linkedFirmwareModuleIds: [], linkedTestIds: [], status: 'MVP' as const },
        { id: 'n2', name: 'Sensor', category: 'Input' as const, description: '', x: 200, y: 0, width: 100, height: 50, linkedRequirementIds: [], linkedCircuitIds: [], linkedComponentIds: [], linkedFirmwareModuleIds: [], linkedTestIds: [], status: 'MVP' as const },
      ];
      const conns = [{ id: 'c1', sourceNodeId: 'n1', targetNodeId: 'n2', type: 'Data' as const, direction: 'Forward' as const }];
      expect(findDisconnectedNodes(nodes, conns)).toHaveLength(0);

      expect(findDisconnectedNodes(nodes, [])).toHaveLength(2);
    });

    it('should find requirements without architecture links', () => {
      const reqs = [
        { id: 'r1', title: 'Linked', description: '', type: 'Functional' as const, priority: 'High' as const, status: 'Draft' as const, acceptanceCriteria: [], linkedArchitectureNodeIds: [], linkedComponentIds: [], linkedFirmwareModuleIds: [], linkedTestIds: [], risks: [] },
        { id: 'r2', title: 'Unlinked', description: '', type: 'Functional' as const, priority: 'High' as const, status: 'Draft' as const, acceptanceCriteria: [], linkedArchitectureNodeIds: [], linkedComponentIds: [], linkedFirmwareModuleIds: [], linkedTestIds: [], risks: [] },
      ];
      const nodes = [
        { id: 'n1', name: 'MCU', category: 'Processing' as const, description: '', x: 0, y: 0, width: 100, height: 50, linkedRequirementIds: ['r1'], linkedCircuitIds: [], linkedComponentIds: [], linkedFirmwareModuleIds: [], linkedTestIds: [], status: 'MVP' as const },
      ];
      const unlinked = findRequirementsWithoutLinks(reqs, nodes);
      expect(unlinked).toHaveLength(1);
      expect(unlinked[0].id).toBe('r2');
    });
  });

  // -----------------------------------------------
  // Schema Migration
  // -----------------------------------------------
  describe('Schema Migration', () => {
    it('should normalize legacy component fields', () => {
      const legacy = {
        id: 'cmp_1', referenceDesignator: 'U2', componentName: 'MCU',
        placementX: 20, placementY: 45, side: 'Bottom',
      };
      const normalized = normalizeProjectComponent(legacy);
      expect(normalized.id).toBe('cmp_1');
      expect(normalized.pcb?.placed).toBe(true);
      expect(normalized.pcb?.xMm).toBe(20);
      expect(normalized.pcb?.side).toBe('Bottom');
    });
  });
});
