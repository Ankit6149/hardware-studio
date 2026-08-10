import { describe, it, expect } from 'vitest';
import { exportDrawingToDxf } from '../lib/blueprints/blueprintDxfExporter';
import { exportBlueprintPackDxf } from '../lib/blueprintPackExport';
import { BlueprintPack } from '../lib/blueprintSheetTypes';

describe('Engineering Blueprints & Multi-Sheet Manufacturing Pack Solidification', () => {
  const samplePack: BlueprintPack = {
    id: 'pack_100',
    projectName: 'Commercial Hardware Product',
    generatedAt: new Date().toISOString(),
    revision: 'A.1',
    status: 'Generated In App',
    warnings: [],
    summary: {
      totalSheets: 1,
      generatedSheets: 1,
      missingDataSheets: 0,
      warnings: 0,
      errors: 0,
      blockers: 0,
    },
    sheets: [
      {
        id: 's1',
        sheetNo: '1',
        title: 'Mechanical Assembly Cutouts',
        category: 'mechanical',
        status: 'Generated In App',
        drawing: {
          viewBox: '0 0 500 300',
          objects: [
            { id: 'obj1', type: 'board', label: 'Shell Outer Contour', x: 20, y: 30, width: 100, height: 60 },
            { id: 'obj2', type: 'component', label: 'Mounting Screw Boss', x: 40, y: 50, width: 10, height: 10 },
          ],
          connections: [],
          dimensions: [
            { id: 'dim1', label: 'Width', from: { x: 20, y: 30 }, to: { x: 120, y: 30 }, unit: 'mm' },
          ],
          callouts: [],
        },
        notes: ['Material: Aluminum 6061-T6', 'Anodized finish'],
        tables: [],
        warnings: [],
        disclaimer: 'For manufacturing reference only',
        sourceObjects: [{ id: 'so1', label: 'Outer Shell', type: 'Component' }],
      },
    ],
  };

  it('should export drawing objects and dimensions to DXF R12 format', () => {
    const dxfString = exportDrawingToDxf(samplePack.sheets[0].drawing, 'Mechanical Assembly Cutouts');

    expect(dxfString).toContain('SECTION');
    expect(dxfString).toContain('HEADER');
    expect(dxfString).toContain('$ACADVER');
    expect(dxfString).toContain('AC1009');
    expect(dxfString).toContain('ENTITIES');
    expect(dxfString).toContain('OUTLINE');
    expect(dxfString).toContain('DIMENSION');
    expect(dxfString).toContain('EOF');
  });

  it('should export multi-sheet DXF package array', () => {
    const dxfFiles = exportBlueprintPackDxf(samplePack);

    expect(dxfFiles.length).toBe(1);
    expect(dxfFiles[0].filename).toBe('Sheet_1_Mechanical_Assembly_Cutouts.dxf');
    expect(dxfFiles[0].dxfContent).toContain('100');
  });
});
