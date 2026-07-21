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
      activeBoardId: 'board_main',
      boards: [
        {
          id: 'board_main',
          name: 'Main Motherboard',
          boardType: 'Rigid PCB',
          layerCount: 4,
          status: 'Concept'
        }
      ],
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
        case 'get_product_summary':
        case 'get_project_summary': {
          return {
            success: true,
            data: {
              id: this.projectState.id,
              projectName: this.projectState.projectName,
              description: this.projectState.description,
              componentsCount: (this.projectState.boardComponents || []).length,
              boardsCount: (this.projectState.boards || []).length,
              wiresCount: (this.projectState.schematicWires || []).length,
              netsCount: (this.projectState.nets || []).length,
              mechanicalObjectsCount: (this.projectState.mechanicalObjects || []).length,
              mechanicalBodiesCount: (this.projectState.mechanicalBodies || []).length,
              firmwareTasksCount: (this.projectState.firmwareTasks || []).length,
              validationTestsCount: (this.projectState.validationTests || []).length,
              validationRunsCount: (this.projectState.validationRuns || []).length,
              proposalsCount: (this.projectState.mcpProposals || []).length
            }
          };
        }

        case 'get_requirements': {
          return {
            success: true,
            data: {
              requirements: this.projectState.requirements || [],
              count: (this.projectState.requirements || []).length
            }
          };
        }

        case 'get_architecture': {
          return {
            success: true,
            data: {
              nodes: this.projectState.nodes || [],
              edges: this.projectState.edges || [],
              architectureNodes: this.projectState.architectureNodes || [],
              architectureConnections: this.projectState.architectureConnections || []
            }
          };
        }

        case 'get_mechanical_layout': {
          return {
            success: true,
            data: {
              mechanicalObjects: this.projectState.mechanicalObjects || [],
              mechanicalBodies: this.projectState.mechanicalBodies || [],
              mechanicalZones: this.projectState.mechanicalZones || [],
              assemblyLayers: this.projectState.assemblyLayers || []
            }
          };
        }

        case 'get_components': {
          return {
            success: true,
            data: {
              boardComponents: this.projectState.boardComponents || [],
              bom: this.projectState.bom || []
            }
          };
        }

        case 'get_schematic':
        case 'get_schematic_netlist': {
          return {
            success: true,
            data: {
              nets: this.projectState.nets || [],
              schematicWires: this.projectState.schematicWires || [],
              schematicSymbols: this.projectState.schematicSymbols || [],
              padNetAssignments: this.projectState.padNetAssignments || []
            }
          };
        }

        case 'get_pcb_status':
        case 'get_pcb_drc_issues': {
          const drcIssues = runBoardDRC(this.projectState);
          return {
            success: true,
            data: {
              activeBoardId: this.projectState.activeBoardId || 'board_main',
              tracesCount: (this.projectState.traces || []).length,
              viasCount: (this.projectState.vias || []).length,
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

        case 'draft_requirement':
        case 'propose_engineering_change': {
          const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const proposal: MCPProposal = {
            id: proposalId,
            proposalId,
            timestamp: new Date().toISOString(),
            proposedBy: params.proposedBy || 'MCP Agent',
            description: params.description || params.title || 'Proposed Engineering Change',
            domain: params.domain || 'Requirements',
            patch: params.patch || { title: params.title, description: params.description, priority: params.priority },
            diffSummary: params.diffSummary || `Proposed change: ${params.title || params.description}`,
            status: 'Pending'
          };

          const updatedProposals = [...(this.projectState.mcpProposals || []), proposal];
          this.projectState = { ...this.projectState, mcpProposals: updatedProposals };
          this.recordAudit(toolName, { proposalId }, 'PROPOSAL_CREATED');

          return {
            success: true,
            data: { proposalId, proposal }
          };
        }

        case 'apply_draft':
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

          const patch = prop.patch || {};
          const updatedProject: Project = {
            ...this.projectState,
            ...patch,
            mcpProposals: proposals.map(p => (p.id === prop.id ? { ...p, status: 'Applied' as const } : p))
          };

          this.projectState = updatedProject;
          this.recordAudit(toolName, { proposalId }, 'PROPOSAL_APPLIED');

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

        case 'delete_component': {
          const componentId = params.componentId;
          if (!params.userApproved) {
            return { success: false, error: `Deletion of component ${componentId} requires user approval.` };
          }

          const remainingComps = (this.projectState.boardComponents || []).filter(c => c.id !== componentId);
          this.projectState = { ...this.projectState, boardComponents: remainingComps };
          this.recordAudit('delete_component', { componentId }, 'COMPONENT_DELETED');

          return {
            success: true,
            data: { componentId, status: 'Deleted' }
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
      requiresApproval: tool.includes('apply') || tool.includes('delete') || tool.includes('propose'),
      approved: true
    };
    const records = [...(this.projectState.mcpAuditRecords || []), record];
    this.projectState = { ...this.projectState, mcpAuditRecords: records };
  }

  public getResource(uri: string): any {
    if (uri === 'hardware-studio://product/current' || uri === 'hardware-studio://summary') {
      return this.callTool('get_product_summary').data;
    }
    if (uri === 'hardware-studio://requirements') {
      return this.callTool('get_requirements').data;
    }
    if (uri === 'hardware-studio://schematic' || uri === 'hardware-studio://schematic/netlist') {
      return this.callTool('get_schematic_netlist').data;
    }
    if (uri === 'hardware-studio://pcb' || uri === 'hardware-studio://pcb/drc') {
      return this.callTool('get_pcb_drc_issues').data;
    }
    if (uri === 'hardware-studio://mechanical' || uri === 'hardware-studio://mechanical/interferences') {
      return this.callTool('get_mechanical_interferences').data;
    }
    if (uri === 'hardware-studio://validation') {
      return this.callTool('get_validation_status').data;
    }
    if (uri === 'hardware-studio://audit') {
      return this.projectState.mcpAuditRecords || [];
    }
    return { error: 'Unknown URI' };
  }
}
