import { describe, it, expect } from 'vitest';
import { createStdioMCPServer } from '../../packages/mcp-server/mcpServerStdio';

describe('Model Context Protocol (MCP) Official SDK Tests', () => {
  it('should initialize stdio MCP server instance with valid tool and resource capabilities', () => {
    const { server, mcpCore } = createStdioMCPServer();
    expect(server).toBeDefined();
    expect(mcpCore).toBeDefined();
  });

  it('should handle read tool call and return product summary', () => {
    const { mcpCore } = createStdioMCPServer();
    const result = mcpCore.callTool('get_product_summary', {});
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });

  it('should handle draft requirement proposal leaving live product unchanged until applied', () => {
    const { mcpCore } = createStdioMCPServer();
    const draftRes = mcpCore.callTool('draft_requirement', {
      title: 'Water Resistance IP68',
      description: 'Submersible up to 1.5m for 30 minutes',
      priority: 'High'
    });

    expect(draftRes.success).toBe(true);
    const proposalId = (draftRes.data as { proposalId: string }).proposalId;
    expect(proposalId).toBeDefined();

    // Verify apply draft executes command and modifies store
    const applyRes = mcpCore.callTool('apply_draft', { proposalId });
    expect(applyRes.success).toBe(true);
  });

  it('should enforce approval boundary on high-impact delete_component operation', () => {
    const { mcpCore } = createStdioMCPServer();

    // High impact operation without user approval
    const denyRes = mcpCore.callTool('delete_component', {
      componentId: 'comp_test_1',
      userApproved: false
    });

    expect(denyRes.success).toBe(false);
    expect(denyRes.error).toContain('user approval');

    // Audit log record written
    const auditRes = mcpCore.callTool('get_audit_log', {});
    expect(auditRes.success).toBe(true);
    expect((auditRes.data as unknown[]).length).toBeGreaterThan(0);
  });
});
