import type {
  Project,
  ValidationReconciliationSuppression,
  ValidationTest,
} from '../../types';
import type { SourceIdentity } from '../../core/domain/provenance';
import {
  previewLegacyValidationAdoption,
  type LegacyValidationAdoptionIssue,
  type LegacyValidationTestProposal,
} from './legacyValidationAdoption';

export type ValidationReconciliationClassification =
  | 'unchanged'
  | 'source-only-change'
  | 'local-only-change'
  | 'conflict'
  | 'source-deleted'
  | 'new-source';

export interface ValidationReconciliationFieldDiff {
  field: string;
  baseline: string | number | boolean | null | undefined;
  baselineSource: string | number | boolean | null | undefined;
  currentCanonical: string | number | boolean | null | undefined;
  currentSource: string | number | boolean | null | undefined;
  localChanged: boolean;
  sourceChanged: boolean;
}

export interface ValidationReconciliationItem {
  classification: ValidationReconciliationClassification;
  sourceTestStageId: string;
  canonicalTestId?: string;
  sourceIdentity: SourceIdentity;
  previousSourceContentHash?: string;
  currentSourceContentHash?: string;
  sourceContentChanged: boolean;
  localSemanticChanged: boolean;
  sourceSemanticChanged: boolean;
  sourceSemanticsResolved: boolean;
  fieldDiffs: ValidationReconciliationFieldDiff[];
  sourceIssues: LegacyValidationAdoptionIssue[];
  message: string;
  suppressed?: boolean;
}

export interface ValidationReconciliationPreviewIssue {
  code:
    | 'duplicate-canonical-source-identity'
    | 'missing-reconciliation-baseline'
    | 'source-fingerprint-missing';
  sourceTestStageId?: string;
  canonicalTestId?: string;
  message: string;
}

export interface ValidationReconciliationPreview {
  projectId: string;
  sourceSystem: 'hardware-studio-legacy-testing';
  items: ValidationReconciliationItem[];
  issues: ValidationReconciliationPreviewIssue[];
  summary: Record<ValidationReconciliationClassification, number>;
  hasConflicts: boolean;
  mutationFree: true;
}

type SemanticSnapshot = Record<string, string | number | boolean | null | undefined>;

const SOURCE_SYSTEM = 'hardware-studio-legacy-testing';

function sourceKey(source: SourceIdentity): string {
  return [source.system, source.documentId || '', source.entityId].join('|');
}

function stableList(values: readonly string[] | undefined): string {
  return JSON.stringify(values || []);
}

function stableJson(value: unknown): string {
  return JSON.stringify(value ?? null);
}

function validationSnapshot(test: ValidationTest): SemanticSnapshot {
  return {
    name: test.name,
    testName: test.testName,
    stage: test.stage,
    category: test.category,
    status: test.status,
    linkedRequirementIds: stableList(test.linkedRequirementIds),
    linkedArchitectureNodeIds: stableList(test.linkedArchitectureNodeIds),
    linkedComponentIds: stableList(test.linkedComponentIds),
    linkedNetIds: stableList(test.linkedNetIds),
    linkedFirmwareModuleIds: stableList(test.linkedFirmwareModuleIds),
    passCriteria: stableList(test.passCriteria),
    steps: stableJson(test.steps),
    measurements: stableJson(test.measurements),
    evidence: stableJson(test.evidence),
    resultNotes: test.resultNotes,
  };
}

function equalValue(
  left: string | number | boolean | null | undefined,
  right: string | number | boolean | null | undefined,
): boolean {
  return Object.is(left, right);
}

function diffSnapshots(
  canonicalBaseline: SemanticSnapshot,
  currentCanonical: SemanticSnapshot,
  sourceBaseline: SemanticSnapshot = canonicalBaseline,
  currentSource?: SemanticSnapshot,
): ValidationReconciliationFieldDiff[] {
  const fields = new Set([
    ...Object.keys(canonicalBaseline),
    ...Object.keys(sourceBaseline),
    ...Object.keys(currentCanonical),
    ...Object.keys(currentSource || {}),
  ]);

  return [...fields]
    .sort()
    .map((field) => {
      const baseline = canonicalBaseline[field];
      const baselineSource = sourceBaseline[field];
      const currentCanonicalValue = currentCanonical[field];
      const currentSourceValue = currentSource?.[field];
      return {
        field,
        baseline,
        baselineSource,
        currentCanonical: currentCanonicalValue,
        currentSource: currentSourceValue,
        localChanged: !equalValue(currentCanonicalValue, baseline),
        sourceChanged: currentSource !== undefined && !equalValue(currentSourceValue, baselineSource),
      };
    });
}

function classify(
  sourceExists: boolean,
  canonicalExists: boolean,
  localSemanticChanged: boolean,
  sourceSemanticChanged: boolean,
  sourceContentChanged: boolean,
  sourceSemanticsResolved: boolean,
): ValidationReconciliationClassification {
  if (!canonicalExists && sourceExists) return 'new-source';
  if (canonicalExists && !sourceExists) return 'source-deleted';

  if (!sourceSemanticsResolved && sourceContentChanged) {
    return localSemanticChanged ? 'conflict' : 'source-only-change';
  }

  if (localSemanticChanged && (sourceSemanticChanged || sourceContentChanged)) {
    return 'conflict';
  }
  if (localSemanticChanged) return 'local-only-change';
  if (sourceSemanticChanged || sourceContentChanged) return 'source-only-change';
  return 'unchanged';
}

function message(
  classification: ValidationReconciliationClassification,
  sourceTestStageId: string,
): string {
  switch (classification) {
    case 'unchanged':
      return `Legacy validation stage "${sourceTestStageId}" and its canonical validation test are unchanged since review.`;
    case 'source-only-change':
      return `Legacy validation stage "${sourceTestStageId}" changed while canonical validation semantics stayed at their reviewed baseline.`;
    case 'local-only-change':
      return `Canonical validation test adopted from "${sourceTestStageId}" changed locally while the source stayed at baseline.`;
    case 'conflict':
      return `Legacy validation stage "${sourceTestStageId}" and its canonical validation test both changed and require explicit reconciliation.`;
    case 'source-deleted':
      return `Legacy validation stage "${sourceTestStageId}" no longer exists. Canonical deletion must not be inferred automatically.`;
    case 'new-source':
      return `Legacy validation stage "${sourceTestStageId}" has no canonical test matched by preserved source identity and is a new adoption candidate.`;
  }
}

function canonicalIndex(project: Project): Map<string, ValidationTest[]> {
  const map = new Map<string, ValidationTest[]>();
  for (const test of project.validationTests || []) {
    const source = test.sourceIdentity;
    if (
      !source
      || source.system !== SOURCE_SYSTEM
      || source.documentId !== project.id
    ) {
      continue;
    }

    const key = sourceKey(source);
    map.set(key, [...(map.get(key) || []), test]);
  }
  return map;
}

function matchingSuppression(
  project: Project,
  source: SourceIdentity,
): boolean {
  const hash = source.contentHash;
  if (!hash) return false;
  return (project.validationReconciliationSuppressions || []).some(
    (suppression: ValidationReconciliationSuppression) => (
      suppression.decision === 'reject-new-source'
      && sourceKey(suppression.sourceIdentity) === sourceKey(source)
      && suppression.sourceContentHash === hash
    ),
  );
}

function matchedItem(
  canonical: ValidationTest,
  proposal: LegacyValidationTestProposal,
  issues: ValidationReconciliationPreviewIssue[],
): ValidationReconciliationItem {
  const baseline = canonical.reconciliationBaseline?.canonicalSnapshot;
  if (!baseline) {
    issues.push({
      code: 'missing-reconciliation-baseline',
      sourceTestStageId: proposal.sourceTestStageId,
      canonicalTestId: canonical.id,
      message: `Canonical validation test "${canonical.id}" has source identity but no reconciliation baseline.`,
    });
  }

  const previousHash = canonical.reconciliationBaseline?.sourceContentHash;
  const currentHash = proposal.sourceIdentity.contentHash;
  if (!currentHash) {
    issues.push({
      code: 'source-fingerprint-missing',
      sourceTestStageId: proposal.sourceTestStageId,
      canonicalTestId: canonical.id,
      message: `Current legacy validation stage "${proposal.sourceTestStageId}" is missing a source content fingerprint.`,
    });
  }

  const canonicalSnapshot = validationSnapshot(canonical);
  const sourceSnapshot = proposal.proposed
    ? validationSnapshot(proposal.proposed)
    : undefined;
  const effectiveBaseline = baseline || canonicalSnapshot;
  const sourceBaseline = canonical.reconciliationBaseline?.sourceSnapshot || effectiveBaseline;
  const fieldDiffs = diffSnapshots(
    effectiveBaseline,
    canonicalSnapshot,
    sourceBaseline,
    sourceSnapshot,
  );

  const localSemanticChanged = fieldDiffs.some((diff) => diff.localChanged);
  const sourceSemanticChanged = fieldDiffs.some((diff) => diff.sourceChanged);
  const sourcePresenceChanged = canonical.reconciliationBaseline?.sourcePresence === 'deleted';
  const sourceContentChanged = sourcePresenceChanged
    || Boolean(previousHash && currentHash && previousHash !== currentHash);
  const sourceSemanticsResolved = Boolean(sourceSnapshot);
  const classification = baseline
    ? classify(
        true,
        true,
        localSemanticChanged,
        sourceSemanticChanged,
        sourceContentChanged,
        sourceSemanticsResolved,
      )
    : 'conflict';

  return {
    classification,
    sourceTestStageId: proposal.sourceTestStageId,
    canonicalTestId: canonical.id,
    sourceIdentity: proposal.sourceIdentity,
    previousSourceContentHash: previousHash,
    currentSourceContentHash: currentHash,
    sourceContentChanged,
    localSemanticChanged,
    sourceSemanticChanged,
    sourceSemanticsResolved,
    fieldDiffs,
    sourceIssues: proposal.issues,
    message: message(classification, proposal.sourceTestStageId),
  };
}

function newSourceItem(
  proposal: LegacyValidationTestProposal,
  suppressed: boolean,
): ValidationReconciliationItem {
  return {
    classification: suppressed ? 'unchanged' : 'new-source',
    sourceTestStageId: proposal.sourceTestStageId,
    sourceIdentity: proposal.sourceIdentity,
    currentSourceContentHash: proposal.sourceIdentity.contentHash,
    sourceContentChanged: !suppressed,
    localSemanticChanged: false,
    sourceSemanticChanged: !suppressed && Boolean(proposal.proposed),
    sourceSemanticsResolved: Boolean(proposal.proposed),
    fieldDiffs: [],
    sourceIssues: proposal.issues,
    message: suppressed
      ? `New legacy validation stage "${proposal.sourceTestStageId}" was explicitly rejected at this exact source fingerprint and remains unchanged.`
      : message('new-source', proposal.sourceTestStageId),
    suppressed,
  };
}

function sourceDeletedItem(test: ValidationTest): ValidationReconciliationItem {
  const source = test.sourceIdentity!;
  const baseline = test.reconciliationBaseline?.canonicalSnapshot;
  const current = validationSnapshot(test);
  const sourceBaseline = test.reconciliationBaseline?.sourceSnapshot || baseline || current;
  const fieldDiffs = baseline
    ? diffSnapshots(baseline, current, sourceBaseline)
    : [];
  const localSemanticChanged = fieldDiffs.some((diff) => diff.localChanged);
  const deletionAlreadyReviewed = test.reconciliationBaseline?.sourcePresence === 'deleted';
  const classification: ValidationReconciliationClassification = deletionAlreadyReviewed
    ? (localSemanticChanged ? 'local-only-change' : 'unchanged')
    : 'source-deleted';
  const sourceTestStageId = source.entityId.replace(/^test-stage:/, '');

  return {
    classification,
    sourceTestStageId,
    canonicalTestId: test.id,
    sourceIdentity: source,
    previousSourceContentHash: test.reconciliationBaseline?.sourceContentHash,
    sourceContentChanged: !deletionAlreadyReviewed,
    localSemanticChanged,
    sourceSemanticChanged: !deletionAlreadyReviewed,
    sourceSemanticsResolved: false,
    fieldDiffs,
    sourceIssues: [],
    message: deletionAlreadyReviewed
      ? localSemanticChanged
        ? 'Canonical validation test retained after source deletion has changed locally since deletion review.'
        : `Source deletion for legacy validation stage "${sourceTestStageId}" was already reviewed and the retained canonical test is unchanged.`
      : message('source-deleted', sourceTestStageId),
  };
}

function emptySummary(): Record<ValidationReconciliationClassification, number> {
  return {
    unchanged: 0,
    'source-only-change': 0,
    'local-only-change': 0,
    conflict: 0,
    'source-deleted': 0,
    'new-source': 0,
  };
}

export async function previewLegacyValidationReconciliation(
  project: Project,
): Promise<ValidationReconciliationPreview> {
  const sourcePreview = await previewLegacyValidationAdoption(project);
  const canonical = canonicalIndex(project);
  const issues: ValidationReconciliationPreviewIssue[] = [];
  const items: ValidationReconciliationItem[] = [];
  const matchedCanonicalIds = new Set<string>();

  for (const proposal of sourcePreview.testProposals) {
    const candidates = canonical.get(sourceKey(proposal.sourceIdentity)) || [];

    if (candidates.length > 1) {
      issues.push({
        code: 'duplicate-canonical-source-identity',
        sourceTestStageId: proposal.sourceTestStageId,
        message: `Multiple canonical validation tests claim source identity "${proposal.sourceIdentity.entityId}".`,
      });
      for (const candidate of candidates) matchedCanonicalIds.add(candidate.id);
      items.push({
        ...newSourceItem(proposal, false),
        classification: 'conflict',
        message: `Legacy validation stage "${proposal.sourceTestStageId}" matches multiple canonical tests by source identity and requires integrity repair.`,
      });
      continue;
    }

    const canonicalTest = candidates[0];
    if (!canonicalTest) {
      items.push(newSourceItem(
        proposal,
        matchingSuppression(project, proposal.sourceIdentity),
      ));
      continue;
    }

    matchedCanonicalIds.add(canonicalTest.id);
    items.push(matchedItem(canonicalTest, proposal, issues));
  }

  for (const tests of canonical.values()) {
    for (const test of tests) {
      if (!matchedCanonicalIds.has(test.id)) {
        items.push(sourceDeletedItem(test));
      }
    }
  }

  const summary = emptySummary();
  for (const item of items) summary[item.classification] += 1;

  return {
    projectId: project.id,
    sourceSystem: SOURCE_SYSTEM,
    items,
    issues,
    summary,
    hasConflicts: summary.conflict > 0,
    mutationFree: true,
  };
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`)
    .join(',')}}`;
}

export async function fingerprintLegacyValidationReconciliation(
  preview: ValidationReconciliationPreview,
): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('SHA-256 is unavailable in this runtime');

  const payload = {
    projectId: preview.projectId,
    items: preview.items.map((item) => ({
      classification: item.classification,
      sourceTestStageId: item.sourceTestStageId,
      canonicalTestId: item.canonicalTestId,
      previousSourceContentHash: item.previousSourceContentHash,
      currentSourceContentHash: item.currentSourceContentHash,
      sourceContentChanged: item.sourceContentChanged,
      localSemanticChanged: item.localSemanticChanged,
      sourceSemanticChanged: item.sourceSemanticChanged,
      sourceSemanticsResolved: item.sourceSemanticsResolved,
      suppressed: item.suppressed === true,
      fieldDiffs: item.fieldDiffs,
      sourceIssueCodes: item.sourceIssues.map((issue) => issue.code).sort(),
    })),
    issueCodes: preview.issues.map((issue) => issue.code).sort(),
  };

  const bytes = new TextEncoder().encode(stableSerialize(payload));
  const digest = await subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hex}`;
}
