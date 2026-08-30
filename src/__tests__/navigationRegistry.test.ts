import { describe, expect, it } from 'vitest';
import {
  allNavigationItems,
  compatibleNavigationItems,
  getContextualNavigationItemsForView,
  getNavigationItem,
  getWorkbenchForView,
  isCanvasNavigationItem,
  primaryNavigationItems,
  workbenchTabs,
} from '../lib/navigationRegistry';

describe('navigation registry', () => {
  it('keeps every navigation id unique', () => {
    const ids = allNavigationItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('exposes connected product work surfaces instead of a permanent domain taxonomy', () => {
    expect(workbenchTabs.map((workbench) => workbench.id)).toEqual([
      'home',
      'requirements',
      'architecture',
      'components',
      'schematic',
      'pcb',
      'mechanical',
      'firmware',
      'validation',
      'release',
    ]);

    expect(primaryNavigationItems.map((item) => item.id)).toEqual([
      'dashboard',
      'requirements',
      'product-architecture',
      'component-library',
      'schematic-editor',
      'board-designer',
      'mechanical-studio',
      'firmware-studio',
      'validation-studio',
      'readiness',
    ]);

    for (const workbench of workbenchTabs) {
      expect(getNavigationItem(workbench.defaultView)).toBeDefined();
      expect(workbench.label.trim().length).toBeGreaterThan(0);
      expect(workbench.purpose.trim().length).toBeGreaterThan(15);
    }
  });

  it('keeps supporting PCB, Firmware, Validation, and Release tools contextual', () => {
    expect(getContextualNavigationItemsForView('board-designer').map((item) => item.id)).toEqual([
      'board-settings',
      'pcb-constraints',
      'pcb-drc',
      'bom',
    ]);
    expect(getContextualNavigationItemsForView('firmware-studio').map((item) => item.id)).toEqual([
      'state-machines',
      'hardware-mapping',
      'source-skeleton',
      'firmware-evidence',
    ]);
    expect(getContextualNavigationItemsForView('validation-studio').map((item) => item.id)).toEqual([
      'requirement-coverage',
      'factory-qa',
    ]);
    expect(getContextualNavigationItemsForView('readiness').map((item) => item.id)).toEqual([
      'exports',
      'revisions',
      'blueprint-sheets',
      'factory-builder',
    ]);

    const primaryIds = new Set(primaryNavigationItems.map((item) => item.id));
    for (const viewId of ['board-settings', 'pcb-constraints', 'pcb-drc', 'bom', 'firmware-evidence', 'factory-qa']) {
      expect(primaryIds.has(viewId)).toBe(false);
      expect(getNavigationItem(viewId)).toBeDefined();
    }
  });

  it('maps historical and contextual view ids back to one owning workbench', () => {
    expect(getWorkbenchForView('power-tree')?.id).toBe('schematic');
    expect(getWorkbenchForView('pin-map')?.id).toBe('schematic');
    expect(getWorkbenchForView('board-studio')?.id).toBe('pcb');
    expect(getWorkbenchForView('pcb-drc')?.id).toBe('pcb');
    expect(getWorkbenchForView('state-machines')?.id).toBe('firmware');
    expect(getWorkbenchForView('factory-qa')?.id).toBe('validation');
    expect(getWorkbenchForView('factory-builder')?.id).toBe('release');
    expect(getWorkbenchForView('master')?.id).toBe('architecture');
  });

  it('keeps obsolete project-era destinations compatibility-only', () => {
    const compatibleIds = compatibleNavigationItems.map((item) => item.id);
    expect(compatibleIds).toEqual(expect.arrayContaining([
      'product-design',
      'master',
      'dossier',
      'electronics',
      'power-tree',
      'board-studio',
      'branches',
      'releases',
    ]));

    for (const id of compatibleIds) {
      expect(getNavigationItem(id)).toBeDefined();
      expect(primaryNavigationItems.some((item) => item.id === id)).toBe(false);
    }
  });

  it('classifies only explicit legacy system blueprint views as canvas layouts', () => {
    expect(isCanvasNavigationItem(getNavigationItem('blueprint-editor'))).toBe(true);
    expect(isCanvasNavigationItem(getNavigationItem('master'))).toBe(true);
    expect(isCanvasNavigationItem(getNavigationItem('dashboard'))).toBe(false);
  });

  it('returns no workbench or surface for an unknown view id', () => {
    expect(getNavigationItem('missing-workbench')).toBeUndefined();
    expect(getWorkbenchForView('missing-workbench')).toBeUndefined();
    expect(getContextualNavigationItemsForView('missing-workbench')).toEqual([]);
  });
});
