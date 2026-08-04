import {
  createProductDesignId,
  normalizeProductDesignDocument,
} from './model';
import type {
  ProductDesignCheckpoint,
  ProductDesignDocument,
  ProductDesignExportBundle,
  ProductDesignObject,
} from './types';

export interface ProductDesignImportPlan {
  mode: 'preserve-identities' | 'create-conflict-safe-copy';
  serializedBundle: string;
  documentId: string;
}

function parseImport(raw: string): ProductDesignExportBundle {
  const parsed = JSON.parse(raw) as ProductDesignExportBundle | ProductDesignDocument;
  if ('format' in parsed && parsed.format === 'hardware-studio-product-design') {
    return {
      ...parsed,
      document: normalizeProductDesignDocument(parsed.document),
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
      checkpoints: Array.isArray(parsed.checkpoints) ? parsed.checkpoints : [],
    };
  }
  return {
    format: 'hardware-studio-product-design',
    version: 1,
    exportedAt: new Date().toISOString(),
    document: normalizeProductDesignDocument(parsed),
    assets: [],
    checkpoints: [],
  };
}

function rebaseDocument(
  source: ProductDesignDocument,
  targetProjectId: string,
  targetDocumentId: string,
  assetIdMap: Map<string, string>,
  appendCopyLabel: boolean,
): ProductDesignDocument {
  const timestamp = new Date().toISOString();
  const layerIdMap = new Map(source.layers.map((layer) => [layer.id, createProductDesignId('layer')]));
  const objectIdMap = new Map(source.objects.map((object) => [object.id, createProductDesignId('object')]));
  const groupIds = Array.from(new Set(source.objects.map((object) => object.groupId).filter((id): id is string => Boolean(id))));
  const groupIdMap = new Map(groupIds.map((groupId) => [groupId, createProductDesignId('group')]));

  const objects = source.objects.map((object) => {
    const base = {
      ...object,
      id: objectIdMap.get(object.id) as string,
      documentId: targetDocumentId,
      layerId: layerIdMap.get(object.layerId) || Array.from(layerIdMap.values())[0],
      groupId: object.groupId ? groupIdMap.get(object.groupId) : undefined,
      createdAt: timestamp,
      updatedAt: timestamp,
    } as ProductDesignObject;

    if (base.type === 'reference-image') {
      return {
        ...base,
        assetId: assetIdMap.get(object.type === 'reference-image' ? object.assetId : '') || createProductDesignId('asset'),
      };
    }
    if (base.type === 'concept-part') {
      return {
        ...base,
        sourceObjectIds: object.type === 'concept-part'
          ? object.sourceObjectIds.map((id) => objectIdMap.get(id)).filter((id): id is string => Boolean(id))
          : [],
      };
    }
    return base;
  });

  return {
    ...source,
    id: targetDocumentId,
    projectId: targetProjectId,
    name: appendCopyLabel ? `${source.name} (imported copy)` : source.name,
    layers: source.layers.map((layer, index) => ({
      ...layer,
      id: layerIdMap.get(layer.id) as string,
      documentId: targetDocumentId,
      order: index,
      createdAt: timestamp,
      updatedAt: timestamp,
    })),
    objects,
    createdAt: timestamp,
    updatedAt: timestamp,
    revision: appendCopyLabel ? 1 : source.revision,
  };
}

export function prepareProductDesignImport(
  raw: string,
  existingDocuments: ProductDesignDocument[],
  targetProjectId: string,
): ProductDesignImportPlan {
  const bundle = parseImport(raw);
  const collision = existingDocuments.some((document) => document.id === bundle.document.id);

  if (!collision && bundle.document.projectId === targetProjectId) {
    return {
      mode: 'preserve-identities',
      serializedBundle: JSON.stringify(bundle),
      documentId: bundle.document.id,
    };
  }

  const targetDocumentId = createProductDesignId('design');
  const assetIdMap = new Map<string, string>();
  bundle.assets.forEach((asset) => assetIdMap.set(asset.id, createProductDesignId('asset')));
  bundle.document.objects.forEach((object) => {
    if (object.type === 'reference-image' && !assetIdMap.has(object.assetId)) {
      assetIdMap.set(object.assetId, createProductDesignId('asset'));
    }
  });

  const document = rebaseDocument(
    bundle.document,
    targetProjectId,
    targetDocumentId,
    assetIdMap,
    true,
  );

  const checkpoints: ProductDesignCheckpoint[] = bundle.checkpoints.map((checkpoint) => ({
    ...checkpoint,
    id: createProductDesignId('checkpoint'),
    documentId: targetDocumentId,
    createdAt: new Date().toISOString(),
    document: rebaseDocument(
      normalizeProductDesignDocument(checkpoint.document),
      targetProjectId,
      targetDocumentId,
      assetIdMap,
      false,
    ),
  }));

  const safeBundle: ProductDesignExportBundle = {
    ...bundle,
    exportedAt: new Date().toISOString(),
    document,
    assets: bundle.assets.map((asset) => ({
      ...asset,
      id: assetIdMap.get(asset.id) as string,
      documentId: targetDocumentId,
    })),
    checkpoints,
  };

  return {
    mode: 'create-conflict-safe-copy',
    serializedBundle: JSON.stringify(safeBundle),
    documentId: targetDocumentId,
  };
}
