import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { exportBlueprintSheetsMarkdown } from '../lib/exportBlueprintSheets';
import {
  generateNativeGerberCopperTop,
  generateNativeGerberCopperBottom,
  generateNativeGerberBoardOutline,
  generateNativeExcellonDrills,
  generateNativeCplDraftCsv
} from '../lib/nativeExports';

describe('Live Blueprint Synchronization & Manufacturing Output Tests', () => {
  it('should generate synchronized blueprint sheets from live project data', () => {
    const store = useProjectStore.getState();
    const markdown = exportBlueprintSheetsMarkdown(store);

    expect(markdown).toBeDefined();
    expect(markdown).toContain('SH 01: COVER / PRODUCT RELEASE INDEX');
    expect(markdown).toContain('SH 16: MISSING FILES / FACTORY READINESS SHEET');
  });

  it('should export native draft Gerber, drill, and CPL files with required DFM disclaimer labels', () => {
    const store = useProjectStore.getState();

    const topCopper = generateNativeGerberCopperTop(store);
    const bottomCopper = generateNativeGerberCopperBottom(store);
    const outline = generateNativeGerberBoardOutline(store);
    const drills = generateNativeExcellonDrills(store);
    const cpl = generateNativeCplDraftCsv(store);

    expect(topCopper).toContain('Generated In App by Hardware Studio');
    expect(topCopper).toContain('DFM validation');
    expect(bottomCopper).toContain('Bottom Copper artwork layer');
    expect(outline).toContain('Board physical contour outline');
    expect(drills).toContain('M48');
    expect(cpl).toContain('Designator,Comment / Component Name');
  });
});
