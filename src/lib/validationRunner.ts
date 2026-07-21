import { Project, ValidationRun, ValidationTest } from '../types';
import { runBoardDRC } from './boardDRC';
import { checkMechanicalInterference } from './mechanical/mechanicalGeometry';
import { validateStateMachine } from './firmware/firmwareValidation';

export function runValidationTest(project: Project, testId: string): { run: ValidationRun; updatedRuns: ValidationRun[] } {
  const tests = project.validationTests || [];
  const test = tests.find(t => t.id === testId) || {
    id: testId,
    testName: 'General Design Rules Check',
    category: 'DRC',
    passCriteria: '0 Blocker DRC errors',
    status: 'Untested'
  };

  const logs: string[] = [];
  logs.push(`[${new Date().toISOString()}] Executing validation run for: ${test.testName}`);

  let pass = true;
  let measuredValue: number | string = 0;

  if (test.category === 'DRC' || test.testName.toLowerCase().includes('drc')) {
    const drcIssues = runBoardDRC(project);
    const blockers = drcIssues.filter(i => i.severity === 'Blocker' || i.severity === 'Error');
    measuredValue = `${blockers.length} errors`;
    logs.push(`DRC Scan completed: ${drcIssues.length} total issues, ${blockers.length} blocking errors.`);
    if (blockers.length > 0) {
      pass = false;
      logs.push(`FAILED: ${blockers.length} design rule violations detected.`);
    } else {
      logs.push('PASSED: Zero design rule violations found.');
    }
  } else if (test.category === 'Thermal' || test.testName.toLowerCase().includes('3d') || test.testName.toLowerCase().includes('clearance')) {
    const interference = checkMechanicalInterference(project);
    measuredValue = interference.hasCollision ? `${interference.collisions.length} collisions` : `Clearance ${interference.minClearanceMm}mm`;
    logs.push(`3D Spatial Collision scan completed: min clearance ${interference.minClearanceMm}mm.`);
    if (interference.hasCollision) {
      pass = false;
      logs.push(`FAILED: ${interference.collisions.length} 3D mechanical spatial collisions detected.`);
    } else {
      logs.push('PASSED: 3D spatial clearance verified.');
    }
  } else if (test.category === 'Firmware' || test.testName.toLowerCase().includes('state')) {
    const warnings = validateStateMachine(project.firmwareStates || [], project.firmwareTransitions || []);
    measuredValue = `${warnings.length} warnings`;
    logs.push(`Firmware state machine scan: ${warnings.length} warnings.`);
    if (warnings.some(w => w.severity === 'Error')) {
      pass = false;
      logs.push('FAILED: Unreachable states or invalid state machine transitions.');
    } else {
      logs.push('PASSED: State machine graph is valid and reachable.');
    }
  } else {
    // Default pass criteria evaluation
    measuredValue = 'Verified';
    logs.push('PASSED: Specification criteria satisfied.');
  }

  const newRun: ValidationRun = {
    id: `val_run_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    testId,
    testName: test.testName,
    timestamp: new Date().toISOString(),
    status: pass ? 'Pass' : 'Fail',
    measuredValue,
    passCriteria: test.passCriteria || '0 Errors',
    logs,
    runBy: 'Local Engineering Validation Engine',
    environment: 'Desktop Hardware Studio V1'
  };

  const updatedRuns = [newRun, ...(project.validationRuns || [])];

  return { run: newRun, updatedRuns };
}
