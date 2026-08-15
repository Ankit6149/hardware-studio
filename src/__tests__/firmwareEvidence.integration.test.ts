import { describe, expect, it } from 'vitest';
import {
  createBuildEvidenceRecord,
  createDeviceEvidenceRecords,
  evaluateFirmwareEvidence,
  getModuleVerificationBlockers,
} from '../lib/firmware/firmwareEvidence';
import type { FirmwareModule, Project } from '../types';

const moduleUnderTest: FirmwareModule = {
  id: 'fw-module-driver',
  name: 'Sensor Driver',
  type: 'Driver',
  description: 'Reads the environmental sensor.',
  linkedArchitectureNodeIds: [],
  linkedComponentIds: ['component-u1'],
  linkedPinIds: ['pin-u1-1'],
  linkedNetIds: ['net-i2c'],
  linkedTestIds: [],
  dependencies: [],
  sourceFiles: [],
  status: 'Implemented',
};

function projectBase(overrides: Partial<Project> = {}): Project {
  return {
    id: 'firmware-evidence-test',
    projectName: 'Firmware Evidence Test',
    description: '',
    createdAt: '2026-08-15T00:00:00.000Z',
    updatedAt: '2026-08-15T00:00:00.000Z',
    version: '5',
    activeView: 'firmware-studio',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    firmwareModules: [moduleUnderTest],
    firmwareSourceFiles: [],
    firmwareBuildRecords: [],
    validationTests: [],
    validationRuns: [],
    ...overrides,
  };
}

describe('firmware build and local-device evidence', () => {
  it('does not treat generated source as implementation evidence', () => {
    const project = projectBase({
      firmwareSourceFiles: [{
        id: 'generated-config',
        path: 'platformio.ini',
        language: 'ini',
        content: '[env:test]',
        isGenerated: true,
        linkedModuleIds: [moduleUnderTest.id],
      }],
    });

    expect(getModuleVerificationBlockers(project, moduleUnderTest)).toContain(
      'Link at least one non-generated source file to this module.',
    );
  });

  it('requires source, mapping, successful build, and passing device evidence before verification', () => {
    const sourceProject = projectBase({
      firmwareSourceFiles: [{
        id: 'driver-source',
        path: 'src/sensor_driver.cpp',
        language: 'cpp',
        content: 'void read_sensor() {}',
        isGenerated: false,
        linkedModuleIds: [moduleUnderTest.id],
      }],
    });

    let blockers = getModuleVerificationBlockers(sourceProject, moduleUnderTest);
    expect(blockers).toContain('Record a successful build result that includes this module’s real source file.');
    expect(blockers).toContain('Record a passing local-device observation linked to this module.');

    const build = createBuildEvidenceRecord({
      id: 'build-1',
      createdAt: '2026-08-15T08:30:00.000Z',
      environmentName: 'env:evt-board',
      outcome: 'Succeeded',
      moduleIds: [moduleUnderTest.id],
      sourceFileIds: ['driver-source'],
      log: 'Compiler exited successfully.',
    });
    const builtProject = projectBase({
      ...sourceProject,
      firmwareBuildRecords: [build as unknown as Record<string, unknown>],
    });

    blockers = getModuleVerificationBlockers(builtProject, moduleUnderTest);
    expect(blockers).not.toContain('Record a successful build result that includes this module’s real source file.');
    expect(blockers).toContain('Record a passing local-device observation linked to this module.');

    const { test, run } = createDeviceEvidenceRecords(builtProject, {
      id: 'device-1',
      createdAt: '2026-08-15T08:45:00.000Z',
      moduleId: moduleUnderTest.id,
      buildRecordId: build.id,
      deviceLabel: 'EVT board #2',
      result: 'Pass',
      connection: 'USB',
      observation: 'Sensor samples streamed at the expected cadence with no reset.',
      evidenceReference: 'logs/evt-board-2.txt',
      operator: 'bench operator',
    });
    const evidencedProject = projectBase({
      ...builtProject,
      validationTests: [test],
      validationRuns: [run],
    });

    expect(getModuleVerificationBlockers(evidencedProject, moduleUnderTest)).toEqual([]);
    expect(evaluateFirmwareEvidence(evidencedProject).verificationReadyModuleIds).toContain(moduleUnderTest.id);
    expect(run.logs.join('\n')).toContain('Hardware Studio did not execute or query the local device automatically.');
  });

  it('rejects device evidence that is not tied to a successful build', () => {
    const project = projectBase();
    expect(() => createDeviceEvidenceRecords(project, {
      id: 'device-invalid',
      createdAt: '2026-08-15T09:00:00.000Z',
      moduleId: moduleUnderTest.id,
      buildRecordId: 'missing-build',
      deviceLabel: 'Bench unit',
      result: 'Pass',
      connection: 'USB',
      observation: 'Observed output.',
    })).toThrow('successful build');
  });
});
