import { describe, expect, it } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { exportBlueprintSheetsJson } from '../lib/exportBlueprintSheets';
import {
  exportBomCsv,
  generateNativeCplDraftCsv,
  generateNativeExcellonDrills,
  generateNativeGerberCopperTop,
  generateReleasePackageManifest,
} from '../lib/nativeExports';

describe('Blueprint and manufacturing release workflow', () => {
  it('keeps blueprint staleness and manufacturing exports tied to explicit board state', () => {
    const store = useProjectStore.getState();

    store.importProjectJSON({
      id: 'proj_blueprint_mfg_1',
      projectName: 'Blueprint Manufacturing System',
      activeBoardId: 'board_main',
      boards: [{
        id: 'board_main',
        name: 'Main Board',
        boardType: 'Rigid',
        dimensionsMm: '50 x 40 mm',
        layerCount: 2,
        status: 'Draft',
      }],
      boardOutlines: [{
        id: 'outline_main',
        boardId: 'board_main',
        width: 50,
        height: 40,
        units: 'mm',
      }],
      boardComponents: [{
        id: 'cmp_bp_1',
        boardId: 'board_main',
        referenceDesignator: 'U1',
        componentName: 'MCU',
        componentType: 'MCU',
        packageName: 'QFN_32',
        footprint: 'QFN_32',
        quantity: 1,
        side: 'Top',
        placementX: 0,
        placementY: 0,
        rotationDeg: 0,
        placementStatus: 'Placed',
        placementCriticality: 'Medium',
        pcb: {
          placed: true,
          xMm: 0,
          yMm: 0,
          rotationDeg: 0,
          side: 'Top',
          locked: false,
          placementStatus: 'Placed',
        },
        pins: [{
          id: 'pin_bp_1',
          componentId: 'cmp_bp_1',
          pinNumber: '1',
          pinName: 'VDD',
          electricalType: 'PowerIn',
          netName: '3V3',
          netId: 'net_3v3',
        }],
      }],
      nets: [{ id: 'net_3v3', netName: '3V3', netType: 'Power' }],
      traces: [],
      vias: [],
      drillHoles: [],
      copperShapes: [],
      blueprintPackStatus: 'Current',
    });

    const bpJsonStr = exportBlueprintSheetsJson(useProjectStore.getState());
    const bpData = JSON.parse(bpJsonStr) as { sheets: unknown[]; projectName: string };
    expect(bpData.sheets.length).toBeGreaterThanOrEqual(10);
    expect(bpData.projectName).toBe('Blueprint Manufacturing System');

    store.markDerivedArtifactsStale('Pin connected via wire');
    expect(useProjectStore.getState().blueprintPackStatus).toBe('Stale');

    const project = useProjectStore.getState();
    const gerberData = generateNativeGerberCopperTop(project);
    const drillData = generateNativeExcellonDrills(project);
    const cplData = generateNativeCplDraftCsv(project);
    const bomData = exportBomCsv(project);

    expect(gerberData).toContain('explicit project geometry only');
    expect(gerberData).not.toContain('board-main');
    expect(drillData).toContain('M48');
    expect(cplData).toContain('canonical PCB millimetres');
    expect(cplData).toContain('"0"');
    expect(bomData).toContain('Reference Designator');

    const manifest = JSON.parse(generateReleasePackageManifest(project)) as {
      releaseManifestVersion: string;
      boardId: string;
      artifacts: { sha256: string; sizeBytes: number }[];
    };

    expect(manifest.releaseManifestVersion).toBe('2.0.0');
    expect(manifest.boardId).toBe('board_main');
    expect(manifest.artifacts).toHaveLength(5);
    expect(manifest.artifacts[0].sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(manifest.artifacts[0].sizeBytes).toBeGreaterThan(0);
  });
});
