import { describe, expect, it } from 'vitest';
import {
  createProductDesignDocument,
  createProductDesignLayer,
  createProductDesignObject,
  getProductDesignSelectionBounds,
  normalizeProductDesignDocument,
  snapProductDesignValue,
} from '../lib/product-design/model';

describe('Product Design document model', () => {
  it('creates a beginner-ready document with stable IDs and one usable layer', () => {
    const document = createProductDesignDocument('project-alpha', 'Portable device concept', 'mm');

    expect(document).toMatchObject({
      projectId: 'project-alpha',
      name: 'Portable device concept',
      units: 'mm',
      schemaVersion: 1,
      revision: 1,
      canvas: expect.objectContaining({ gridVisible: true, snapToGrid: true, gridSize: 10 }),
    });
    expect(document.id).toMatch(/^design_/);
    expect(document.layers).toHaveLength(1);
    expect(document.layers[0]).toMatchObject({ documentId: document.id, name: 'Concept', visible: true, locked: false });
  });

  it('creates truthful defaults for design objects and concept parts', () => {
    const document = createProductDesignDocument('project-alpha');
    const layerId = document.layers[0].id;
    const rectangle = createProductDesignObject(document, 'rectangle', layerId, 100, 120);
    const dimension = createProductDesignObject(document, 'dimension', layerId, 100, 280);
    const concept = createProductDesignObject(document, 'concept-part', layerId, 320, 120);

    expect(rectangle).toMatchObject({ type: 'rectangle', authority: 'concept', x: 100, y: 120 });
    expect(dimension).toMatchObject({ type: 'dimension', authority: 'intent', units: 'mm', suffix: ' intent' });
    expect(concept).toMatchObject({
      type: 'concept-part',
      authority: 'concept',
      material: 'Unspecified polymer',
      finish: 'Concept finish',
      sourceObjectIds: [],
    });
    expect(new Set([rectangle.id, dimension.id, concept.id]).size).toBe(3);
  });

  it('calculates selection bounds and grid snapping without persisting pointer frames', () => {
    const document = createProductDesignDocument('project-alpha');
    const layerId = document.layers[0].id;
    const first = { ...createProductDesignObject(document, 'rectangle', layerId, 20, 30), width: 100, height: 80 };
    const second = { ...createProductDesignObject(document, 'ellipse', layerId, 150, 100), width: 60, height: 40 };

    expect(getProductDesignSelectionBounds([first, second], [first.id, second.id])).toEqual({
      x: 20,
      y: 30,
      width: 190,
      height: 110,
    });
    expect(snapProductDesignValue(47, 10, true)).toBe(50);
    expect(snapProductDesignValue(47, 10, false)).toBe(47);
  });

  it('normalizes imported documents while preserving valid identities and repairing missing layer links', () => {
    const original = createProductDesignDocument('project-alpha', 'Imported concept');
    const secondLayer = createProductDesignLayer(original.id, 'Annotations', 1);
    const object = createProductDesignObject(original, 'note', 'missing-layer', 50, 60);

    const normalized = normalizeProductDesignDocument({
      ...original,
      layers: [original.layers[0], secondLayer],
      objects: [{ ...object, name: '', opacity: undefined }],
      schemaVersion: 99,
    });

    expect(normalized.id).toBe(original.id);
    expect(normalized.schemaVersion).toBe(1);
    expect(normalized.objects[0].id).toBe(object.id);
    expect(normalized.objects[0].layerId).toBe(original.layers[0].id);
    expect(normalized.objects[0].name).toContain('note');
    expect(normalized.objects[0].opacity).toBe(1);
  });
});
