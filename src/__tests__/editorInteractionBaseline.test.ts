import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('editor-first interaction model', () => {
  it('does not mutate engineering state merely by opening the schematic', () => {
    const adapters = source('../components/studio/UnifiedWorkbenchAdapters.tsx');
    expect(adapters).not.toContain('placeComponentOnSchematic');
    expect(adapters).toContain('Opening an editor must never mutate engineering state');
  });

  it('keeps navigation, selection, and mutation as visibly separate actions', () => {
    const subnav = source('../components/ContextSubnav.tsx');
    const dashboard = source('../components/ProjectDashboard.tsx');
    const readiness = source('../components/ReadinessDashboard.tsx');

    expect(subnav).toContain('Clicking the row itself does not mutate the project');
    expect(subnav).toContain('aria-label={`Add ${libraryItem.name} to the blueprint`}');
    expect(subnav).not.toContain('onClick={() => handleAddBlock(libraryItem)}\n                            className="group flex');

    expect(dashboard).toContain('Rows are information. Only the Open button changes workspaces.');
    expect(readiness).toContain('Evidence text is inert. Use the explicit Resolve button to change workspaces.');
    expect(readiness).toContain('Gate rows show state. Only Review changes the workspace.');
  });

  it('gives authoring canvases the dominant editor area', () => {
    const product = source('../components/product/ProductStudio.tsx');
    const electronics = source('../components/studio/ElectronicsWorkspace.tsx');
    const schematic = source('../components/schematic/UnifiedSchematicEditor.tsx');
    const pcb = source('../components/board/BoardDesigner.tsx');
    const mechanical = source('../components/mechanical/MechanicalStudio.tsx');
    const editorLayout = source('../app/editor-layout.css');

    expect(product).not.toContain('productViews.map');
    expect(product).toContain('showRequirementContext');
    expect(product).toContain('showInspector');

    expect(electronics).not.toContain('role="tablist"');
    expect(electronics).toContain('{renderStage(activeStage)}');

    expect(schematic).toContain('partsOpen');
    expect(schematic).toContain('inspectorOpen');
    expect(schematic).toContain('absolute bottom-3 left-3 top-3');
    expect(schematic).toContain('Opening this editor never places anything automatically.');
    expect(schematic).not.toContain('flex w-60 shrink-0 flex-col');
    expect(schematic).not.toContain('flex w-72 shrink-0 flex-col');

    expect(pcb).toContain('layersOpen');
    expect(pcb).toContain('componentsOpen');
    expect(pcb).toContain('rightDockOpen');
    expect(pcb).toContain('relative min-h-0 flex-1 overflow-hidden bg-white');
    expect(pcb).not.toContain('flex w-56 shrink-0 flex-col');

    expect(mechanical).toContain('objectsOpen');
    expect(mechanical).toContain('inspectorOpen');
    expect(mechanical).not.toContain('grid-cols-[11rem_minmax(0,1fr)_16rem]');

    expect(editorLayout).toContain('Product Design Studio');
    expect(editorLayout).toContain('position: absolute');
  });
});