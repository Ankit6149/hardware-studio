import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Mechanical shared selection', () => {
  it('uses studioContextStore mechanical-object selection as the workbench selection authority', () => {
    const workbench = source('../components/mechanical/EngineeringMechanicalWorkbench.tsx');
    const drawer = source('../components/mechanical/MechanicalProjectDrawer.tsx');

    expect(workbench).toContain("selected?.entity === 'mechanical-object'");
    expect(workbench).toContain("select({ entity: 'mechanical-object'");
    expect(drawer).toContain("entity: 'mechanical-object'");
    expect(workbench).not.toContain('objects[0]?.id');
  });
});
