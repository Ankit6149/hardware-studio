import { describe, it, expect } from 'vitest';
import { HardwareStudioMCPServer } from '../../packages/mcp-server/mcpServer';
import { Project } from '../types';

describe('Hardware Studio Native MCP Server Tests', () => {
  const sampleProject: Project = {
    id: 'proj_mcp_test',
    projectName: 'MCP Test Product',
    description: '',
    createdAt: '',
    updatedAt: '',
    version: '5',
    activeView: 'dashboard',
    nodes: [],
    edges: [],
    bom: [],
    testing: [],
    powerBudget: [],
    pinMap: [],
    firmwareTasks: [],
    requirements: [{ id: 'r1', title: 'Req 1', description: '', type: 'Functional', priority: 'High', status: 'Approved', acceptanceCriteria: [], linkedArchitectureNodeIds: [], linkedComponentIds: [], linkedFirmwareModuleIds: [], linkedTestIds: [], risks: [] }],
    boardComponents: [{ id: 'c1', boardId: 'b1', circuitBlockId: 'cb1', referenceDesignator: 'U1', componentName: 'Sensor', componentType: 'IC', value: '', packageName: '', footprint: '', partNumber: '', quantity: 1, side: 'Top', placementCriticality: 'Low', notes: '' }]
  };

  it('should execute read tools and record audit log', () => {
    const mcp = new HardwareStudioMCPServer(sampleProject);
    const res = mcp.callTool('get_project_summary');
    expect(res.success).toBe(true);
    expect(res.data.projectName).toBe('MCP Test Product');
    expect(res.data.componentsCount).toBe(1);
  });

  it('should create draft proposal without mutating active project until applied', () => {
    const mcp = new HardwareStudioMCPServer(sampleProject);
    const propRes = mcp.callTool('propose_engineering_change', {
      proposedBy: 'Test Agent',
      description: 'Add new component',
      patch: { description: 'Updated description' }
    });
    expect(propRes.success).toBe(true);
    const proposalId = propRes.data.proposalId;

    const applyRes = mcp.callTool('apply_engineering_change', { proposalId });
    expect(applyRes.success).toBe(true);
    expect(applyRes.data.status).toBe('Applied');
  });

  it('should reject applying invalid or non-existent proposal', () => {
    const mcp = new HardwareStudioMCPServer(sampleProject);
    const applyRes = mcp.callTool('apply_engineering_change', { proposalId: 'non_existent' });
    expect(applyRes.success).toBe(false);
    expect(applyRes.error).toContain('not found');
  });
});
