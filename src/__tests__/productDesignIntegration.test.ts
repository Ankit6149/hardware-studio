import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { getNavigationItem } from '../lib/navigationRegistry';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('Product Design Studio integration contracts', () => {
  it('registers Product Design as a distinct connected workbench', () => {
    expect(getNavigationItem('product-design')).toMatchObject({
      label: 'Product Design',
      surface: 'product-studio',
      badge: 'DESIGN',
    });
    expect(getNavigationItem('requirements')?.id).toBe('requirements');
    expect(getNavigationItem('product-architecture')?.id).toBe('product-architecture');
  });

  it('routes the active Product view into the correct ProductStudio mode', () => {
    const appShell = source('../components/AppShell.tsx');
    const productStudio = source('../components/product/ProductStudio.tsx');
    expect(appShell).toContain('<ProductStudio initialMode={viewId} />');
    expect(productStudio).toContain("activeMode === 'product-design'");
    expect(productStudio).toContain('<ProductDesignStudio />');
    expect(productStudio).toContain("activeMode === 'requirements'");
    expect(productStudio).toContain("activeMode === 'product-architecture'");
  });

  it('uses IndexedDB repositories instead of placing Product Design documents in localStorage', () => {
    const repository = source('../lib/product-design/repository.ts');
    const store = source('../store/productDesignStore.ts');
    expect(repository).toContain("const DATABASE_NAME = 'hardware-studio-product-design'");
    expect(repository).toContain("const DOCUMENTS_STORE = 'documents'");
    expect(repository).toContain("const ASSETS_STORE = 'assets'");
    expect(repository).toContain("const CHECKPOINTS_STORE = 'checkpoints'");
    expect(repository).toContain("database.transaction(DOCUMENTS_STORE, 'readwrite')");
    expect(store).not.toContain('localStorage.setItem');
    expect(store).not.toContain('localStorage.getItem');
  });

  it('keeps pointer previews separate and commits one logical persisted command', () => {
    const store = source('../store/productDesignStore.ts');
    const canvas = source('../components/product-design/ProductDesignCanvas.tsx');
    expect(store).toContain('previewPatches');
    expect(store).toContain('commitPreviewPatches');
    expect(canvas).toContain("commitPreviewPatches('Move design objects')");
    expect(canvas).toContain("commitPreviewPatches('Resize design object')");
    expect(canvas).not.toContain('saveDocument(');
  });

  it('uses an event-driven low-power 3D preview and releases WebGL resources', () => {
    const view3d = source('../components/product-design/ProductDesign3DPreview.tsx');
    expect(view3d).toContain("powerPreference: 'low-power'");
    expect(view3d).toContain("controls.addEventListener('change', render)");
    expect(view3d).toContain("window.document.addEventListener('visibilitychange'");
    expect(view3d).toContain('renderer.forceContextLoss()');
    expect(view3d).not.toContain('requestAnimationFrame');
    expect(view3d).toContain('not exact CAD');
  });

  it('does not use native blocking dialogs in the touched Product Design flow', () => {
    const studio = source('../components/product-design/ProductDesignStudio.tsx');
    const canvas = source('../components/product-design/ProductDesignCanvas.tsx');
    const view3d = source('../components/product-design/ProductDesign3DPreview.tsx');
    for (const file of [studio, canvas, view3d]) {
      expect(file).not.toContain('window.alert');
      expect(file).not.toContain('window.confirm');
      expect(file).not.toContain('window.prompt');
    }
  });
});
