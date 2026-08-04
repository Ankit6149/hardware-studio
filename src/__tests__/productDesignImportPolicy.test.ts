import { describe, expect, it } from 'vitest';
import {
  createProductDesignDocument,
  createProductDesignId,
  createProductDesignObject,
} from '../lib/product-design/model';
import { prepareProductDesignImport } from '../lib/product-design/importPolicy';
import type { ProductDesignExportBundle } from '../lib/product-design/types';

function exportedBundle(): ProductDesignExportBundle {
  const document = createProductDesignDocument('source-project', 'Wearable concept');
  const layerId = document.layers[0].id;
  const rectangle = createProductDesignObject(document, 'rectangle', layerId, 80, 90);
  const reference = {
    ...createProductDesignObject(document, 'reference-image', layerId, 260, 90),
    assetId: createProductDesignId('asset'),
  };
  const concept = {
    ...createProductDesignObject(document, 'concept-part', layerId, 80, 260),
    sourceObjectIds: [rectangle.id, reference.id],
  };
  document.objects = [rectangle, reference, concept];

  return {
    format: 'hardware-studio-product-design',
    version: 1,
    exportedAt: new Date().toISOString(),
    document,
    assets: [{
      id: reference.assetId,
      documentId: document.id,
      fileName: 'reference.png',
      mimeType: 'image/png',
      size: 4,
      sourceUrl: '',
      attribution: 'User supplied',
      license: 'User owned',
      altText: 'Reference',
      createdAt: new Date().toISOString(),
      dataUrl: 'data:image/png;base64,AQIDBA==',
    }],
    checkpoints: [{
      id: createProductDesignId('checkpoint'),
      documentId: document.id,
      name: 'First direction',
      description: '',
      createdAt: new Date().toISOString(),
      document,
    }],
  };
}

describe('Product Design import policy', () => {
  it('preserves original document and object identities in an empty target project', () => {
    const bundle = exportedBundle();
    const plan = prepareProductDesignImport(
      JSON.stringify(bundle),
      [],
      bundle.document.projectId,
    );
    const imported = JSON.parse(plan.serializedBundle) as ProductDesignExportBundle;

    expect(plan.mode).toBe('preserve-identities');
    expect(imported.document.id).toBe(bundle.document.id);
    expect(imported.document.objects.map((object) => object.id)).toEqual(
      bundle.document.objects.map((object) => object.id),
    );
  });

  it('creates a fully remapped copy instead of overwriting an existing document', () => {
    const bundle = exportedBundle();
    const plan = prepareProductDesignImport(
      JSON.stringify(bundle),
      [bundle.document],
      'target-project',
    );
    const imported = JSON.parse(plan.serializedBundle) as ProductDesignExportBundle;
    const oldObjectIds = new Set(bundle.document.objects.map((object) => object.id));
    const newObjectIds = new Set(imported.document.objects.map((object) => object.id));
    const importedReference = imported.document.objects.find((object) => object.type === 'reference-image');
    const importedConcept = imported.document.objects.find((object) => object.type === 'concept-part');

    expect(plan.mode).toBe('create-conflict-safe-copy');
    expect(imported.document.id).not.toBe(bundle.document.id);
    expect(imported.document.projectId).toBe('target-project');
    expect(imported.document.name).toContain('imported copy');
    expect([...newObjectIds].every((id) => !oldObjectIds.has(id))).toBe(true);
    expect(imported.document.layers[0].id).not.toBe(bundle.document.layers[0].id);

    expect(importedReference?.type).toBe('reference-image');
    if (!importedReference || importedReference.type !== 'reference-image') {
      throw new Error('Expected a remapped reference image.');
    }
    expect(imported.assets[0].id).toBe(importedReference.assetId);

    expect(importedConcept?.type).toBe('concept-part');
    if (!importedConcept || importedConcept.type !== 'concept-part') {
      throw new Error('Expected a remapped concept part.');
    }
    expect(importedConcept.sourceObjectIds.every((id) => newObjectIds.has(id))).toBe(true);

    expect(imported.checkpoints[0].documentId).toBe(imported.document.id);
    expect(imported.checkpoints[0].document.id).toBe(imported.document.id);
  });

  it('rebases a document from another project even when its ID does not collide', () => {
    const bundle = exportedBundle();
    const plan = prepareProductDesignImport(
      JSON.stringify(bundle),
      [],
      'different-project',
    );
    const imported = JSON.parse(plan.serializedBundle) as ProductDesignExportBundle;

    expect(plan.mode).toBe('create-conflict-safe-copy');
    expect(imported.document.projectId).toBe('different-project');
    expect(imported.document.id).not.toBe(bundle.document.id);
  });
});
