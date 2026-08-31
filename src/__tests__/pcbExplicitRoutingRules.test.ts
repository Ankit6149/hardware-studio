import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolvePcbRoutingRules } from '../lib/pcb/pcbRuleResolution';
import type { PcbRule } from '../types';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

function rule(overrides: Partial<PcbRule> & Pick<PcbRule, 'id' | 'ruleType'>): PcbRule {
  return {
    boardId: 'board-a',
    value: '0.2',
    unit: 'mm',
    ...overrides,
  };
}

describe('explicit PCB routing rules', () => {
  it('resolves only explicit board-scoped positive physical dimensions', () => {
    const rules: PcbRule[] = [
      rule({ id: 'other-width', boardId: 'board-b', ruleType: 'Trace Width', value: '9', unit: 'mm' }),
      rule({ id: 'width', ruleType: 'Trace Width', value: '8', unit: 'mil' }),
      rule({ id: 'via-outer', ruleType: 'Via Outer Diameter', value: '0.6', unit: 'mm' }),
      rule({ id: 'via-drill', ruleType: 'Via Drill Diameter', value: '0.3', unit: 'mm' }),
    ];

    const resolved = resolvePcbRoutingRules(rules, 'board-a');
    expect(resolved.routeWidthMm).toBeCloseTo(0.2032, 6);
    expect(resolved.viaOuterDiameterMm).toBe(0.6);
    expect(resolved.viaDrillDiameterMm).toBe(0.3);
    expect(resolved.viaReady).toBe(true);
    expect(resolved.routeWidthRuleId).toBe('width');
  });

  it('keeps missing, invalid-unit, and physically impossible rules unresolved', () => {
    expect(resolvePcbRoutingRules([], 'board-a')).toMatchObject({
      routeWidthMm: null,
      viaOuterDiameterMm: null,
      viaDrillDiameterMm: null,
      viaReady: false,
    });

    const invalid = resolvePcbRoutingRules([
      rule({ id: 'width', ruleType: 'Track Width', value: '12', unit: '' }),
      rule({ id: 'via-outer', ruleType: 'Via Diameter', value: '0.25', unit: 'mm' }),
      rule({ id: 'via-drill', ruleType: 'Via Drill', value: '0.3', unit: 'mm' }),
    ], 'board-a');

    expect(invalid.routeWidthMm).toBeNull();
    expect(invalid.viaReady).toBe(false);
  });

  it('does not infer engineering dimensions from net display names or hidden editor constants', () => {
    const canvas = source('../components/board/BoardCanvas.tsx');
    const workbench = source('../components/board/EngineeringBoardWorkbench.tsx');
    const routing = source('../lib/pcb/pcbRoutingEngine.ts');

    expect(canvas).not.toContain("selectedNetName.toLowerCase().includes('gnd')");
    expect(canvas).not.toContain("selectedNetName.toLowerCase().includes('vbat')");
    expect(canvas).not.toContain('drillDiameter: 0.3');
    expect(canvas).not.toContain('outerDiameter: 0.6');
    expect(canvas).not.toContain('maxX: 50, maxY: 30');
    expect(workbench).not.toContain('configuredRouteWidth || 0.25');
    expect(workbench).not.toContain('selectedTrace.width || 0.25');
    expect(workbench).not.toContain('selectedVia.outerDiameter || 0.6');
    expect(workbench).not.toContain('selectedVia.drillDiameter || 0.3');
    expect(routing).not.toContain('trace.width || 0.25');
    expect(routing).not.toContain('via.outerDiameter || 0.6');
  });
});
