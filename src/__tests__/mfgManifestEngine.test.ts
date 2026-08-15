import { beforeEach, describe, expect, it } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { generateManufacturingManifestPackage, computeSHA256 } from '../lib/blueprints/mfgManifestEngine';
import { ManufacturingContextError } from '../lib/manufacturing/manufacturingContext';

function loadManufacturableProject() {
  useProjectStore.getState().importProjectJSON({
    id: 'proj_mfg_manifest',
    projectName: 'Manufacturing Context Fixture',
    activeBoardId: 'board_mfg',
    boards: [{
      id: 'board_mfg',
      name: 'Main PCB',
      boardType: 'Rigid',
      dimensionsMm: '50 x 40 mm',
      layerCount: 2,
      status: 'Draft',
    }],
    boardComponents: [{
      id: 'cmp_mfg',
      boardId: 'board_mfg',
      referenceDesignator: 'U1',
      componentName: 'Controller',
      componentType: 'MCU',
      value: 'RP2040',
      packageName: 'QFN_32',
      footprint: 'QFN_32',
      partNumber: 'RP2040',
      quantity: 1,
      side: 'Top',
      placementX: 0,
      placementY: 0,
      placementStatus: 'Placed',
      placementCriticality: 'Medium',
      notes: '',
      pcb: {
        placed: true,
        xMm: 0,
        yMm: 0,
        rotationDeg: 0,
        side: 'Top',
        locked: false,
        placementStatus: 'Placed',
      },
      pins: [],
    }],
    nets: [],
    traces: [],
    vias: [],
    drillHoles: [],
    boardOutlines: [],
    blueprintPackStatus: 'Current',
  });
}

describe('SHA-256 manufacturing manifest engine', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('computes valid 64-character hex SHA-256 digests', () => {
    const hash = computeSHA256('Hardware Studio V1 Production Content');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('blocks package generation when real board context is missing', () => {
    expect(() => generateManufacturingManifestPackage(useProjectStore.getState()))
      .toThrow(ManufacturingContextError);
  });

  it('generates a board-bound package only after the context gate passes', () => {
    loadManufacturableProject();
    const manifestPkg = generateManufacturingManifestPackage(useProjectStore.getState());

    expect(manifestPkg.boardId).toBe('board_mfg');
    expect(manifestPkg.boardName).toBe('Main PCB');
    expect(manifestPkg.packageId).toBeDefined();
    expect(manifestPkg.packageSha256).toHaveLength(64);
    expect(manifestPkg.packageSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(manifestPkg.files).toHaveLength(7);

    manifestPkg.files.forEach((file) => {
      expect(file.fileName).toBeDefined();
      expect(file.sizeBytes).toBeGreaterThan(0);
      expect(file.sha256).toHaveLength(64);
      expect(file.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(file.sha256).not.toContain('sha256_');
    });
  });

  it('treats zero PCB coordinates as real placement data', () => {
    loadManufacturableProject();
    expect(() => generateManufacturingManifestPackage(useProjectStore.getState())).not.toThrow();
  });

  it('blocks unresolved component placement instead of inventing coordinates', () => {
    loadManufacturableProject();
    useProjectStore.getState().updateBoardComponent('cmp_mfg', {
      placementX: undefined,
      placementY: undefined,
      placementStatus: 'Unplaced',
      pcb: {
        placed: false,
        xMm: undefined,
        yMm: undefined,
        rotationDeg: 0,
        side: 'Top',
        locked: false,
        placementStatus: 'Unplaced',
      },
    });

    expect(() => generateManufacturingManifestPackage(useProjectStore.getState()))
      .toThrow(/no approved PCB placement/i);
  });

  it('blocks multi-board packaging until serializers are fully board-isolated', () => {
    loadManufacturableProject();
    useProjectStore.getState().addBoard({
      id: 'board_secondary',
      name: 'Secondary PCB',
      boardType: 'Rigid',
      dimensionsMm: '20 x 20 mm',
      layerCount: 2,
      status: 'Draft',
    });

    expect(() => generateManufacturingManifestPackage(useProjectStore.getState()))
      .toThrow(/multi-board projects/i);
  });

  it('changes the package hash when serialized engineering state changes', () => {
    loadManufacturableProject();
    const manifest1 = generateManufacturingManifestPackage(useProjectStore.getState());

    useProjectStore.getState().updateBoardComponent('cmp_mfg', { value: 'RP2040-B1' });
    const manifest2 = generateManufacturingManifestPackage(useProjectStore.getState());

    expect(manifest1.packageSha256).not.toEqual(manifest2.packageSha256);
  });
});
