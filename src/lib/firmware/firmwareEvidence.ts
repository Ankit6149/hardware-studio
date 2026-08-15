import type { FirmwareModule, FirmwareSourceFile, Project, ValidationRun, ValidationTest } from '../../types';

export type FirmwareBuildOutcome = 'Succeeded' | 'Failed' | 'Needs Review';

export interface FirmwareBuildEvidenceRecord {
  id: string;
  kind: 'build-evidence';
  createdAt: string;
  environmentName: string;
  outcome: FirmwareBuildOutcome;
  moduleIds: string[];
  sourceFileIds: string[];
  artifactName?: string;
  artifactSha256?: string;
  toolchain?: string;
  log: string;
  recordedBy?: string;
  note: 'Recorded evidence only — Hardware Studio did not execute this build automatically.';
}

export interface FirmwareEvidenceSnapshot {
  sourceFileCount: number;
  mappedModuleCount: number;
  successfulBuildCount: number;
  deviceEvidenceCount: number;
  verificationReadyModuleIds: string[];
  blockersByModuleId: Record<string, string[]>;
}

export interface DeviceEvidenceInput {
  id: string;
  createdAt: string;
  moduleId: string;
  buildRecordId: string;
  deviceLabel: string;
  result: 'Pass' | 'Fail' | 'Inconclusive';
  connection: 'Serial' | 'USB' | 'Network' | 'Manual';
  observation: string;
  evidenceReference?: string;
  operator?: string;
}

function isBuildEvidenceRecord(record: Record<string, unknown>): record is Record<string, unknown> & FirmwareBuildEvidenceRecord {
  return record.kind === 'build-evidence'
    && typeof record.id === 'string'
    && typeof record.createdAt === 'string'
    && Array.isArray(record.moduleIds)
    && Array.isArray(record.sourceFileIds)
    && typeof record.environmentName === 'string'
    && typeof record.outcome === 'string'
    && typeof record.log === 'string';
}

export function getFirmwareBuildEvidence(project: Project): FirmwareBuildEvidenceRecord[] {
  return (project.firmwareBuildRecords || [])
    .filter((record): record is Record<string, unknown> => Boolean(record && typeof record === 'object'))
    .filter(isBuildEvidenceRecord)
    .map((record) => record as FirmwareBuildEvidenceRecord);
}

export function createBuildEvidenceRecord(input: {
  id: string;
  createdAt: string;
  environmentName: string;
  outcome: FirmwareBuildOutcome;
  moduleIds: string[];
  sourceFileIds: string[];
  artifactName?: string;
  artifactSha256?: string;
  toolchain?: string;
  log: string;
  recordedBy?: string;
}): FirmwareBuildEvidenceRecord {
  return {
    ...input,
    kind: 'build-evidence',
    note: 'Recorded evidence only — Hardware Studio did not execute this build automatically.',
  };
}

function deviceEvidenceTests(project: Project): ValidationTest[] {
  return (project.validationTests || []).filter((test) =>
    test.category === 'Firmware'
    && test.name.startsWith('Local device evidence · '),
  );
}

function deviceEvidenceRuns(project: Project): ValidationRun[] {
  const testIds = new Set(deviceEvidenceTests(project).map((test) => test.id));
  return (project.validationRuns || []).filter((run) => testIds.has(run.testId));
}

function isRealSourceFile(file: FirmwareSourceFile | undefined): boolean {
  return Boolean(
    file
    && !file.generated
    && !file.isGenerated
    && file.content.trim().length > 0,
  );
}

function moduleRealSourceFiles(project: Project, firmwareModule: FirmwareModule): FirmwareSourceFile[] {
  const projectFiles = project.firmwareSourceFiles || [];
  const referenced = new Set<string>();
  for (const source of firmwareModule.sourceFiles || []) {
    if (typeof source === 'string') referenced.add(source);
    else referenced.add(source.id);
  }
  return projectFiles.filter((file) =>
    isRealSourceFile(file)
    && (file.linkedModuleIds?.includes(firmwareModule.id) || referenced.has(file.id) || referenced.has(file.path)),
  );
}

function firmwareModuleMappedToHardware(firmwareModule: FirmwareModule): boolean {
  return firmwareModule.linkedComponentIds.length > 0
    && (firmwareModule.linkedPinIds.length > 0 || firmwareModule.linkedNetIds.length > 0);
}

export function getModuleVerificationBlockers(project: Project, firmwareModule: FirmwareModule): string[] {
  const blockers: string[] = [];
  const realSources = moduleRealSourceFiles(project, firmwareModule);
  if (realSources.length === 0) blockers.push('Link at least one non-generated source file to this module.');
  if (!firmwareModuleMappedToHardware(firmwareModule)) blockers.push('Link the module to canonical hardware plus at least one pin or net.');

  const realSourceIds = new Set(realSources.map((file) => file.id));
  const successfulBuilds = getFirmwareBuildEvidence(project).filter(
    (record) => record.outcome === 'Succeeded'
      && record.moduleIds.includes(firmwareModule.id)
      && record.sourceFileIds.some((fileId) => realSourceIds.has(fileId)),
  );
  if (successfulBuilds.length === 0) blockers.push('Record a successful build result that includes this module’s real source file.');

  const tests = deviceEvidenceTests(project).filter((test) => test.linkedFirmwareModuleIds?.includes(firmwareModule.id));
  const testIds = new Set(tests.map((test) => test.id));
  const passingDeviceRun = (project.validationRuns || []).some(
    (run) => testIds.has(run.testId) && (run.status === 'Pass' || run.status === 'Passed'),
  );
  if (!passingDeviceRun) blockers.push('Record a passing local-device observation linked to this module.');

  return blockers;
}

export function evaluateFirmwareEvidence(project: Project): FirmwareEvidenceSnapshot {
  const firmwareModules = project.firmwareModules || [];
  const blockersByModuleId: Record<string, string[]> = {};
  const verificationReadyModuleIds: string[] = [];

  for (const firmwareModule of firmwareModules) {
    const blockers = getModuleVerificationBlockers(project, firmwareModule);
    blockersByModuleId[firmwareModule.id] = blockers;
    if (blockers.length === 0) verificationReadyModuleIds.push(firmwareModule.id);
  }

  return {
    sourceFileCount: (project.firmwareSourceFiles || []).filter(isRealSourceFile).length,
    mappedModuleCount: firmwareModules.filter(firmwareModuleMappedToHardware).length,
    successfulBuildCount: getFirmwareBuildEvidence(project).filter((record) => record.outcome === 'Succeeded').length,
    deviceEvidenceCount: deviceEvidenceRuns(project).length,
    verificationReadyModuleIds,
    blockersByModuleId,
  };
}

export function createDeviceEvidenceRecords(
  project: Project,
  input: DeviceEvidenceInput,
): { test: ValidationTest; run: ValidationRun } {
  const firmwareModule = (project.firmwareModules || []).find((candidate) => candidate.id === input.moduleId);
  if (!firmwareModule) throw new Error('The selected firmware module no longer exists.');
  if (!input.deviceLabel.trim()) throw new Error('Name the real local device used for this observation.');
  if (!input.observation.trim()) throw new Error('Record what was actually observed on the local device.');

  const build = getFirmwareBuildEvidence(project).find((record) => record.id === input.buildRecordId);
  if (!build || build.outcome !== 'Succeeded' || !build.moduleIds.includes(firmwareModule.id)) {
    throw new Error('Local-device evidence must reference a successful build for the selected module.');
  }

  const testId = `fw_device_test_${input.id}`;
  const test: ValidationTest = {
    id: testId,
    name: `Local device evidence · ${firmwareModule.name} · ${input.deviceLabel.trim()}`,
    stage: 'EVT',
    category: 'Firmware',
    linkedRequirementIds: [],
    linkedArchitectureNodeIds: [...firmwareModule.linkedArchitectureNodeIds],
    linkedComponentIds: [...firmwareModule.linkedComponentIds],
    linkedNetIds: [...firmwareModule.linkedNetIds],
    linkedFirmwareModuleIds: [firmwareModule.id],
    steps: [{
      stepNumber: 1,
      instruction: `Observe ${firmwareModule.name} on ${input.deviceLabel.trim()} using ${input.connection}.`,
      expectedResult: 'Observed behavior matches the firmware acceptance criteria for the physical hardware.',
      completed: true,
    }],
    measurements: [],
    passCriteria: ['A real local-device observation is recorded against the selected successful build.'],
    status: input.result === 'Pass' ? 'Passed' : input.result === 'Fail' ? 'Failed' : 'Needs Review',
    evidence: input.evidenceReference?.trim() ? [{
      id: `fw_device_evidence_${input.id}`,
      type: 'File Reference',
      value: input.evidenceReference.trim(),
      createdAt: input.createdAt,
      notes: 'External evidence reference recorded by the operator.',
    }] : [],
    resultNotes: input.observation.trim(),
  };

  const run: ValidationRun = {
    id: `fw_device_run_${input.id}`,
    testId,
    testName: test.name,
    timestamp: input.createdAt,
    status: input.result,
    passCriteria: test.passCriteria[0],
    evidenceLink: input.evidenceReference?.trim() || undefined,
    logs: [
      `Build evidence: ${build.id}`,
      `Device: ${input.deviceLabel.trim()}`,
      `Connection: ${input.connection}`,
      `Observation: ${input.observation.trim()}`,
      'Recorded evidence only — Hardware Studio did not execute or query the local device automatically.',
    ],
    runBy: input.operator?.trim() || undefined,
    operator: input.operator?.trim() || undefined,
    environment: input.deviceLabel.trim(),
  };

  return { test, run };
}
