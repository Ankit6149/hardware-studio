import { describe, expect, it } from 'vitest';
import {
  asEntityId,
  createEntityId,
  deriveEntityId,
  isEntityId,
  isIndependentlyQualified,
  isVisualizationOnlyRepresentation,
  parseEntityId,
  representationHasExactMechanicalAuthority,
  validateEngineeringProvenance,
  validateSourceIdentity,
  type CanonicalRepresentation,
  type EngineeringProvenance,
  type SourceIdentity,
} from '../core/domain';

describe('canonical domain semantics', () => {
  it('creates typed secure entity IDs and rejects legacy timestamp/random shapes', () => {
    const componentId = createEntityId('component');

    expect(isEntityId(componentId, 'component')).toBe(true);
    expect(isEntityId(componentId, 'board')).toBe(false);
    expect(parseEntityId(componentId)?.type).toBe('component');
    expect(() => asEntityId('component_1720000000_abc', 'component')).toThrow();
  });

  it('derives stable migration/import IDs from explicit namespace and source identity', async () => {
    const first = await deriveEntityId('component', 'kicad:9', 'project-a:/U3');
    const second = await deriveEntityId('component', 'kicad:9', 'project-a:/U3');
    const differentSource = await deriveEntityId('component', 'kicad:9', 'project-a:/U4');
    const differentType = await deriveEntityId('representation', 'kicad:9', 'project-a:/U3');

    expect(first).toBe(second);
    expect(first).not.toBe(differentSource);
    expect(first).not.toBe(differentType);
    expect(isEntityId(first, 'component')).toBe(true);
  });

  it('requires stable source identity and normalized sha256 hashes', () => {
    const valid: SourceIdentity = {
      system: 'kicad',
      documentId: 'main.kicad_pcb',
      entityId: 'footprint:U3',
      revision: 'git:abc123',
      contentHash: `sha256:${'a'.repeat(64)}`,
      adapterId: 'kicad-v1',
      adapterVersion: '0.1.0',
    };

    expect(validateSourceIdentity(valid)).toEqual([]);
    expect(validateSourceIdentity({ ...valid, contentHash: 'abc123' })).toEqual([
      expect.objectContaining({ code: 'invalid-content-hash' }),
    ]);
    expect(validateSourceIdentity({ ...valid, system: '', entityId: '' }).map((issue) => issue.code))
      .toEqual(['missing-source-system', 'missing-source-entity']);
  });

  it('prevents generated proposals from self-promoting into qualified engineering truth', () => {
    const invalid: EngineeringProvenance = {
      origin: 'generated-proposal',
      qualification: 'independently-qualified',
      recordedAt: '2026-09-18T00:00:00.000Z',
    };

    expect(validateEngineeringProvenance(invalid)).toEqual([
      expect.objectContaining({ code: 'generated-proposal-overqualified' }),
    ]);
    expect(isIndependentlyQualified(invalid)).toBe(false);

    const qualified: EngineeringProvenance = {
      origin: 'imported',
      qualification: 'independently-qualified',
      recordedAt: '2026-09-18T00:00:00.000Z',
      source: {
        system: 'manufacturer',
        entityId: 'BME280-step-rev-3',
      },
    };

    expect(validateEngineeringProvenance(qualified)).toEqual([]);
    expect(isIndependentlyQualified(qualified)).toBe(true);
  });

  it('keeps visual meshes separate from exact mechanical authority', () => {
    const entityId = createEntityId('component');

    const render: CanonicalRepresentation = {
      id: createEntityId('representation'),
      entityId,
      kind: 'render3d',
      authority: 'visualization',
      availability: 'available',
      provenance: {
        origin: 'derived',
        qualification: 'provisional',
        recordedAt: '2026-09-18T00:00:00.000Z',
      },
    };

    const exact: CanonicalRepresentation = {
      id: createEntityId('representation'),
      entityId,
      kind: 'exact3d',
      authority: 'exact-mechanical',
      availability: 'available',
      provenance: {
        origin: 'imported',
        qualification: 'independently-qualified',
        recordedAt: '2026-09-18T00:00:00.000Z',
      },
    };

    expect(isVisualizationOnlyRepresentation(render)).toBe(true);
    expect(representationHasExactMechanicalAuthority(render)).toBe(false);
    expect(isVisualizationOnlyRepresentation(exact)).toBe(false);
    expect(representationHasExactMechanicalAuthority(exact)).toBe(true);
  });
});
