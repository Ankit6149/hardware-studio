import { describe, expect, it } from 'vitest';
import {
  canonicalizeStudioViewId,
  getStudioPathForView,
  getStudioViewForLegacyHash,
  getStudioViewForPath,
  isStudioPath,
} from '../lib/studioRoutes';

describe('Studio clean routes', () => {
  it('maps primary workbenches to stable human-readable paths', () => {
    expect(getStudioPathForView('dashboard')).toBe('/studio');
    expect(getStudioPathForView('requirements')).toBe('/studio/requirements');
    expect(getStudioPathForView('product-architecture')).toBe('/studio/architecture');
    expect(getStudioPathForView('component-library')).toBe('/studio/components');
    expect(getStudioPathForView('schematic-editor')).toBe('/studio/schematic');
    expect(getStudioPathForView('board-designer')).toBe('/studio/pcb');
    expect(getStudioPathForView('mechanical-studio')).toBe('/studio/mechanical');
    expect(getStudioPathForView('firmware-studio')).toBe('/studio/firmware');
    expect(getStudioPathForView('validation-studio')).toBe('/studio/validate');
    expect(getStudioPathForView('readiness')).toBe('/studio/release');
  });

  it('uses nested paths for contextual tools instead of hash fragments', () => {
    expect(getStudioPathForView('power-budget')).toBe('/studio/schematic/power');
    expect(getStudioPathForView('pin-map')).toBe('/studio/schematic/pins');
    expect(getStudioPathForView('board-settings')).toBe('/studio/pcb/setup');
    expect(getStudioPathForView('pcb-constraints')).toBe('/studio/pcb/rules');
    expect(getStudioPathForView('pcb-drc')).toBe('/studio/pcb/drc');
    expect(getStudioPathForView('bom')).toBe('/studio/pcb/bom');
    expect(getStudioPathForView('source-skeleton')).toBe('/studio/firmware/source');
    expect(getStudioPathForView('requirement-coverage')).toBe('/studio/validate/coverage');
    expect(getStudioPathForView('revisions')).toBe('/studio/release/revisions');
  });

  it('resolves direct and trailing-slash URLs back to the owning view', () => {
    expect(getStudioViewForPath('/studio')).toBe('dashboard');
    expect(getStudioViewForPath('/studio/pcb/drc')).toBe('pcb-drc');
    expect(getStudioViewForPath('/studio/firmware/source/')).toBe('source-skeleton');
    expect(getStudioViewForPath('/studio/release/outputs?from=home')).toBe('exports');
  });

  it('canonicalizes historical project view IDs without preserving legacy URLs', () => {
    expect(canonicalizeStudioViewId('power-tree')).toBe('power-budget');
    expect(canonicalizeStudioViewId('board-studio')).toBe('board-settings');
    expect(canonicalizeStudioViewId('master')).toBe('product-architecture');
    expect(getStudioPathForView('power-tree')).toBe('/studio/schematic/power');
    expect(getStudioPathForView('branches')).toBe('/studio/release/revisions');
  });

  it('accepts old hash links once so AppShell can replace them with clean paths', () => {
    expect(getStudioViewForLegacyHash('#pcb')).toBe('board-designer');
    expect(getStudioViewForLegacyHash('#pcb-drc')).toBe('pcb-drc');
    expect(getStudioViewForLegacyHash('#power-tree')).toBe('power-budget');
    expect(getStudioViewForLegacyHash('#source')).toBe('source-skeleton');
    expect(getStudioViewForLegacyHash('')).toBeUndefined();
  });

  it('distinguishes unknown nested Studio paths from routes outside Studio', () => {
    expect(isStudioPath('/studio/unknown')).toBe(true);
    expect(getStudioViewForPath('/studio/unknown')).toBeUndefined();
    expect(isStudioPath('/pricing')).toBe(false);
  });
});
