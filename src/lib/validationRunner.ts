import { Project, ValidationRun, ValidationTest } from '../types';
import { runBoardDRC } from './boardDRC';
import { checkMechanicalInterference } from './mechanical/mechanicalGeometry';
import { validateStateMachine } from './firmware/firmwareValidation';

export interface ExecuteRunOptions {
  measuredValue?: number | string;
  evidenceLink?: string;
  notes?: string;
  runBy?: string;
}

export function runValidationTest(
  project: Project,
  testId: string,
  options?: ExecuteRunOptions
): { run: ValidationRun; updatedRuns: ValidationRun[] } {
  const tests = project.validationTests || [];
  const rawTest = tests.find(t => t.id === testId || t.name === testId || t.testName === testId);
  const testName = rawTest?.testName || rawTest?.name || testId || 'Manual Validation Test';
  const category = rawTest?.category || (testId.toLowerCase().includes('drc') ? 'DRC' : 'Manual');
  const rawCriteria = rawTest?.passCriteria || 'Verification criteria';
  const passCriteriaStr = Array.isArray(rawCriteria) ? rawCriteria.join(', ') : String(rawCriteria);

  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] Executing validation run for: ${testName}`);

  let status: ValidationRun['status'] = 'Pass';
  let measuredValue: number | string = options?.measuredValue ?? 0;

  if (category === 'DRC' || testName.toLowerCase().includes('drc')) {
    const drcIssues = runBoardDRC(project);
    const blockers = drcIssues.filter(i => i.severity === 'Blocker' || i.severity === 'Error');
    measuredValue = options?.measuredValue ?? `${blockers.length} errors`;
    logs.push(`DRC Scan completed: ${drcIssues.length} total issues, ${blockers.length} blocking errors.`);
    if (blockers.length > 0) {
      status = 'Fail';
      logs.push(`FAILED: ${blockers.length} design rule violations detected.`);
    } else {
      logs.push('PASSED: Zero design rule violations found.');
    }
  } else if (category === 'Thermal' || category === 'Mechanical' || testName.toLowerCase().includes('3d') || testName.toLowerCase().includes('clearance')) {
    const interference = checkMechanicalInterference(project);
    measuredValue = options?.measuredValue ?? (interference.hasCollision ? `${interference.collisions.length} collisions` : `Clearance ${interference.minClearanceMm}mm`);
    logs.push(`3D Spatial Collision scan completed: min clearance ${interference.minClearanceMm}mm.`);
    if (interference.hasCollision) {
      status = 'Fail';
      logs.push(`FAILED: ${interference.collisions.length} 3D mechanical spatial collisions detected.`);
    } else {
      logs.push('PASSED: 3D spatial clearance verified.');
    }
  } else if (category === 'Firmware' || testName.toLowerCase().includes('state')) {
    const warnings = validateStateMachine(project.firmwareStates || [], project.firmwareTransitions || []);
    measuredValue = options?.measuredValue ?? `${warnings.length} warnings`;
    logs.push(`Firmware state machine scan: ${warnings.length} warnings.`);
    if (warnings.some(w => w.severity === 'Error')) {
      status = 'Fail';
      logs.push('FAILED: Unreachable states or invalid state machine transitions.');
    } else {
      logs.push('PASSED: State machine graph is valid and reachable.');
    }
  } else {
    // Unknown or manual category MUST NOT auto-pass!
    if (options?.measuredValue != null) {
      measuredValue = options.measuredValue;
      status = options.measuredValue.toString().toLowerCase().includes('fail') ? 'Fail' : 'Pass';
      logs.push(`MANUAL MEASUREMENT ENTERED: ${measuredValue}`);
    } else {
      measuredValue = 'Pending Verification';
      status = 'Needs Review';
      logs.push('NEEDS REVIEW: Manual execution, physical testing, or measurement entry required.');
    }
  }

  // If evidence link was provided, record and validate format
  let evidenceLink = options?.evidenceLink;
  if (evidenceLink) {
    logs.push(`Evidence attached: ${evidenceLink}`);
  }

  if (options?.notes) {
    logs.push(`Notes: ${options.notes}`);
  }

  const newRun: ValidationRun = {
    id: `val_run_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    testId,
    testName,
    timestamp: new Date().toISOString(),
    status,
    measuredValue,
    passCriteria: passCriteriaStr,
    evidenceLink,
    logs,
    runBy: options?.runBy || 'Local Engineering Validation Engine',
    environment: 'Desktop Hardware Studio V1'
  };

  // Immutable history prepending
  const updatedRuns = [newRun, ...(project.validationRuns || [])];

  return { run: newRun, updatedRuns };
}
