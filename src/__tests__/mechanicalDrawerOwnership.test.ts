import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Mechanical drawer ownership', () => {
  it('has exactly one user-facing Mechanical structure browser in the shared shell path', () => {
    const navigation = source('../components/StudioWorkbenchNavigation.tsx');
    const workbench = source('../components/mechanical/EngineeringMechanicalWorkbench.tsx');

    expect(navigation).toContain('<MechanicalProjectDrawer />');
    expect(workbench).not.toContain('<EngineeringDock side="left"');
    expect(workbench).not.toContain('Design browser');
  });
});
