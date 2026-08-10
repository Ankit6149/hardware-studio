import { describe, it, expect } from 'vitest';
import { calculateCpk, evaluateValidationMeasurement } from '../lib/validation/measurementEvaluation';
import { exportValidationReportHtml, generateValidationSummary } from '../lib/validation/validationReportExport';
import { ValidationTest, ValidationMeasurement } from '../types';

describe('Hardware Validation & EVT/DVT TestStage Execution Workbench Solidification', () => {
  it('should evaluate numeric telemetry measurements against specs accurately', () => {
    const measurement: ValidationMeasurement = {
      id: 'm1',
      name: 'VCC 3.3V Rail',
      type: 'Numeric',
      expectedValue: 3.3,
      actualValue: 3.28,
      tolerancePlus: 0.1,
      toleranceMinus: 0.1,
      unit: 'V',
      required: true,
      status: 'Untested',
    };

    const status = evaluateValidationMeasurement(measurement);
    expect(status).toBe('Pass');
  });

  it('should compute process capability Cpk index accurately', () => {
    const telemetryData = [3.28, 3.30, 3.31, 3.29, 3.32, 3.27];
    const { cpk, mean, stdDev } = calculateCpk(telemetryData, 3.20, 3.40);

    expect(mean).toBeGreaterThan(3.25);
    expect(mean).toBeLessThan(3.35);
    expect(cpk).toBeGreaterThan(1.0);
  });

  it('should generate EVT/DVT compliance validation report HTML', () => {
    const tests: ValidationTest[] = [
      {
        id: 't1',
        name: 'DC Power Rail Voltage Regulation',
        stage: 'EVT',
        category: 'Electrical',
        linkedRequirementIds: [],
        linkedComponentIds: [],
        steps: [{ stepNumber: 1, instruction: 'Apply 5V input', expectedResult: '3.3V regulated', completed: true }],
        measurements: [
          { id: 'm1', name: '3.3V Rail', type: 'Numeric', expectedValue: 3.3, actualValue: 3.30, required: true, status: 'Untested' },
        ],
        passCriteria: ['Output voltage within ±0.1V'],
        evidence: [{ id: 'e1', type: 'Measurement', value: '3.30V logged via DMM', createdAt: '2026-08-10' }],
      },
    ];

    const summary = generateValidationSummary('Smart Ring Board', tests);
    expect(summary.totalTests).toBe(1);
    expect(summary.passedTests).toBe(1);
    expect(summary.passRatePercent).toBe(100);

    const html = exportValidationReportHtml('Smart Ring Board', tests);
    expect(html).toContain('Hardware Validation Report');
    expect(html).toContain('DC Power Rail Voltage Regulation');
    expect(html).toContain('100%');
  });
});
