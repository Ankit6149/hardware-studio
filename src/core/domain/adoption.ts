import {
  isEntityId,
  type EntityId,
  type EntityType,
} from './identity';
import type { SourceIdentity } from './provenance';

export interface CanonicalSourceMapping {
  id: EntityId<'source-mapping'>;
  adoptionSessionId: EntityId<'adoption-session'>;
  canonicalEntityId: EntityId;
  canonicalEntityType: EntityType;
  source: SourceIdentity;
  recordedAt: string;
}

export interface SourceMappingValidationIssue {
  code:
    | 'invalid-mapping-id'
    | 'invalid-adoption-session-id'
    | 'invalid-canonical-entity-id'
    | 'canonical-entity-type-mismatch'
    | 'missing-source-system'
    | 'missing-source-entity'
    | 'invalid-recorded-at';
  message: string;
}

export function sourceIdentityKey(source: SourceIdentity): string {
  return [
    source.system.trim(),
    source.documentId?.trim() || '',
    source.entityId.trim(),
  ].join('::');
}

export function validateCanonicalSourceMapping(
  mapping: CanonicalSourceMapping,
): SourceMappingValidationIssue[] {
  const issues: SourceMappingValidationIssue[] = [];

  if (!isEntityId(mapping.id, 'source-mapping')) {
    issues.push({
      code: 'invalid-mapping-id',
      message: 'Source mapping requires a typed source-mapping entity ID.',
    });
  }

  if (!isEntityId(mapping.adoptionSessionId, 'adoption-session')) {
    issues.push({
      code: 'invalid-adoption-session-id',
      message: 'Source mapping requires a typed adoption-session ID.',
    });
  }

  if (!isEntityId(mapping.canonicalEntityId)) {
    issues.push({
      code: 'invalid-canonical-entity-id',
      message: 'Source mapping canonical entity ID is not a valid Hardware Studio entity ID.',
    });
  } else if (!isEntityId(mapping.canonicalEntityId, mapping.canonicalEntityType)) {
    issues.push({
      code: 'canonical-entity-type-mismatch',
      message: `Canonical entity ID does not match declared type "${mapping.canonicalEntityType}".`,
    });
  }

  if (!mapping.source.system.trim()) {
    issues.push({
      code: 'missing-source-system',
      message: 'Source mapping requires a source system.',
    });
  }

  if (!mapping.source.entityId.trim()) {
    issues.push({
      code: 'missing-source-entity',
      message: 'Source mapping requires a source entity ID.',
    });
  }

  if (!Number.isFinite(Date.parse(mapping.recordedAt))) {
    issues.push({
      code: 'invalid-recorded-at',
      message: 'Source mapping recordedAt must be an ISO-compatible timestamp.',
    });
  }

  return issues;
}

export function findSourceMapping(
  mappings: readonly CanonicalSourceMapping[],
  source: SourceIdentity,
): CanonicalSourceMapping | undefined {
  const key = sourceIdentityKey(source);
  return mappings.find((mapping) => sourceIdentityKey(mapping.source) === key);
}
