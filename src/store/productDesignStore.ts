'use client';

import { create } from 'zustand';
import {
  cloneProductDesignDocument,
  createProductDesignDocument,
  createProductDesignId,
  createProductDesignLayer,
  createProductDesignObject,
  getProductDesignSelectionBounds,
  normalizeProductDesignDocument,
  snapProductDesignValue,
  touchProductDesignDocument,
} from '../lib/product-design/model';
import {
  createProductDesignRepository,
  MemoryProductDesignRepository,
} from '../lib/product-design/repository';
import type {
  ProductDesignAsset,
  ProductDesignCheckpoint,
  ProductDesignCommandRecord,
  ProductDesignCommandType,
  ProductDesignDocument,
  ProductDesignExportBundle,
  ProductDesignLayer,
  ProductDesignObject,
  ProductDesignObjectType,
  ProductDesignRepository,
  ProductDesignTool,
  ProductDesignUnits,
} from '../lib/product-design/types';

type PersistenceStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

type ObjectPatch = Partial<ProductDesignObject>;

interface ProductDesignStoreState {
  repository: ProductDesignRepository;
  projectId: string;
  documents: ProductDesignDocument[];
  document: ProductDesignDocument | null;
  checkpoints: ProductDesignCheckpoint[];
  activeLayerId: string | null;
  selectedObjectIds: string[];
  activeTool: ProductDesignTool;
  zoom: number;
  panX: number;
  panY: number;
  previewPatches: Record<string, ObjectPatch>;
  assetUrls: Record<string, string>;
  missingAssetIds: string[];
  persistenceStatus: PersistenceStatus;
  persistenceMessage: string;
  undoStack: ProductDesignCommandRecord[];
  redoStack: ProductDesignCommandRecord[];
  is3DOpen: boolean;

  setRepository: (repository: ProductDesignRepository) => void;
  initialize: (projectId: string) => Promise<void>;
  createDocument: (name?: string, units?: ProductDesignUnits) => Promise<ProductDesignDocument>;
  openDocument: (documentId: string) => Promise<void>;
  updateDocument: (patch: Partial<Pick<ProductDesignDocument, 'name' | 'description' | 'units' | 'canvas'>>) => void;
  addLayer: (name?: string) => void;
  updateLayer: (layerId: string, patch: Partial<ProductDesignLayer>) => void;
  deleteLayer: (layerId: string) => void;
  setActiveLayer: (layerId: string) => void;
  addObject: (type: ProductDesignObjectType, x: number, y: number, patch?: ObjectPatch) => string | null;
  updateObjects: (objectIds: string[], patch: ObjectPatch, label?: string) => void;
  updateObjectById: (objectId: string, patch: ObjectPatch, label?: string) => void;
  setPreviewPatch: (objectId: string, patch: ObjectPatch) => void;
  clearPreviewPatches: () => void;
  commitPreviewPatches: (label: string) => void;
  selectObject: (objectId: string | null, additive?: boolean) => void;
  selectObjects: (objectIds: string[]) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  bringSelectedForward: () => void;
  sendSelectedBackward: () => void;
  moveSelected: (dx: number, dy: number) => void;
  alignSelected: (alignment: 'left' | 'center-x' | 'right' | 'top' | 'center-y' | 'bottom') => void;
  createConceptPartFromSelection: () => string | null;
  addReferenceImage: (file: File, metadata?: Partial<Pick<ProductDesignAsset, 'sourceUrl' | 'attribution' | 'license' | 'altText'>>) => Promise<string | null>;
  removeAsset: (assetId: string) => Promise<void>;
  createCheckpoint: (name: string, description?: string) => Promise<ProductDesignCheckpoint | null>;
  restoreCheckpoint: (checkpointId: string) => void;
  deleteCheckpoint: (checkpointId: string) => Promise<void>;
  undo: () => void;
  redo: () => void;
  setActiveTool: (tool: ProductDesignTool) => void;
  setViewport: (patch: Partial<Pick<ProductDesignStoreState, 'zoom' | 'panX' | 'panY'>>) => void;
  fitDocument: () => void;
  set3DOpen: (open: boolean) => void;
  exportDocument: () => Promise<string | null>;
  importDocument: (raw: string) => Promise<ProductDesignDocument>;
  resetForTests: () => void;
}

const MAX_HISTORY = 80;

function revokeAssetUrls(urls: Record<string, string>): void {
  if (typeof URL === 'undefined') return;
  Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error || new Error('Unable to read asset.'));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, encoded] = dataUrl.split(',');
  const mimeType = /data:([^;]+)/.exec(header)?.[1] || 'application/octet-stream';
  const binary = atob(encoded || '');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mimeType });
}

export const useProductDesignStore = create<ProductDesignStoreState>((set, get) => {
  const persist = async (document: ProductDesignDocument) => {
    set({ persistenceStatus: 'saving', persistenceMessage: 'Saving locally…' });
    try {
      await get().repository.saveDocument(document);
      const documents = await get().repository.listDocuments(document.projectId);
      set({ documents, persistenceStatus: 'saved', persistenceMessage: 'Saved locally' });
    } catch (error) {
      set({
        persistenceStatus: 'error',
        persistenceMessage: error instanceof Error ? error.message : 'Local save failed.',
      });
    }
  };

  const loadAssets = async (document: ProductDesignDocument) => {
    revokeAssetUrls(get().assetUrls);
    const assetUrls: Record<string, string> = {};
    const missingAssetIds: string[] = [];
    const references = document.objects.filter((object) => object.type === 'reference-image');
    await Promise.all(references.map(async (reference) => {
      const asset = await get().repository.getAsset(reference.assetId);
      if (!asset) {
        missingAssetIds.push(reference.assetId);
        return;
      }
      if (typeof URL !== 'undefined') assetUrls[asset.id] = URL.createObjectURL(asset.blob);
    }));
    set({ assetUrls, missingAssetIds });
  };

  const commit = (
    type: ProductDesignCommandType,
    label: string,
    mutate: (draft: ProductDesignDocument) => ProductDesignDocument | void,
  ) => {
    const current = get().document;
    if (!current) return;
    const before = cloneProductDesignDocument(current);
    const draft = cloneProductDesignDocument(current);
    const result = mutate(draft);
    const after = touchProductDesignDocument(result || draft);
    const command: ProductDesignCommandRecord = {
      id: createProductDesignId('command'),
      documentId: current.id,
      type,
      label,
      timestamp: new Date().toISOString(),
      before,
      after: cloneProductDesignDocument(after),
    };
    set((state) => ({
      document: after,
      undoStack: [...state.undoStack, command].slice(-MAX_HISTORY),
      redoStack: [],
      previewPatches: {},
    }));
    void persist(after);
  };

  return {
    repository: createProductDesignRepository(),
    projectId: '',
    documents: [],
    document: null,
    checkpoints: [],
    activeLayerId: null,
    selectedObjectIds: [],
    activeTool: 'select',
    zoom: 1,
    panX: 40,
    panY: 40,
    previewPatches: {},
    assetUrls: {},
    missingAssetIds: [],
    persistenceStatus: 'idle',
    persistenceMessage: 'Not loaded',
    undoStack: [],
    redoStack: [],
    is3DOpen: false,

    setRepository: (repository) => set({ repository }),

    initialize: async (projectId) => {
      set({ projectId, persistenceStatus: 'loading', persistenceMessage: 'Opening Product Design…' });
      try {
        const documents = await get().repository.listDocuments(projectId);
        if (documents[0]) {
          const checkpoints = await get().repository.listCheckpoints(documents[0].id);
          set({
            documents,
            document: documents[0],
            checkpoints,
            activeLayerId: documents[0].layers[0]?.id || null,
            selectedObjectIds: [],
            undoStack: [],
            redoStack: [],
            persistenceStatus: 'saved',
            persistenceMessage: 'Opened from local database',
          });
          await loadAssets(documents[0]);
          return;
        }
        const document = createProductDesignDocument(projectId, 'Product concept');
        await get().repository.saveDocument(document);
        set({
          documents: [document],
          document,
          checkpoints: [],
          activeLayerId: document.layers[0].id,
          persistenceStatus: 'saved',
          persistenceMessage: 'Created and saved locally',
        });
      } catch (error) {
        set({
          persistenceStatus: 'error',
          persistenceMessage: error instanceof Error ? error.message : 'Unable to open Product Design.',
        });
      }
    },

    createDocument: async (name = 'Product concept', units = 'mm') => {
      const projectId = get().projectId || 'local-project';
      const document = createProductDesignDocument(projectId, name, units);
      await get().repository.saveDocument(document);
      const documents = await get().repository.listDocuments(projectId);
      revokeAssetUrls(get().assetUrls);
      set({
        document,
        documents,
        checkpoints: [],
        activeLayerId: document.layers[0].id,
        selectedObjectIds: [],
        undoStack: [],
        redoStack: [],
        assetUrls: {},
        missingAssetIds: [],
        persistenceStatus: 'saved',
        persistenceMessage: 'Created and saved locally',
      });
      return document;
    },

    openDocument: async (documentId) => {
      set({ persistenceStatus: 'loading', persistenceMessage: 'Opening document…' });
      const document = await get().repository.getDocument(documentId);
      if (!document) {
        set({ persistenceStatus: 'error', persistenceMessage: 'Document was not found.' });
        return;
      }
      const checkpoints = await get().repository.listCheckpoints(document.id);
      set({
        document,
        checkpoints,
        activeLayerId: document.layers[0]?.id || null,
        selectedObjectIds: [],
        undoStack: [],
        redoStack: [],
        persistenceStatus: 'saved',
        persistenceMessage: 'Opened from local database',
      });
      await loadAssets(document);
    },

    updateDocument: (patch) => commit('UPDATE_DOCUMENT', 'Update product design document', (draft) => {
      Object.assign(draft, patch);
    }),

    addLayer: (name) => commit('CREATE_LAYER', 'Create design layer', (draft) => {
      const layer = createProductDesignLayer(draft.id, name || `Layer ${draft.layers.length + 1}`, draft.layers.length);
      draft.layers.push(layer);
      set({ activeLayerId: layer.id });
    }),

    updateLayer: (layerId, patch) => commit('UPDATE_LAYER', 'Update design layer', (draft) => {
      draft.layers = draft.layers.map((layer) => layer.id === layerId
        ? { ...layer, ...patch, id: layer.id, documentId: layer.documentId, updatedAt: new Date().toISOString() }
        : layer);
    }),

    deleteLayer: (layerId) => {
      const document = get().document;
      if (!document || document.layers.length <= 1) return;
      commit('DELETE_LAYER', 'Delete design layer', (draft) => {
        const fallback = draft.layers.find((layer) => layer.id !== layerId);
        if (!fallback) return;
        draft.objects = draft.objects.map((object) => object.layerId === layerId
          ? { ...object, layerId: fallback.id, updatedAt: new Date().toISOString() }
          : object);
        draft.layers = draft.layers.filter((layer) => layer.id !== layerId)
          .map((layer, order) => ({ ...layer, order }));
        set({ activeLayerId: fallback.id });
      });
    },

    setActiveLayer: (layerId) => set({ activeLayerId: layerId }),

    addObject: (type, x, y, patch = {}) => {
      const document = get().document;
      const activeLayerId = get().activeLayerId || document?.layers[0]?.id;
      if (!document || !activeLayerId) return null;
      const object = { ...createProductDesignObject(document, type, activeLayerId, x, y), ...patch } as ProductDesignObject;
      commit('CREATE_OBJECT', `Create ${type.replace('-', ' ')}`, (draft) => {
        draft.objects.push(object);
      });
      set({ selectedObjectIds: [object.id], activeTool: 'select' });
      return object.id;
    },

    updateObjects: (objectIds, patch, label = 'Update design objects') => commit('UPDATE_OBJECT', label, (draft) => {
      const selected = new Set(objectIds);
      draft.objects = draft.objects.map((object) => selected.has(object.id) && !object.locked
        ? { ...object, ...patch, id: object.id, type: object.type, updatedAt: new Date().toISOString() } as ProductDesignObject
        : object);
    }),

    updateObjectById: (objectId, patch, label) => get().updateObjects([objectId], patch, label),

    setPreviewPatch: (objectId, patch) => set((state) => ({
      previewPatches: {
        ...state.previewPatches,
        [objectId]: { ...state.previewPatches[objectId], ...patch },
      },
    })),

    clearPreviewPatches: () => set({ previewPatches: {} }),

    commitPreviewPatches: (label) => {
      const patches = get().previewPatches;
      if (Object.keys(patches).length === 0) return;
      commit('UPDATE_OBJECT', label, (draft) => {
        draft.objects = draft.objects.map((object) => patches[object.id] && !object.locked
          ? { ...object, ...patches[object.id], id: object.id, type: object.type, updatedAt: new Date().toISOString() } as ProductDesignObject
          : object);
      });
    },

    selectObject: (objectId, additive = false) => set((state) => {
      if (!objectId) return { selectedObjectIds: [] };
      if (!additive) return { selectedObjectIds: [objectId] };
      return {
        selectedObjectIds: state.selectedObjectIds.includes(objectId)
          ? state.selectedObjectIds.filter((id) => id !== objectId)
          : [...state.selectedObjectIds, objectId],
      };
    }),

    selectObjects: (objectIds) => set({ selectedObjectIds: Array.from(new Set(objectIds)) }),

    deleteSelected: () => {
      const selected = get().selectedObjectIds;
      if (selected.length === 0) return;
      commit('DELETE_OBJECTS', 'Delete selected design objects', (draft) => {
        const selectedSet = new Set(selected);
        draft.objects = draft.objects.filter((object) => !selectedSet.has(object.id));
      });
      set({ selectedObjectIds: [] });
    },

    duplicateSelected: () => {
      const selected = get().selectedObjectIds;
      const current = get().document;
      if (!current || selected.length === 0) return;
      const timestamp = new Date().toISOString();
      const copies = current.objects.filter((object) => selected.includes(object.id)).map((object, index) => ({
        ...object,
        id: createProductDesignId('object'),
        name: `${object.name} copy`,
        x: object.x + 20,
        y: object.y + 20,
        groupId: undefined,
        order: current.objects.length + index,
        createdAt: timestamp,
        updatedAt: timestamp,
      })) as ProductDesignObject[];
      commit('DUPLICATE_OBJECTS', 'Duplicate selected design objects', (draft) => {
        draft.objects.push(...copies);
      });
      set({ selectedObjectIds: copies.map((copy) => copy.id) });
    },

    groupSelected: () => {
      const selected = get().selectedObjectIds;
      if (selected.length < 2) return;
      const groupId = createProductDesignId('group');
      commit('GROUP_OBJECTS', 'Group selected design objects', (draft) => {
        draft.objects = draft.objects.map((object) => selected.includes(object.id)
          ? { ...object, groupId, updatedAt: new Date().toISOString() }
          : object);
      });
    },

    ungroupSelected: () => {
      const selected = get().selectedObjectIds;
      if (selected.length === 0) return;
      const selectedObjects = get().document?.objects.filter((object) => selected.includes(object.id)) || [];
      const groups = new Set(selectedObjects.map((object) => object.groupId).filter(Boolean));
      commit('UNGROUP_OBJECTS', 'Ungroup selected design objects', (draft) => {
        draft.objects = draft.objects.map((object) => object.groupId && groups.has(object.groupId)
          ? { ...object, groupId: undefined, updatedAt: new Date().toISOString() }
          : object);
      });
    },

    bringSelectedForward: () => {
      const selected = get().selectedObjectIds;
      commit('REORDER_OBJECT', 'Bring selected objects forward', (draft) => {
        const maxOrder = Math.max(0, ...draft.objects.map((object) => object.order));
        draft.objects = draft.objects.map((object, index) => selected.includes(object.id)
          ? { ...object, order: maxOrder + index + 1, updatedAt: new Date().toISOString() }
          : object);
      });
    },

    sendSelectedBackward: () => {
      const selected = get().selectedObjectIds;
      commit('REORDER_OBJECT', 'Send selected objects backward', (draft) => {
        const minOrder = Math.min(0, ...draft.objects.map((object) => object.order));
        draft.objects = draft.objects.map((object, index) => selected.includes(object.id)
          ? { ...object, order: minOrder - index - 1, updatedAt: new Date().toISOString() }
          : object);
      });
    },

    moveSelected: (dx, dy) => {
      const document = get().document;
      const selected = get().selectedObjectIds;
      if (!document || selected.length === 0) return;
      commit('UPDATE_OBJECT', 'Move selected design objects', (draft) => {
        draft.objects = draft.objects.map((object) => selected.includes(object.id) && !object.locked
          ? {
              ...object,
              x: snapProductDesignValue(object.x + dx, document.canvas.gridSize, document.canvas.snapToGrid),
              y: snapProductDesignValue(object.y + dy, document.canvas.gridSize, document.canvas.snapToGrid),
              updatedAt: new Date().toISOString(),
            }
          : object);
      });
    },

    alignSelected: (alignment) => {
      const document = get().document;
      const selected = get().selectedObjectIds;
      if (!document || selected.length < 2) return;
      const bounds = getProductDesignSelectionBounds(document.objects, selected);
      if (!bounds) return;
      commit('UPDATE_OBJECT', `Align selected objects ${alignment}`, (draft) => {
        draft.objects = draft.objects.map((object) => {
          if (!selected.includes(object.id) || object.locked) return object;
          let x = object.x;
          let y = object.y;
          if (alignment === 'left') x = bounds.x;
          if (alignment === 'center-x') x = bounds.x + bounds.width / 2 - object.width / 2;
          if (alignment === 'right') x = bounds.x + bounds.width - object.width;
          if (alignment === 'top') y = bounds.y;
          if (alignment === 'center-y') y = bounds.y + bounds.height / 2 - object.height / 2;
          if (alignment === 'bottom') y = bounds.y + bounds.height - object.height;
          return { ...object, x, y, updatedAt: new Date().toISOString() };
        });
      });
    },

    createConceptPartFromSelection: () => {
      const document = get().document;
      const selected = get().selectedObjectIds;
      if (!document || selected.length === 0) return null;
      const bounds = getProductDesignSelectionBounds(document.objects, selected);
      const activeLayerId = get().activeLayerId || document.layers[0]?.id;
      if (!bounds || !activeLayerId) return null;
      const conceptPart = {
        ...createProductDesignObject(document, 'concept-part', activeLayerId, bounds.x, bounds.y),
        width: Math.max(20, bounds.width),
        height: Math.max(20, bounds.height),
        depth: Math.max(8, Math.round(Math.min(bounds.width, bounds.height) * 0.2)),
        sourceObjectIds: [...selected],
        name: `Concept part ${document.objects.filter((object) => object.type === 'concept-part').length + 1}`,
      } as ProductDesignObject;
      commit('CREATE_CONCEPT_PART', 'Create concept part from selection', (draft) => {
        draft.objects.push(conceptPart);
      });
      set({ selectedObjectIds: [conceptPart.id], is3DOpen: true });
      return conceptPart.id;
    },

    addReferenceImage: async (file, metadata = {}) => {
      const document = get().document;
      const activeLayerId = get().activeLayerId || document?.layers[0]?.id;
      if (!document || !activeLayerId) return null;
      const assetId = createProductDesignId('asset');
      const asset: ProductDesignAsset = {
        id: assetId,
        documentId: document.id,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        sourceUrl: metadata.sourceUrl || '',
        attribution: metadata.attribution || '',
        license: metadata.license || '',
        altText: metadata.altText || file.name,
        blob: file,
        createdAt: new Date().toISOString(),
      };
      set({ persistenceStatus: 'saving', persistenceMessage: 'Saving reference image…' });
      try {
        await get().repository.saveAsset(asset);
        const object = {
          ...createProductDesignObject(document, 'reference-image', activeLayerId, 120, 120),
          assetId,
          name: file.name,
          altText: asset.altText,
          sourceUrl: asset.sourceUrl,
          attribution: asset.attribution,
          license: asset.license,
        } as ProductDesignObject;
        commit('CREATE_OBJECT', 'Add reference image', (draft) => {
          draft.objects.push(object);
        });
        if (typeof URL !== 'undefined') {
          set((state) => ({ assetUrls: { ...state.assetUrls, [assetId]: URL.createObjectURL(file) } }));
        }
        set({ selectedObjectIds: [object.id] });
        return object.id;
      } catch (error) {
        set({
          persistenceStatus: 'error',
          persistenceMessage: error instanceof Error ? error.message : 'Reference image could not be saved.',
        });
        return null;
      }
    },

    removeAsset: async (assetId) => {
      await get().repository.deleteAsset(assetId);
      const url = get().assetUrls[assetId];
      if (url && typeof URL !== 'undefined') URL.revokeObjectURL(url);
      set((state) => {
        const assetUrls = { ...state.assetUrls };
        delete assetUrls[assetId];
        return { assetUrls, missingAssetIds: state.missingAssetIds.filter((id) => id !== assetId) };
      });
    },

    createCheckpoint: async (name, description = '') => {
      const document = get().document;
      if (!document || !name.trim()) return null;
      const checkpoint: ProductDesignCheckpoint = {
        id: createProductDesignId('checkpoint'),
        documentId: document.id,
        name: name.trim(),
        description: description.trim(),
        createdAt: new Date().toISOString(),
        document: cloneProductDesignDocument(document),
      };
      await get().repository.saveCheckpoint(checkpoint);
      const checkpoints = await get().repository.listCheckpoints(document.id);
      set({ checkpoints, persistenceStatus: 'saved', persistenceMessage: `Checkpoint “${checkpoint.name}” created` });
      return checkpoint;
    },

    restoreCheckpoint: (checkpointId) => {
      const checkpoint = get().checkpoints.find((candidate) => candidate.id === checkpointId);
      if (!checkpoint) return;
      commit('RESTORE_CHECKPOINT', `Restore checkpoint ${checkpoint.name}`, () => cloneProductDesignDocument(checkpoint.document));
      set({ selectedObjectIds: [] });
      void loadAssets(checkpoint.document);
    },

    deleteCheckpoint: async (checkpointId) => {
      await get().repository.deleteCheckpoint(checkpointId);
      const documentId = get().document?.id;
      if (documentId) set({ checkpoints: await get().repository.listCheckpoints(documentId) });
    },

    undo: () => {
      const command = get().undoStack.at(-1);
      if (!command) return;
      const document = cloneProductDesignDocument(command.before);
      set((state) => ({
        document,
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, command].slice(-MAX_HISTORY),
        selectedObjectIds: state.selectedObjectIds.filter((id) => document.objects.some((object) => object.id === id)),
        previewPatches: {},
      }));
      void persist(document);
      void loadAssets(document);
    },

    redo: () => {
      const command = get().redoStack.at(-1);
      if (!command) return;
      const document = cloneProductDesignDocument(command.after);
      set((state) => ({
        document,
        undoStack: [...state.undoStack, command].slice(-MAX_HISTORY),
        redoStack: state.redoStack.slice(0, -1),
        previewPatches: {},
      }));
      void persist(document);
      void loadAssets(document);
    },

    setActiveTool: (tool) => set({ activeTool: tool }),

    setViewport: (patch) => set((state) => ({
      zoom: patch.zoom ?? state.zoom,
      panX: patch.panX ?? state.panX,
      panY: patch.panY ?? state.panY,
    })),

    fitDocument: () => set({ zoom: 0.78, panX: 40, panY: 40 }),

    set3DOpen: (open) => set({ is3DOpen: open }),

    exportDocument: async () => {
      const document = get().document;
      if (!document) return null;
      const assets = await get().repository.listAssets(document.id);
      const checkpoints = await get().repository.listCheckpoints(document.id);
      const bundle: ProductDesignExportBundle = {
        format: 'hardware-studio-product-design',
        version: 1,
        exportedAt: new Date().toISOString(),
        document: cloneProductDesignDocument(document),
        assets: await Promise.all(assets.map(async ({ blob, ...asset }) => ({
          ...asset,
          dataUrl: await blobToDataUrl(blob),
        }))),
        checkpoints,
      };
      return JSON.stringify(bundle, null, 2);
    },

    importDocument: async (raw) => {
      const parsed = JSON.parse(raw) as ProductDesignExportBundle | ProductDesignDocument;
      const isBundle = 'format' in parsed && parsed.format === 'hardware-studio-product-design';
      const document = normalizeProductDesignDocument(isBundle ? parsed.document : parsed);
      await get().repository.saveDocument(document);
      if (isBundle) {
        for (const asset of parsed.assets) {
          if (!asset.dataUrl) continue;
          await get().repository.saveAsset({ ...asset, blob: dataUrlToBlob(asset.dataUrl) });
        }
        for (const checkpoint of parsed.checkpoints) await get().repository.saveCheckpoint(checkpoint);
      }
      const documents = await get().repository.listDocuments(document.projectId);
      const checkpoints = await get().repository.listCheckpoints(document.id);
      set({
        projectId: document.projectId,
        documents,
        document,
        checkpoints,
        activeLayerId: document.layers[0]?.id || null,
        selectedObjectIds: [],
        undoStack: [],
        redoStack: [],
        persistenceStatus: 'saved',
        persistenceMessage: 'Imported and saved locally',
      });
      await loadAssets(document);
      return document;
    },

    resetForTests: () => {
      revokeAssetUrls(get().assetUrls);
      set({
        repository: new MemoryProductDesignRepository(),
        projectId: '',
        documents: [],
        document: null,
        checkpoints: [],
        activeLayerId: null,
        selectedObjectIds: [],
        activeTool: 'select',
        zoom: 1,
        panX: 40,
        panY: 40,
        previewPatches: {},
        assetUrls: {},
        missingAssetIds: [],
        persistenceStatus: 'idle',
        persistenceMessage: 'Not loaded',
        undoStack: [],
        redoStack: [],
        is3DOpen: false,
      });
    },
  };
});
