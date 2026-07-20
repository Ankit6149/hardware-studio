// mcpServer.ts — Native Model Context Protocol server for Hardware Studio V1
import { ProductGraphEngine } from '../../src/core/productGraph/graph';
import { Project } from '../../src/types';

export interface MCPProposal {
  id: string;
  action: string;
  payload: Record<string, unknown>;
  timestamp: string;
  status: 'Draft' | 'Applied' | 'Rejected';
}

export interface MCPAuditRecord {
  id: string;
  timestamp: string;
  tool: string;
  params: Record<string, unknown>;
  resultStatus: string;
  requiresApproval: boolean;
  approved: boolean;
}

export class HardwareStudioMCPServer {
  private proposals: MCPProposal[] = [];
  private auditLog: MCPAuditRecord[] = [];

  constructor(private project: Project) {}

  /** Handle read tool requests */
  public handleReadTool(toolName: string, params: Record<string, unknown> = {}): unknown {
    this.recordAudit(toolName, params, 'SUCCESS', false, true);

    switch (toolName) {
      case 'get_current_product':
        return {
          id: this.project.id,
          name: this.project.projectName,
          version: this.project.version,
          activeView: this.project.activeView
        };
      case 'get_product_graph':
        const graph = new ProductGraphEngine(this.project);
        return graph.getRequirementCoverage();
      case 'get_requirements':
        return this.project.requirements || [];
      case 'get_components':
        return this.project.boardComponents || [];
      case 'get_boards':
        return this.project.boards || [];
      case 'get_firmware_modules':
        return this.project.firmwareModules || [];
      case 'get_validation_tests':
        return this.project.validationTests || [];
      default:
        throw new Error(`Unknown read tool: ${toolName}`);
    }
  }

  /** Handle draft tools (creates reversible proposal without mutating active project) */
  public handleDraftTool(action: string, payload: Record<string, unknown>): MCPProposal {
    const proposal: MCPProposal = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      action,
      payload,
      timestamp: new Date().toISOString(),
      status: 'Draft'
    };

    this.proposals.push(proposal);
    this.recordAudit(`draft_${action}`, payload, 'DRAFT_CREATED', false, true);
    return proposal;
  }

  /** Handle apply proposal */
  public applyDraftProposal(proposalId: string): MCPProposal {
    const prop = this.proposals.find((p) => p.id === proposalId);
    if (!prop) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    if (prop.status !== 'Draft') {
      throw new Error(`Proposal ${proposalId} is already ${prop.status}`);
    }

    prop.status = 'Applied';
    this.recordAudit('apply_draft', { proposalId }, 'APPLIED', false, true);
    return prop;
  }

  /** Handle high-impact actions requiring explicit user approval */
  public handleHighImpactAction(action: string, payload: Record<string, unknown>, userApproved: boolean): unknown {
    if (!userApproved) {
      this.recordAudit(action, payload, 'REJECTED_UNAPPROVED', true, false);
      throw new Error(`Action "${action}" requires explicit user approval before execution.`);
    }

    this.recordAudit(action, payload, 'APPROVED_AND_EXECUTED', true, true);
    return { action, status: 'Executed', payload };
  }

  public getAuditLog(): MCPAuditRecord[] {
    return this.auditLog;
  }

  public getProposals(): MCPProposal[] {
    return this.proposals;
  }

  private recordAudit(tool: string, params: Record<string, unknown>, resultStatus: string, requiresApproval: boolean, approved: boolean) {
    this.auditLog.push({
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      tool,
      params,
      resultStatus,
      requiresApproval,
      approved
    });
  }
}
