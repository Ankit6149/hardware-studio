import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('validation execution mode UX contract', () => {
  it('uses one shared execution classifier across the engine and validation workbench', () => {
    const runner = source('../lib/validationRunner.ts');
    const workbench = source('../components/studio/UnifiedValidationWorkbench.tsx');

    expect(runner).toContain("export type ValidationExecutionMode = 'drc-auto' | 'firmware-state-auto' | 'mechanical-screen' | 'manual'");
    expect(runner).toContain('getValidationExecutionMode(category, testName)');
    expect(workbench).toContain('getValidationExecutionMode');
    expect(workbench).not.toContain('function isAutomatedValidation');
  });

  it('makes screened Mechanical review and unsupported Thermal automation explicit to the user', () => {
    const workbench = source('../components/studio/UnifiedValidationWorkbench.tsx');

    expect(workbench).toContain('Run approximate screen');
    expect(workbench).toContain('exact CAD/physical evidence');
    expect(workbench).toContain('reviewer identity');
    expect(workbench).toContain('No internal thermal solver exists');
    expect(workbench).toContain('external simulation/lab evidence');
  });
});
