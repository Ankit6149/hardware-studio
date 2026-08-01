import { describe, expect, it } from 'vitest';
import {
  allNavigationItems,
  compatibleNavigationItems,
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

  it('gives every visible destination a complete readable contract', () => {
    expect(navigationDomains.map((domain) => domain.id)).toEqual([
      'overview',
      'product',
      'mechanical',
      'electronics',
      'pcb',
      'firmware',
      'validation',
      'outputs',
    ]);

    for (const item of visibleNavigationItems) {
      expect(getNavigationItem(item.id)).toBe(item);
      expect(item.label.trim().length).toBeGreaterThan(0);
      expect(item.purpose.trim().length).toBeGreaterThan(20);
      expect(item.surface.trim().length).toBeGreaterThan(0);
      expect(['workspace', 'canvas']).toContain(item.layout);
    }
  });

  it('keeps known saved-project ids explicit without exposing them twice', () => {
    const compatibleIds = compatibleNavigationItems.map((item) => item.id);
    expect(compatibleIds).toEqual(
      expect.arrayContaining(['master', 'dossier', 'electronics', 'power-budget', 'board-studio', 'board-components']),
    );

    for (const id of compatibleIds) {
      expect(getNavigationItem(id)).toBeDefined();
      expect(visibleNavigationItems.some((item) => item.id === id)).toBe(false);
    }
  });

  it('classifies only the explicit system blueprint views as canvas layouts', () => {
    expect(isCanvasNavigationItem(getNavigationItem('blueprint-editor'))).toBe(true);
    expect(isCanvasNavigationItem(getNavigationItem('master'))).toBe(true);
    expect(isCanvasNavigationItem(getNavigationItem('dashboard'))).toBe(false);
  });

  it('returns no surface for an unknown view id', () => {
    expect(getNavigationItem('missing-workbench')).toBeUndefined();
    expect(isCanvasNavigationItem(getNavigationItem('missing-workbench'))).toBe(false);
  });
});
