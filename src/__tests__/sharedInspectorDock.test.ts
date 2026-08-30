import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('shared Inspector and diagnostics dock contracts', () => {
  it('defines explicit shared Inspector and bottom-dock primitives in one editor-shell authority', () => {
    const shell = source('../components/editor/EngineeringEditorShell.tsx');

    expect(shell).toContain('export const EngineeringInspector');
    expect(shell).toContain('data-editor-chrome="inspector"');
    expect(shell).toContain('export const EngineeringBottomDock');
    expect(shell).toContain('data-editor-chrome="bottom-dock"');
    expect(shell).toContain('closed docks cost no canvas space');
    expect(shell).toContain('export const EngineeringStatusBar');
  });

  it('keeps Schematic selection in Inspector and ERC in the Problems dock', () => {
    const schematic = source('../components/schematic/EngineeringSchematicWorkbench.tsx');

    expect(schematic).toContain('<EngineeringInspector');
    expect(schematic).toContain('<EngineeringBottomDock');
    expect(schematic).toContain('title="ERC findings"');
    expect(schematic).toContain('label="Problems"');
    expect(schematic).toContain('count={ercResults.length}');
    expect(schematic).not.toContain('Selection & ERC');
  });

  it('keeps PCB selection/nets in Inspector and DRC in the Problems dock', () => {
    const pcb = source('../components/board/EngineeringBoardWorkbench.tsx');

    expect(pcb).toContain('<EngineeringInspector');
    expect(pcb).toContain('<EngineeringBottomDock');
    expect(pcb).toContain('title="PCB DRC"');
    expect(pcb).toContain('label="Problems"');
    expect(pcb).toContain("type InspectorTab = 'selection' | 'nets';");
    expect(pcb).not.toContain("'drc', 'DRC'");
    expect(pcb).toContain('setProblemsOpen(true)');
  });

  it('keeps Mechanical feature editing in Inspector and checks in the Problems dock', () => {
    const mechanical = source('../components/mechanical/EngineeringMechanicalWorkbench.tsx');

    expect(mechanical).toContain('<EngineeringInspector');
    expect(mechanical).toContain('<EngineeringBottomDock');
    expect(mechanical).toContain('title="Mechanical checks"');
    expect(mechanical).toContain('label="Problems"');
    expect(mechanical).toContain('Capture dimension & tolerance');
  });

  it('keeps panel visibility local to workbenches rather than canonical project state', () => {
    const projectStore = source('../store/projectStore.ts');

    expect(projectStore).not.toContain('problemsOpen');
    expect(projectStore).not.toContain('inspectorOpen');
    expect(projectStore).not.toContain('browserOpen');
    expect(projectStore).not.toContain('bottomDockOpen');
  });
});
