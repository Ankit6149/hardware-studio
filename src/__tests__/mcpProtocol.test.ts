import { beforeEach, describe, expect, it } from 'vitest';
import { HardwareStudioMCPServer } from '../../packages/mcp-server/mcpServer';
import { createStdioMCPServer } from '../../packages/mcp-server/mcpServerStdio';
import { useProjectStore } from '../store/projectStore';

describe('Slice 8 MCP Live Project Integration & Stdio Server', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
  });

  it('initializes MCP server with live project context', () => {
    const liveProject = useProjectStore.getState();
    const mcpServer = new HardwareStudioMCPServer(liveProject);

    const summary = mcpServer.callTool('get_product_summary');
    expect(summary.success).toBe(true);
    expect(summary.data.projectName).toBe(liveProject.projectName);
    expect(summary.data.componentsCount).toBe((liveProject.boardComponents || []).length);
  });

  it('keeps draft requirements reversible until the host records human approval', () => {
    const liveProject = useProjectStore.getState();
    const mcpServer = new HardwareStudioMCPServer(liveProject);
    const initialRequirementCount = (liveProject.requirements || []).length;

    const draft = mcpServer.callTool('draft_requirement', {
      title: 'IP67 Waterproof Enclosure Requirement',
      description: 'Must withstand the approved ingress test procedure.',
      priority: 'High',
    });
    expect(draft.success).toBe(true);
    const proposalId = draft.data.proposalId as string;
    expect(mcpServer.getProject().requirements || []).toHaveLength(initialRequirementCount);

    const blockedApply = mcpServer.callTool('apply_draft', { proposalId, userApproved: true });
    expect(blockedApply.success).toBe(false);

    expect(mcpServer.approveProposal(proposalId, 'Local reviewer').success).toBe(true);
    const applied = mcpServer.callTool('apply_draft', { proposalId });
    expect(applied.success).toBe(true);
    expect(applied.data.status).toBe('Applied');
    expect((mcpServer.getProject().requirements || []).length).toBe(initialRequirementCount + 1);
  });

  it('disables direct destructive MCP mutation even when the agent supplies userApproved', () => {
    const liveProject = useProjectStore.getState();
    const mcpServer = new HardwareStudioMCPServer(liveProject);
    const response = mcpServer.callTool('delete_component', {
      componentId: 'comp_temp_c1',
      userApproved: true,
    });

    expect(response.success).toBe(false);
    expect(response.error).toContain('Direct component deletion through MCP is disabled');
  });

  it('instantiates the stdio MCP server cleanly with the hardened core', () => {
    const stdioApp = createStdioMCPServer();
    expect(stdioApp.server).toBeDefined();
    expect(stdioApp.mcpCore).toBeDefined();
    expect(stdioApp.mcpCore.getResource('hardware-studio://changes')).not.toHaveProperty('error');
  });
});
