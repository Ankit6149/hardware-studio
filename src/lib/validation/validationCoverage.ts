import { ProductRequirement, ValidationTest } from '../../types';
import { evaluateValidationMeasurement } from './measurementEvaluation';

export interface CoverageEntry {
  requirementId: string;
  requirementTitle: string;
  priority: string;
  linkedTestIds: string[];
  passedTestIds: string[];
  failedTestIds: string[];
  missingTests: boolean;
  status: 'Covered' | 'Partially Covered' | 'Not Covered' | 'Failed';
}

/** Calculate requirement coverage from tests */
export function calculateRequirementCoverage(
  requirements: ProductRequirement[],
  tests: ValidationTest[]
): CoverageEntry[] {
  return requirements.map(req => {
    const linkedTests = tests.filter(t => t.linkedRequirementIds.includes(req.id));
    const linkedTestIds = linkedTests.map(t => t.id);

    const passedTestIds: string[] = [];
    const failedTestIds: string[] = [];

    for (const test of linkedTests) {
      const hasFailed = test.measurements.some(m => {
        const result = evaluateValidationMeasurement(m);
        return m.required && result === 'Fail';
      });

      if (hasFailed || test.status === 'Failed') {
        failedTestIds.push(test.id);
      } else if (test.status === 'Passed') {
        passedTestIds.push(test.id);
      }
    }

    let status: CoverageEntry['status'];
    if (linkedTests.length === 0) {
      status = 'Not Covered';
    } else if (failedTestIds.length > 0) {
      status = 'Failed';
    } else if (passedTestIds.length === linkedTests.length) {
      status = 'Covered';
    } else {
      status = 'Partially Covered';
    }

    return {
      requirementId: req.id,
      requirementTitle: req.title,
      priority: req.priority,
      linkedTestIds,
      passedTestIds,
      failedTestIds,
      missingTests: linkedTests.length === 0,
      status
    };
  });
}
