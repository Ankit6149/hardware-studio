import { ValidationMeasurement, ValidationTest, ValidationEvidence } from '../../types';

/** Evaluate a single measurement against its criteria */
export function evaluateValidationMeasurement(
  measurement: ValidationMeasurement
): 'Pass' | 'Fail' | 'Untested' | 'Needs Review' {
  // If no actual value recorded, it's untested
  if (measurement.actualValue === undefined || measurement.actualValue === null || measurement.actualValue === '') {
    return 'Untested';
  }

  switch (measurement.type) {
    case 'Numeric': {
      const actual = typeof measurement.actualValue === 'number'
        ? measurement.actualValue
        : parseFloat(String(measurement.actualValue));

      if (isNaN(actual)) return 'Needs Review';

      // If explicit min/max exist, use them
      if (measurement.minValue !== undefined && measurement.maxValue !== undefined) {
        return (actual >= measurement.minValue && actual <= measurement.maxValue) ? 'Pass' : 'Fail';
      }

      // If expected + tolerance exist
      if (measurement.expectedValue !== undefined && measurement.expectedValue !== '') {
        const expected = typeof measurement.expectedValue === 'number'
          ? measurement.expectedValue
          : parseFloat(String(measurement.expectedValue));

        if (isNaN(expected)) return 'Needs Review';

        const tolPlus = measurement.tolerancePlus ?? 0;
        const tolMinus = measurement.toleranceMinus ?? 0;

        const min = expected - tolMinus;
        const max = expected + tolPlus;

        return (actual >= min && actual <= max) ? 'Pass' : 'Fail';
      }

      return 'Needs Review';
    }

    case 'Boolean': {
      const actualBool = measurement.actualValue === true || measurement.actualValue === 'true';
      const expectedBool = measurement.expectedValue === true || measurement.expectedValue === 'true';
      return actualBool === expectedBool ? 'Pass' : 'Fail';
    }

    case 'Text': {
      const actualStr = String(measurement.actualValue).trim().toLowerCase();
      const expectedStr = String(measurement.expectedValue ?? '').trim().toLowerCase();
      if (!expectedStr) return 'Needs Review';
      return actualStr === expectedStr ? 'Pass' : 'Needs Review';
    }

    case 'Visual Inspection': {
      // Visual inspection cannot auto-pass; requires explicit reviewer action
      return 'Needs Review';
    }

    default:
      return 'Needs Review';
  }
}

/** Calculate the correct status for a validation test */
export function calculateTestStatus(
  test: ValidationTest
): 'Not Started' | 'In Progress' | 'Passed' | 'Failed' | 'Blocked' {
  const hasAnyStepDone = test.steps.some(s => s.completed);
  const hasAnyMeasurement = test.measurements.length > 0;
  const hasAnyActualValue = test.measurements.some(
    m => m.actualValue !== undefined && m.actualValue !== null && m.actualValue !== ''
  );

  // Not Started: no execution activity
  if (!hasAnyStepDone && !hasAnyActualValue) {
    return 'Not Started';
  }

  // Evaluate all measurements
  const measurementStatuses = test.measurements.map(m => evaluateValidationMeasurement(m));

  // Failed: any required measurement failed
  const hasFailedRequired = test.measurements.some(
    (m, i) => m.required && measurementStatuses[i] === 'Fail'
  );
  if (hasFailedRequired) {
    return 'Failed';
  }

  // Check all required steps completed
  const allRequiredStepsDone = test.steps.every(s => s.completed);

  // Check all required measurements pass
  const allRequiredMeasurementsPass = test.measurements
    .filter(m => m.required)
    .every((m, _i) => {
      const status = evaluateValidationMeasurement(m);
      return status === 'Pass';
    });

  // Check no required measurement is untested
  const hasUntestedRequired = test.measurements.some(
    (m, i) => m.required && measurementStatuses[i] === 'Untested'
  );

  // Check required evidence exists
  const hasRequiredEvidence = test.evidence.length > 0;

  // Check pass criteria are defined
  const hasPassCriteria = test.passCriteria.length > 0;

  // Passed: all conditions met
  if (
    allRequiredStepsDone &&
    allRequiredMeasurementsPass &&
    !hasUntestedRequired &&
    hasRequiredEvidence &&
    (hasPassCriteria || !hasAnyMeasurement)
  ) {
    return 'Passed';
  }

  // In Progress: some work done but conditions unresolved
  return 'In Progress';
}
