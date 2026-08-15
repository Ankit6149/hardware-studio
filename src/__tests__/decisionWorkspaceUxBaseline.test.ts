import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('decision-first product UX baseline', () => {
  it('keeps project overview and readiness focused on decisions, consequences, and responsible workspaces', () => {
    const dashboard = source('../components/ProjectDashboard.tsx');
    const readiness = source('../components/ReadinessDashboard.tsx');
    const engine = source('../lib/readinessScore.ts');

    expect(dashboard).toContain('Next engineering decision');
    expect(dashboard).toContain('Why this matters / consequence');
    expect(dashboard).toContain('Counts, not decisions');
    expect(dashboard).toContain("setActiveView('readiness')");

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

  it('keeps two distinct navigation levels while editor object tools stay inside their workbench', () => {
    const sidebar = source('../components/Sidebar.tsx');
    const subnav = source('../components/ContextSubnav.tsx');
    const productStudio = source('../components/product/ProductStudio.tsx');

    expect(sidebar).toContain('Primary product-area navigation');
    expect(sidebar).toContain('Engineering domains');
    expect(sidebar).toContain('<ContextSubnav collapsed={collapsed} />');
    expect(sidebar).not.toContain('domain.items.map');

    expect(subnav).toContain('data-context-subnav');
    expect(subnav).toContain('contextual navigation');
    expect(subnav).toContain('workbenches');
    expect(subnav).toContain('activeDomain.items.map');
    expect(subnav).toContain('Start here');
    expect(subnav).toContain('quickStartByView');
    expect(subnav).not.toContain('showDeviceLibrary');
    expect(subnav).not.toContain('libraryItem');

    expect(productStudio).toContain('ArchitectureGlyph');
    expect(productStudio).toContain('onClick={() => handleAddElement(preset)}');
    expect(productStudio).toContain('aria-label={`Place ${preset.name}`}');
  });
});
