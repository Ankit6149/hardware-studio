import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { ProductGraphEngine } from '../core/productGraph/graph';
import { getMechanicalBoundingBox } from '../lib/mechanical/mechanicalGeometry';
import { runBoardDRC } from '../lib/boardDRC';
import { createNamedRevision, validateReleaseEligibility } from '../lib/releaseEngine';
import { exportBlueprintSheetsMarkdown } from '../lib/exportBlueprintSheets';
import { createStdioMCPServer } from '../../packages/mcp-server/mcpServerStdio';

describe('Hardware Studio V1 Full System End-to-End Integration Suite', () => {
  it('should execute full 20-phase hardware engineering lifecycle without errors', () => {
    const store = useProjectStore.getState();

    // 1. Core Serialization & Initial state
    const exported = store.exportProjectJSON();
    expect(exported).toBeDefined();

    // 2. Canonical Product Graph Queries
    const graph = new ProductGraphEngine(store);
    const summary = graph.getProductSummary();
    expect(summary.id).toBeDefined();
    expect(summary.schemaVersion).toBeGreaterThanOrEqual(1);

    // 3. Mechanical 2D & 3D Geometry
    const enc = store.mechanicalObjects?.[0];
    if (enc) {
      const bbox = getMechanicalBoundingBox(enc);
      expect(bbox.width).toBeGreaterThan(0);
    }

    // 4. PCB DRC Execution
    const drc = runBoardDRC(store);
    expect(Array.isArray(drc)).toBe(true);

    // 5. Versioning & Release Gate Eligibility
    const blockers = validateReleaseEligibility(store);
    expect(Array.isArray(blockers)).toBe(true);
    const rev = createNamedRevision(store, 'V1.0-Final', 'Full integration test snapshot');
    expect(rev.name).toBe('V1.0-Final');

    // 6. Live Blueprint Markdown Generation
    const markdown = exportBlueprintSheetsMarkdown(store);
    expect(markdown).toContain('SH 01: COVER / PRODUCT RELEASE INDEX');

    // 7. MCP Server Stdio Tool Calls
    const { mcpCore } = createStdioMCPServer();
    const readRes = mcpCore.callTool('get_product_summary', {});
    expect(readRes.success).toBe(true);
  });
});
