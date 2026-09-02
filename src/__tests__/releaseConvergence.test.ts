import { beforeEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { useReleaseWorkspaceUiStore } from '../store/releaseWorkspaceUiStore';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('U8 Release convergence', () => {
  beforeEach(() => {
    useReleaseWorkspaceUiStore.setState({
      drawerSection: 'readiness',
      selectedKind: null,
      selectedRecordId: null,
      inspectorOpen: true,
      bottomDockOpen: false,
    });
  });

  it('keeps release selection and shell state UI-only', () => {
    const ui = useReleaseWorkspaceUiStore.getState();
    ui.selectRecord('snapshot', 'rev-explicit');
    ui.setDrawerSection('snapshots');
    ui.setBottomDockOpen(true);

    expect(useReleaseWorkspaceUiStore.getState()).toMatchObject({
      selectedKind: 'snapshot',
      selectedRecordId: 'rev-explicit',
      drawerSection: 'snapshots',
      bottomDockOpen: true,
    });

    const uiSource = source('../store/releaseWorkspaceUiStore.ts');
    expect(uiSource).not.toContain('useProjectStore');
    expect(uiSource).not.toContain('revisions:');
    expect(uiSource).not.toContain('releaseCandidates:');
    expect(uiSource).not.toContain('releases:');
  });

  it('uses one shell-owned Release Project Drawer and one Release workbench authority', () => {
    const navigation = source('../components/StudioWorkbenchNavigation.tsx');
    const drawer = source('../components/release/ReleaseProjectDrawer.tsx');
    const appShell = source('../components/AppShell.tsx');

    expect(navigation).toContain("activeWorkbench.id === 'release'");
    expect(navigation).toContain('<ReleaseProjectDrawer />');
    expect(drawer).toContain("label: 'Readiness'");
    expect(drawer).toContain("label: 'Snapshots'");
    expect(drawer).toContain("label: 'Outputs'");
    expect(drawer).toContain("label: 'Drawings'");
    expect(drawer).toContain("label: 'Factory'");

    expect(appShell).toContain('<UnifiedReleaseWorkbench mode="readiness" />');
    expect(appShell).toContain('<UnifiedReleaseWorkbench mode="snapshots" />');
    expect(appShell).toContain('<UnifiedReleaseWorkbench mode="outputs" />');
    expect(appShell).toContain('<UnifiedReleaseWorkbench mode="drawings" />');
    expect(appShell).toContain('<UnifiedReleaseWorkbench mode="factory" />');
    expect(appShell).not.toContain('<ExportCenter />');
    expect(appShell).not.toContain('<FactoryPackageBuilder />');
    expect(appShell).not.toContain('<RevisionsStudio />');
  });

  it('requires explicit source snapshot context for branch and candidate creation', () => {
    const revisions = source('../components/revisions/RevisionsStudio.tsx');
    const drawer = source('../components/release/ReleaseProjectDrawer.tsx');

    expect(revisions).not.toContain('revisions[revisions.length - 1]');
    expect(revisions).not.toContain('latestRevision');
    expect(revisions).toContain("selectedKind === 'snapshot'");
    expect(revisions).toContain('revisions.find((revision) => revision.id === selectedRecordId)');
    expect(revisions).toContain('if (!name || !selectedSnapshot) return;');
    expect(revisions).toContain('if (!tag || !selectedSnapshot) return;');
    expect(drawer).toContain("onClick={() => selectRecord(kind, record.id)}");
    expect(drawer).toContain('Opening Release never creates or selects one.');
  });

  it('bounds snapshot/candidate/release wording to current local authority', () => {
    const revisions = source('../components/revisions/RevisionsStudio.tsx');
    const workbench = source('../components/release/UnifiedReleaseWorkbench.tsx');

    expect(revisions).toContain('Capture local snapshot');
    expect(revisions).toContain('Provisional candidate');
    expect(revisions).toContain('Local release records');
    expect(revisions).toContain('not a #20-grade content-addressed immutable version');
    expect(revisions).toContain('Trusted approval/immutable publication remain #20');
    expect(workbench).toContain('not a #20-grade content-addressed version, trusted approval, or immutable published release');
  });

  it('treats readiness as local preflight rather than fabrication/release authorization', () => {
    const readiness = source('../components/ReadinessDashboard.tsx');

    expect(readiness).not.toContain('Fabrication evidence satisfied');
    expect(readiness).not.toContain('Review and publish the frozen release candidate');
    expect(readiness).toContain('Local helper preflight has no fabrication blocker');
    expect(readiness).toContain('This is not fabrication or release authorization');
    expect(readiness).toContain('Supporting signal only. It is not a release score, approval, fabrication authorization, or artifact qualification.');
  });

  it('keeps live manufacturing outputs Draft / Unqualified and avoids release-manifest overclaiming', () => {
    const outputs = source('../components/release/ReleaseOutputsSurface.tsx');
    const factory = source('../components/release/ReleaseFactorySurface.tsx');

    for (const surface of [outputs, factory]) {
      expect(surface).toContain('Draft / Unqualified');
      expect(surface).toContain('draft_package_manifest.json');
      expect(surface).toContain('Draft package manifest');
      expect(surface).not.toContain("'release_manifest.json'");
    }

    expect(outputs).toContain('not #21-qualified manufacturing/release artifacts');
    expect(factory).toContain('Checklist state records review notes only');
    expect(factory).toContain('does not mark a package Verified');
    expect(factory).toContain('still unqualified');
  });

  it('keeps #20/#21 qualification gaps visible in the shared Release grammar', () => {
    const workbench = source('../components/release/UnifiedReleaseWorkbench.tsx');
    const drawer = source('../components/release/ReleaseProjectDrawer.tsx');

    expect(workbench).toContain('trusted versions/releases remain #20');
    expect(workbench).toContain('qualified artifacts remain #21');
    expect(workbench).toContain('Helper blockers only');
    expect(drawer).toContain('Trusted release/qualification remain #20/#21.');
  });
});
