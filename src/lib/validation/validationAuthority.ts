import type { Project, TestStage, ValidationTest } from '../../types';

export type ValidationAuthoritySource = 'canonical' | 'legacy-compatibility' | 'empty';

export interface ValidationTestProjection {
  id: string;
  name: string;
  stage?: 'EVT' | 'DVT' | 'PVT' | 'Factory QA';
  category?: string;
  status: string;
  passCriteria: string[];
  linkedRequirementIds: string[];
  evidenceCount: number;
  source: Exclude<ValidationAuthoritySource, 'empty'>;
  legacy?: {
    goal?: string;
    partsNeeded?: string;
    steps?: string;
    risks?: string;
    notes?: string;
    resultNotes?: string;
    evidenceLink?: string;
  };
}

export interface ValidationAuthorityProjection {
  source: ValidationAuthoritySource;
  tests: ValidationTestProjection[];
  canonicalTests: ValidationTest[];
  legacyStages: TestStage[];
}

function canonicalTestProjection(test: ValidationTest): ValidationTestProjection {
  return {
    id: test.id,
    name: test.name || test.testName || 'Unnamed validation test',
    stage: test.stage,
    category: test.category,
    status: test.status || 'Untested',
    passCriteria: test.passCriteria || [],
    linkedRequirementIds: test.linkedRequirementIds || [],
    evidenceCount: (test.evidence || []).length,
    source: 'canonical',
  };
}

function normalizeLegacyStage(stage: TestStage): ValidationTestProjection {
  const explicitStage = stage.stage;
  const category = stage.category?.trim();
  const inferredStage = explicitStage
    || (category === 'EVT' || category === 'DVT' || category === 'PVT' || category === 'Factory QA'
      ? category
      : undefined);

  return {
    id: stage.id,
    name: stage.name,
    stage: inferredStage,
    category,
    status: stage.status,
    passCriteria: stage.passCriteria?.trim() ? [stage.passCriteria.trim()] : [],
    linkedRequirementIds: stage.linkedRequirementIds || [],
    evidenceCount: stage.evidenceLink || stage.evidence ? 1 : 0,
    source: 'legacy-compatibility',
    legacy: {
      goal: stage.goal,
      partsNeeded: stage.partsNeeded,
      steps: stage.steps,
      risks: stage.risks,
      notes: stage.notes,
      resultNotes: stage.resultNotes,
      evidenceLink: stage.evidenceLink || stage.evidence,
    },
  };
}

/**
 * Validation definitions have one production read authority.
 *
 * Once canonical validationTests exist, legacy testing stages must not be merged
 * into the same logical test set. Legacy testing remains an explicit fallback
 * only for projects that have not yet adopted canonical validation definitions.
 */
export function resolveValidationAuthority(project: Project): ValidationAuthorityProjection {
  const canonicalTests = project.validationTests || [];
  const legacyStages = project.testing || [];

  if (canonicalTests.length > 0) {
    return {
      source: 'canonical',
      tests: canonicalTests.map(canonicalTestProjection),
      canonicalTests,
      legacyStages,
    };
  }

  if (legacyStages.length > 0) {
    return {
      source: 'legacy-compatibility',
      tests: legacyStages.map(normalizeLegacyStage),
      canonicalTests,
      legacyStages,
    };
  }

  return {
    source: 'empty',
    tests: [],
    canonicalTests,
    legacyStages,
  };
}

export function validationUsesLegacyCompatibility(project: Project): boolean {
  return resolveValidationAuthority(project).source === 'legacy-compatibility';
}
