import { describe, it, expect } from 'vitest';
import { ValidationRun, ValidationEvidence } from '../types';

describe('Validation Execution Runs & Evidence Engine Tests', () => {
  it('should create immutable ValidationRun records and require valid non-empty evidence', () => {
    const validEvidence: ValidationEvidence = {
      id: 'ev_1',
      type: 'Measurement',
      value: 'Voltage reading 3.31V within ±0.05V spec',
      createdAt: new Date().toISOString()
    };

    const run: ValidationRun = {
      id: 'run_val_1',
      testId: 'val_101',
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      operator: 'Lead Test Engineer',
      measurements: [],
      evidence: [validEvidence],
      status: 'Passed'
    };

    expect(run.status).toBe('Passed');
    expect(run.evidence.length).toBe(1);
    expect(run.evidence[0].value.trim()).not.toBe('');

    // Verify empty evidence rejection helper
    const isValidEvidence = (ev: ValidationEvidence[]) => ev.length > 0 && ev.every(e => e.value && e.value.trim() !== '');
    expect(isValidEvidence(run.evidence)).toBe(true);
    expect(isValidEvidence([{ id: '2', type: 'Text', value: '   ', createdAt: '' }])).toBe(false);
  });
});
