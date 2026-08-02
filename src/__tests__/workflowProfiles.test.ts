import { describe, expect, it } from 'vitest';
import { navigationDomains } from '../lib/navigationRegistry';
import {
  createPreferenceFromProfile,
  deriveGuidedWorkflowActions,
  getHiddenDomainCount,
  getVisibleNavigationDomains,
  getWorkflowConnectionNotices,
  inferProfileId,
  normalizeWorkflowPreference,
  toggleWorkflowDomain,
  workflowProfiles,
  WORKFLOW_DOMAIN_IDS,
  type WorkflowProjectSnapshot,
} from '../lib/workflowProfiles';

const emptySnapshot: WorkflowProjectSnapshot = {
  requirements: 0,
  architectureNodes: 0,
  risks: 0,
  mechanicalObjects: 0,
  assemblyLayers: 0,
  components: 0,
  circuitBlocks: 0,
  nets: 0,
  boards: 0,
  traces: 0,
  firmwareModules: 0,
  firmwareStates: 0,
  validationTests: 0,
  validationRuns: 0,
  revisions: 0,
  factoryPackageStatus: 'Draft',
};

describe('adaptive workflow profiles', () => {
  it('ships unique bounded profiles and every configurable domain', () => {
    expect(new Set(workflowProfiles.map((profile) => profile.id)).size).toBe(workflowProfiles.length);
    expect(WORKFLOW_DOMAIN_IDS).toEqual([
      'product',
      'mechanical',
      'electronics',
      'pcb',
      'firmware',
      'validation',
      'outputs',
    ]);

    workflowProfiles.forEach((profile) => {
      expect(profile.name.trim(), profile.id).not.toBe('');
      expect(profile.summary.trim(), profile.id).not.toBe('');
      expect(profile.bestFor.trim(), profile.id).not.toBe('');
      expect(profile.enabledDomains.every((domainId) => WORKFLOW_DOMAIN_IDS.includes(domainId))).toBe(true);
    });
  });

  it('creates exact preferences from standard profiles and infers custom combinations', () => {
    const electronics = createPreferenceFromProfile('electronics-pcb');
    expect(electronics.enabledDomains).toEqual(['product', 'electronics', 'pcb', 'validation', 'outputs']);
    expect(inferProfileId(electronics.enabledDomains)).toBe('electronics-pcb');

    expect(inferProfileId(['mechanical', 'firmware'])).toBe('custom');
  });

  it('normalizes malformed storage without admitting unknown domains', () => {
    expect(normalizeWorkflowPreference(null).enabledDomains).toEqual([...WORKFLOW_DOMAIN_IDS]);

    const normalized = normalizeWorkflowPreference({
      version: 999,
      profileId: 'not-real',
      enabledDomains: ['pcb', 'pcb', 'unknown', 'firmware'],
      showAllDomains: 'yes',
      hasCompletedSetup: true,
    });

    expect(normalized).toEqual({
      version: 1,
      profileId: 'custom',
      enabledDomains: ['pcb', 'firmware'],
      showAllDomains: false,
      hasCompletedSetup: true,
    });
  });

  it('toggles domains in canonical order and reports the hidden count', () => {
    const withoutMechanical = toggleWorkflowDomain(WORKFLOW_DOMAIN_IDS, 'mechanical');
    expect(withoutMechanical).not.toContain('mechanical');
    expect(getHiddenDomainCount(withoutMechanical)).toBe(1);

    const restored = toggleWorkflowDomain(withoutMechanical, 'mechanical');
    expect(restored).toEqual([...WORKFLOW_DOMAIN_IDS]);
  });
});

describe('capability-based navigation', () => {
  it('always preserves Overview while filtering other domains', () => {
    const visible = getVisibleNavigationDomains(['electronics'], 'dashboard', false);
    expect(visible.map((domain) => domain.id)).toEqual(['overview', 'electronics']);
    expect(visible[0]).toEqual(navigationDomains[0]);
  });

  it('preserves a currently active hidden workbench until the user leaves it', () => {
    const visible = getVisibleNavigationDomains(['electronics'], 'mechanical-studio', false);
    expect(visible.map((domain) => domain.id)).toEqual(['overview', 'mechanical', 'electronics']);
  });

  it('returns the full registry only for temporary Show all', () => {
    const visible = getVisibleNavigationDomains([], 'dashboard', true);
    expect(visible).toEqual(navigationDomains);
  });
});

describe('truthful standalone guidance', () => {
  it('explains PCB and firmware limitations when electronics is hidden', () => {
    const notices = getWorkflowConnectionNotices(['pcb', 'firmware']);
    expect(notices.map((notice) => notice.id)).toEqual([
      'pcb-without-electronics',
      'firmware-without-electronics',
    ]);
  });

  it('describes useful mechanical and PCB connectivity without forcing a dependency', () => {
    const notices = getWorkflowConnectionNotices(['mechanical', 'pcb']);
    expect(notices.some((notice) => notice.id === 'pcb-without-electronics')).toBe(true);
    expect(notices.some((notice) => notice.id === 'mechanical-pcb-connected')).toBe(true);
  });

  it('does not invent warnings for a complete connected workflow', () => {
    expect(getWorkflowConnectionNotices(WORKFLOW_DOMAIN_IDS)).toEqual([
      expect.objectContaining({ id: 'mechanical-pcb-connected', tone: 'info' }),
    ]);
  });
});

describe('guided project actions', () => {
  it('derives exactly one honest action for each enabled domain', () => {
    const enabled = ['product', 'electronics', 'pcb', 'firmware', 'validation', 'outputs'] as const;
    const actions = deriveGuidedWorkflowActions(enabled, emptySnapshot);
    expect(actions.map((action) => action.domainId)).toEqual(enabled);
    expect(new Set(actions.map((action) => action.domainId)).size).toBe(enabled.length);
    expect(actions.every((action) => action.status === 'start')).toBe(true);
  });

  it('moves from creation to review based on actual project evidence', () => {
    const populated: WorkflowProjectSnapshot = {
      ...emptySnapshot,
      requirements: 5,
      architectureNodes: 8,
      components: 12,
      circuitBlocks: 4,
      nets: 18,
      boards: 1,
      traces: 30,
      firmwareModules: 6,
      firmwareStates: 4,
      validationTests: 9,
      validationRuns: 3,
      revisions: 2,
      factoryPackageStatus: 'Review',
    };

    const actions = deriveGuidedWorkflowActions(
      ['product', 'electronics', 'pcb', 'firmware', 'validation', 'outputs'],
      populated,
    );

    expect(actions.every((action) => action.status === 'review')).toBe(true);
    expect(actions.find((action) => action.domainId === 'pcb')?.viewId).toBe('pcb-constraints');
    expect(actions.find((action) => action.domainId === 'validation')?.viewId).toBe('requirement-coverage');
  });

  it('returns no domain action for an overview-only workspace', () => {
    expect(deriveGuidedWorkflowActions([], emptySnapshot)).toEqual([]);
  });
});
