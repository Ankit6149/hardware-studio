import { describe, expect, it } from 'vitest';
import { createProductDesignDocument, createProductDesignId } from '../lib/product-design/model';
import { MemoryProductDesignRepository } from '../lib/product-design/repository';
import type { ProductDesignAsset, ProductDesignCheckpoint } from '../lib/product-design/types';

describe('Product Design repository contract', () => {
  it('stores independent project documents and returns defensive clones', async () => {
    const repository = new MemoryProductDesignRepository();
    const first = createProductDesignDocument('project-a', 'First concept');
    const second = createProductDesignDocument('project-b', 'Other project');

    await repository.saveDocument(first);
    await repository.saveDocument(second);

    const documents = await repository.listDocuments('project-a');
    expect(documents).toHaveLength(1);
    expect(documents[0].id).toBe(first.id);

    documents[0].name = 'Mutated outside repository';
    expect((await repository.getDocument(first.id))?.name).toBe('First concept');
  });

  it('stores binary reference assets separately from document JSON', async () => {
    const repository = new MemoryProductDesignRepository();
    const document = createProductDesignDocument('project-a');
    const asset: ProductDesignAsset = {
      id: createProductDesignId('asset'),
      documentId: document.id,
      fileName: 'reference.png',
      mimeType: 'image/png',
      size: 4,
      sourceUrl: '',
      attribution: 'Original concept photo',
      license: 'User-owned',
      altText: 'Product reference',
      blob: new Blob([new Uint8Array([1, 2, 3, 4])], { type: 'image/png' }),
      createdAt: new Date().toISOString(),
    };

    await repository.saveDocument(document);
    await repository.saveAsset(asset);

    expect((await repository.getAsset(asset.id))?.blob.size).toBe(4);
    expect(await repository.listAssets(document.id)).toHaveLength(1);
    expect(JSON.stringify(document)).not.toContain('data:image');
  });

  it('stores named checkpoints and removes dependent records with a document', async () => {
    const repository = new MemoryProductDesignRepository();
    const document = createProductDesignDocument('project-a');
    const checkpoint: ProductDesignCheckpoint = {
      id: createProductDesignId('checkpoint'),
      documentId: document.id,
      name: 'Initial direction',
      description: '',
      createdAt: new Date().toISOString(),
      document,
    };
    const asset: ProductDesignAsset = {
      id: createProductDesignId('asset'),
      documentId: document.id,
      fileName: 'reference.png',
      mimeType: 'image/png',
      size: 1,
      sourceUrl: '',
      attribution: '',
      license: '',
      altText: '',
      blob: new Blob(['x'], { type: 'image/png' }),
      createdAt: new Date().toISOString(),
    };

    await repository.saveDocument(document);
    await repository.saveCheckpoint(checkpoint);
    await repository.saveAsset(asset);
    expect(await repository.listCheckpoints(document.id)).toHaveLength(1);

    await repository.deleteDocument(document.id);

    expect(await repository.getDocument(document.id)).toBeNull();
    expect(await repository.listCheckpoints(document.id)).toEqual([]);
    expect(await repository.listAssets(document.id)).toEqual([]);
  });
});
