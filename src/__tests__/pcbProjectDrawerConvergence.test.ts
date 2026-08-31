import { beforeEach, describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import {
  getPcbDrawerSectionForView,
  usePcbWorkspaceUiStore,
} from '../store/pcbWorkspaceUiStore';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('PCB Project Drawer convergence', () => {
  beforeEach(() => usePcbWorkspaceUiStore.getState().reset());

  it('keeps PCB panel and layer state UI-only and predictable', () => {
    const ui = usePcbWorkspaceUiStore.getState();
    ui.setActiveSection('layers');
    ui.setActiveLayer('bottom-copper');
    ui.toggleLayerVisibility('silkscreen');
    ui.setInspectorOpen(true);
    ui.setProblemsOpen(true);

    expect(usePcbWorkspaceUiStore.getState()).toMatchObject({
      activeSection: 'layers',
      activeLayerId: 'bottom-copper',
      inspectorOpen: true,
      problemsOpen: true,
    });
    expect(usePcbWorkspaceUiStore.getState().layerVisibility.silkscreen).toBe(false);
    expect(source('../store/pcbWorkspaceUiStore.ts')).not.toContain('useProjectStore');
    expect(source('../store/pcbWorkspaceUiStore.ts')).not.toContain('updateProjectState');
  });

  it('maps compatibility PCB views to the same integrated board surface', () => {
    const electronics = source('../components/studio/ElectronicsWorkspace.tsx');
    const routes = source('../lib/studioRoutes.ts');

    expect(getPcbDrawerSectionForView('pcb-constraints')).toBe('rules');
    expect(getPcbDrawerSectionForView('board-designer')).toBe('objects');
    expect(electronics).toContain("viewId === 'pcb-constraints' || viewId === 'pcb-drc'");
    expect(electronics).toContain("return 'board-designer'");
    expect(electronics).toContain("activeView === 'pcb-constraints'");
    expect(electronics).toContain("activeView === 'pcb-drc'");
    expect(electronics).toContain('setPcbProblemsOpen(true)');
    expect(electronics).not.toContain('PCBConstraints');
    expect(electronics).not.toContain('UnifiedBoardDRCWorkbench');
    expect(routes).toContain("'pcb-constraints': '/studio/pcb/rules'");
    expect(routes).toContain("'pcb-drc': '/studio/pcb/drc'");
  });

  it('gives PCB one shell-owned Project Drawer and removes nested state mirrors/browser/nets inspector', () => {
    const shell = source('../components/StudioWorkbenchNavigation.tsx');
    const pcb = source('../components/board/EngineeringBoardWorkbench.tsx');

    expect(shell).toContain("activeWorkbench.id === 'pcb'");
    expect(shell).toContain('<PcbProjectDrawer />');
    expect(pcb).toContain('usePcbWorkspaceUiStore');
    expect(pcb).toContain('effectiveViewState');
    expect(pcb).toContain('aria-label="Active PCB routing layer"');
    expect(pcb).not.toContain('useEffect');
    expect(pcb).not.toContain('problemsRequestId');
    expect(pcb).not.toContain('browserOpen');
    expect(pcb).not.toContain('browserTab');
    expect(pcb).not.toContain('Design browser');
    expect(pcb).not.toContain('EngineeringDock side="left"');
    expect(pcb).not.toContain("type InspectorTab = 'selection' | 'nets'");
    expect(pcb).not.toContain("['nets', 'Nets'");
    expect(pcb).toContain('Nets and board structure stay in the Project Drawer');
  });

  it('uses explicit board-scoped canonical objects, nets, rules and stackup without legacy fallbacks', () => {
    const drawer = source('../components/board/PcbProjectDrawer.tsx');

    expect(drawer).toContain("'objects'");
    expect(drawer).toContain("'nets'");
    expect(drawer).toContain("'layers'");
    expect(drawer).toContain("'rules'");
    expect(drawer).toContain("'stackup'");
    expect(drawer).toContain('pcbRules');
    expect(drawer).toContain('pcbLayers');
    expect(drawer).not.toContain('pcbConstraints');
    expect(drawer).not.toContain('boards[0]');
    expect(drawer).toContain('component.boardId === activeBoardId');
    expect(drawer).toContain('rule.boardId === activeBoardId');
    expect(drawer).toContain('layer.boardId === activeBoardId');
    expect(drawer).toContain('Stackup unresolved');
    expect(drawer).toContain('select({');
    expect(drawer).not.toContain('updatePCBPlacement');
  });

  it('physically removes retired standalone PCB Rules and DRC mini-apps', () => {
    expect(existsSync(new URL('../components/PCBConstraints.tsx', import.meta.url))).toBe(false);
    expect(existsSync(new URL('../components/studio/UnifiedBoardDRCWorkbench.tsx', import.meta.url))).toBe(false);
  });
});
