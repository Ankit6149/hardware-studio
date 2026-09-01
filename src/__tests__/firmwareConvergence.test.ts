import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('U6.1 firmware convergence', () => {
  it('uses one shell-owned Firmware Project Drawer', () => {
    const navigation = source('../components/StudioWorkbenchNavigation.tsx');
    const drawer = source('../components/firmware/FirmwareProjectDrawer.tsx');

    expect(navigation).toContain("activeWorkbench.id === 'firmware'");
    expect(navigation).toContain('<FirmwareProjectDrawer />');
    expect(drawer).toContain('data-workbench="firmware"');
    expect(drawer).toContain("{ id: 'modules', label: 'Modules'");
    expect(drawer).toContain("{ id: 'files', label: 'Files'");
    expect(drawer).toContain("{ id: 'hardware-map', label: 'Map'");
    expect(drawer).toContain("{ id: 'environment', label: 'Env'");
  });

  it('routes all Firmware surfaces through one engineering workbench and deletes the duplicate studio', () => {
    const shell = source('../components/AppShell.tsx');

    expect(shell).toContain("import { EngineeringFirmwareWorkbench } from './firmware/EngineeringFirmwareWorkbench';");
    expect(shell).toContain('<EngineeringFirmwareWorkbench initialMode="state-machine" />');
    expect(shell).toContain('<EngineeringFirmwareWorkbench initialMode="hardware-map" />');
    expect(shell).toContain('<EngineeringFirmwareWorkbench initialMode="source" />');
    expect(shell).not.toContain('FirmwareStudio');
    expect(existsSync(new URL('../components/firmware/FirmwareStudio.tsx', import.meta.url))).toBe(false);
  });

  it('keeps representation, selection, and dock chrome outside canonical project state', () => {
    const uiStore = source('../store/firmwareWorkspaceUiStore.ts');
    const projectStore = source('../store/projectStore.ts');

    expect(uiStore).toContain("export type FirmwareRepresentation = 'modules' | 'behavior' | 'hardware-map' | 'source';");
    expect(uiStore).toContain('selectedModuleId: string | null');
    expect(uiStore).toContain('selectedFileId: string | null');
    expect(uiStore).toContain("export type FirmwareDockTab = 'problems' | 'build-evidence' | 'device-evidence';");
    expect(projectStore).not.toContain('firmwareWorkspaceUiStore');
    expect(projectStore).not.toContain('selectedModuleId: string | null');
    expect(projectStore).not.toContain('selectedFileId: string | null');
  });

  it('does not silently choose the first module/file or keep private drawer navigation', () => {
    const workbench = source('../components/firmware/EngineeringFirmwareWorkbench.tsx');
    const editor = source('../components/firmware/FirmwareCodePreview.tsx');

    expect(workbench).not.toContain('firmwareModules[0]');
    expect(workbench).not.toContain('modeLabels');
    expect(workbench).not.toContain('Firmware workspace sections');
    expect(editor).not.toContain('sourceFiles[0]');
    expect(editor).not.toContain('aria-label="Firmware source files"');
    expect(editor).toContain('choose a file explicitly');
  });

  it('uses shared Inspector and bottom dock while keeping execution claims truthful', () => {
    const workbench = source('../components/firmware/EngineeringFirmwareWorkbench.tsx');

    expect(workbench).toContain('<EngineeringEditorBar');
    expect(workbench).toContain('<EngineeringInspector');
    expect(workbench).toContain('<EngineeringBottomDock');
    expect(workbench).toContain('<EngineeringStatusBar');
    expect(workbench).toContain("openDock('problems')");
    expect(workbench).toContain("openDock('build-evidence')");
    expect(workbench).toContain("openDock('device-evidence')");
    expect(workbench).toContain('Hardware Studio did not run the compiler');
    expect(workbench).toContain('Hardware Studio did not flash, query or monitor the device');
    expect(workbench).toContain('No build is selected automatically for device evidence.');
  });
});
