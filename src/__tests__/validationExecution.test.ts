import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { runValidationTest } from '../lib/validationRunner';

describe('Slice 6 Validation Execution Engine', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
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

  it('should require review when the lightweight mechanical engine finds no approximate collision', () => {
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
    expect(String(result.run.measuredValue)).toContain('Approximate AABB clearance');
    expect(result.run.logs.some((line) => line.includes('not CAD-kernel or physical clearance verification'))).toBe(true);
    expect(result.run.logs.some((line) => line.includes('approximate geometry cannot verify physical clearance'))).toBe(true);
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
