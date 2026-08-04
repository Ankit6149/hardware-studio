'use client';

import React, { useRef, useState } from 'react';
import { AlertTriangle, FileImage, Upload } from 'lucide-react';
import { prepareProductDesignImport } from '../../lib/product-design/importPolicy';
import type { ProductDesignAsset, ProductDesignReferenceImage } from '../../lib/product-design/types';
import { useProductDesignStore } from '../../store/productDesignStore';

let importPolicyInstalled = false;

function installSafeImportPolicy(): void {
  if (importPolicyInstalled) return;
  importPolicyInstalled = true;
  const originalImport = useProductDesignStore.getState().importDocument;

  useProductDesignStore.setState({
    importDocument: async (raw: string) => {
      const state = useProductDesignStore.getState();
      const plan = prepareProductDesignImport(
        raw,
        state.documents,
        state.projectId || 'local-project',
      );
      const document = await originalImport(plan.serializedBundle);
      useProductDesignStore.setState({
        persistenceMessage: plan.mode === 'create-conflict-safe-copy'
          ? 'Imported as a new conflict-safe copy; existing work was not overwritten'
          : 'Imported with original identities',
      });
      return document;
    },
  });
}

installSafeImportPolicy();

export const ProductDesignSafetyBoundary: React.FC = () => {
  const document = useProductDesignStore((state) => state.document);
  const missingAssetIds = useProductDesignStore((state) => state.missingAssetIds);
  const repository = useProductDesignStore((state) => state.repository);
  const updateObjectById = useProductDesignStore((state) => state.updateObjectById);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetObjectId, setTargetObjectId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const missingReferences = (document?.objects || []).filter(
    (object): object is ProductDesignReferenceImage =>
      object.type === 'reference-image' && missingAssetIds.includes(object.assetId),
  );

  const requestRelink = (objectId: string) => {
    setTargetObjectId(objectId);
    setError('');
    fileInputRef.current?.click();
  };

  const relink = async (file: File | undefined) => {
    const reference = document?.objects.find(
      (object): object is ProductDesignReferenceImage => object.id === targetObjectId && object.type === 'reference-image',
    );
    if (!file || !reference || !document) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file to repair this reference.');
      return;
    }

    const asset: ProductDesignAsset = {
      id: reference.assetId,
      documentId: document.id,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      size: file.size,
      sourceUrl: reference.sourceUrl,
      attribution: reference.attribution,
      license: reference.license,
      altText: reference.altText || file.name,
      blob: file,
      createdAt: new Date().toISOString(),
    };

    try {
      await repository.saveAsset(asset);
      const state = useProductDesignStore.getState();
      const previousUrl = state.assetUrls[asset.id];
      if (previousUrl && typeof URL !== 'undefined') URL.revokeObjectURL(previousUrl);
      useProductDesignStore.setState({
        assetUrls: {
          ...state.assetUrls,
          [asset.id]: typeof URL !== 'undefined' ? URL.createObjectURL(file) : '',
        },
        missingAssetIds: state.missingAssetIds.filter((assetId) => assetId !== asset.id),
        persistenceStatus: 'saved',
        persistenceMessage: `Relinked ${file.name}`,
      });
      updateObjectById(reference.id, {
        ...reference,
        name: file.name,
        altText: reference.altText || file.name,
      }, 'Relink reference image');
      setTargetObjectId(null);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'The reference image could not be relinked.');
    }
  };

  if (missingReferences.length === 0 && !error) return null;

  return (
    <div className="shrink-0 border-b border-amber-200 bg-amber-50 px-3 py-2 text-amber-950">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void relink(event.target.files?.[0]);
          event.currentTarget.value = '';
        }}
      />
      <div className="flex flex-wrap items-center gap-2">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-[10px] leading-5">
          {error || `${missingReferences.length} reference image${missingReferences.length === 1 ? '' : 's'} is missing from local storage. The design geometry and asset identity are preserved.`}
        </p>
        {missingReferences.map((reference) => (
          <button
            key={reference.id}
            type="button"
            onClick={() => requestRelink(reference.id)}
            className="inline-flex h-8 max-w-52 items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-2.5 text-[10px] font-bold text-amber-900 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            title={`Relink ${reference.name}`}
          >
            <FileImage className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{reference.name}</span>
            <Upload className="h-3.5 w-3.5 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};
