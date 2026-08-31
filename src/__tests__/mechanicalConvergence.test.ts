import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('U5 Mechanical convergence', () => {
  it('owns Mechanical structure in the shared Project Drawer', () => {
    const navigation = source('../components/StudioWorkbenchNavigation.tsx');
    const drawer = source('../components/mechanical/MechanicalProjectDrawer.tsx');

    expect(navigation).toContain("activeWorkbench.id === 'mechanical'");
    expect(navigation).toContain('<MechanicalProjectDrawer />');
    expect(drawer).toContain("data-workbench=\"mechanical\"");
    expect(drawer).toContain("'features'");
    expect(drawer).toContain("'dimensions'");
    expect(drawer).toContain("'assembly'");
    expect(drawer).toContain("entity: 'mechanical-object'");
  });

  it('keeps Mechanical panel state outside canonical project state', () => {
    const uiStore = source('../store/mechanicalWorkspaceUiStore.ts');
    const projectStore = source('../store/projectStore.ts');

    expect(uiStore).toContain("drawerSection: 'features'");
    expect(uiStore).toContain('inspectorOpen');
    expect(uiStore).toContain('problemsOpen');
    expect(projectStore).not.toContain('mechanicalDrawerSection');
    expect(projectStore).not.toContain('mechanicalInspectorOpen');
  });

  it('does not retain fabricated starter geometry in the authoritative Mechanical workbench', () => {
    const workbench = source('../components/mechanical/EngineeringMechanicalWorkbench.tsx');

    expect(workbench).not.toContain("useState<string | null>(objects[0]?.id");
    expect(workbench).not.toContain("useState('70')");
    expect(workbench).not.toContain("useState('45')");
    expect(workbench).not.toContain("useState('12')");
    expect(workbench).not.toContain("useState('0.10')");
    expect(workbench).not.toContain('title="Design browser"');
    expect(workbench).not.toContain('label="Browser"');
  });
});
