import type { EntityId } from './identity';

export const KNOWLEDGE_ORIGINS = [
  'user-authored',
  'imported',
  'observed',
  'derived',
  'generated-proposal',
] as const;

export type KnowledgeOrigin = (typeof KNOWLEDGE_ORIGINS)[number];

export const QUALIFICATION_STATES = [
  'unresolved',
  'provisional',
  'implemented',
  'verified',
  'independently-qualified',
  'released',
  'stale',
  'blocked',
  'unsupported',
  'superseded',
] as const;

export type QualificationState = (typeof QUALIFICATION_STATES)[number];

export type Sha256ContentHash = `sha256:${string}`;

export interface SourceIdentity {
  system: string;
  documentId?: string;
  entityId: string;
  revision?: string;
  contentHash?: Sha256ContentHash;
  adapterId?: string;
  adapterVersion?: string;
}

export interface EngineeringProvenance {
  origin: KnowledgeOrigin;
  qualification: QualificationState;
  recordedAt: string;
  source?: SourceIdentity;
  derivedFrom?: EntityId[];
  actorId?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  note?: string;
}

export interface ProvenanceValidationIssue {
  code:
    | 'missing-source'
    | 'missing-source-system'
    | 'missing-source-entity'
    | 'invalid-content-hash'
    | 'generated-proposal-overqualified'
    | 'review-time-without-reviewer'
    | 'reviewer-without-review-time';
  message: string;
}

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/;

export function validateSourceIdentity(source: SourceIdentity): ProvenanceValidationIssue[] {
  const issues: ProvenanceValidationIssue[] = [];

  if (!source.system.trim()) {
    issues.push({
      code: 'missing-source-system',
      message: 'Source identity requires a non-empty system/tool identifier.',
    });
  }

  if (!source.entityId.trim()) {
    issues.push({
      code: 'missing-source-entity',
      message: 'Source identity requires a non-empty source entity identifier.',
    });
  }

  if (source.contentHash && !SHA256_PATTERN.test(source.contentHash)) {
    issues.push({
      code: 'invalid-content-hash',
      message: 'Source content hashes must use lowercase sha256:<64 hex characters> format.',
    });
  }

  return issues;
}

export function validateEngineeringProvenance(
  provenance: EngineeringProvenance,
): ProvenanceValidationIssue[] {
  const issues = provenance.source ? validateSourceIdentity(provenance.source) : [];

  if ((provenance.origin === 'imported' || provenance.origin === 'observed') && !provenance.source) {
    issues.push({
      code: 'missing-source',
      message: `${provenance.origin} engineering knowledge requires an explicit source identity.`,
    });
  }

  if (
    provenance.origin === 'generated-proposal' &&
    ['verified', 'independently-qualified', 'released'].includes(provenance.qualification)
  ) {
    issues.push({
      code: 'generated-proposal-overqualified',
      message: 'Generated proposals cannot directly become verified, independently qualified, or released engineering truth.',
    });
  }

  if (provenance.reviewedAt && !provenance.reviewedBy) {
    issues.push({
      code: 'review-time-without-reviewer',
      message: 'A review timestamp requires a reviewer identity.',
    });
  }

  if (provenance.reviewedBy && !provenance.reviewedAt) {
    issues.push({
      code: 'reviewer-without-review-time',
      message: 'A reviewer identity requires a review timestamp.',
    });
  }

  return issues;
}

export function isIndependentlyQualified(provenance: EngineeringProvenance): boolean {
  if (provenance.origin === 'generated-proposal') return false;
  return provenance.qualification === 'independently-qualified' || provenance.qualification === 'released';
}
