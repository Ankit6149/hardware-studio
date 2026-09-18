import type { EntityId } from './identity';
import type { EngineeringProvenance } from './provenance';

export const REPRESENTATION_KINDS = [
  'architecture',
  'schematic',
  'pictorial',
  'footprint',
  'package',
  'render3d',
  'exact3d',
  'photo',
] as const;

export type RepresentationKind = (typeof REPRESENTATION_KINDS)[number];

export const REPRESENTATION_AVAILABILITY_STATES = [
  'available',
  'provisional',
  'unresolved',
  'unavailable',
] as const;

export type RepresentationAvailabilityState =
  (typeof REPRESENTATION_AVAILABILITY_STATES)[number];

export const REPRESENTATION_TRUST_LEVELS = [
  'semantic',
  'educational',
  'preview',
  'authoritative',
] as const;

export type RepresentationTrustLevel = (typeof REPRESENTATION_TRUST_LEVELS)[number];

export const REPRESENTATION_AUTHORITIES = [
  'semantic',
  'electrical-connectivity',
  'pcb-manufacturing',
  'mechanical-envelope',
  'exact-mechanical',
  'visualization',
  'educational',
  'reference',
] as const;

export type RepresentationAuthority = (typeof REPRESENTATION_AUTHORITIES)[number];

export interface RepresentationArtifactRef {
  artifactId: EntityId<'artifact'>;
  contentHash?: string;
  mediaType?: string;
}

export interface CanonicalRepresentation {
  id: EntityId<'representation'>;
  entityId: EntityId;
  kind: RepresentationKind;
  authority: RepresentationAuthority;
  availability: RepresentationAvailabilityState;
  provenance: EngineeringProvenance;
  artifact?: RepresentationArtifactRef;
  sourceRepresentationId?: EntityId<'representation'>;
  coordinateFrameId?: string;
  unitSystem?: string;
  note?: string;
}

export function isVisualizationOnlyRepresentation(
  representation: Pick<CanonicalRepresentation, 'kind' | 'authority'>,
): boolean {
  return (
    representation.kind === 'render3d' ||
    representation.kind === 'pictorial' ||
    representation.kind === 'photo' ||
    representation.authority === 'visualization' ||
    representation.authority === 'educational' ||
    representation.authority === 'reference'
  );
}

export function representationHasExactMechanicalAuthority(
  representation: Pick<CanonicalRepresentation, 'kind' | 'authority' | 'availability'>,
): boolean {
  return (
    representation.kind === 'exact3d' &&
    representation.authority === 'exact-mechanical' &&
    representation.availability === 'available'
  );
}
