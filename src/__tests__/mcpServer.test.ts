import { describe, expect, it } from 'vitest';
import { HardwareStudioMCPServer } from '../../packages/mcp-server/mcpServer';
import type { Project } from '../types';

function sampleProject(): Project {
  return {
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
}

describe('Hardware Studio Native MCP Server Tests', () => {
  it('executes read tools against cloned live project state', () => {
    const project = sampleProject();
    const mcp = new HardwareStudioMCPServer(project);
    const response = mcp.callTool('get_project_summary');

    expect(response.success).toBe(true);
    expect(response.data.projectName).toBe('MCP Test Product');
    expect(response.data.componentsCount).toBe(1);

    const exposed = mcp.getProject();
    exposed.projectName = 'External mutation';
    expect(mcp.getProject().projectName).toBe('MCP Test Product');
  });

  it('requires host-side human approval before applying a reversible requirement proposal', () => {
    const mcp = new HardwareStudioMCPServer(sampleProject());
    const proposal = mcp.callTool('draft_requirement', {
      proposedBy: 'Design Agent',
      title: 'Ingress protection',
      description: 'Enclosure must resist the approved water-ingress test.',
      priority: 'High',
      acceptanceCriteria: ['Pass the documented ingress test.'],
    });
    expect(proposal.success).toBe(true);
    const proposalId = proposal.data.proposalId as string;
    expect(mcp.getProject().requirements).toHaveLength(1);

    const unapprovedApply = mcp.callTool('apply_draft', { proposalId, userApproved: true });
    expect(unapprovedApply.success).toBe(false);
    expect(unapprovedApply.error).toContain('host-side human approval');
    expect(mcp.getProject().requirements).toHaveLength(1);

    const approval = mcp.approveProposal(proposalId, 'Ankit / local reviewer');
    expect(approval.success).toBe(true);

    const applied = mcp.callTool('apply_draft', { proposalId });
    expect(applied.success).toBe(true);
    expect(applied.data.status).toBe('Applied');
    expect(applied.data.approvedBy).toBe('Ankit / local reviewer');
    expect(mcp.getProject().requirements).toHaveLength(2);
    expect(mcp.getProject().requirements?.[1].source).toContain(proposalId);
  });

  it('blocks structural generic patches even after host approval', () => {
    const mcp = new HardwareStudioMCPServer(sampleProject());
    const proposal = mcp.callTool('propose_engineering_change', {
      description: 'Replace component array directly',
      patch: { boardComponents: [] },
    });
    const proposalId = proposal.data.proposalId as string;
    expect(mcp.approveProposal(proposalId, 'Reviewer').success).toBe(true);

    const applied = mcp.callTool('apply_engineering_change', { proposalId });
    expect(applied.success).toBe(false);
    expect(applied.error).toContain('Structural MCP patch blocked');
    expect(mcp.getProject().boardComponents).toHaveLength(1);
  });

  it('never trusts an MCP-supplied approval boolean for direct component deletion', () => {
    const mcp = new HardwareStudioMCPServer(sampleProject());
    const response = mcp.callTool('delete_component', { componentId: 'c1', userApproved: true });

    expect(response.success).toBe(false);
    expect(response.error).toContain('Direct component deletion through MCP is disabled');
    expect(mcp.getProject().boardComponents).toHaveLength(1);
  });

  it('exposes collaboration change queue and previously listed lifecycle resources', () => {
    const mcp = new HardwareStudioMCPServer(sampleProject());
    mcp.callTool('draft_requirement', { title: 'Req 2', description: 'Second requirement' });

    expect(mcp.getResource('hardware-studio://changes').proposals).toHaveLength(1);
    expect(mcp.getResource('hardware-studio://firmware')).not.toHaveProperty('error');
    expect(mcp.getResource('hardware-studio://revisions')).not.toHaveProperty('error');
    expect(mcp.getResource('hardware-studio://releases')).not.toHaveProperty('error');
  });
});
