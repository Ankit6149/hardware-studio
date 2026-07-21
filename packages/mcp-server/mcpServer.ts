// mcpServer.ts — Native Model Context Protocol server for Hardware Studio V1
import { Project, MCPProposal, MCPAuditRecord } from '../../src/types';
import { runBoardDRC } from '../../src/lib/boardDRC';
import { checkMechanicalInterference } from '../../src/lib/mechanical/mechanicalGeometry';

export type { MCPProposal, MCPAuditRecord };

export class HardwareStudioMCPServer {
  private projectState: Project;

  constructor(initialProject?: Project) {
    this.projectState = initialProject || {
      id: 'proj_mcp_default',
      projectName: 'Hardware Studio Product',
      description: 'MCP Live Project Context',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      activeView: 'master',
      nodes: [],
      edges: [],
      bom: [],
      testing: [],
      powerBudget: [],
      pinMap: [],
      firmwareTasks: [],
      mcpProposals: [],
      mcpAuditRecords: []
    };
  }

  public getProject(): Project {
    return this.projectState;
  }

  public setProject(project: Project): void {
    this.projectState = project;
  }

  public callTool(toolName: string, params: Record<string, any> = {}): { success: boolean; data?: any; error?: string } {
    try {
      this.recordAudit(toolName, params, 'RECEIVED');

      switch (toolName) {
        case 'get_project_summary': {
          return {
            success: true,
            data: {
              id: this.projectState.id,
              projectName: this.projectState.projectName,
              componentsCount: (this.projectState.boardComponents || []).length,
              boardsCount: (this.projectState.boards || []).length,
              wiresCount: (this.projectState.schematicWires || []).length,
              netsCount: (this.projectState.nets || []).length,
              mechanicalObjectsCount: (this.projectState.mechanicalObjects || []).length,
              mechanicalBodiesCount: (this.projectState.mechanicalBodies || []).length,
              firmwareModulesCount: (this.projectState.firmwareModules || []).length,
              firmwareFilesCount: (this.projectState.firmwareSourceFiles || []).length,
              validationTestsCount: (this.projectState.validationTests || []).length,
              validationRunsCount: (this.projectState.validationRuns || []).length,
              proposalsCount: (this.projectState.mcpProposals || []).length
            }
          };
        }

        case 'get_schematic_netlist': {
          return {
            success: true,
            data: {
              nets: this.projectState.nets || [],
              schematicWires: this.projectState.schematicWires || [],
              padNetAssignments: this.projectState.padNetAssignments || []
            }
          };
        }

        case 'get_pcb_drc_issues': {
          const drcIssues = runBoardDRC(this.projectState);
          return {
            success: true,
            data: {
              drcIssuesCount: drcIssues.length,
              drcIssues
            }
          };
        }

        case 'get_mechanical_interferences': {
          const interference = checkMechanicalInterference(this.projectState);
          return {
            success: true,
            data: interference
          };
        }

        case 'get_validation_status': {
          return {
            success: true,
            data: {
              validationTests: this.projectState.validationTests || [],
              validationRuns: this.projectState.validationRuns || []
            }
          };
        }

        case 'propose_engineering_change': {
          const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const proposal: MCPProposal = {
            id: proposalId,
            proposalId,
            timestamp: new Date().toISOString(),
            proposedBy: params.proposedBy || 'MCP Agent',
            description: params.description || 'Proposed Engineering Change',
            domain: params.domain || 'Schematic',
            patch: params.patch || {},
            diffSummary: params.diffSummary || 'Modification patch proposed',
            status: 'Pending'
          };

          const updatedProposals = [...(this.projectState.mcpProposals || []), proposal];
          this.projectState = { ...this.projectState, mcpProposals: updatedProposals };
          this.recordAudit('propose_engineering_change', { proposalId }, 'PROPOSAL_CREATED');

          return {
            success: true,
            data: { proposalId, proposal }
          };
        }

        case 'apply_engineering_change': {
          const proposalId = params.proposalId;
          const proposals = this.projectState.mcpProposals || [];
          const prop = proposals.find(p => p.id === proposalId || p.proposalId === proposalId);

          if (!prop) {
            return { success: false, error: `Proposal ${proposalId} not found` };
          }
          if (prop.status !== 'Pending') {
            return { success: false, error: `Proposal ${proposalId} is already ${prop.status}` };
          }

          // Apply patch to project state
          const patch = prop.patch || {};
          const updatedProject: Project = {
            ...this.projectState,
            ...patch,
            mcpProposals: proposals.map(p => (p.id === prop.id ? { ...p, status: 'Applied' as const } : p))
          };

          this.projectState = updatedProject;
          this.recordAudit('apply_engineering_change', { proposalId }, 'PROPOSAL_APPLIED');

          return {
            success: true,
            data: { proposalId, status: 'Applied', updatedProject: this.projectState }
          };
        }

        case 'reject_engineering_change': {
          const proposalId = params.proposalId;
          const proposals = this.projectState.mcpProposals || [];
          const prop = proposals.find(p => p.id === proposalId || p.proposalId === proposalId);

          if (!prop) {
            return { success: false, error: `Proposal ${proposalId} not found` };
          }

          const updatedProposals = proposals.map(p => (p.id === prop.id ? { ...p, status: 'Rejected' as const } : p));
          this.projectState = { ...this.projectState, mcpProposals: updatedProposals };
          this.recordAudit('reject_engineering_change', { proposalId }, 'PROPOSAL_REJECTED');

          return {
            success: true,
            data: { proposalId, status: 'Rejected' }
          };
        }

        default:
          return { success: false, error: `Unknown MCP tool: ${toolName}` };
      }
    } catch (err: any) {
      return { success: false, error: err.message || String(err) };
    }
  }

  private recordAudit(tool: string, params: Record<string, any>, status: string): void {
    const record: MCPAuditRecord = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      tool,
      params,
      resultStatus: status,
      requiresApproval: tool.includes('apply') || tool.includes('propose'),
      approved: true
    };
    const records = [...(this.projectState.mcpAuditRecords || []), record];
    this.projectState = { ...this.projectState, mcpAuditRecords: records };
  }
}
