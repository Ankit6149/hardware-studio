import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('U5.2 Mechanical representation convergence', () => {
  it('stores representation choice as Mechanical UI state, not project engineering state', () => {
    const uiStore = source('../store/mechanicalWorkspaceUiStore.ts');
    const projectStore = source('../store/projectStore.ts');

    expect(uiStore).toContain("export type MechanicalRepresentation = 'layout' | 'review-3d' | 'assembly'");
    expect(uiStore).toContain("representation: 'layout'");
    expect(uiStore).toContain('setRepresentation');
    expect(projectStore).not.toContain('mechanicalRepresentation');
    expect(projectStore).not.toContain('review-3d');
  });

  it('maps legacy Mechanical requests into the contextual representation state and clears the handoff', () => {
    const adapter = source('../components/studio/UnifiedWorkbenchAdapters.tsx');

    expect(adapter).toContain('mechanicalRepresentationForLegacyMode');
    expect(adapter).toContain("mode === 'assembly'");
    expect(adapter).toContain("mode === 'webgl-3d' || mode === '3d-preview'");
    expect(adapter).toContain("return 'review-3d'");
    expect(adapter).toContain('if (requestedMode) requestMechanicalMode(null)');
    expect(adapter).toContain('<MechanicalRepresentationTabs />');
    expect(adapter).toContain('<Mechanical3DReview />');
    expect(adapter).toContain('<EngineeringMechanicalWorkbench initialMode="assembly" />');
    expect(adapter).toContain('<EngineeringMechanicalWorkbench initialMode="canvas" />');
  });

  it('makes 2D, 3D Review, and Assembly explicit contextual tabs instead of global destinations', () => {
    const tabs = source('../components/mechanical/MechanicalRepresentationTabs.tsx');
    const navigation = source('../lib/navigationRegistry.ts');

    expect(tabs).toContain('aria-label="Mechanical representations"');
    expect(tabs).toContain("label: '2D Layout'");
    expect(tabs).toContain("label: '3D Review'");
    expect(tabs).toContain("detail: 'Visualization'");
    expect(tabs).toContain("label: 'Assembly'");
    expect(tabs).toContain('3D review never grants CAD or validation authority.');
    expect(navigation).not.toContain("label: '3D Review'");
  });

  it('keeps the Project Drawer and representation state coherent without creating another Mechanical browser', () => {
    const drawer = source('../components/mechanical/MechanicalProjectDrawer.tsx');
    const workbench = source('../components/mechanical/EngineeringMechanicalWorkbench.tsx');

    expect(drawer).toContain("if (section === 'assembly') setRepresentation('assembly')");
    expect(drawer).toContain("else if (representation === 'assembly') setRepresentation('layout')");
    expect(drawer).toContain('data-workbench="mechanical"');
    expect(workbench).not.toContain('Design browser');
  });

  it('classifies 3D as review visualization while retaining canonical selection context', () => {
    const review = source('../components/mechanical/Mechanical3DReview.tsx');
    const renderer = source('../components/mechanical/UnifiedBoard3DView.tsx');

    expect(review).toContain('title="3D Review"');
    expect(review).toContain('Visualization only');
    expect(review).toContain('3D Review is not CAD and never grants validation authority.');
    expect(review).toContain('const selected = useStudioContextStore((state) => state.selected)');
    expect(review).toContain('Selection · ${selectedLabel}');
    expect(review).toContain('[&>section>header]:hidden');

    expect(renderer).toContain('Hardware Studio will not substitute the first board.');
    expect(renderer).toContain('No 50 × 30 mm preview envelope or other guessed outline will be created.');
    expect(renderer).toContain('not STEP/B-Rep geometry and not manufacturing clearance evidence.');
  });
});
