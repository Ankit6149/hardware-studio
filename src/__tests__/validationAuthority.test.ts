import { describe, expect, it } from 'vitest';
import type { Project, TestStage, ValidationTest } from '../types';
import {
  resolveValidationAuthority,
  validationUsesLegacyCompatibility,
} from '../lib/validation/validationAuthority';
import { calculateReadinessScore } from '../lib/readinessScore';
import { generateEditorLayouts } from '../lib/editorLayoutGenerators';
import { runDesignReview } from '../lib/designReview';
import { exportTestingPlanJson } from '../lib/nativeExports';
import { exportBlueprintSheetsJson } from '../lib/exportBlueprintSheets';

function legacyTest(
  id: string,
  name: string,
  status: TestStage['status'],
): TestStage {
  return {
    id,
    name,
    goal: 'Legacy goal',
    partsNeeded: '',
    steps: 'Legacy steps',
    passCriteria: 'Legacy criteria',
    risks: '',
    status,
    notes: '',
    category: 'EVT',
    stage: 'EVT',
    linkedRequirementIds: [],
  };
}

function canonicalTest(
  id: string,
  name: string,
  status: ValidationTest['status'],
): ValidationTest {
  return {
    id,
    name,
    stage: 'DVT',
    category: 'Electrical',
    linkedRequirementIds: ['req-1'],
    steps: [],
    measurements: [],
    passCriteria: ['Canonical criteria'],
    status,
    evidence: [],
  };
}

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: 'validation-authority-project',
    projectName: 'Validation Authority Fixture',
    description: '',
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    version: '1',
    schemaVersion: 6,
    activeView: 'validation',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    requirements: [],
    architectureNodes: [],
    architectureConnections: [],
    validationTests: [],
    validationRuns: [],
    boards: [],
    boardComponents: [],
    nets: [],
    pcbConstraints: [],
    manufacturingChecklist: [],
    mechanicalZones: [],
    assemblyLayers: [],
    schematicSymbols: [],
    schematicConnections: [],
    schematicWires: [],
    pcbLayers: [],
    copperShapes: [],
    traces: [],
    vias: [],
    drillHoles: [],
    boardOutlines: [],
    pcbRules: [],
    padNetAssignments: [],
    keepoutZones: [],
    reviewResults: [],
    exportHistory: [],
    mechanicalObjects: [],
    mechanicalDimensions: [],
    mechanicalBodies: [],
    firmwareModules: [],
    firmwareStates: [],
    firmwareTransitions: [],
    ...overrides,
  } as Project;
}

describe('validation read authority', () => {
  it('prefers canonical validation tests when legacy stages contradict them', () => {
    const source = project({
      testing: [legacyTest('legacy-pass', 'Legacy passed test', 'Passed')],
      validationTests: [canonicalTest('canonical-fail', 'Canonical failed test', 'Failed')],
    });

    const authority = resolveValidationAuthority(source);

    expect(authority.source).toBe('canonical');
    expect(authority.tests).toHaveLength(1);
    expect(authority.tests[0]).toMatchObject({
      id: 'canonical-fail',
      name: 'Canonical failed test',
      stage: 'DVT',
      status: 'Failed',
      source: 'canonical',
      passCriteria: ['Canonical criteria'],
    });
    expect(validationUsesLegacyCompatibility(source)).toBe(false);
  });

  it('uses legacy testing only as an explicit fallback when canonical tests are absent', () => {
    const source = project({
      testing: [legacyTest('legacy-1', 'Legacy EVT', 'In Progress')],
    });

    const authority = resolveValidationAuthority(source);

    expect(authority.source).toBe('legacy-compatibility');
    expect(authority.tests[0]).toMatchObject({
      id: 'legacy-1',
      name: 'Legacy EVT',
      stage: 'EVT',
      status: 'In Progress',
      source: 'legacy-compatibility',
      passCriteria: ['Legacy criteria'],
    });
    expect(validationUsesLegacyCompatibility(source)).toBe(true);
  });

  it('does not let a passed legacy stage hide a failed canonical test in readiness', () => {
    const report = calculateReadinessScore(project({
      testing: [legacyTest('legacy-pass', 'Legacy pass', 'Passed')],
      validationTests: [canonicalTest('canonical-fail', 'Canonical fail', 'Failed')],
    }));

    expect(report.blockers).toContain('1 test procedures failed.');
    expect(report.categories.testing).toBe(60);
  });

  it('does not let a failed legacy stage poison readiness when canonical validation passes', () => {
    const report = calculateReadinessScore(project({
      testing: [legacyTest('legacy-fail', 'Legacy fail', 'Failed')],
      validationTests: [canonicalTest('canonical-pass', 'Canonical pass', 'Passed')],
    }));

    expect(report.blockers).not.toContain('1 test procedures failed.');
    expect(report.categories.testing).toBe(100);
  });

  it('projects canonical tests into the testing layout and records authority source', () => {
    const { layouts } = generateEditorLayouts(project({
      testing: [legacyTest('legacy-1', 'Legacy EVT', 'Passed')],
      validationTests: [canonicalTest('canonical-1', 'Canonical DVT', 'In Progress')],
    }));

    const cards = (layouts.testing || []).filter((item) => item.sourceType === 'test');
    expect(cards).toHaveLength(1);
    expect(cards[0]).toMatchObject({
      sourceId: 'canonical-1',
      label: 'Canonical DVT',
      metadata: {
        status: 'In Progress',
        criteria: 'Canonical criteria',
        authoritySource: 'canonical',
      },
    });
  });

  it('design review recognizes canonical validation even when legacy testing is empty', () => {
    const results = runDesignReview(project({
      testing: [],
      validationTests: [canonicalTest('canonical-1', 'Canonical DVT', 'Not Started')],
    }));

    expect(results.some((result) => result.id === 'rev_test_empty')).toBe(false);
  });

  it('testing-plan export exposes one authority and does not present legacy data as equal truth', () => {
    const payload = JSON.parse(exportTestingPlanJson(project({
      testing: [legacyTest('legacy-1', 'Legacy EVT', 'Passed')],
      validationTests: [canonicalTest('canonical-1', 'Canonical DVT', 'Passed')],
    })));

    expect(payload.authoritySource).toBe('canonical');
    expect(payload.tests.map((test: { id: string }) => test.id)).toEqual(['canonical-1']);
    expect(payload.canonicalValidationTests.map((test: { id: string }) => test.id)).toEqual(['canonical-1']);
    expect(payload.legacyCompatibilityTesting).toEqual([]);
  });

  it('blueprint-sheet export uses canonical validation counts and cards', () => {
    const payload = JSON.parse(exportBlueprintSheetsJson(project({
      testing: [
        legacyTest('legacy-1', 'Legacy EVT', 'Passed'),
        legacyTest('legacy-2', 'Legacy PVT', 'Passed'),
      ],
      validationTests: [canonicalTest('canonical-1', 'Canonical DVT', 'In Progress')],
    })));

    const cover = payload.sheets.find((sheet: { sheetNum: number }) => sheet.sheetNum === 1);
    const validation = payload.sheets.find((sheet: { sheetNum: number }) => sheet.sheetNum === 14);

    expect(cover.stats.testStagesCount).toBe(1);
    expect(validation.authoritySource).toBe('canonical');
    expect(validation.tests).toEqual([
      expect.objectContaining({
        name: 'Canonical DVT',
        stage: 'DVT',
        status: 'In Progress',
      }),
    ]);
  });

  it('returns an explicitly empty authority when neither model has tests', () => {
    expect(resolveValidationAuthority(project())).toMatchObject({
      source: 'empty',
      tests: [],
    });
  });
});
