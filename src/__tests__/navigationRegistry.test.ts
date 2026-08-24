import { describe, expect, it } from 'vitest';
import {
  allNavigationItems,
  compatibleNavigationItems,
  getNavigationDomainForView,
  getNavigationItem,
  isCanvasNavigationItem,
  navigationDomains,
  visibleNavigationItems,
} from '../lib/navigationRegistry';

describe('navigation registry', () => {
  it('keeps every navigation id unique', () => {
    const ids = allNavigationItems.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('exposes one small stable V1 lifecycle', () => {
    expect(navigationDomains.map((domain) => domain.id)).toEqual([
      'overview',
      'product',
      'electronics',
      'mechanical',
      'firmware',
      'validation',
      'outputs',
    ]);

    expect(visibleNavigationItems.map((item) => item.id)).toEqual([
      'dashboard',
      'requirements',
      'product-architecture',
      'component-library',
      'schematic-editor',
      'board-designer',
      'bom',
      'mechanical-studio',
      'assembly-stack',
      'firmware-studio',
      'hardware-mapping',
      'source-skeleton',
      'validation-studio',
      'requirement-coverage',
      'readiness',
      'exports',
      'revisions',
    ]);

    for (const item of visibleNavigationItems) {
      expect(getNavigationItem(item.id)).toBe(item);
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.purpose.trim().length).toBeGreaterThan(20);
      expect(item.surface.trim().length).toBeGreaterThan(0);
      expect(['workspace', 'canvas']).toContain(item.layout);
    }
  });

  it('keeps supporting and legacy destinations compatibility-only', () => {
    const compatibleIds = compatibleNavigationItems.map((item) => item.id);
    expect(compatibleIds).toEqual(
      expect.arrayContaining([
        'product-design',
        'master',
        'dossier',
        'electronics',
        'power-tree',
        'pin-map',
        'board-settings',
        'pcb-constraints',
        'pcb-drc',
        'factory-qa',
        'factory-builder',
      ]),
    );

    for (const id of compatibleIds) {
      expect(getNavigationItem(id)).toBeDefined();
      expect(visibleNavigationItems.some((item) => item.id === id)).toBe(false);
    }
  });

  it('maps supporting Electronics and PCB tools back to one Electronics area', () => {
    expect(getNavigationDomainForView('component-library')?.id).toBe('electronics');
    expect(getNavigationDomainForView('board-designer')?.id).toBe('electronics');
    expect(getNavigationDomainForView('board-settings')?.id).toBe('electronics');
    expect(getNavigationDomainForView('pcb-drc')?.id).toBe('electronics');
    expect(getNavigationDomainForView('power-tree')?.id).toBe('electronics');
  });

  it('classifies only the explicit legacy system blueprint views as canvas layouts', () => {
    expect(isCanvasNavigationItem(getNavigationItem('blueprint-editor'))).toBe(true);
    expect(isCanvasNavigationItem(getNavigationItem('master'))).toBe(true);
    expect(isCanvasNavigationItem(getNavigationItem('dashboard'))).toBe(false);
  });

  it('returns no surface for an unknown view id', () => {
    expect(getNavigationItem('missing-workbench')).toBeUndefined();
    expect(isCanvasNavigationItem(getNavigationItem('missing-workbench'))).toBe(false);
  });
});
