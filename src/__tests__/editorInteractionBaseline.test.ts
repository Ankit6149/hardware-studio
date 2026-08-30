import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('editor-first interaction model', () => {
  it('does not mutate engineering state merely by opening authoring editors', () => {
    const adapters = source('../components/studio/UnifiedWorkbenchAdapters.tsx');
    const schematic = source('../components/schematic/EngineeringSchematicWorkbench.tsx');
    const firmwareSource = source('../components/firmware/FirmwareCodePreview.tsx');

    expect(adapters).not.toContain('placeComponentOnSchematic');
    expect(adapters).toContain('<EngineeringSchematicWorkbench />');
    expect(schematic).toContain("activeTool: 'place-component'");
    expect(schematic).toContain('placeAtPointer');
    expect(schematic).not.toContain('140 + column * 180');

    expect(firmwareSource).not.toContain('useEffect');
    expect(firmwareSource).toContain('Opening Source does not generate files');
    expect(firmwareSource).toContain('onClick={() => void handleRegenerate()}');
  });

  it('keeps navigation, selection, and mutation as visibly separate actions', () => {
    const navigation = source('../components/StudioWorkbenchNavigation.tsx');
    const product = source('../components/product/ProductStudio.tsx');
    const dashboard = source('../components/ProjectDashboard.tsx');
    const readiness = source('../components/ReadinessDashboard.tsx');
    const schematic = source('../components/schematic/EngineeringSchematicWorkbench.tsx');
    const pcb = source('../components/board/EngineeringBoardWorkbench.tsx');

    expect(navigation).toContain('onClick={() => setActiveView(workbench.defaultView)}');
    expect(navigation).toContain('onClick={() => setActiveView(item.id)}');
    expect(navigation).not.toContain('addBlockLibraryItemToProject');
    expect(navigation).not.toContain('libraryItem');
    expect(product).toContain('onClick={() => handleAddElement(preset)}');
    expect(product).toContain('aria-label={`Place ${preset.name}`}');

    expect(dashboard).toContain('onClick={() => setActiveView(nextAction.viewId)}');
    expect(dashboard).toContain('onClick={() => setActiveView(area.viewId)}');
    expect(dashboard).toContain('Open an area only when that is the work you need.');
    expect(readiness).toContain('Evidence text is inert. Use the explicit Resolve button to change workspaces.');
    expect(readiness).toContain('Gate rows show state. Only Review changes the workspace.');

    expect(schematic).toContain('Place…');
    expect(schematic).toContain('click sheet · Esc cancels');
    expect(pcb).toContain('drag to board');
    expect(pcb).toContain('click a pad/via/trace endpoint to begin');
  });

  it('uses one professional editor grammar for the core engineering workbenches', () => {
    const shared = source('../components/editor/EngineeringEditorShell.tsx');
    const schematic = source('../components/schematic/EngineeringSchematicWorkbench.tsx');
    const pcb = source('../components/board/EngineeringBoardWorkbench.tsx');
    const mechanical = source('../components/mechanical/EngineeringMechanicalWorkbench.tsx');
    const mechanicalCanvas = source('../components/mechanical/EngineeringMechanicalCanvas.tsx');
    const validation = source('../components/validation/ValidationStudio.tsx');
    const unifiedValidation = source('../components/studio/UnifiedValidationWorkbench.tsx');
    const firmwareSource = source('../components/firmware/FirmwareCodePreview.tsx');

    expect(shared).toContain('EngineeringEditorBar');
    expect(shared).toContain('EngineeringDock');
    expect(shared).toContain('EngineeringStatusBar');

    for (const editor of [schematic, pcb, mechanical]) {
      expect(editor).toContain('<EngineeringEditorBar');
      expect(editor).toContain('<EngineeringDock');
      expect(editor).toContain('<EngineeringStatusBar');
    }

    expect(schematic).toContain('<SchematicCanvas');
    expect(pcb).toContain('<BoardCanvas');
    expect(pcb).not.toContain('Auto Place');
    expect(pcb).not.toContain('Autoroute');

    expect(mechanical).toContain('New physical feature');
    expect(mechanical).toContain('Capture dimension & tolerance');
    expect(mechanical).not.toContain('Rectangle');
    expect(mechanicalCanvas).toContain('mechanicalDimensions');

    expect(validation).toContain('testListOpen');
    expect(unifiedValidation).toContain('runPanelOpen');
    expect(firmwareSource).toContain('Firmware source editor');
  });
});
