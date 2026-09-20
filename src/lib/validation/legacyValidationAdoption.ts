import type { Project, TestStage, ValidationTest } from '../../types';
import { deriveEntityId, type EntityId } from '../../core/domain/identity';
import type { SourceIdentity } from '../../core/domain/provenance';

export type LegacyValidationAdoptionIssueSeverity = 'blocker' | 'warning' | 'info';

export type LegacyValidationAdoptionIssueCode =
  | 'canonical-validation-already-present'
  | 'legacy-validation-empty'
  | 'legacy-test-name-missing'
  | 'legacy-steps-unstructured'
  | 'legacy-evidence-unstructured'
  | 'legacy-enrichment-unmapped'
  | 'legacy-block-links-unresolved'
  | 'legacy-order-display-only';

export interface LegacyValidationAdoptionIssue {
  code: LegacyValidationAdoptionIssueCode;
  severity: LegacyValidationAdoptionIssueSeverity;
  sourceEntityId?: string;
  message: string;
  resolution?: string;
}

export interface LegacyValidationTestProposal {
  sourceTestStageId: string;
  canonicalId: EntityId<'validation-test'>;
  sourceIdentity: SourceIdentity;
  canAdopt: boolean;
  proposed?: ValidationTest;
  issues: LegacyValidationAdoptionIssue[];
}

export interface LegacyValidationAdoptionPreview {
  adoptionSessionId: EntityId<'adoption-session'>;
  sourceSystem: 'hardware-studio-legacy-testing';
  canonicalStatePresent: boolean;
  canApplyWithoutResolution: boolean;
  testProposals: LegacyValidationTestProposal[];
  issues: LegacyValidationAdoptionIssue[];
}

const ADAPTER_ID = 'legacy-validation-adoption';
const ADAPTER_VERSION = '1';

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(',')}}`;
}

async function sha256ContentHash(value: unknown): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('SHA-256 is unavailable in this runtime');

  const bytes = new TextEncoder().encode(stableSerialize(value));
  const digest = await subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return `sha256:${hex}`;
}

function sourceIdentity(
  project: Project,
  stage: TestStage,
  contentHash: string,
): SourceIdentity {
  return {
    system: 'hardware-studio-legacy-testing',
    documentId: project.id,
    entityId: `test-stage:${stage.id}`,
    revision: project.version,
    contentHash,
    adapterId: ADAPTER_ID,
    adapterVersion: ADAPTER_VERSION,
  };
}

function inferredStage(stage: TestStage): ValidationTest['stage'] {
  if (stage.stage) return stage.stage;

  const category = stage.category?.trim();
  switch (category) {
    case 'EVT':
    case 'DVT':
    case 'PVT':
    case 'Factory QA':
      return category;
    default:
      return undefined;
  }
}

function canonicalCategory(stage: TestStage): string | undefined {
  const category = stage.category?.trim();
  if (!category) return undefined;
  return inferredStage(stage) === category ? undefined : category;
}

function hasUnmappedEnrichment(stage: TestStage): boolean {
  return Boolean(
    stage.goal?.trim()
    || stage.partsNeeded?.trim()
    || stage.risks?.trim()
    || stage.notes?.trim(),
  );
}

async function previewTestStage(
  project: Project,
  stage: TestStage,
): Promise<LegacyValidationTestProposal> {
  const issues: LegacyValidationAdoptionIssue[] = [];
  const canonicalId = await deriveEntityId(
    'validation-test',
    project.id,
    `legacy-validation-test:${stage.id}`,
  );
  const contentHash = await sha256ContentHash(stage);

  const name = stage.name?.trim() || '';
  if (!name) {
    issues.push({
      code: 'legacy-test-name-missing',
      severity: 'blocker',
      sourceEntityId: stage.id,
      message: `Legacy test stage "${stage.id}" has no usable test name.`,
      resolution: 'Provide an explicit validation test name before adoption.',
    });
  }

  if (stage.steps?.trim()) {
    issues.push({
      code: 'legacy-steps-unstructured',
      severity: 'warning',
      sourceEntityId: stage.id,
      message: 'Legacy free-text steps are preserved as source context but are not promoted into structured validation steps automatically.',
      resolution: 'Review and split the procedure into ordered steps with explicit expected results.',
    });
  }

  if (stage.evidenceLink?.trim() || stage.evidence?.trim()) {
    issues.push({
      code: 'legacy-evidence-unstructured',
      severity: 'warning',
      sourceEntityId: stage.id,
      message: 'Legacy evidence text/link is not promoted into canonical evidence because evidence type, creation time, and qualification are not fully known.',
      resolution: 'Attach or classify the evidence explicitly during validation adoption/review.',
    });
  }

  if (hasUnmappedEnrichment(stage)) {
    issues.push({
      code: 'legacy-enrichment-unmapped',
      severity: 'warning',
      sourceEntityId: stage.id,
      message: 'Legacy goal, parts-needed, risks, or notes do not have equivalent canonical ValidationTest fields and are not silently embedded.',
      resolution: 'Preserve these as reviewed notes/artifacts or map them into the appropriate product entities later.',
    });
  }

  if ((stage.linkedBlocks || []).length > 0) {
    issues.push({
      code: 'legacy-block-links-unresolved',
      severity: 'warning',
      sourceEntityId: stage.id,
      message: 'Legacy block links are not promoted into canonical architecture-node links because legacy block identity may not equal canonical architecture identity.',
      resolution: 'Resolve links through canonical source identity during reviewed adoption.',
    });
  }

  if (stage.order !== undefined) {
    issues.push({
      code: 'legacy-order-display-only',
      severity: 'info',
      sourceEntityId: stage.id,
      message: 'Legacy test ordering is treated as display/workflow metadata and is not engineering test semantics.',
    });
  }

  const hasBlocker = issues.some((issue) => issue.severity === 'blocker');
  const proposed = !hasBlocker && name
    ? {
        id: canonicalId,
        name,
        stage: inferredStage(stage),
        category: canonicalCategory(stage),
        linkedRequirementIds: [...(stage.linkedRequirementIds || [])],
        linkedArchitectureNodeIds: [],
        linkedComponentIds: [...(stage.linkedComponentIds || [])],
        linkedNetIds: [...(stage.linkedNetIds || [])],
        linkedFirmwareModuleIds: [...(stage.linkedFirmwareModuleIds || [])],
        steps: [],
        measurements: [],
        passCriteria: stage.passCriteria?.trim() ? [stage.passCriteria.trim()] : [],
        status: stage.status,
        evidence: [],
        resultNotes: stage.resultNotes?.trim() || undefined,
      } satisfies ValidationTest
    : undefined;

  return {
    sourceTestStageId: stage.id,
    canonicalId,
    sourceIdentity: sourceIdentity(project, stage, contentHash),
    canAdopt: Boolean(proposed),
    proposed,
    issues,
  };
}

export async function previewLegacyValidationAdoption(
  project: Project,
): Promise<LegacyValidationAdoptionPreview> {
  const adoptionSessionId = await deriveEntityId(
    'adoption-session',
    project.id,
    'legacy-validation-adoption:v1',
  );

  const canonicalStatePresent = (project.validationTests?.length || 0) > 0;
  const issues: LegacyValidationAdoptionIssue[] = [];

  if (canonicalStatePresent) {
    issues.push({
      code: 'canonical-validation-already-present',
      severity: 'blocker',
      message: 'Canonical validation tests already exist. Legacy testing requires reconciliation instead of one-way adoption.',
      resolution: 'Compare source identities and reviewed canonical tests before applying any legacy changes.',
    });
  }

  const legacyStages = project.testing || [];
  if (legacyStages.length === 0) {
    issues.push({
      code: 'legacy-validation-empty',
      severity: 'blocker',
      message: 'No legacy testing stages are available for validation adoption.',
    });
  }

  const testProposals = await Promise.all(
    legacyStages.map((stage) => previewTestStage(project, stage)),
  );
  const allIssues = [
    ...issues,
    ...testProposals.flatMap((proposal) => proposal.issues),
  ];

  return {
    adoptionSessionId,
    sourceSystem: 'hardware-studio-legacy-testing',
    canonicalStatePresent,
    canApplyWithoutResolution: !canonicalStatePresent
      && testProposals.length > 0
      && testProposals.every((proposal) => proposal.canAdopt)
      && allIssues.every((issue) => issue.severity !== 'blocker'),
    testProposals,
    issues: allIssues,
  };
}
