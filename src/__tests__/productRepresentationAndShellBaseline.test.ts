import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('semantic product representation and calm shell contracts', () => {
  it('renders Product Architecture from semantic families and typed ports instead of one generic rectangle', () => {
    const canvas = source('../components/product/ProductArchitectureCanvas.tsx');
    expect(canvas).toContain('ArchitectureGlyph');
    expect(canvas).toContain('resolveVisualFamilyId');
    expect(canvas).toContain('portHandleId');
    expect(canvas).toContain('portKindStyles');
    expect(canvas).toContain("type: 'smoothstep'");
    expect(canvas).toContain('linkedCount');
    expect(canvas).not.toContain('ArchitectureBlockNode');
    expect(canvas).not.toContain('CATEGORY_COLORS');
  });

  it('exposes recognizable system roles as visible placement tools instead of anonymous architecture blocks', () => {
    const studio = source('../components/product/ProductStudio.tsx');
    expect(studio).toContain('ArchitectureGlyph');
    expect(studio).toContain('Place ${preset.name}');
    expect(studio).toContain('Main Controller');
    expect(studio).toContain("familyId: 'microcontroller'");
    expect(studio).toContain('Environmental Sensor');
    expect(studio).toContain("familyId: 'sensor'");
    expect(studio).toContain('USB-C Interface');
    expect(studio).toContain("familyId: 'usb-c'");
    expect(studio).toContain('Enclosure');
    expect(studio).toContain('Safety / Protection');
    expect(studio).not.toContain('Add block');
    expect(studio).not.toContain('Math.random()');
  });

  it('keeps supporting destinations contextual or compatibility-only rather than primary workbench tabs', () => {
    const navigation = source('../lib/navigationRegistry.ts');
    const [primary, contextualAndCompatibility] = navigation.split('const contextualItems =');
    expect(primary).not.toContain("item('pcb-drc'");
    expect(primary).not.toContain("item('power-budget'");
    expect(primary).not.toContain("item('pin-map'");
    expect(primary).not.toContain("item('factory-builder'");
    expect(contextualAndCompatibility).toContain("item('pcb-drc'");
    expect(contextualAndCompatibility).toContain("item('power-budget'");
    expect(contextualAndCompatibility).toContain("item('pin-map'");
    expect(contextualAndCompatibility).toContain("item('factory-builder'");
  });

  it('uses shared workbench tabs and drawer without bringing global coaching strips back', () => {
    const shell = source('../components/AppShell.tsx');
    expect(shell).not.toContain('EngineeringContextBar');
    expect(shell).not.toContain('ReviewWarnings');
    expect(shell).not.toContain('WorkspaceCoach');
    expect(shell).not.toContain('workflowPreferencesStore');
    expect(shell).not.toContain('<Sidebar');
    expect(shell).toContain('<TopBar />');
    expect(shell).toContain('<StudioWorkbenchTabs');
    expect(shell).toContain('<StudioProjectDrawer');
  });

  it('lets typed port and edge colors survive the global React Flow skin', () => {
    const css = source('../app/globals.css');
    const reactFlowCss = css.split('/* React Flow — warm technical drawing treatment. Inline engineering semantics win. */')[1] || '';
    expect(reactFlowCss).toContain('background-color: #a69d90;');
    expect(reactFlowCss).not.toContain('background-color: #a69d90 !important');
    expect(reactFlowCss).toContain('stroke: #9e978b;');
    expect(reactFlowCss).not.toContain('stroke: #9e978b !important');
  });
});
