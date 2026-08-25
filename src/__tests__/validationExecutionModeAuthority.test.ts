import { describe, expect, it } from 'vitest';
import { getValidationExecutionMode } from '../lib/validationRunner';

describe('validation execution mode category authority', () => {
  it('never lets a test name override an explicit engineering category', () => {
    expect(getValidationExecutionMode('Thermal', 'Thermal clearance DRC review')).toBe('manual');
    expect(getValidationExecutionMode('Electrical', '3D clearance state DRC')).toBe('manual');
    expect(getValidationExecutionMode('EMC', '3D clearance DRC screening')).toBe('manual');
    expect(getValidationExecutionMode('Mechanical', 'Board DRC review')).toBe('mechanical-screen');
    expect(getValidationExecutionMode('Firmware', 'Mechanical clearance review')).toBe('manual');
    expect(getValidationExecutionMode('Firmware', 'Firmware state machine reachability')).toBe('firmware-state-auto');
  });

  it('uses conservative name heuristics only when category is absent or explicitly Manual', () => {
    expect(getValidationExecutionMode(undefined, 'Board DRC')).toBe('drc-auto');
    expect(getValidationExecutionMode('Manual', 'Firmware state machine review')).toBe('firmware-state-auto');
    expect(getValidationExecutionMode('Manual', '3D enclosure clearance')).toBe('mechanical-screen');
    expect(getValidationExecutionMode('Manual', 'Thermal chamber run')).toBe('manual');
  });
});
