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

export type ValidationExecutionMode = 'drc-auto' | 'firmware-state-auto' | 'mechanical-screen' | 'manual';

export function getValidationExecutionMode(category?: string, name?: string): ValidationExecutionMode {
  const normalizedCategory = (category || '').trim().toLowerCase();
  const normalizedName = (name || '').trim().toLowerCase();

  if (normalizedCategory === 'drc' || normalizedName.includes('drc')) return 'drc-auto';
  if (normalizedName.includes('state') && (normalizedCategory === 'firmware' || normalizedName.includes('firmware') || normalizedName.includes('state machine') || normalizedName.includes('state-machine'))) {
    return 'firmware-state-auto';
  }
  if (normalizedCategory === 'mechanical' || normalizedName.includes('3d') || normalizedName.includes('clearance')) {
    return 'mechanical-screen';
  }
  return 'manual';
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
  const normalizedCategory = category.trim().toLowerCase();
  const executionMode = getValidationExecutionMode(category, testName);
  const rawCriteria = rawTest?.passCriteria || 'Verification criteria';
  const passCriteriaStr = Array.isArray(rawCriteria) ? rawCriteria.join(', ') : String(rawCriteria);
  const priorRuns = getValidationRunHistory(project, rawTest?.id || testId);
  const previousRun = priorRuns[0];
  const nextRunNumber = Math.max(0, ...priorRuns.map((run) => run.runNumber || 0)) + 1;
  const evidenceLink = options?.evidenceLink?.trim() || undefined;
  const reviewer = options?.runBy?.trim() || undefined;

  const logs: string[] = [];
  const now = new Date().toISOString();
  logs.push(`[${now}] Executing validation run #${nextRunNumber} for: ${testName}`);
  if (previousRun) {
    logs.push(`RETEST: supersedes evidence review of run ${previousRun.id} (${previousRun.status}). Prior history remains immutable.`);
  }

  let status: ValidationRun['status'] = 'Needs Review';
  let measuredValue: number | string = options?.measuredValue ?? 'Pending Verification';
  const isFullyAutomated = executionMode === 'drc-auto' || executionMode === 'firmware-state-auto';

  if (executionMode === 'drc-auto') {
    const drcIssues = runBoardDRC(project);
    const blockers = drcIssues.filter((issue) => issue.severity === 'Blocker' || issue.severity === 'Error');
    measuredValue = options?.measuredValue ?? `${blockers.length} errors`;
    logs.push(`DRC scan completed: ${drcIssues.length} total issues, ${blockers.length} blocking errors.`);
    if (blockers.length > 0) {
      status = 'Fail';
      logs.push(`FAILED: ${blockers.length} design rule violations detected.`);
    } else {
      status = 'Pass';
      logs.push('PASSED: Zero blocking design rule violations found for the implemented local DRC rules.');
    }
  } else if (executionMode === 'mechanical-screen') {
    const interference = checkMechanicalInterference(project);
    const clearanceLabel = interference.minClearanceMm === null
      ? 'unresolved'
      : `${interference.minClearanceMm}mm`;
    measuredValue = options?.measuredValue ?? (interference.hasCollision
      ? `${interference.collisions.length} approximate AABB collisions`
      : `Approximate AABB clearance ${clearanceLabel}`);

    if (interference.minClearanceMm === null) {
      logs.push('Approximate AABB collision screen completed with insufficient explicit comparable geometry to report a clearance value. Missing geometry was not replaced with defaults.');
    } else {
      logs.push(`Approximate AABB collision screen completed: reported minimum separation ${interference.minClearanceMm}mm. This local geometry check is not CAD-kernel or physical clearance verification.`);
    }

    if (interference.hasCollision) {
      status = 'Fail';
      logs.push(`FAILED: ${interference.collisions.length} approximate 3D bounding-box collisions detected. Resolve these before detailed mechanical review.`);
      if (options?.manualVerdict) {
        logs.push('ENGINEER VERDICT NOT APPLIED: an approximate collision blocker is present, so the screening result remains Fail until the conflicting geometry is corrected.');
      }
    } else if (options?.manualVerdict && evidenceLink && reviewer) {
      status = options.manualVerdict;
      logs.push(`ENGINEER VERDICT RECORDED: ${options.manualVerdict}. Reviewer ${reviewer} attached external CAD/physical evidence after the approximate screen.`);
      logs.push('The engineer verdict is evidence-backed; the approximate AABB screen itself did not produce a verified pass.');
    } else {
      status = 'Needs Review';
      if (options?.manualVerdict) {
        const missing = [!evidenceLink ? 'evidence reference' : null, !reviewer ? 'reviewer identity' : null].filter(Boolean).join(' and ');
        logs.push(`NEEDS REVIEW: ${missing || 'required review evidence'} is missing, so the requested engineer verdict was not accepted.`);
      } else {
        logs.push('NEEDS REVIEW: No bounding-box collision was detected, but approximate geometry cannot verify physical clearance. Review exact CAD/package geometry or physical evidence before recording a verdict.');
      }
    }
  } else if (executionMode === 'firmware-state-auto') {
    const warnings = validateStateMachine(project.firmwareStates || [], project.firmwareTransitions || []);
    measuredValue = options?.measuredValue ?? `${warnings.length} warnings`;
    logs.push(`Firmware state-machine structural scan completed: ${warnings.length} warnings.`);
    if (warnings.some((warning) => warning.severity === 'Error')) {
      status = 'Fail';
      logs.push('FAILED: Unreachable states or invalid state-machine transitions were detected.');
    } else {
      status = 'Pass';
      logs.push('PASSED: State-machine structure is valid and reachable according to the local validator. This does not verify compilation, timing, hardware behavior, or runtime correctness.');
    }
  } else if (options?.manualVerdict) {
    if (normalizedCategory === 'thermal' && (!evidenceLink || !reviewer)) {
      status = 'Needs Review';
      const missing = [!evidenceLink ? 'thermal evidence reference' : null, !reviewer ? 'reviewer identity' : null].filter(Boolean).join(' and ');
      logs.push(`NEEDS REVIEW: ${missing || 'required thermal evidence'} is missing. Hardware Studio does not currently run a thermal solver, so a thermal verdict must be supported by external simulation or lab evidence.`);
    } else {
      status = options.manualVerdict;
      measuredValue = options.measuredValue ?? 'No numeric measurement recorded';
      logs.push(`MANUAL VERDICT RECORDED: ${options.manualVerdict}.`);
      if (normalizedCategory === 'thermal') {
        logs.push('THERMAL EVIDENCE: No internal thermal solver was executed. This verdict depends on the attached external simulation/lab evidence and reviewer judgment.');
      } else if (normalizedCategory === 'firmware') {
        logs.push('FIRMWARE EVIDENCE: Only state-machine structural checks are automated. This verdict depends on the recorded build/runtime/hardware evidence.');
      }
      if (options.measuredValue != null) {
        logs.push(`Manual measurement recorded: ${options.measuredValue}`);
      }
    }
  } else {
    if (options?.measuredValue != null) {
      measuredValue = options.measuredValue;
      logs.push(`Manual measurement recorded without a verdict: ${options.measuredValue}`);
    }
    status = 'Needs Review';
    if (normalizedCategory === 'thermal') {
      logs.push('NEEDS REVIEW: Hardware Studio does not currently run a thermal solver. Attach external simulation or lab evidence, identify the reviewer, and record an explicit engineer verdict.');
    } else if (normalizedCategory === 'firmware') {
      logs.push('NEEDS REVIEW: This firmware test is not a supported automated state-machine structural check. Record build/runtime/hardware evidence and an explicit engineer verdict.');
    } else {
      logs.push('NEEDS REVIEW: Manual/physical validation cannot auto-pass from a measurement value alone. Record an explicit engineer verdict after reviewing the procedure and evidence.');
    }
  }

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

  const defaultRunBy = executionMode === 'mechanical-screen'
    ? 'Local Engineering Screening Engine'
    : isFullyAutomated
      ? 'Local Engineering Validation Engine'
      : 'Local engineer — attribution not recorded';

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
    runBy: reviewer || defaultRunBy,
    environment: 'Desktop Hardware Studio V1'
  };

  const updatedRuns = [newRun, ...(project.validationRuns || [])];
  return { run: newRun, updatedRuns };
}
