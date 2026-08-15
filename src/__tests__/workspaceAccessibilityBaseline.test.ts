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
    expect(sidebar).toContain('w-[68px]');
    expect(sidebar).toContain("product: 'Product'");
    expect(sidebar).toContain("mechanical: 'Mech'");
    expect(sidebar).toContain("electronics: 'Elec'");
    expect(sidebar).toContain("validation: 'Validate'");
    expect(sidebar).toContain("outputs: 'Release'");

    expect(subnav).toContain('contextual navigation');
    expect(subnav).toContain('workbenches');
    expect(subnav).toContain('min-h-9');
    expect(subnav).toContain('w-[196px]');
  });
});
