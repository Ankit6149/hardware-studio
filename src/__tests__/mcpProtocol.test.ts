import { describe, it, expect, beforeEach } from 'vitest';
import { HardwareStudioMCPServer } from '../../packages/mcp-server/mcpServer';
import { createStdioMCPServer } from '../../packages/mcp-server/mcpServerStdio';
import { useProjectStore } from '../store/projectStore';

describe('Slice 8 MCP Live Project Integration & Stdio Server', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('should initialize MCP server with live project context', () => {
    const liveProject = useProjectStore.getState();
    const mcpServer = new HardwareStudioMCPServer(liveProject);

    const summaryRes = mcpServer.callTool('get_product_summary');
    expect(summaryRes.success).toBe(true);
    expect(summaryRes.data.projectName).toBe(liveProject.projectName);
    expect(summaryRes.data.componentsCount).toBe((liveProject.boardComponents || []).length);
  });

  it('should create reversible draft proposal without mutating live state until applied', () => {
    const liveProject = useProjectStore.getState();
    const mcpServer = new HardwareStudioMCPServer(liveProject);

    const initialCompCount = (liveProject.boardComponents || []).length;

    // 1. Create draft proposal
    const draftRes = mcpServer.callTool('draft_requirement', {
      title: 'IP67 Waterproof Enclosure Requirement',
      description: 'Must withstand 1m submersion for 30 minutes',
      priority: 'High'
    });

    expect(draftRes.success).toBe(true);
    const proposalId = draftRes.data.proposalId;
    expect(proposalId).toBeDefined();

    // Verify live state has pending proposal record
    const proposals = mcpServer.getProject().mcpProposals || [];
    expect(proposals.length).toBe(1);
    expect(proposals[0].status).toBe('Pending');

    // 2. Apply draft proposal
    const applyRes = mcpServer.callTool('apply_draft', { proposalId });
    expect(applyRes.success).toBe(true);
    expect(applyRes.data.status).toBe('Applied');

    const updatedProposals = mcpServer.getProject().mcpProposals || [];
    expect(updatedProposals[0].status).toBe('Applied');
  });

  it('should require explicit user approval for high-impact delete_component tool', () => {
    const liveProject = useProjectStore.getState();
    liveProject.boardComponents = [
      {
        id: 'comp_temp_c1',
        boardId: 'board_main',
        referenceDesignator: 'C1',
        componentName: '100nF Capacitor',
        componentType: 'Capacitor',
        footprint: '0603',
        packageName: '0603',
        placementCriticality: 'Medium',
        partNumber: 'CAP_100NF',
        quantity: 1,
        value: '100nF',
        notes: ''
      }
    ];

    const mcpServer = new HardwareStudioMCPServer(liveProject);

    // 1. Delete without user approval -> Rejected
    const noApprovalRes = mcpServer.callTool('delete_component', {
      componentId: 'comp_temp_c1',
      userApproved: false
    });

    expect(noApprovalRes.success).toBe(false);
    expect(noApprovalRes.error).toContain('requires user approval');

    // 2. Delete with user approval -> Success
    const approvedRes = mcpServer.callTool('delete_component', {
      componentId: 'comp_temp_c1',
      userApproved: true
    });

    expect(approvedRes.success).toBe(true);
    expect(approvedRes.data.status).toBe('Deleted');

    const remaining = mcpServer.getProject().boardComponents || [];
    expect(remaining.length).toBe(0);
  });

  it('should instantiate stdio MCP server cleanly', () => {
    const stdioApp = createStdioMCPServer();
    expect(stdioApp.server).toBeDefined();
    expect(stdioApp.mcpCore).toBeDefined();
  });
});
