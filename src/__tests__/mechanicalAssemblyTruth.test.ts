import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const workbench = readFileSync(new URL('../components/mechanical/EngineeringMechanicalWorkbench.tsx', import.meta.url), 'utf8');

describe('Mechanical assembly truth', () => {
  it('keeps new assembly evidence unresolved until entered', () => {
    expect(workbench).toContain("material: ''");
    expect(workbench).toContain("fasteningMethod: ''");
    expect(workbench).toContain('material and fastening intent are known');
  });
});
