import type {
  ProductDesignAuthority,
  ProductDesignDocument,
  ProductDesignLayer,
  ProductDesignObject,
  ProductDesignObjectType,
  ProductDesignSelectionBounds,
  ProductDesignUnits,
} from './types';

export const PRODUCT_DESIGN_SCHEMA_VERSION = 1;

export function createProductDesignId(prefix: string): string {
  const randomId = typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}_${randomId}`;
}

export function cloneProductDesignDocument(document: ProductDesignDocument): ProductDesignDocument {
  if (typeof structuredClone === 'function') return structuredClone(document);
  return JSON.parse(JSON.stringify(document)) as ProductDesignDocument;
}

export function createProductDesignLayer(
  documentId: string,
  name: string,
  order: number,
): ProductDesignLayer {
  const timestamp = new Date().toISOString();
  return {
    id: createProductDesignId('layer'),
    documentId,
    name,
    order,
    visible: true,
    locked: false,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createProductDesignDocument(
  projectId: string,
  name = 'Untitled product concept',
  units: ProductDesignUnits = 'mm',
): ProductDesignDocument {
  const timestamp = new Date().toISOString();
  const id = createProductDesignId('design');
  return {
    id,
    projectId,
    schemaVersion: PRODUCT_DESIGN_SCHEMA_VERSION,
    name,
    description: '',
    units,
    canvas: {
      width: 1200,
      height: 800,
      background: '#ffffff',
      gridSize: 10,
      gridVisible: true,
      snapToGrid: true,
    },
    layers: [createProductDesignLayer(id, 'Concept', 0)],
    objects: [],
    createdAt: timestamp,
    updatedAt: timestamp,
    revision: 1,
  };
}

function commonObjectFields(
  document: ProductDesignDocument,
  type: ProductDesignObjectType,
  layerId: string,
  x: number,
  y: number,
  authority: ProductDesignAuthority,
) {
  const timestamp = new Date().toISOString();
  return {
    id: createProductDesignId('object'),
    documentId: document.id,
    layerId,
    type,
    name: `${type.replace('-', ' ')} ${document.objects.length + 1}`,
    x,
    y,
    width: 140,
    height: 90,
    rotation: 0,
    fill: '#dbeafe',
    stroke: '#334155',
    strokeWidth: 2,
    opacity: 1,
    visible: true,
    locked: false,
    order: document.objects.length,
    authority,
    notes: '',
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

export function createProductDesignObject(
  document: ProductDesignDocument,
  type: ProductDesignObjectType,
  layerId: string,
  x: number,
  y: number,
): ProductDesignObject {
  if (type === 'rectangle') {
    return { ...commonObjectFields(document, type, layerId, x, y, 'concept'), type, cornerRadius: 12 };
  }
  if (type === 'ellipse') {
    return { ...commonObjectFields(document, type, layerId, x, y, 'concept'), type };
  }
  if (type === 'line' || type === 'arrow') {
    return {
      ...commonObjectFields(document, type, layerId, x, y, 'intent'),
      type,
      width: 160,
      height: 0,
      fill: 'transparent',
    };
  }
  if (type === 'text') {
    return {
      ...commonObjectFields(document, type, layerId, x, y, 'concept'),
      type,
      width: 220,
      height: 44,
      fill: 'transparent',
      stroke: 'transparent',
      text: 'Product text',
      fontSize: 24,
      fontWeight: 600,
      textAlign: 'left',
    };
  }
  if (type === 'note') {
    return {
      ...commonObjectFields(document, type, layerId, x, y, 'intent'),
      type,
      width: 220,
      height: 120,
      fill: '#fef3c7',
      stroke: '#d97706',
      text: 'Design note',
      fontSize: 16,
      fontWeight: 500,
      textAlign: 'left',
    };
  }
  if (type === 'dimension') {
    return {
      ...commonObjectFields(document, type, layerId, x, y, 'intent'),
      type,
      width: 180,
      height: 24,
      fill: 'transparent',
      stroke: '#0f766e',
      value: 180,
      units: document.units,
      prefix: '',
      suffix: ' intent',
    };
  }
  if (type === 'concept-part') {
    return {
      ...commonObjectFields(document, type, layerId, x, y, 'concept'),
      type,
      width: 180,
      height: 120,
      depth: 24,
      material: 'Unspecified polymer',
      finish: 'Concept finish',
      appearance: '#94a3b8',
      sourceObjectIds: [],
      linkedRequirementIds: [],
    };
  }
  if (type === 'reference-image') {
    return {
      ...commonObjectFields(document, type, layerId, x, y, 'reference'),
      type,
      width: 320,
      height: 220,
      fill: '#f8fafc',
      stroke: '#94a3b8',
      assetId: '',
      fit: 'contain',
      sourceUrl: '',
      attribution: '',
      license: '',
      altText: '',
    };
  }

  const exhaustive: never = type;
  throw new Error(`Unsupported product design object: ${exhaustive}`);
}

export function touchProductDesignDocument(
  document: ProductDesignDocument,
  incrementRevision = true,
): ProductDesignDocument {
  return {
    ...document,
    schemaVersion: PRODUCT_DESIGN_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    revision: incrementRevision ? document.revision + 1 : document.revision,
  };
}

export function getProductDesignSelectionBounds(
  objects: ProductDesignObject[],
  selectedIds: string[],
): ProductDesignSelectionBounds | null {
  const selected = objects.filter((object) => selectedIds.includes(object.id) && object.visible);
  if (selected.length === 0) return null;

  const left = Math.min(...selected.map((object) => Math.min(object.x, object.x + object.width)));
  const top = Math.min(...selected.map((object) => Math.min(object.y, object.y + object.height)));
  const right = Math.max(...selected.map((object) => Math.max(object.x, object.x + object.width)));
  const bottom = Math.max(...selected.map((object) => Math.max(object.y, object.y + object.height)));

  return { x: left, y: top, width: right - left, height: bottom - top };
}

export function snapProductDesignValue(value: number, gridSize: number, enabled: boolean): number {
  if (!enabled || gridSize <= 0) return value;
  return Math.round(value / gridSize) * gridSize;
}

export function normalizeProductDesignDocument(input: unknown): ProductDesignDocument {
  if (!input || typeof input !== 'object') throw new Error('Product Design document must be an object.');
  const raw = input as Partial<ProductDesignDocument>;
  if (!raw.id || !raw.projectId || !raw.name) throw new Error('Product Design document identity is incomplete.');

  const timestamp = new Date().toISOString();
  const layers = Array.isArray(raw.layers) && raw.layers.length > 0
    ? raw.layers.map((layer, index) => ({
        ...layer,
        id: layer.id || createProductDesignId('layer'),
        documentId: raw.id as string,
        name: layer.name || `Layer ${index + 1}`,
        order: Number.isFinite(layer.order) ? layer.order : index,
        visible: layer.visible !== false,
        locked: Boolean(layer.locked),
        createdAt: layer.createdAt || timestamp,
        updatedAt: layer.updatedAt || timestamp,
      }))
    : [createProductDesignLayer(raw.id, 'Concept', 0)];
  const layerIds = new Set(layers.map((layer) => layer.id));
  const fallbackLayerId = layers[0].id;

  const objects = Array.isArray(raw.objects)
    ? raw.objects.map((object, index) => ({
        ...object,
        id: object.id || createProductDesignId('object'),
        documentId: raw.id as string,
        layerId: layerIds.has(object.layerId) ? object.layerId : fallbackLayerId,
        name: object.name || `${object.type || 'object'} ${index + 1}`,
        x: Number(object.x) || 0,
        y: Number(object.y) || 0,
        width: Number.isFinite(object.width) ? Number(object.width) : 100,
        height: Number.isFinite(object.height) ? Number(object.height) : 100,
        rotation: Number(object.rotation) || 0,
        fill: object.fill || '#dbeafe',
        stroke: object.stroke || '#334155',
        strokeWidth: Number.isFinite(object.strokeWidth) ? Number(object.strokeWidth) : 2,
        opacity: Number.isFinite(object.opacity) ? Number(object.opacity) : 1,
        visible: object.visible !== false,
        locked: Boolean(object.locked),
        order: Number.isFinite(object.order) ? Number(object.order) : index,
        authority: object.authority || 'concept',
        notes: object.notes || '',
        createdAt: object.createdAt || timestamp,
        updatedAt: object.updatedAt || timestamp,
      })) as ProductDesignObject[]
    : [];

  return {
    id: raw.id,
    projectId: raw.projectId,
    schemaVersion: PRODUCT_DESIGN_SCHEMA_VERSION,
    name: raw.name,
    description: raw.description || '',
    units: raw.units || 'mm',
    canvas: {
      width: raw.canvas?.width || 1200,
      height: raw.canvas?.height || 800,
      background: raw.canvas?.background || '#ffffff',
      gridSize: raw.canvas?.gridSize || 10,
      gridVisible: raw.canvas?.gridVisible !== false,
      snapToGrid: raw.canvas?.snapToGrid !== false,
    },
    layers,
    objects,
    createdAt: raw.createdAt || timestamp,
    updatedAt: raw.updatedAt || timestamp,
    revision: Math.max(1, Number(raw.revision) || 1),
  };
}

export function objectTypeFromTool(tool: string): ProductDesignObjectType | null {
  if (tool === 'rectangle' || tool === 'ellipse' || tool === 'line' || tool === 'arrow' || tool === 'text' || tool === 'note' || tool === 'dimension' || tool === 'reference-image') return tool;
  return null;
}
