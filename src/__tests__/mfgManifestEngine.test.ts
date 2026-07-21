import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { generateManufacturingManifestPackage, computeSHA256 } from '../lib/blueprints/mfgManifestEngine';

describe('Slice 9 Real SHA-256 Manufacturing Manifest Engine', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('should compute valid 64-character hex SHA-256 digests', () => {
    const hash = computeSHA256('Hardware Studio V1 Production Content');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('should generate complete manufacturing package with real SHA-256 digests for all 7 file types', () => {
    const project = useProjectStore.getState();
    const manifestPkg = generateManufacturingManifestPackage(project);

    expect(manifestPkg.packageId).toBeDefined();
    expect(manifestPkg.packageSha256).toHaveLength(64);
    expect(manifestPkg.packageSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(manifestPkg.files.length).toBe(7);

    manifestPkg.files.forEach(file => {
      expect(file.fileName).toBeDefined();
      expect(file.sizeBytes).toBeGreaterThan(0);
      expect(file.sha256).toHaveLength(64);
      expect(file.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(file.sha256).not.toContain('sha256_'); // Must NOT be fake rolling hash string
    });
  });

  it('should deterministically produce different SHA-256 hashes when project state changes', () => {
    const store = useProjectStore.getState();
    const manifest1 = generateManufacturingManifestPackage(store);

    // Modify board components
    store.addBoardComponent({
      id: 'comp_manifest_test',
      boardId: 'board-main',
      referenceDesignator: 'U99',
      componentName: 'Cryptographic Accelerator',
      footprint: 'QFN40'
    });

    const manifest2 = generateManufacturingManifestPackage(useProjectStore.getState());
    expect(manifest1.packageSha256).not.toEqual(manifest2.packageSha256);
  });
});
