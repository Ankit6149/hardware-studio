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

    expect(sidebar).toContain('aria-label="Primary product navigation"');
    expect(sidebar).toContain('aria-label="Product areas"');
    expect(sidebar).toContain('Show workbench navigation');
    expect(sidebar).toContain('Hide workbench navigation');
    expect(sidebar).toContain('w-[78px]');
    expect(sidebar).toContain('domain.label');

    expect(subnav).toContain('workbench navigation');
    expect(subnav).toContain('activeDomain.items.map');
    expect(subnav).toContain('min-h-11');
    expect(subnav).toContain('w-[176px]');
    expect(subnav).not.toContain('Start here');
    expect(subnav).not.toContain('quickStartByView');
  });
});
