import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('decision-first product UX baseline', () => {
  it('keeps project overview and readiness focused on evidence-driven next actions', () => {
    const dashboard = source('../components/ProjectDashboard.tsx');
    const readiness = source('../components/ReadinessDashboard.tsx');
    const engine = source('../lib/readinessScore.ts');

    expect(dashboard).toContain('deriveNextAction');
    expect(dashboard).toContain('The complete product path');
    expect(dashboard).toContain('One product. One identity. One path forward.');
    expect(dashboard).toContain('Existing evidence—not a progress percentage—decides what can move forward.');
    expect(dashboard).toContain("viewId: 'readiness'");

    expect(readiness).toContain('What can this project safely do next?');
    expect(readiness).toContain('Blocking evidence');
    expect(readiness).toContain('Consequence');
    expect(readiness).toContain('Gate evidence');
    expect(readiness).toContain('routeForIssue');

    expect(engine).toContain('component.placementX == null || component.placementY == null');
    expect(engine).toContain("file.status !== 'Not Generated'");
    expect(engine).toContain('PCB DRC: ${result.title}');
  });

  it('turns requirements into evidence-gated decisions rather than CRUD records', () => {
    const requirements = source('../components/product/ProductRequirementsPanel.tsx');
    const productStudio = source('../components/product/ProductStudio.tsx');

    expect(requirements).toContain('Requirement decision workspace');
    expect(requirements).toContain('Evidence needed to decide');
    expect(requirements).toContain('Decision state');
    expect(requirements).toContain('Consequence');
    expect(requirements).toContain('Create linked validation');
    expect(requirements).toContain("nextStatus === 'Verified'");
    expect(requirements).toContain('passedLinkedTests.length === 0');
    expect(requirements).toContain('feedback.confirm');
    expect(requirements).not.toContain('window.prompt');
    expect(requirements).not.toContain('window.confirm');

    expect(productStudio).toContain('<ProductRequirementsPanel mode="full" />');
    expect(productStudio).toContain('<ProductRequirementsPanel mode="compact" />');
  });

  it('uses connected workbench tabs and one contextual project drawer instead of a permanent domain rail', () => {
    const navigation = source('../components/StudioWorkbenchNavigation.tsx');
    const registry = source('../lib/navigationRegistry.ts');
    const productStudio = source('../components/product/ProductStudio.tsx');

    expect(navigation).toContain('data-studio-shell="workbench-tabs"');
    expect(navigation).toContain('aria-label="Open product workbenches"');
    expect(navigation).toContain('role="tablist"');
    expect(navigation).toContain('data-studio-shell="project-drawer"');
    expect(navigation).toContain('Project tools');
    expect(navigation).toContain('getContextualNavigationItemsForView');
    expect(navigation).toContain('Hide project drawer');
    expect(navigation).toContain('Show project drawer');

    expect(registry).toContain('export const workbenchTabs');
    expect(registry).toContain('contextualItemsByWorkbench');
    expect(registry).not.toContain('export const navigationDomains');
    expect(existsSync(new URL('../components/Sidebar.tsx', import.meta.url))).toBe(false);
    expect(existsSync(new URL('../components/ContextSubnav.tsx', import.meta.url))).toBe(false);

    expect(productStudio).toContain('ArchitectureGlyph');
    expect(productStudio).toContain('onClick={() => handleAddElement(preset)}');
    expect(productStudio).toContain('aria-label={`Place ${preset.name}`}');
  });
});
