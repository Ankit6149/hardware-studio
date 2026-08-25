import { Project, ValidationRun } from '../types';
import { runBoardDRC } from './boardDRC';
import { checkMechanicalInterference } from './mechanical/mechanicalGeometry';
import { validateStateMachine } from './firmware/firmwareValidation';

export interface ExecuteRunOptions {
  measuredValue?: number | string;
  evidenceLink?: string;
  notes?: string;
  runBy?: string;
  manualVerdict?: 'Pass' | 'Fail' | 'Inconclusive';
}

function runTimestamp(run: ValidationRun): number {
  const parsed = run.timestamp ? Date.parse(run.timestamp) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getValidationRunHistory(project: Project, testId: string): ValidationRun[] {
  return (project.validationRuns || [])
    .filter((run) => run.testId === testId)
    .slice()
    .sort((a, b) => {
      const runNumberDelta = (b.runNumber || 0) - (a.runNumber || 0);
      return runNumberDelta || runTimestamp(b) - runTimestamp(a);
    });
}

export function runValidationTest(
  project: Project,
  testId: string,
  options?: ExecuteRunOptions
): { run: ValidationRun; updatedRuns: ValidationRun[] } {
  const tests = project.validationTests || [];
  const rawTest = tests.find((test) => test.id === testId || test.name === testId || test.testName === testId);
  const testName = rawTest?.testName || rawTest?.name || testId || 'Manual Validation Test';
  const category = rawTest?.category || (testId.toLowerCase().includes('drc') ? 'DRC' : 'Manual');
  const rawCriteria = rawTest?.passCriteria || 'Verification criteria';
  const passCriteriaStr = Array.isArray(rawCriteria) ? rawCriteria.join(', ') : String(rawCriteria);
  const priorRuns = getValidationRunHistory(project, rawTest?.id || testId);
  const previousRun = priorRuns[0];
  const nextRunNumber = Math.max(0, ...priorRuns.map((run) => run.runNumber || 0)) + 1;

  const logs: string[] = [];
  const now = new Date().toISOString();
  logs.push(`[${now}] Executing validation run #${nextRunNumber} for: ${testName}`);
  if (previousRun) {
    logs.push(`RETEST: supersedes evidence review of run ${previousRun.id} (${previousRun.status}). Prior history remains immutable.`);
  }

  let status: ValidationRun['status'] = 'Needs Review';
  let measuredValue: number | string = options?.measuredValue ?? 'Pending Verification';
  const isAutomatedCategory = category === 'DRC'
    || category === 'Thermal'
    || category === 'Mechanical'
    || category === 'Firmware'
    || testName.toLowerCase().includes('drc')
    || testName.toLowerCase().includes('3d')
    || testName.toLowerCase().includes('clearance')
    || testName.toLowerCase().includes('state');

  if (category === 'DRC' || testName.toLowerCase().includes('drc')) {
    const drcIssues = runBoardDRC(project);
    const blockers = drcIssues.filter((issue) => issue.severity === 'Blocker' || issue.severity === 'Error');
    measuredValue = options?.measuredValue ?? `${blockers.length} errors`;
    logs.push(`DRC scan completed: ${drcIssues.length} total issues, ${blockers.length} blocking errors.`);
    if (blockers.length > 0) {
      status = 'Fail';
      logs.push(`FAILED: ${blockers.length} design rule violations detected.`);
    } else {
      status = 'Pass';
      logs.push('PASSED: Zero blocking design rule violations found.');
    }
  } else if (category === 'Thermal' || category === 'Mechanical' || testName.toLowerCase().includes('3d') || testName.toLowerCase().includes('clearance')) {
    const interference = checkMechanicalInterference(project);
    measuredValue = options?.measuredValue ?? (interference.hasCollision
      ? `${interference.collisions.length} approximate AABB collisions`
      : `Approximate AABB clearance ${interference.minClearanceMm}mm`);
    logs.push(`Approximate AABB collision scan completed: reported minimum separation ${interference.minClearanceMm}mm. This local geometry check is not CAD-kernel or physical clearance verification.`);
    if (interference.hasCollision) {
      status = 'Fail';
      logs.push(`FAILED: ${interference.collisions.length} approximate 3D bounding-box collisions detected. Resolve these before detailed mechanical review.`);
    } else {
      status = 'Needs Review';
      logs.push('NEEDS REVIEW: No bounding-box collision was detected, but approximate geometry cannot verify physical clearance. Review exact CAD/package geometry or physical evidence before recording a pass.');
    }
  } else if (category === 'Firmware' || testName.toLowerCase().includes('state')) {
    const warnings = validateStateMachine(project.firmwareStates || [], project.firmwareTransitions || []);
    measuredValue = options?.measuredValue ?? `${warnings.length} warnings`;
    logs.push(`Firmware state-machine scan completed: ${warnings.length} warnings.`);
    if (warnings.some((warning) => warning.severity === 'Error')) {
      status = 'Fail';
      logs.push('FAILED: Unreachable states or invalid state-machine transitions were detected.');
    } else {
      status = 'Pass';
      logs.push('PASSED: State-machine graph is valid and reachable according to the local validator.');
    }
  } else if (options?.manualVerdict) {
    status = options.manualVerdict;
    measuredValue = options.measuredValue ?? 'No numeric measurement recorded';
    logs.push(`MANUAL VERDICT RECORDED: ${options.manualVerdict}.`);
    if (options.measuredValue != null) {
      logs.push(`Manual measurement recorded: ${options.measuredValue}`);
    }
  } else {
    if (options?.measuredValue != null) {
      measuredValue = options.measuredValue;
      logs.push(`Manual measurement recorded without a verdict: ${options.measuredValue}`);
    }
    status = 'Needs Review';
    logs.push('NEEDS REVIEW: Manual/physical validation cannot auto-pass from a measurement value alone. Record an explicit engineer verdict after reviewing the procedure and evidence.');
  }

  const evidenceLink = options?.evidenceLink?.trim() || undefined;
  if (evidenceLink) {
    logs.push(`Evidence link attached: ${evidenceLink}`);
  }
  if (options?.notes?.trim()) {
    logs.push(`Notes: ${options.notes.trim()}`);
  }

  const frozenEvidence = JSON.parse(JSON.stringify(rawTest?.evidence || [])) as unknown[];
  if (evidenceLink) {
    frozenEvidence.push({
      type: 'Link',
      value: evidenceLink,
      createdAt: now,
      notes: 'Captured with this validation run.'
    });
  }

  const newRun: ValidationRun = {
    id: `val_run_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    testId: rawTest?.id || testId,
    runNumber: nextRunNumber,
    testName,
    timestamp: now,
    status,
    measuredValue,
    passCriteria: passCriteriaStr,
    evidenceLink,
    evidence: frozenEvidence,
    stepResults: JSON.parse(JSON.stringify(rawTest?.steps || [])),
    logs,
    runBy: options?.runBy?.trim() || (isAutomatedCategory ? 'Local Engineering Validation Engine' : 'Local engineer — attribution not recorded'),
    environment: 'Desktop Hardware Studio V1'
  };

  const updatedRuns = [newRun, ...(project.validationRuns || [])];
  return { run: newRun, updatedRuns };
}
