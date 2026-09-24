import type { ProductRequirement, Project } from '../../types';
import type { SourceIdentity } from '../../core/domain/provenance';
import {
  previewLegacyRequirementsAdoption,
  requirementCanonicalSnapshot,
  requirementSourceSnapshot,
  type LegacyRequirementProposal,
  type LegacyRequirementsAdoptionIssue,
} from './legacyRequirementsAdoption';

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
  sourceEntityId: string;
  canonicalEntityId?: string;
  sourceIdentity: SourceIdentity;
  previousSourceContentHash?: string;
  currentSourceContentHash?: string;
  sourceContentChanged: boolean;
  localSemanticChanged: boolean;
  sourceSemanticChanged: boolean;
  fieldDiffs: RequirementsReconciliationFieldDiff[];
  sourceIssues: LegacyRequirementsAdoptionIssue[];
  message: string;
  suppressed?: boolean;
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

type SemanticSnapshot = Record<string, string | number | boolean | null | undefined>;

const SOURCE_SYSTEM = 'hardware-studio-legacy-node-requirements';

function sourceKey(source: SourceIdentity): string {
  return [source.system, source.documentId || '', source.entityId].join('|');
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
  sourceBaseline: SemanticSnapshot,
  currentSource?: SemanticSnapshot,
): RequirementsReconciliationFieldDiff[] {
  const fields = new Set([
    ...Object.keys(canonicalBaseline),
    ...Object.keys(sourceBaseline),
    ...Object.keys(currentCanonical),
    ...Object.keys(currentSource || {}),
  ]);

  return [...fields]
    .sort()
    .map((field) => ({
      field,
      baseline: canonicalBaseline[field],
      baselineSource: sourceBaseline[field],
      currentCanonical: currentCanonical[field],
      currentSource: currentSource?.[field],
      localChanged: !equalValue(currentCanonical[field], canonicalBaseline[field]),
      sourceChanged: currentSource !== undefined
        && !equalValue(currentSource[field], sourceBaseline[field]),
    }));
}

function classify(
  sourceExists: boolean,
  canonicalExists: boolean,
  localChanged: boolean,
  sourceChanged: boolean,
  sourceContentChanged: boolean,
): RequirementsReconciliationClassification {
  if (!canonicalExists && sourceExists) return 'new-source';
  if (canonicalExists && !sourceExists) return 'source-deleted';
  if (localChanged && (sourceChanged || sourceContentChanged)) return 'conflict';
  if (localChanged) return 'local-only-change';
  if (sourceChanged || sourceContentChanged) return 'source-only-change';
  return 'unchanged';
}

function messageFor(
  classification: RequirementsReconciliationClassification,
  sourceEntityId: string,
): string {
  switch (classification) {
    case 'unchanged':
      return `Legacy requirement source "${sourceEntityId}" and its canonical requirement are unchanged since review.`;
    case 'source-only-change':
      return `Legacy requirement source "${sourceEntityId}" changed while the canonical requirement remained at its reviewed baseline.`;
    case 'local-only-change':
      return `The canonical requirement adopted from "${sourceEntityId}" changed locally while the legacy source remained at baseline.`;
    case 'conflict':
      return `Legacy requirement source "${sourceEntityId}" and its canonical requirement both changed and require explicit reconciliation.`;
    case 'source-deleted':
      return `Legacy requirement source "${sourceEntityId}" disappeared. Canonical deletion must not be inferred automatically.`;
    case 'new-source':
      return `Legacy requirement source "${sourceEntityId}" has no canonical requirement matched by preserved source identity.`;
  }
}

function buildCanonicalIndex(project: Project): Map<string, ProductRequirement[]> {
  const index = new Map<string, ProductRequirement[]>();

  for (const requirement of project.requirements || []) {
    const source = requirement.sourceIdentity;
    if (source?.system !== SOURCE_SYSTEM || source.documentId !== project.id) continue;
    const key = sourceKey(source);
    index.set(key, [...(index.get(key) || []), requirement]);
  }

  return index;
}

function sourceSnapshot(proposal: LegacyRequirementProposal): SemanticSnapshot {
  return requirementSourceSnapshot(proposal.proposedTitle, proposal.sourceDescription);
}

function matchedItem(
  canonical: ProductRequirement,
  proposal: LegacyRequirementProposal,
  issues: RequirementsReconciliationPreviewIssue[],
): RequirementsReconciliationItem {
  const baseline = canonical.reconciliationBaseline?.canonicalSnapshot;
  if (!baseline) {
    issues.push({
      code: 'missing-reconciliation-baseline',
      sourceEntityId: proposal.sourceNodeId,
      canonicalEntityId: canonical.id,
      message: `Canonical requirement "${canonical.id}" has source identity but no reconciliation baseline.`,
    });
  }

  const previousHash = canonical.reconciliationBaseline?.sourceContentHash;
  const currentHash = proposal.sourceIdentity.contentHash;
  if (!currentHash) {
    issues.push({
      code: 'source-fingerprint-missing',
      sourceEntityId: proposal.sourceNodeId,
      canonicalEntityId: canonical.id,
      message: `Legacy requirement source "${proposal.sourceNodeId}" is missing a source content fingerprint.`,
    });
  }

  const canonicalSnapshot = requirementCanonicalSnapshot(canonical);
  const currentSourceSnapshot = sourceSnapshot(proposal);
  const effectiveBaseline = baseline || canonicalSnapshot;
  const baselineSource = canonical.reconciliationBaseline?.sourceSnapshot || currentSourceSnapshot;
  const fieldDiffs = diffSnapshots(
    effectiveBaseline,
    canonicalSnapshot,
    baselineSource,
    currentSourceSnapshot,
  );

  const localSemanticChanged = fieldDiffs.some((diff) => diff.localChanged);
  const sourceSemanticChanged = fieldDiffs.some((diff) => diff.sourceChanged);
  const sourcePresenceChanged = canonical.reconciliationBaseline?.sourcePresence === 'deleted';
  const sourceContentChanged = sourcePresenceChanged
    || Boolean(previousHash && currentHash && previousHash !== currentHash);
  const classification = baseline
    ? classify(true, true, localSemanticChanged, sourceSemanticChanged, sourceContentChanged)
    : 'conflict';

  return {
    classification,
    sourceEntityId: proposal.sourceNodeId,
    canonicalEntityId: canonical.id,
    sourceIdentity: proposal.sourceIdentity,
    previousSourceContentHash: previousHash,
    currentSourceContentHash: currentHash,
    sourceContentChanged,
    localSemanticChanged,
    sourceSemanticChanged,
    fieldDiffs,
    sourceIssues: proposal.issues,
    message: messageFor(classification, proposal.sourceNodeId),
  };
}

function matchingSuppression(project: Project, source: SourceIdentity): boolean {
  const hash = source.contentHash;
  if (!hash) return false;
  return (project.requirementsReconciliationSuppressions || []).some((suppression) => (
    suppression.decision === 'reject-new-source'
    && sourceKey(suppression.sourceIdentity) === sourceKey(source)
    && suppression.sourceContentHash === hash
  ));
}

function newSourceItem(
  proposal: LegacyRequirementProposal,
  suppressed = false,
): RequirementsReconciliationItem {
  return {
    classification: suppressed ? 'unchanged' : 'new-source',
    sourceEntityId: proposal.sourceNodeId,
    sourceIdentity: proposal.sourceIdentity,
    currentSourceContentHash: proposal.sourceIdentity.contentHash,
    sourceContentChanged: !suppressed,
    localSemanticChanged: false,
    sourceSemanticChanged: !suppressed,
    fieldDiffs: [],
    sourceIssues: proposal.issues,
    message: suppressed
      ? `Legacy requirement source "${proposal.sourceNodeId}" was explicitly rejected at this exact source fingerprint and remains suppressed.`
      : messageFor('new-source', proposal.sourceNodeId),
    suppressed,
  };
}

function deletedItem(requirement: ProductRequirement): RequirementsReconciliationItem {
  const source = requirement.sourceIdentity!;
  const baseline = requirement.reconciliationBaseline?.canonicalSnapshot;
  const current = requirementCanonicalSnapshot(requirement);
  const baselineSource = requirement.reconciliationBaseline?.sourceSnapshot || {};
  const fieldDiffs = baseline
    ? diffSnapshots(baseline, current, baselineSource)
    : [];
  const localSemanticChanged = fieldDiffs.some((diff) => diff.localChanged);
  const deletionAlreadyReviewed = requirement.reconciliationBaseline?.sourcePresence === 'deleted';
  const classification: RequirementsReconciliationClassification = deletionAlreadyReviewed
    ? (localSemanticChanged ? 'local-only-change' : 'unchanged')
    : 'source-deleted';
  const sourceEntityId = source.entityId
    .replace(/^node:/, '')
    .replace(/:requirements$/, '');

  return {
    classification,
    sourceEntityId,
    canonicalEntityId: requirement.id,
    sourceIdentity: source,
    previousSourceContentHash: requirement.reconciliationBaseline?.sourceContentHash,
    sourceContentChanged: !deletionAlreadyReviewed,
    localSemanticChanged,
    sourceSemanticChanged: !deletionAlreadyReviewed,
    fieldDiffs,
    sourceIssues: [],
    message: deletionAlreadyReviewed
      ? localSemanticChanged
        ? `Canonical requirement retained after source deletion has changed locally since deletion review.`
        : `Source deletion for legacy requirement "${sourceEntityId}" was already reviewed and the retained canonical requirement is unchanged.`
      : messageFor('source-deleted', sourceEntityId),
  };
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

export async function previewLegacyRequirementsReconciliation(
  project: Project,
): Promise<RequirementsReconciliationPreview> {
  const sourcePreview = await previewLegacyRequirementsAdoption(project);
  const canonical = buildCanonicalIndex(project);
  const issues: RequirementsReconciliationPreviewIssue[] = [];
  const items: RequirementsReconciliationItem[] = [];
  const matchedCanonicalIds = new Set<string>();

  for (const proposal of sourcePreview.proposals) {
    const candidates = canonical.get(sourceKey(proposal.sourceIdentity)) || [];

    if (candidates.length > 1) {
      issues.push({
        code: 'duplicate-canonical-source-identity',
        sourceEntityId: proposal.sourceNodeId,
        message: `Multiple canonical requirements claim source identity "${proposal.sourceIdentity.entityId}".`,
      });
      for (const candidate of candidates) matchedCanonicalIds.add(candidate.id);
      items.push({
        ...newSourceItem(proposal),
        classification: 'conflict',
        message: `Legacy requirement source "${proposal.sourceNodeId}" matches multiple canonical requirements and requires integrity repair.`,
      });
      continue;
    }

    const canonicalRequirement = candidates[0];
    if (!canonicalRequirement) {
      items.push(newSourceItem(
        proposal,
        matchingSuppression(project, proposal.sourceIdentity),
      ));
      continue;
    }

    matchedCanonicalIds.add(canonicalRequirement.id);
    items.push(matchedItem(canonicalRequirement, proposal, issues));
  }

  for (const requirements of canonical.values()) {
    for (const requirement of requirements) {
      if (!matchedCanonicalIds.has(requirement.id)) {
        items.push(deletedItem(requirement));
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

export async function fingerprintLegacyRequirementsReconciliation(
  preview: RequirementsReconciliationPreview,
): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) throw new Error('SHA-256 is unavailable in this runtime');

  const payload = {
    projectId: preview.projectId,
    items: preview.items.map((item) => ({
      classification: item.classification,
      sourceEntityId: item.sourceEntityId,
      canonicalEntityId: item.canonicalEntityId,
      previousSourceContentHash: item.previousSourceContentHash,
      currentSourceContentHash: item.currentSourceContentHash,
      sourceContentChanged: item.sourceContentChanged,
      localSemanticChanged: item.localSemanticChanged,
      sourceSemanticChanged: item.sourceSemanticChanged,
      suppressed: item.suppressed === true,
      fieldDiffs: item.fieldDiffs,
      sourceIssueCodes: item.sourceIssues.map((issue) => issue.code).sort(),
    })),
    issueCodes: preview.issues.map((issue) => issue.code).sort(),
  };

  const digest = await subtle.digest(
    'SHA-256',
    new TextEncoder().encode(stableSerialize(payload)),
  );
  const hex = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  return `sha256:${hex}`;
}
