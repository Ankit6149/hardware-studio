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

  it('should support manual measurement entry and evidence attachment', () => {
    const project = useProjectStore.getState();

    const result = runValidationTest(project, 'test_drop_survivability', {
      measuredValue: '10 drops survived without fracture',
      evidenceLink: 'https://storage.internal/evidence/drop_test_log.pdf',
      notes: 'Verified casing integrity post drop sequence',
      runBy: 'Senior Test Engineer'
    });

    expect(result.run.status).toBe('Pass');
    expect(result.run.measuredValue).toBe('10 drops survived without fracture');
    expect(result.run.evidenceLink).toBe('https://storage.internal/evidence/drop_test_log.pdf');
    expect(result.run.runBy).toBe('Senior Test Engineer');
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
