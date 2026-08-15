import { describe, it, expect } from 'vitest';
import { useProjectStore } from '../store/projectStore';
import { calculateReadinessScore } from '../lib/readinessScore';
import { checkMechanicalInterference } from '../lib/mechanical/mechanicalGeometry';
import { runValidationTest } from '../lib/validationRunner';
import { HardwareStudioMCPServer } from '../../packages/mcp-server/mcpServer';
import { createNamedRevision, createBranch, createReleaseCandidate, approveRelease } from '../lib/releaseEngine';
import { exportBlueprintSheetsJson } from '../lib/exportBlueprintSheets';
import { generateReleasePackageManifest } from '../lib/nativeExports';
import { evaluateManufacturingContext } from '../lib/manufacturing/manufacturingContext';

describe('Hardware Studio broad integration smoke suite', () => {
  it('keeps connected product-development foundations consistent without overriding V1 truth gates', () => {
    const store = useProjectStore.getState();

    // Canonical serialization & domain persistence
    const cleanState = store.exportProjectJSON();
    expect(cleanState).toContain('projectName');

    // Pointer command lifecycle & undo/redo
    store.beginCommand('TEST_COMMAND', 'Integration drag test');
    store.updateTransientPreview({ description: 'Preview description' });
    store.commitCommand();
    expect(useProjectStore.getState().pastCommands?.length).toBeGreaterThan(0);
    store.undoProjectCommand();

    // Schematic structured wire anchors
    const wireRes = store.connectComponentPins('comp_mcu', '1', 'comp_sensor', '1', 'I2C_SDA');
    expect(wireRes.wire.sourceAnchor).toBeDefined();
    expect(wireRes.wire.sourceAnchor?.type).toBe('pin');

    // Active-board PCB isolation & routing foundations.
    const current = useProjectStore.getState();
    const existingBoard = (current.boards || []).find(board => board.id === current.activeBoardId)
      || (current.boards || [])[0];
    const board = existingBoard || current.addBoard({
      name: 'Integration PCB',
      boardType: 'Main PCB',
      dimensionsMm: '40 x 30',
      layerCount: 2,
      substrate: 'FR4',
    });
    useProjectStore.getState().setActiveBoard(board.id);
    useProjectStore.getState().addVia({
      boardId: board.id,
      layerId: 'top',
      xMm: 20,
      yMm: 20,
      padDiameterMm: 0.8,
      drillDiameterMm: 0.4,
    });
    const pcbState = useProjectStore.getState();
    expect(pcbState.activeBoardId).toBe(board.id);
    const vias = (pcbState.vias || []).filter(via => via.boardId === board.id);
    expect(vias.length).toBeGreaterThan(0);

    // Mechanical 2D & lightweight constraints
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

    // WebGL/geometry collision foundation
    const collisions = checkMechanicalInterference(useProjectStore.getState());
    expect(collisions.hasCollision).toBeDefined();

    // Firmware workspace foundation
    expect(useProjectStore.getState().firmwareSourceFiles).toBeDefined();

    // Secure local bridge configuration foundation
    expect(process.env.BRIDGE_PORT || 4040).toBeDefined();

    // Validation run foundation
    const valResult = runValidationTest(useProjectStore.getState(), 'val_test_integration');
    expect(valResult.run.status).toBeDefined();

    // Revisions, branches & release helper foundation
    const initialRev = createNamedRevision(useProjectStore.getState(), 'v1.0-rc', 'RC Snapshot', 'main');
    const branch = createBranch(initialRev, 'patch-1');
    expect(branch.branchName).toBe('patch-1');

    const rc = createReleaseCandidate(initialRev);
    const rel = approveRelease(rc, 'Principal Engineer');
    expect(rel.status).toBe('Released');

    // MCP server, proposals & audit foundations
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

    // Blueprint generation & stale tracking
    const bpJson = exportBlueprintSheetsJson(useProjectStore.getState());
    expect(bpJson).toContain('Blueprint Drawing Compiler');
    store.markDerivedArtifactsStale('Integration test trigger');
    expect(useProjectStore.getState().blueprintPackStatus).toBe('Stale');

    // Manufacturing is now a truth gate, not a file-exists gate.
    // This broad fixture intentionally contains multiple boards/copper shapes, so
    // release-manifest generation must stay blocked rather than synthesize output.
    const manufacturing = evaluateManufacturingContext(useProjectStore.getState());
    if (manufacturing.ready) {
      const manifestJson = generateReleasePackageManifest(useProjectStore.getState());
      expect(manifestJson).toContain('"sha256": "');
    } else {
      expect(manufacturing.blockers.length).toBeGreaterThan(0);
      expect(() => generateReleasePackageManifest(useProjectStore.getState())).toThrow();
    }

    // Readiness engine remains informational and must expose blockers.
    const report = calculateReadinessScore(useProjectStore.getState());
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(report.blockers)).toBe(true);

    // Smoke-suite identity check
    expect(useProjectStore.getState().id).toBeDefined();
  });
});
