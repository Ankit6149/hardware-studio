import type { PcbRule } from '../../types';

export interface PcbRoutingRuleSet {
  routeWidthMm: number | null;
  viaOuterDiameterMm: number | null;
  viaDrillDiameterMm: number | null;
  routeWidthRuleId: string | null;
  viaOuterDiameterRuleId: string | null;
  viaDrillDiameterRuleId: string | null;
  viaReady: boolean;
}

function normalizeRuleType(ruleType: string): string {
  return ruleType.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

function parsePositiveLengthMm(rule: PcbRule | undefined): number | null {
  if (!rule?.value || !rule.unit) return null;
  const value = Number.parseFloat(rule.value);
  if (!Number.isFinite(value) || value <= 0) return null;

  const unit = rule.unit.trim().toLowerCase().replace(/\s+/g, '');
  const factor = unit === 'mm' || unit === 'millimeter' || unit === 'millimeters'
    ? 1
    : unit === 'mil' || unit === 'mils'
      ? 0.0254
      : unit === 'in' || unit === 'inch' || unit === 'inches'
        ? 25.4
        : unit === 'um' || unit === 'µm' || unit === 'micrometer' || unit === 'micrometers'
          ? 0.001
          : null;

  if (factor == null) return null;
  return value * factor;
}

function isTraceWidthRule(rule: PcbRule): boolean {
  const type = normalizeRuleType(rule.ruleType);
  return (type.includes('trace') || type.includes('track')) && type.includes('width');
}

function isViaDrillRule(rule: PcbRule): boolean {
  const type = normalizeRuleType(rule.ruleType);
  return type.includes('via') && type.includes('drill');
}

function isViaOuterDiameterRule(rule: PcbRule): boolean {
  const type = normalizeRuleType(rule.ruleType);
  if (!type.includes('via') || type.includes('drill')) return false;
  return type.includes('outer diameter') || type.includes('pad diameter') || type.includes('diameter');
}

function resolveRule(
  rules: PcbRule[],
  boardId: string,
  predicate: (rule: PcbRule) => boolean,
): { rule: PcbRule | undefined; valueMm: number | null } {
  const boardRules = rules.filter((rule) => rule.boardId === boardId && predicate(rule));
  for (const rule of boardRules) {
    const valueMm = parsePositiveLengthMm(rule);
    if (valueMm != null) return { rule, valueMm };
  }
  return { rule: boardRules[0], valueMm: null };
}

export function resolvePcbRoutingRules(
  rules: PcbRule[] | undefined,
  boardId: string | null | undefined,
): PcbRoutingRuleSet {
  if (!boardId) {
    return {
      routeWidthMm: null,
      viaOuterDiameterMm: null,
      viaDrillDiameterMm: null,
      routeWidthRuleId: null,
      viaOuterDiameterRuleId: null,
      viaDrillDiameterRuleId: null,
      viaReady: false,
    };
  }

  const source = rules || [];
  const route = resolveRule(source, boardId, isTraceWidthRule);
  const viaOuter = resolveRule(source, boardId, isViaOuterDiameterRule);
  const viaDrill = resolveRule(source, boardId, isViaDrillRule);
  const viaReady = viaOuter.valueMm != null
    && viaDrill.valueMm != null
    && viaOuter.valueMm > viaDrill.valueMm;

  return {
    routeWidthMm: route.valueMm,
    viaOuterDiameterMm: viaOuter.valueMm,
    viaDrillDiameterMm: viaDrill.valueMm,
    routeWidthRuleId: route.rule?.id || null,
    viaOuterDiameterRuleId: viaOuter.rule?.id || null,
    viaDrillDiameterRuleId: viaDrill.rule?.id || null,
    viaReady,
  };
}
