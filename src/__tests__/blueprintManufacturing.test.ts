import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { exportBlueprintSheetsJson } from '../lib/exportBlueprintSheets';
import {
  generateNativeGerberCopperTop,
  generateNativeExcellonDrills,
  generateNativeCplDraftCsv,
  exportBomCsv,
  generateReleasePackageManifest
} from '../lib/nativeExports';

describe('Slice 12 Complete Blueprints & Manufacturing Release Workflow Tests', () => {
  it('should generate multi-sheet blueprint pack, track stale state on edits, export manufacturing package, and generate release manifest checksums', () => {
    const store = useProjectStore.getState();

    // 1. Setup project state
    store.importProjectJSON({
      id: 'proj_blueprint_mfg_1',
      projectName: 'Blueprint Manufacturing System',
      activeBoardId: 'board_main',
      boards: [{ id: 'board_main', name: 'Main Board', boardType: 'Rigid', layerCount: 2, status: 'Draft' }],
      boardComponents: [
        {
          id: 'cmp_bp_1',
          boardId: 'board_main',
          referenceDesignator: 'U1',
          componentName: 'MCU',
          componentType: 'MCU',
          packageName: 'QFN_32',
          footprint: 'QFN_32',
          quantity: 1,
          side: 'Top',
          placementX: 25,
          placementY: 25,
          placementStatus: 'Placed',
          pins: [{ id: 'pin_bp_1', componentId: 'cmp_bp_1', pinNumber: '1', pinName: 'VDD', electricalType: 'PowerIn', netName: '3V3' }]
        }
      ],
      nets: [{ id: 'net_3v3', netName: '3V3', netType: 'Power' }],
      blueprintPackStatus: 'Current'
    });

    // 2. Generate multi-sheet blueprint pack
    const bpJsonStr = exportBlueprintSheetsJson(useProjectStore.getState());
    const bpData = JSON.parse(bpJsonStr);
    expect(bpData.sheets.length).toBeGreaterThanOrEqual(10);
    expect(bpData.projectName).toBe('Blueprint Manufacturing System');

    // 3. Make edit in schematic -> confirm blueprint marked stale
    store.markDerivedArtifactsStale('Pin connected via wire');
    expect(useProjectStore.getState().blueprintPackStatus).toBe('Stale');

    // 4. Generate Manufacturing Package Exports (Gerber, Drill, Pick & Place, BOM)
    const gerberData = generateNativeGerberCopperTop(useProjectStore.getState());
    const drillData = generateNativeExcellonDrills(useProjectStore.getState());
    const cplData = generateNativeCplDraftCsv(useProjectStore.getState());
    const bomData = exportBomCsv(useProjectStore.getState());

    expect(gerberData).toContain('Gerber');
    expect(drillData).toContain('M48');
    expect(cplData).toContain('Designator');
    expect(bomData).toContain('Reference Designator');

    // 5. Generate Release Package Manifest with SHA-256 Checksums
    const manifestJson = generateReleasePackageManifest(useProjectStore.getState());
    const manifest = JSON.parse(manifestJson);

    expect(manifest.releaseManifestVersion).toBe('1.0.0');
    expect(manifest.artifacts.length).toBe(5);
    expect(manifest.artifacts[0].sha256).toContain('sha256_');
    expect(manifest.artifacts[0].sizeBytes).toBeGreaterThan(0);
  });
});
