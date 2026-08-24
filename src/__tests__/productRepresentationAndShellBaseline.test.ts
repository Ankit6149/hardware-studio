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

  it('keeps duplicate and supporting destinations compatibility-only rather than visible navigation', () => {
    const navigation = source('../lib/navigationRegistry.ts');
    const [visible, compatibility] = navigation.split('export const compatibleNavigationItems');
    expect(visible).not.toContain("item('product-design'");
    expect(visible).not.toContain("item('blueprint-editor'");
    expect(visible).not.toContain("item('pcb-drc'");
    expect(visible).not.toContain("item('power-tree'");
    expect(visible).not.toContain("item('pin-map'");
    expect(visible).not.toContain("item('factory-builder'");
    expect(compatibility).toContain("item('product-design'");
    expect(compatibility).toContain("item('blueprint-editor'");
    expect(compatibility).toContain("item('pcb-drc'");
    expect(compatibility).toContain("item('power-tree'");
    expect(compatibility).toContain("item('pin-map'");
    expect(compatibility).toContain("item('factory-builder'");
  });

  it('does not wrap every workbench in global context, review, or coaching strips', () => {
    const shell = source('../components/AppShell.tsx');
    expect(shell).not.toContain('EngineeringContextBar');
    expect(shell).not.toContain('ReviewWarnings');
    expect(shell).not.toContain('WorkspaceCoach');
    expect(shell).not.toContain('workflowPreferencesStore');
    expect(shell).toContain('<TopBar />');
    expect(shell).toContain('<Sidebar');
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
