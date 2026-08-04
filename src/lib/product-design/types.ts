export type ProductDesignUnits = 'mm' | 'cm' | 'in';

export type ProductDesignTool =
  | 'select'
  | 'pan'
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'text'
  | 'note'
  | 'dimension'
  | 'reference-image';

export type ProductDesignObjectType =
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'text'
  | 'note'
  | 'dimension'
  | 'reference-image'
  | 'concept-part';

export type ProductDesignAuthority = 'concept' | 'intent' | 'reference' | 'qualified';

export interface ProductDesignLayer {
  id: string;
  documentId: string;
  name: string;
  order: number;
  visible: boolean;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDesignBaseObject {
  id: string;
  documentId: string;
  layerId: string;
  groupId?: string;
  type: ProductDesignObjectType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  order: number;
  authority: ProductDesignAuthority;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDesignRectangle extends ProductDesignBaseObject {
  type: 'rectangle';
  cornerRadius: number;
}

export interface ProductDesignEllipse extends ProductDesignBaseObject {
  type: 'ellipse';
}

export interface ProductDesignLine extends ProductDesignBaseObject {
  type: 'line' | 'arrow';
}

export interface ProductDesignText extends ProductDesignBaseObject {
  type: 'text' | 'note';
  text: string;
  fontSize: number;
  fontWeight: number;
  textAlign: 'left' | 'center' | 'right';
}

export interface ProductDesignDimension extends ProductDesignBaseObject {
  type: 'dimension';
  value: number;
  units: ProductDesignUnits;
  prefix: string;
  suffix: string;
}

export interface ProductDesignReferenceImage extends ProductDesignBaseObject {
  type: 'reference-image';
  assetId: string;
  fit: 'contain' | 'cover';
  sourceUrl: string;
  attribution: string;
  license: string;
  altText: string;
}

export interface ProductDesignConceptPart extends ProductDesignBaseObject {
  type: 'concept-part';
  depth: number;
  material: string;
  finish: string;
  appearance: string;
  sourceObjectIds: string[];
  linkedMechanicalObjectId?: string;
  linkedRequirementIds: string[];
}

export type ProductDesignObject =
  | ProductDesignRectangle
  | ProductDesignEllipse
  | ProductDesignLine
  | ProductDesignText
  | ProductDesignDimension
  | ProductDesignReferenceImage
  | ProductDesignConceptPart;

export interface ProductDesignCanvasSettings {
  width: number;
  height: number;
  background: string;
  gridSize: number;
  gridVisible: boolean;
  snapToGrid: boolean;
}

export interface ProductDesignDocument {
  id: string;
  projectId: string;
  schemaVersion: number;
  name: string;
  description: string;
  units: ProductDesignUnits;
  canvas: ProductDesignCanvasSettings;
  layers: ProductDesignLayer[];
  objects: ProductDesignObject[];
  createdAt: string;
  updatedAt: string;
  revision: number;
}

export interface ProductDesignAsset {
  id: string;
  documentId: string;
  fileName: string;
  mimeType: string;
  size: number;
  checksum?: string;
  sourceUrl: string;
  attribution: string;
  license: string;
  altText: string;
  blob: Blob;
  createdAt: string;
}

export interface ProductDesignCheckpoint {
  id: string;
  documentId: string;
  name: string;
  description: string;
  createdAt: string;
  document: ProductDesignDocument;
}

export type ProductDesignCommandType =
  | 'CREATE_DOCUMENT'
  | 'UPDATE_DOCUMENT'
  | 'CREATE_LAYER'
  | 'UPDATE_LAYER'
  | 'DELETE_LAYER'
  | 'CREATE_OBJECT'
  | 'UPDATE_OBJECT'
  | 'DELETE_OBJECTS'
  | 'DUPLICATE_OBJECTS'
  | 'GROUP_OBJECTS'
  | 'UNGROUP_OBJECTS'
  | 'REORDER_OBJECT'
  | 'CREATE_CONCEPT_PART'
  | 'IMPORT_DOCUMENT'
  | 'RESTORE_CHECKPOINT';

export interface ProductDesignCommandRecord {
  id: string;
  documentId: string;
  type: ProductDesignCommandType;
  label: string;
  timestamp: string;
  before: ProductDesignDocument;
  after: ProductDesignDocument;
}

export interface ProductDesignExportBundle {
  format: 'hardware-studio-product-design';
  version: 1;
  exportedAt: string;
  document: ProductDesignDocument;
  assets: Array<Omit<ProductDesignAsset, 'blob'> & { dataUrl?: string }>;
  checkpoints: ProductDesignCheckpoint[];
}

export interface ProductDesignRepository {
  listDocuments(projectId: string): Promise<ProductDesignDocument[]>;
  getDocument(documentId: string): Promise<ProductDesignDocument | null>;
  saveDocument(document: ProductDesignDocument): Promise<void>;
  deleteDocument(documentId: string): Promise<void>;
  saveAsset(asset: ProductDesignAsset): Promise<void>;
  getAsset(assetId: string): Promise<ProductDesignAsset | null>;
  listAssets(documentId: string): Promise<ProductDesignAsset[]>;
  deleteAsset(assetId: string): Promise<void>;
  saveCheckpoint(checkpoint: ProductDesignCheckpoint): Promise<void>;
  listCheckpoints(documentId: string): Promise<ProductDesignCheckpoint[]>;
  deleteCheckpoint(checkpointId: string): Promise<void>;
}

export interface ProductDesignSelectionBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}
