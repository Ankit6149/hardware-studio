import type {
  ProductRequirement,
  Project,
  RequirementReconciliationSuppression,
} from '../../types';
import type { SourceIdentity } from '../../core/domain/provenance';
import {
  previewLegacyRequirementsAdoption,
  type LegacyRequirementProposal,
  type LegacyRequirementsAdoptionIssue,
} from './legacyRequirementsAdoption';
import {
  requirementSnapshot,
  requirementSourceSnapshot,
} from './legacyRequirementsAdoptionApply';

export type RequirementsReconciliationClassification =
  | 'unchanged'
  | 'source-only-change'
  | 'local-only-change'
  | 'conflict'
  | 'source-deleted'
  | 'new-source';

export interface RequirementsReconciliationFieldDiff {
  field: string;
  baseline: string | number | boolean | null | undefined;
  baselineSource: string | number | boolean | null | undefined;
  currentCanonical: string | number | boolean | null | undefined;
  currentSource: string | number | boolean | null | undefined;
  localChanged: boolean;
  sourceChanged: boolean;
}

export interface RequirementsReconciliationItem {
  classification: RequirementsReconciliationClassification;
  sourceNodeId: string;
  canonicalRequirementId?: string;
  sourceIdentity: SourceIdentity;
  previousSourceContentHash?: string;
  currentSourceContentHash?: string;
  sourceContentChanged: boolean;
  localSemanticChanged: boolean;
  sourceSemanticChanged: boolean;
  sourceSemanticsResolved: boolean;
  fieldDiffs: RequirementsReconciliationFieldDiff[];
  sourceIssues: LegacyRequirementsAdoptionIssue[];
  message: string;
}

export interface RequirementsReconciliationPreviewIssue {
  code:
    | 'duplicate-canonical-source-identity'
    | 'missing-reconciliation-baseline'
    | 'source-fingerprint-missing';
  sourceEntityId?: string;
  canonicalEntityId?: string;
  message: string;
}

export interface RequirementsReconciliationPreview {
  projectId: string;
  sourceSystem: 'hardware-studio-legacy-node-requirements';
  items: RequirementsReconciliationItem[];
  issues: RequirementsReconciliationPreviewIssue[];
  summary: Record<RequirementsReconciliationClassification, number>;
  hasConflicts: boolean;
  mutationFree: true;
}

const SOURCE_SYSTEM = 'hardware-studio-legacy-node-requirements';

function sourceKey(source: SourceIdentity): string {
  return [source.system, source.documentId || '', source.entityId].join('|');
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

function equalSnapshot(
  a: Record<string, string | number | boolean | null | undefined> | undefined,
  b: Record<string, string | number | boolean | null | undefined> | undefined,
): boolean {
  return stableSerialize(a || {}) === stableSerialize(b || {});
}

function sourceNodeIdFromIdentity(source: SourceIdentity): string {
  return source.entityId.startsWith('node-requirements:')
    ? source.entityId.slice('node-requirements:'.length)
    : source.entityId;
}

function sourceProposalMap(proposals: readonly LegacyRequirementProposal[]) {
  return new Map(proposals.map((proposal) => [sourceKey(proposal.sourceIdentity), proposal]));
}

function exactSuppressionExists(
  suppressions: readonly RequirementReconciliationSuppression[],
  proposal: LegacyRequirementProposal,
): boolean {
  const hash = proposal.sourceIdentity.contentHash;
  if (!hash) return false;
  return suppressions.some((suppression) => (
    sourceKey(suppression.sourceIdentity) === sourceKey(proposal.sourceIdentity)
    && suppression.sourceContentHash === hash
    && suppression.decision === 'reject-new-source'
  ));
}

function fieldDiffs(
  requirement: ProductRequirement,
  proposal: LegacyRequirementProposal | undefined,
): RequirementsReconciliationFieldDiff[] {
  const baseline = requirement.reconciliationBaseline?.canonicalSnapshot || {};
  const baselineSource = requirement.reconciliationBaseline?.sourceSnapshot || {};
  const currentCanonical = requirementSnapshot(requirement);
  const currentSource = proposal ? requirementSourceSnapshot(proposal) : {};

  return ['title', 'description'].map((field) => ({
    field,
    baseline: baseline[field],
    baselineSource: baselineSource[field],
    currentCanonical: currentCanonical[field],
    currentSource: currentSource[field],
    localChanged: currentCanonical[field] !== baseline[field],
    sourceChanged: currentSource[field] !== baselineSource[field],
  }));
}

function emptySummary(): Record<RequirementsReconciliationClassification, number> {
  return {
    unchanged: 0,
    'source-only-change': 0,
    'local-only-change': 0,
    conflict: 0,
    'source-deleted': 0,
    'new-source': 0,
  };
}

function classifyExisting(
  localChanged: boolean,
  sourceChanged: boolean,
  sourceExists: boolean,
): RequirementsReconciliationClassification {
  if (!sourceExists) return 'source-deleted';
  if (localChanged && sourceChanged) return 'conflict';
  if (sourceChanged) return 'source-only-change';
  if (localChanged) return 'local-only-change';
  return 'unchanged';
}

export async function previewLegacyRequirementsReconciliation(
  project: Project,
): Promise<RequirementsReconciliationPreview> {
  const sourcePreview = await previewLegacyRequirementsAdoption(project);
  const proposalsBySource = sourceProposalMap(sourcePreview.requirementProposals);
  const issues: RequirementsReconciliationPreviewIssue[] = [];
  const items: RequirementsReconciliationItem[] = [];
  const canonical = (project.requirements || []).filter(
    (requirement) => requirement.sourceIdentity?.system === SOURCE_SYSTEM,
  );

  const canonicalBySource = new Map<string, ProductRequirement[]>();
  for (const requirement of canonical) {
    const source = requirement.sourceIdentity!;
    const key = sourceKey(source);
    canonicalBySource.set(key, [...(canonicalBySource.get(key) || []), requirement]);
  }

  for (const [key, matches] of canonicalBySource.entries()) {
    if (matches.length > 1) {
      issues.push({
        code: 'duplicate-canonical-source-identity',
        sourceEntityId: key,
        message: 'Multiple canonical requirements claim the same legacy source identity. Reconciliation is blocked until identity ownership is repaired.',
      });
    }
  }

  for (const requirement of canonical) {
    const source = requirement.sourceIdentity!;
    const proposal = proposalsBySource.get(sourceKey(source));
    const baseline = requirement.reconciliationBaseline;

    if (!baseline) {
      issues.push({
        code: 'missing-reconciliation-baseline',
        sourceEntityId: source.entityId,
        canonicalEntityId: requirement.id,
        message: `Canonical requirement "${requirement.id}" has legacy source identity but no reconciliation baseline.`,
      });
    }

    if (!source.contentHash && !baseline?.sourceContentHash) {
      issues.push({
        code: 'source-fingerprint-missing',
        sourceEntityId: source.entityId,
        canonicalEntityId: requirement.id,
        message: 'Requirements reconciliation requires an adoption-time source fingerprint.',
      });
    }

    const currentCanonicalSnapshot = requirementSnapshot(requirement);
    const baselineCanonicalSnapshot = baseline?.canonicalSnapshot;
    const currentSourceSnapshot = proposal ? requirementSourceSnapshot(proposal) : undefined;
    const baselineSourceSnapshot = baseline?.sourceSnapshot;

    const localSemanticChanged = baselineCanonicalSnapshot
      ? !equalSnapshot(currentCanonicalSnapshot, baselineCanonicalSnapshot)
      : true;
    const sourceSemanticChanged = proposal
      ? baselineSourceSnapshot
        ? !equalSnapshot(currentSourceSnapshot, baselineSourceSnapshot)
        : proposal.sourceIdentity.contentHash !== baseline?.sourceContentHash
      : true;
    const sourceContentChanged = proposal
      ? proposal.sourceIdentity.contentHash !== baseline?.sourceContentHash
      : true;
    const classification = classifyExisting(
      localSemanticChanged,
      sourceSemanticChanged,
      Boolean(proposal),
    );

    items.push({
      classification,
      sourceNodeId: proposal?.sourceNodeId || sourceNodeIdFromIdentity(source),
      canonicalRequirementId: requirement.id,
      sourceIdentity: proposal?.sourceIdentity || source,
      previousSourceContentHash: baseline?.sourceContentHash || source.contentHash,
      currentSourceContentHash: proposal?.sourceIdentity.contentHash,
      sourceContentChanged,
      localSemanticChanged,
      sourceSemanticChanged,
      sourceSemanticsResolved: Boolean(proposal?.sourceValues.title.trim() && proposal.sourceValues.description.trim()),
      fieldDiffs: fieldDiffs(requirement, proposal),
      sourceIssues: proposal?.issues || [],
      message: classification === 'source-deleted'
        ? 'The legacy requirement note no longer exists. Canonical state is preserved until an explicit reviewed decision.'
        : classification === 'conflict'
          ? 'Both the reviewed canonical requirement and its legacy source changed since the baseline.'
          : classification === 'source-only-change'
            ? 'The legacy requirement note changed while reviewed canonical semantics remained at baseline.'
            : classification === 'local-only-change'
              ? 'The reviewed canonical requirement changed while the legacy source remained at baseline.'
              : 'Legacy source and reviewed canonical requirement match their reconciliation baseline.',
    });
  }

  for (const proposal of sourcePreview.requirementProposals) {
    const key = sourceKey(proposal.sourceIdentity);
    if (canonicalBySource.has(key)) continue;
    if (exactSuppressionExists(project.requirementReconciliationSuppressions || [], proposal)) continue;

    if (!proposal.sourceIdentity.contentHash) {
      issues.push({
        code: 'source-fingerprint-missing',
        sourceEntityId: proposal.sourceNodeId,
        message: 'A new legacy requirement source has no deterministic content fingerprint.',
      });
    }

    items.push({
      classification: 'new-source',
      sourceNodeId: proposal.sourceNodeId,
      sourceIdentity: proposal.sourceIdentity,
      currentSourceContentHash: proposal.sourceIdentity.contentHash,
      sourceContentChanged: true,
      localSemanticChanged: false,
      sourceSemanticChanged: true,
      sourceSemanticsResolved: Boolean(proposal.sourceValues.title.trim() && proposal.sourceValues.description.trim()),
      fieldDiffs: [],
      sourceIssues: proposal.issues,
      message: 'A new legacy requirement note has no canonical requirement with the same preserved source identity.',
    });
  }

  const summary = emptySummary();
  for (const item of items) summary[item.classification] += 1;

  return {
    projectId: project.id,
    sourceSystem: SOURCE_SYSTEM,
    items,
    issues,
    summary,
    hasConflicts: items.some((item) => item.classification === 'conflict'),
    mutationFree: true,
  };
}

export async function fingerprintLegacyRequirementsReconciliation(
  preview: RequirementsReconciliationPreview,
): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('SHA-256 is unavailable in this runtime');
  const bytes = new TextEncoder().encode(stableSerialize(preview));
  const digest = await subtle.digest('SHA-256', bytes);
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hex}`;
}
