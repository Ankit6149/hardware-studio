import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('workspace accessibility and focus baseline', () => {
  it('provides a skip target, route announcement, and collapsible labeled two-level navigation', () => {
    const shell = source('../components/AppShell.tsx');
    const sidebar = source('../components/Sidebar.tsx');
    const subnav = source('../components/ContextSubnav.tsx');

    expect(shell).toContain('href="#workspace-main"');
    expect(shell).toContain('id="workspace-main"');
    expect(shell).toContain('aria-live="polite"');
    expect(shell).toContain('sidebarCollapsed');
    expect(shell).toContain('onToggleCollapsed');

    expect(sidebar).toContain('aria-label="Primary product-area navigation"');
    expect(sidebar).toContain('aria-label="Engineering domains"');
    expect(sidebar).toContain('Show contextual navigation');
    expect(sidebar).toContain('Hide contextual navigation');
    expect(sidebar).toContain('w-[86px]');
    expect(sidebar).toContain("product: 'Product'");
    expect(sidebar).toContain("mechanical: 'Mechanical'");
    expect(sidebar).toContain("electronics: 'Electronics'");
    expect(sidebar).toContain("validation: 'Validation'");
    expect(sidebar).toContain("outputs: 'Release'");

    expect(subnav).toContain('contextual navigation');
    expect(subnav).toContain('workbenches');
    expect(subnav).toContain('min-h-10');
    expect(subnav).toContain('w-[184px]');
    expect(subnav).toContain('Start here');
    expect(subnav).toContain("'schematic-editor': ['Place project components on the sheet.'");
    expect(subnav).toContain("'board-designer': ['Place footprints inside the real board outline.'");
  });
});
