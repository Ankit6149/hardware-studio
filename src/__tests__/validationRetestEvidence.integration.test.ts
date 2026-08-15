import { describe, expect, it } from 'vitest';
import { runValidationTest } from '../lib/validationRunner';
import type { Project } from '../types';

function baseProject(): Project {
  return {
    id: 'proj_validation_retest',
    projectName: 'Validation Retest Project',
    description: '',
    createdAt: '',
    updatedAt: '',
    version: '1',
    activeView: 'validation-studio',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    validationTests: [{
      id: 'val_manual_1',
      name: 'USB current validation',
      stage: 'EVT',
      category: 'Electrical',
      linkedRequirementIds: ['req_usb'],
      linkedArchitectureNodeIds: [],
      linkedComponentIds: ['u1'],
      linkedNetIds: ['VBUS'],
      linkedFirmwareModuleIds: [],
      steps: [{ stepNumber: 1, instruction: 'Measure current', expectedResult: 'Below limit', completed: true }],
      measurements: [],
      passCriteria: ['Current is below the approved limit.'],
      status: 'In Progress',
      evidence: [{ id: 'ev1', type: 'Text', value: 'Bench setup photo recorded', createdAt: '2026-08-15T00:00:00.000Z' }],
    }],
    validationRuns: [],
  };
}

describe('validation retest and evidence truth', () => {
  it('does not auto-pass a manual test from a measurement alone', () => {
    const project = baseProject();
    const { run } = runValidationTest(project, 'val_manual_1', { measuredValue: '42 mA' });

    expect(run.status).toBe('Needs Review');
    expect(run.runNumber).toBe(1);
    expect(run.logs.join('\n')).toContain('cannot auto-pass');
  });

  it('records explicit manual verdicts as append-only retests', () => {
    const project = baseProject();
    const first = runValidationTest(project, 'val_manual_1', {
      measuredValue: '42 mA',
      manualVerdict: 'Pass',
      runBy: 'Bench Engineer',
    });
    const withFirst: Project = { ...project, validationRuns: first.updatedRuns };
    const second = runValidationTest(withFirst, 'val_manual_1', {
      measuredValue: '43 mA',
      manualVerdict: 'Pass',
      evidenceLink: 'bench://capture-2',
      runBy: 'Bench Engineer',
    });

    expect(second.run.status).toBe('Pass');
    expect(second.run.runNumber).toBe(2);
    expect(second.updatedRuns).toHaveLength(2);
    expect(second.updatedRuns[1].id).toBe(first.run.id);
    expect(second.run.logs.join('\n')).toContain('RETEST:');
  });

  it('freezes test steps and attached evidence into each run record', () => {
    const project = baseProject();
    const { run } = runValidationTest(project, 'val_manual_1', { manualVerdict: 'Pass' });

    project.validationTests![0].steps[0].instruction = 'Changed later';
    project.validationTests![0].evidence[0].value = 'Changed later';

    expect((run.stepResults?.[0] as { instruction?: string }).instruction).toBe('Measure current');
    expect((run.evidence?.[0] as { value?: string }).value).toBe('Bench setup photo recorded');
  });
});
