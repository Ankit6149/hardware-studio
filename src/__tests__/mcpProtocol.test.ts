import { describe, it, expect } from 'vitest';
import { HardwareStudioMCPServer } from '../../packages/mcp-server/mcpServer';
import { useProjectStore } from '../store/projectStore';
import { Project } from '../types';

describe('Slice 11 Complete MCP Server, Protocol & Real Draft/Apply System Tests', () => {
  it('should initialize live project context, query live domains, draft proposals without live state mutation, apply proposals, and maintain audit log', () => {
    // 1. Initial live project state
    const testProject: Project = {
      id: 'proj_mcp_live_1',
      projectName: 'MCP Connected Smart Hardware',
      description: 'Live MCP Test Project',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      activeView: 'master',
      activeBoardId: 'board_main',
      boards: [{ id: 'board_main', name: 'Main Board', boardType: 'Rigid PCB', layerCount: 2, status: 'In Layout' }],
      boardOutlines: [{ id: 'out_1', boardId: 'board_main', points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 80 }, { x: 0, y: 80 }] }],
      nets: [{ id: 'net_1', netName: '3V3', netType: 'Power', voltage: '3.3V', sourceComponent: 'U1', sourcePin: '1', targetComponent: 'C1', targetPin: '1', protocol: 'Power', currentEstimate: '50mA', impedanceRequirement: 'N/A', notes: '' }],
      boardComponents: [
        {
          id: 'cmp_mcp_1',
          boardId: 'board_main',
          circuitBlockId: 'cb_1',
          referenceDesignator: 'U1',
          componentName: 'MCU',
          componentType: 'MCU',
          value: 'STM32',
          packageName: 'QFN_32',
          footprint: 'QFN_32',
          partNumber: 'STM32F4',
          quantity: 1,
          side: 'Top',
          placementCriticality: 'High',
          notes: '',
          placementX: 20,
          placementY: 20,
          placementStatus: 'Placed',
          pins: []
        }
      ],
      mcpProposals: [],
      mcpAuditRecords: []
    };

    const mcpServer = new HardwareStudioMCPServer(testProject);

    // 2. Call get_project_summary
    const summaryRes = mcpServer.callTool('get_project_summary');
    expect(summaryRes.success).toBe(true);
    expect(summaryRes.data.projectName).toBe('MCP Connected Smart Hardware');
    expect(summaryRes.data.componentsCount).toBe(1);

    // 3. Call get_schematic_netlist
    const netlistRes = mcpServer.callTool('get_schematic_netlist');
    expect(netlistRes.success).toBe(true);
    expect(netlistRes.data.nets.length).toBe(1);

    // 4. Call get_pcb_drc_issues
    const drcRes = mcpServer.callTool('get_pcb_drc_issues');
    expect(drcRes.success).toBe(true);
    expect(Array.isArray(drcRes.data.drcIssues)).toBe(true);

    // 5. Call get_mechanical_interferences
    const mechRes = mcpServer.callTool('get_mechanical_interferences');
    expect(mechRes.success).toBe(true);
    expect(mechRes.data.hasCollision).toBeDefined();

    // 6. Call propose_engineering_change (creates proposal with status Pending)
    const proposeRes = mcpServer.callTool('propose_engineering_change', {
      proposedBy: 'DeepMind Assistant',
      description: 'Add decoupling capacitor C101 on 3V3 rail',
      domain: 'Schematic',
      patch: {
        boardComponents: [
          ...testProject.boardComponents,
          {
            id: 'cmp_mcp_cap',
            boardId: 'board_main',
            referenceDesignator: 'C101',
            componentName: 'Capacitor',
            componentType: 'Capacitor',
            packageName: 'C_0603',
            footprint: 'C_0603',
            quantity: 1,
            side: 'Top',
            placementX: 30,
            placementY: 20,
            placementStatus: 'Placed',
            pins: []
          }
        ]
      }
    });

    expect(proposeRes.success).toBe(true);
    const proposalId = proposeRes.data.proposalId;
    expect(proposalId).toBeDefined();

    // 7. Confirm proposal does NOT mutate live project state until applied
    const liveProjectBefore = mcpServer.getProject();
    expect(liveProjectBefore.boardComponents.length).toBe(1); // Still 1 component!
    expect(liveProjectBefore.mcpProposals.length).toBe(1);
    expect(liveProjectBefore.mcpProposals[0].status).toBe('Pending');

    // 8. Call apply_engineering_change
    const applyRes = mcpServer.callTool('apply_engineering_change', { proposalId });
    expect(applyRes.success).toBe(true);
    expect(applyRes.data.status).toBe('Applied');

    // 9. Verify live project updated after apply
    const liveProjectAfter = mcpServer.getProject();
    expect(liveProjectAfter.boardComponents.length).toBe(2);
    expect(liveProjectAfter.boardComponents.some(c => c.id === 'cmp_mcp_cap')).toBe(true);
    expect(liveProjectAfter.mcpAuditRecords.length).toBeGreaterThan(0);

    // 10. Persist & reload project with MCP proposals & audit history
    useProjectStore.getState().importProjectJSON(liveProjectAfter);
    const reloaded = useProjectStore.getState();
    expect(reloaded.mcpProposals?.length).toBe(1);
    expect(reloaded.mcpAuditRecords?.length).toBeGreaterThan(0);
    expect(reloaded.mcpProposals?.[0]?.status).toBe('Applied');
  });
});
