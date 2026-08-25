import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Electronics contextual tool convergence', () => {
  it('keeps power, pin mapping, board rules and legacy aliases inside the Electronics workspace', () => {
    const workspace = source('../components/studio/ElectronicsWorkspace.tsx');

    for (const viewId of ['electronics', 'power-tree', 'power-budget', 'pin-map', 'pcb-constraints']) {
      expect(workspace).toContain(`'${viewId}'`);
    }

    expect(workspace).toContain("case 'power-budget': return <PowerBudgetTable />;");
    expect(workspace).toContain("case 'pin-map': return <PinMapTable />;");
    expect(workspace).toContain("case 'pcb-constraints': return <PCBConstraints />;");
    expect(workspace).toContain("if (viewId === 'power-tree') return 'power-budget';");
  });

  it('does not mount those contextual tools as separate shell pages', () => {
    const shell = source('../components/AppShell.tsx');

    expect(shell).not.toContain("import { PowerBudgetTable } from './PowerBudgetTable';");
    expect(shell).not.toContain("import { PinMapTable } from './PinMapTable';");
    expect(shell).not.toContain("import { PCBConstraints } from './PCBConstraints';");
    expect(shell).toContain("case 'power-budget':");
    expect(shell).toContain("case 'pin-map':");
    expect(shell).toContain("case 'pcb-constraints':");
    expect(shell).toContain('return <ElectronicsWorkspace />;');
  });
});
