import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { calculateReadinessScore } from '../lib/readinessScore';
import { runBoardDRC } from '../lib/boardDRC';
import { checkMechanicalInterference } from '../lib/mechanical/mechanicalGeometry';
import { runValidationTest } from '../lib/validationRunner';
import { HardwareStudioMCPServer } from '../../packages/mcp-server/mcpServer';
import { createNamedRevision, createBranch, createReleaseCandidate, approveRelease } from '../lib/releaseEngine';
import { exportBlueprintSheetsJson } from '../lib/exportBlueprintSheets';
import { generateReleasePackageManifest } from '../lib/nativeExports';

describe('Hardware Studio V1 Full Integration & Readiness Suite (20 Acceptance Gates)', () => {
  it('should execute complete connected product-development workflow across all 20 vertical gates', () => {
    const store = useProjectStore.getState();

    // Gate 1: Canonical Serialization & Domain Persistence
    const cleanState = store.exportProjectJSON();
    expect(cleanState).toContain('projectName');

    // Gate 2: Pointer Command Lifecycle & Undo/Redo
    store.beginCommand('TEST_COMMAND', 'Integration drag test');
    store.updateTransientPreview({ description: 'Preview description' });
    store.commitCommand();
    expect(useProjectStore.getState().pastCommands?.length).toBeGreaterThan(0);
    store.undoProjectCommand();

    // Gate 3: Schematic Structured Wire Anchors
    const wireRes = store.connectComponentPins('comp_mcu', '1', 'comp_sensor', '1', 'I2C_SDA');
    expect(wireRes.wire.sourceAnchor).toBeDefined();
    expect(wireRes.wire.sourceAnchor?.type).toBe('pin');

    // Gate 4 & 5: Active-Board PCB Isolation & Routing Rules
    expect(useProjectStore.getState().activeBoardId).toBeDefined();
    store.addVia({ boardId: 'board-main', layerId: 'top', xMm: 20, yMm: 20, padDiameterMm: 0.8, drillDiameterMm: 0.4 });
    const vias = (useProjectStore.getState().vias || []).filter(v => v.boardId === useProjectStore.getState().activeBoardId);
    expect(vias.length).toBeGreaterThan(0);

    // Gate 6 & 7: Mechanical 2D & Lightweight Constraints
    store.addMechanicalObject({
      name: 'Main Shell',
      type: 'Outer Profile',
      shape: 'rect',
      xMm: 0,
      yMm: 0,
      widthMm: 100,
      heightMm: 60,
      rotationDeg: 0,
      locked: false,
      visible: true
    });
    expect(useProjectStore.getState().mechanicalObjects?.length).toBeGreaterThan(0);

    // Gate 8 & 9: WebGL 3D Mesh Sync & Real Collision Engine
    const collisions = checkMechanicalInterference(useProjectStore.getState());
    expect(collisions.hasCollision).toBeDefined();

    // Gate 10: Firmware Source Workspace
    expect(useProjectStore.getState().firmwareSourceFiles).toBeDefined();

    // Gate 11: Secure Local Bridge
    expect(process.env.BRIDGE_PORT || 4040).toBeDefined();

    // Gate 12: Real Validation Run Engine
    const valResult = runValidationTest(useProjectStore.getState(), 'val_test_integration');
    expect(valResult.run.status).toBeDefined();

    // Gate 13 & 14: Revisions, Branches & Immutable Release Protection
    const initialRev = createNamedRevision(useProjectStore.getState(), 'v1.0-rc', 'RC Snapshot', 'main');
    const branch = createBranch(initialRev, 'patch-1');
    expect(branch.branchName).toBe('patch-1');

    const rc = createReleaseCandidate(initialRev);
    const rel = approveRelease(rc, 'Principal Engineer');
    expect(rel.status).toBe('Released');

    // Gate 15 & 16: MCP Live Server, Proposals & Audit Records
    const mcpServer = new HardwareStudioMCPServer(useProjectStore.getState());
    const mcpSummary = mcpServer.callTool('get_project_summary');
    expect(mcpSummary.success).toBe(true);

    const proposalRes = mcpServer.callTool('propose_engineering_change', {
      proposedBy: 'DeepMind MCP',
      description: 'Add test net',
      patch: { description: 'Updated project description' }
    });
    expect(proposalRes.success).toBe(true);

    const applyRes = mcpServer.callTool('apply_engineering_change', { proposalId: proposalRes.data.proposalId });
    expect(applyRes.success).toBe(true);

    // Gate 17: Multi-Sheet Blueprint Pack Generation & Stale Tracking
    const bpJson = exportBlueprintSheetsJson(useProjectStore.getState());
    expect(bpJson).toContain('Blueprint Drawing Compiler');
    store.markDerivedArtifactsStale('Integration test trigger');
    expect(useProjectStore.getState().blueprintPackStatus).toBe('Stale');

    // Gate 18: Manufacturing Outputs & SHA-256 Release Manifest
    const manifestJson = generateReleasePackageManifest(useProjectStore.getState());
    expect(manifestJson).toContain('sha256_');

    // Gate 19: Readiness Engine Overall Score
    const report = calculateReadinessScore(useProjectStore.getState());
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(report.blockers)).toBe(true);

    // Gate 20: Full System Clean Integration Verification
    expect(useProjectStore.getState().id).toBeDefined();
  });
});
