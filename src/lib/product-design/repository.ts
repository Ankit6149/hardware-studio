import type {
  ProductDesignAsset,
  ProductDesignCheckpoint,
  ProductDesignDocument,
  ProductDesignRepository,
} from './types';
import { cloneProductDesignDocument, normalizeProductDesignDocument } from './model';

const DATABASE_NAME = 'hardware-studio-product-design';
const DATABASE_VERSION = 1;
const DOCUMENTS_STORE = 'documents';
const ASSETS_STORE = 'assets';
const CHECKPOINTS_STORE = 'checkpoints';

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed.'));
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction was aborted.'));
    transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed.'));
  });
}

function deleteRecordsByIndex(
  store: IDBObjectStore,
  indexName: string,
  value: IDBValidKey,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = store.index(indexName).openCursor(IDBKeyRange.only(value));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) {
        resolve();
        return;
      }
      cursor.delete();
      cursor.continue();
    };
    request.onerror = () => reject(request.error || new Error(`Unable to delete records from ${indexName}.`));
  });
}

async function openProductDesignDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === 'undefined') throw new Error('IndexedDB is unavailable in this environment.');

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DOCUMENTS_STORE)) {
        const store = database.createObjectStore(DOCUMENTS_STORE, { keyPath: 'id' });
        store.createIndex('projectId', 'projectId', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
      if (!database.objectStoreNames.contains(ASSETS_STORE)) {
        const store = database.createObjectStore(ASSETS_STORE, { keyPath: 'id' });
        store.createIndex('documentId', 'documentId', { unique: false });
      }
      if (!database.objectStoreNames.contains(CHECKPOINTS_STORE)) {
        const store = database.createObjectStore(CHECKPOINTS_STORE, { keyPath: 'id' });
        store.createIndex('documentId', 'documentId', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Unable to open Product Design database.'));
    request.onblocked = () => reject(new Error('Product Design database upgrade is blocked by another tab.'));
  });
}

export class IndexedDbProductDesignRepository implements ProductDesignRepository {
  private databasePromise: Promise<IDBDatabase> | null = null;

  private database(): Promise<IDBDatabase> {
    this.databasePromise ||= openProductDesignDatabase();
    return this.databasePromise;
  }

  async listDocuments(projectId: string): Promise<ProductDesignDocument[]> {
    const database = await this.database();
    const transaction = database.transaction(DOCUMENTS_STORE, 'readonly');
    const records = await requestToPromise(
      transaction.objectStore(DOCUMENTS_STORE).index('projectId').getAll(projectId),
    );
    await transactionToPromise(transaction);
    return (records as ProductDesignDocument[])
      .map(normalizeProductDesignDocument)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getDocument(documentId: string): Promise<ProductDesignDocument | null> {
    const database = await this.database();
    const transaction = database.transaction(DOCUMENTS_STORE, 'readonly');
    const record = await requestToPromise(transaction.objectStore(DOCUMENTS_STORE).get(documentId));
    await transactionToPromise(transaction);
    return record ? normalizeProductDesignDocument(record) : null;
  }

  async saveDocument(document: ProductDesignDocument): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(DOCUMENTS_STORE, 'readwrite');
    transaction.objectStore(DOCUMENTS_STORE).put(cloneProductDesignDocument(document));
    await transactionToPromise(transaction);
  }

  async deleteDocument(documentId: string): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(
      [DOCUMENTS_STORE, ASSETS_STORE, CHECKPOINTS_STORE],
      'readwrite',
    );
    transaction.objectStore(DOCUMENTS_STORE).delete(documentId);
    await Promise.all([
      deleteRecordsByIndex(transaction.objectStore(ASSETS_STORE), 'documentId', documentId),
      deleteRecordsByIndex(transaction.objectStore(CHECKPOINTS_STORE), 'documentId', documentId),
    ]);
    await transactionToPromise(transaction);
  }

  async saveAsset(asset: ProductDesignAsset): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(ASSETS_STORE, 'readwrite');
    transaction.objectStore(ASSETS_STORE).put(asset);
    await transactionToPromise(transaction);
  }

  async getAsset(assetId: string): Promise<ProductDesignAsset | null> {
    const database = await this.database();
    const transaction = database.transaction(ASSETS_STORE, 'readonly');
    const asset = await requestToPromise(transaction.objectStore(ASSETS_STORE).get(assetId));
    await transactionToPromise(transaction);
    return (asset as ProductDesignAsset | undefined) || null;
  }

  async listAssets(documentId: string): Promise<ProductDesignAsset[]> {
    const database = await this.database();
    const transaction = database.transaction(ASSETS_STORE, 'readonly');
    const assets = await requestToPromise(
      transaction.objectStore(ASSETS_STORE).index('documentId').getAll(documentId),
    );
    await transactionToPromise(transaction);
    return assets as ProductDesignAsset[];
  }

  async deleteAsset(assetId: string): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(ASSETS_STORE, 'readwrite');
    transaction.objectStore(ASSETS_STORE).delete(assetId);
    await transactionToPromise(transaction);
  }

  async saveCheckpoint(checkpoint: ProductDesignCheckpoint): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(CHECKPOINTS_STORE, 'readwrite');
    transaction.objectStore(CHECKPOINTS_STORE).put({
      ...checkpoint,
      document: cloneProductDesignDocument(checkpoint.document),
    });
    await transactionToPromise(transaction);
  }

  async listCheckpoints(documentId: string): Promise<ProductDesignCheckpoint[]> {
    const database = await this.database();
    const transaction = database.transaction(CHECKPOINTS_STORE, 'readonly');
    const checkpoints = await requestToPromise(
      transaction.objectStore(CHECKPOINTS_STORE).index('documentId').getAll(documentId),
    );
    await transactionToPromise(transaction);
    return (checkpoints as ProductDesignCheckpoint[])
      .map((checkpoint) => ({
        ...checkpoint,
        document: normalizeProductDesignDocument(checkpoint.document),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async deleteCheckpoint(checkpointId: string): Promise<void> {
    const database = await this.database();
    const transaction = database.transaction(CHECKPOINTS_STORE, 'readwrite');
    transaction.objectStore(CHECKPOINTS_STORE).delete(checkpointId);
    await transactionToPromise(transaction);
  }
}

export class MemoryProductDesignRepository implements ProductDesignRepository {
  private readonly documents = new Map<string, ProductDesignDocument>();
  private readonly assets = new Map<string, ProductDesignAsset>();
  private readonly checkpoints = new Map<string, ProductDesignCheckpoint>();

  async listDocuments(projectId: string): Promise<ProductDesignDocument[]> {
    return Array.from(this.documents.values())
      .filter((document) => document.projectId === projectId)
      .map(cloneProductDesignDocument)
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getDocument(documentId: string): Promise<ProductDesignDocument | null> {
    const document = this.documents.get(documentId);
    return document ? cloneProductDesignDocument(document) : null;
  }

  async saveDocument(document: ProductDesignDocument): Promise<void> {
    this.documents.set(document.id, cloneProductDesignDocument(document));
  }

  async deleteDocument(documentId: string): Promise<void> {
    this.documents.delete(documentId);
    for (const [assetId, asset] of this.assets) {
      if (asset.documentId === documentId) this.assets.delete(assetId);
    }
    for (const [checkpointId, checkpoint] of this.checkpoints) {
      if (checkpoint.documentId === documentId) this.checkpoints.delete(checkpointId);
    }
  }

  async saveAsset(asset: ProductDesignAsset): Promise<void> {
    this.assets.set(asset.id, asset);
  }

  async getAsset(assetId: string): Promise<ProductDesignAsset | null> {
    return this.assets.get(assetId) || null;
  }

  async listAssets(documentId: string): Promise<ProductDesignAsset[]> {
    return Array.from(this.assets.values()).filter((asset) => asset.documentId === documentId);
  }

  async deleteAsset(assetId: string): Promise<void> {
    this.assets.delete(assetId);
  }

  async saveCheckpoint(checkpoint: ProductDesignCheckpoint): Promise<void> {
    this.checkpoints.set(checkpoint.id, {
      ...checkpoint,
      document: cloneProductDesignDocument(checkpoint.document),
    });
  }

  async listCheckpoints(documentId: string): Promise<ProductDesignCheckpoint[]> {
    return Array.from(this.checkpoints.values())
      .filter((checkpoint) => checkpoint.documentId === documentId)
      .map((checkpoint) => ({
        ...checkpoint,
        document: cloneProductDesignDocument(checkpoint.document),
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async deleteCheckpoint(checkpointId: string): Promise<void> {
    this.checkpoints.delete(checkpointId);
  }
}

let browserRepository: ProductDesignRepository | null = null;

export function createProductDesignRepository(): ProductDesignRepository {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return new MemoryProductDesignRepository();
  }
  browserRepository ||= new IndexedDbProductDesignRepository();
  return browserRepository;
}
