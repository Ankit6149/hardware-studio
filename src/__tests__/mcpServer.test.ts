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
    const prod = mcp.handleReadTool('get_current_product') as Record<string, string>;
    expect(prod.name).toBe('MCP Test Product');

    const reqs = mcp.handleReadTool('get_requirements') as Array<unknown>;
    expect(reqs).toHaveLength(1);

    const audit = mcp.getAuditLog();
    expect(audit.length).toBeGreaterThanOrEqual(2);
    expect(audit[0].tool).toBe('get_current_product');
  });

  it('should create draft proposal without mutating active project until applied', () => {
    const mcp = new HardwareStudioMCPServer(sampleProject);
    const prop = mcp.handleDraftTool('add_requirement', { title: 'Draft Req 2' });
    expect(prop.status).toBe('Draft');

    // Requirements list should remain unchanged before apply
    const reqsBefore = mcp.handleReadTool('get_requirements') as Array<unknown>;
    expect(reqsBefore).toHaveLength(1);

    // Apply draft proposal
    const applied = mcp.applyDraftProposal(prop.id);
    expect(applied.status).toBe('Applied');
  });

  it('should enforce approval boundary for high-impact tools', () => {
    const mcp = new HardwareStudioMCPServer(sampleProject);
    expect(() => mcp.handleHighImpactAction('create_release', { version: 'v1.0' }, false))
      .toThrow('Action "create_release" requires explicit user approval');

    // Executed successfully when approved
    const res = mcp.handleHighImpactAction('create_release', { version: 'v1.0' }, true) as Record<string, string>;
    expect(res.status).toBe('Executed');
  });
});
