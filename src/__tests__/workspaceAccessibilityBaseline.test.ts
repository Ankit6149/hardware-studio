import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('workspace accessibility and focus baseline', () => {
  it('provides a skip target, route announcement, keyboard-focusable tabs, and a collapsible contextual drawer', () => {
    const shell = source('../components/AppShell.tsx');
    const navigation = source('../components/StudioWorkbenchNavigation.tsx');

    expect(shell).toContain('href="#workspace-main"');
    expect(shell).toContain('id="workspace-main"');
    expect(shell).toContain('aria-live="polite"');
    expect(shell).toContain('projectDrawerOpen');
    expect(shell).toContain('<StudioWorkbenchTabs');
    expect(shell).toContain('<StudioProjectDrawer');

    expect(navigation).toContain('role="tablist"');
    expect(navigation).toContain('role="tab"');
    expect(navigation).toContain('aria-selected={active}');
    expect(navigation).toContain('aria-controls="workspace-main"');
    expect(navigation).toContain('Hide project drawer');
    expect(navigation).toContain('Show project drawer');
    expect(navigation).toContain('aria-expanded={drawerOpen}');
    expect(navigation).toContain('contextual tools');
    expect(navigation).toContain('min-h-10');
    expect(navigation).toContain('w-[192px]');
    expect(navigation).not.toContain('Start here');
    expect(navigation).not.toContain('quickStartByView');
  });
});
