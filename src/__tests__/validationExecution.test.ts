import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { getValidationExecutionMode, runValidationTest } from '../lib/validationRunner';

describe('Slice 6 Validation Execution Engine', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('classifies only implemented checks as fully automated', () => {
    expect(getValidationExecutionMode('DRC', 'Board DRC')).toBe('drc-auto');
    expect(getValidationExecutionMode('Firmware', 'Firmware state machine reachability')).toBe('firmware-state-auto');
    expect(getValidationExecutionMode('Mechanical', 'Enclosure clearance review')).toBe('mechanical-screen');
    expect(getValidationExecutionMode('Thermal', 'Thermal rise validation')).toBe('manual');
    expect(getValidationExecutionMode('Firmware', 'Firmware build on target')).toBe('manual');
  });

  it('should return Needs Review for unknown or manual test categories instead of auto-passing', () => {
    const project = useProjectStore.getState();

    const result = runValidationTest(project, 'test_manual_custom');
    expect(result.run).toBeDefined();
    expect(result.run.status).toBe('Needs Review');
    expect(result.run.measuredValue).toBe('Pending Verification');
    expect(result.run.logs.some(l => l.includes('NEEDS REVIEW'))).toBe(true);
  });

  it('should support explicit manual verdict, measurement entry, and evidence attachment', () => {
    const project = useProjectStore.getState();

    const result = runValidationTest(project, 'test_drop_survivability', {
      measuredValue: '10 drops survived without fracture',
      manualVerdict: 'Pass',
      evidenceLink: 'https://storage.internal/evidence/drop_test_log.pdf',
      notes: 'Verified casing integrity post drop sequence',
      runBy: 'Senior Test Engineer'
    });

    expect(result.run.status).toBe('Pass');
    expect(result.run.measuredValue).toBe('10 drops survived without fracture');
    expect(result.run.evidenceLink).toBe('https://storage.internal/evidence/drop_test_log.pdf');
    expect(result.run.runBy).toBe('Senior Test Engineer');
    expect(result.run.logs.some(l => l.includes('MANUAL VERDICT RECORDED: Pass'))).toBe(true);
  });

  it('should require review and report unresolved clearance when explicit geometry is insufficient', () => {
    useProjectStore.setState({
      validationTests: [{
        id: 'test_mechanical_clearance',
        name: 'Enclosure clearance review',
        category: 'Mechanical',
        linkedRequirementIds: [],
        steps: [],
        measurements: [],
        passCriteria: ['No physical interference at required clearance'],
        evidence: [],
      }],
      mechanicalBodies: [],
      mechanicalObjects: [],
      boardComponents: [],
      boards: [],
      activeBoardId: '',
    });

    const result = runValidationTest(useProjectStore.getState(), 'test_mechanical_clearance');

    expect(result.run.status).toBe('Needs Review');
    expect(result.run.measuredValue).toBe('Approximate AABB clearance unresolved');
    expect(result.run.logs.some((line) => line.includes('insufficient explicit comparable geometry'))).toBe(true);
    expect(result.run.logs.some((line) => line.includes('Missing geometry was not replaced with defaults'))).toBe(true);
    expect(result.run.logs.some((line) => line.includes('approximate geometry cannot verify physical clearance'))).toBe(true);
  });

  it('accepts an engineer-reviewed mechanical verdict only with evidence and reviewer identity', () => {
    useProjectStore.setState({
      validationTests: [{
        id: 'test_mechanical_reviewed',
        name: 'Mechanical clearance evidence review',
        category: 'Mechanical',
        linkedRequirementIds: [],
        steps: [],
        measurements: [],
        passCriteria: ['Exact CAD or physical evidence confirms required clearance'],
        evidence: [],
      }],
      mechanicalBodies: [],
      mechanicalObjects: [],
      boardComponents: [],
      boards: [],
      activeBoardId: '',
    });

    const rejected = runValidationTest(useProjectStore.getState(), 'test_mechanical_reviewed', {
      manualVerdict: 'Pass',
    });
    expect(rejected.run.status).toBe('Needs Review');
    expect(rejected.run.logs.some((line) => line.includes('requested engineer verdict was not accepted'))).toBe(true);

    const reviewed = runValidationTest(useProjectStore.getState(), 'test_mechanical_reviewed', {
      manualVerdict: 'Pass',
      evidenceLink: 'cad://enclosure/rev-c/interference-review',
      runBy: 'Mechanical Lead',
    });
    expect(reviewed.run.status).toBe('Pass');
    expect(reviewed.run.runBy).toBe('Mechanical Lead');
    expect(reviewed.run.logs.some((line) => line.includes('ENGINEER VERDICT RECORDED: Pass'))).toBe(true);
    expect(reviewed.run.logs.some((line) => line.includes('AABB screen itself did not produce a verified pass'))).toBe(true);
  });

  it('does not allow an engineer verdict to override an approximate mechanical collision blocker', () => {
    useProjectStore.setState({
      validationTests: [{
        id: 'test_mechanical_collision',
        name: '3D enclosure clearance',
        category: 'Mechanical',
        linkedRequirementIds: [],
        steps: [],
        measurements: [],
        passCriteria: ['No enclosure protrusion'],
        evidence: [],
      }],
      mechanicalObjects: [
        {
          id: 'enc',
          name: 'Enclosure',
          type: 'Outer Profile',
          shape: 'rect',
          layer: 'Enclosure',
          xMm: 0,
          yMm: 0,
          widthMm: 20,
          heightMm: 20,
          depthMm: 10,
          rotationDeg: 0,
          locked: false,
          visible: true,
        },
        {
          id: 'connector',
          name: 'Connector',
          type: 'Connector Opening',
          shape: 'rect',
          layer: 'Internal',
          xMm: 18,
          yMm: 5,
          widthMm: 6,
          heightMm: 5,
          depthMm: 5,
          rotationDeg: 0,
          locked: false,
          visible: true,
        },
      ],
      boardComponents: [],
      boards: [],
      activeBoardId: '',
    });

    const result = runValidationTest(useProjectStore.getState(), 'test_mechanical_collision', {
      manualVerdict: 'Pass',
      evidenceLink: 'cad://review/attempted-override',
      runBy: 'Mechanical Reviewer',
    });

    expect(result.run.status).toBe('Fail');
    expect(result.run.logs.some((line) => line.includes('ENGINEER VERDICT NOT APPLIED'))).toBe(true);
  });

  it('keeps thermal validation manual and evidence-backed instead of using the collision engine', () => {
    useProjectStore.setState({
      validationTests: [{
        id: 'test_thermal',
        name: 'Thermal rise validation',
        category: 'Thermal',
        linkedRequirementIds: [],
        steps: [],
        measurements: [],
        passCriteria: ['Temperature rise remains within requirement'],
        evidence: [],
      }],
    });

    const unresolved = runValidationTest(useProjectStore.getState(), 'test_thermal');
    expect(unresolved.run.status).toBe('Needs Review');
    expect(unresolved.run.logs.some((line) => line.includes('does not currently run a thermal solver'))).toBe(true);
    expect(unresolved.run.logs.some((line) => line.includes('AABB collision'))).toBe(false);

    const reviewed = runValidationTest(useProjectStore.getState(), 'test_thermal', {
      measuredValue: 'Peak case temperature 51.2 C',
      manualVerdict: 'Pass',
      evidenceLink: 'lab://thermal/chamber-run-42',
      runBy: 'Thermal Test Engineer',
    });
    expect(reviewed.run.status).toBe('Pass');
    expect(reviewed.run.logs.some((line) => line.includes('No internal thermal solver was executed'))).toBe(true);
  });

  it('does not treat every Firmware-category test as a state-machine auto-pass', () => {
    useProjectStore.setState({
      validationTests: [{
        id: 'test_firmware_build',
        name: 'Firmware build on target',
        category: 'Firmware',
        linkedRequirementIds: [],
        steps: [],
        measurements: [],
        passCriteria: ['Firmware builds and runs on target hardware'],
        evidence: [],
      }],
      firmwareStates: [],
      firmwareTransitions: [],
    });

    const result = runValidationTest(useProjectStore.getState(), 'test_firmware_build');
    expect(result.run.status).toBe('Needs Review');
    expect(result.run.logs.some((line) => line.includes('not a supported automated state-machine structural check'))).toBe(true);
  });

  it('should maintain immutable run history prepending new runs', () => {
    const store = useProjectStore.getState();
    const initialRunCount = store.validationRuns?.length || 0;

    const res1 = runValidationTest(store, 'test_1');
    store.executeProjectCommand('RECORD_RUN_1', 'Record run 1', () => {
      useProjectStore.setState({ validationRuns: res1.updatedRuns });
    });

    const res2 = runValidationTest(useProjectStore.getState(), 'test_2');
    store.executeProjectCommand('RECORD_RUN_2', 'Record run 2', () => {
      useProjectStore.setState({ validationRuns: res2.updatedRuns });
    });

    const finalRuns = useProjectStore.getState().validationRuns || [];
    expect(finalRuns.length).toBe(initialRunCount + 2);
    expect(finalRuns[0].id).toBe(res2.run.id);
    expect(finalRuns[1].id).toBe(res1.run.id);
  });
});
