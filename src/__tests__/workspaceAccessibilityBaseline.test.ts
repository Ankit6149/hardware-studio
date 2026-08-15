import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('workspace accessibility and focus baseline', () => {
  it('provides a skip target, route announcement, and collapsible responsive navigation', () => {
    const shell = source('../components/AppShell.tsx');
    const sidebar = source('../components/Sidebar.tsx');

    expect(shell).toContain('href="#workspace-main"');
    expect(shell).toContain('id="workspace-main"');
    expect(shell).toContain('aria-live="polite"');
    expect(shell).toContain('sidebarCollapsed');
    expect(shell).toContain('onToggleCollapsed');

    expect(sidebar).toContain('aria-label="Primary workspace navigation"');
    expect(sidebar).toContain('Collapse navigation');
    expect(sidebar).toContain('Expand navigation');
    expect(sidebar).toContain('h-10');
    expect(sidebar).toContain('lg:w-[240px]');
  });
});
