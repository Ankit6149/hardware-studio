// mcpServer.ts — Native Model Context Protocol server for Hardware Studio V1
import { Project, MCPProposal, MCPAuditRecord, ProductRequirement } from '../../src/types';
import { runBoardDRC } from '../../src/lib/boardDRC';
import { checkMechanicalInterference } from '../../src/lib/mechanical/mechanicalGeometry';

export type { MCPProposal, MCPAuditRecord };

interface HostApproval {
  proposalId: string;
  approvedBy: string;
  approvedAt: string;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string').map((entry) => entry.trim()).filter(Boolean) : [];
}

function isRequirementPriority(value: unknown): value is ProductRequirement['priority'] {
  return value === 'Critical' || value === 'High' || value === 'Medium' || value === 'Low';
}

function isRequirementType(value: unknown): value is ProductRequirement['type'] {
  return value === 'Functional' || value === 'Electrical' || value === 'Mechanical' || value === 'Firmware' || value === 'Safety' || value === 'Manufacturing' || value === 'Validation';
}

export class HardwareStudioMCPServer {
  private projectState: Project;
  private approvedProposals = new Map<string, HostApproval>();

  constructor(initialProject?: Project) {
    this.projectState = initialProject ? clone(initialProject) : {
      id: 'proj_mcp_default',
      projectName: 'Hardware Studio Product',
      description: 'MCP project context — no physical hardware has been defined yet.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0',
      activeView: 'dashboard',
      activeBoardId: '',
      boards: [],
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
    return clone(this.projectState);
  }

  public setProject(project: Project): void {
    this.projectState = clone(project);
    this.approvedProposals.clear();
  }

  /**
   * Host-only approval boundary. This method is intentionally not routed through
   * callTool(), so an MCP agent cannot approve its own proposal by supplying a
   * boolean in tool arguments. The embedding UI/host must invoke it after a real
   * human approval interaction.
   */
  public approveProposal(proposalId: string, approvedBy: string): { success: boolean; error?: string; approval?: HostApproval } {
    const approver = approvedBy.trim();
    if (!approver) return { success: false, error: 'Host approval requires an identified reviewer.' };

    const proposal = (this.projectState.mcpProposals || []).find((candidate) => candidate.id === proposalId || candidate.proposalId === proposalId);
    if (!proposal) return { success: false, error: `Proposal ${proposalId} not found` };
    if (proposal.status !== 'Pending') return { success: false, error: `Proposal ${proposalId} is already ${proposal.status}` };

    const approval: HostApproval = {
      proposalId: proposal.id,
      approvedBy: approver,
      approvedAt: new Date().toISOString(),
    };
    this.approvedProposals.set(proposal.id, approval);
    this.recordAudit('host_approve_proposal', { proposalId: proposal.id }, 'PROPOSAL_APPROVED', {
      proposalId: proposal.id,
      executedBy: approver,
      requiresApproval: true,
      approved: true,
    });
    return { success: true, approval };
  }

  public callTool(toolName: string, params: Record<string, any> = {}): { success: boolean; data?: any; error?: string } {
    try {
      const mutationTool = toolName === 'apply_draft' || toolName === 'apply_engineering_change' || toolName === 'delete_component';
      this.recordAudit(toolName, params, 'RECEIVED', {
        proposalId: stringValue(params.proposalId) || undefined,
        requiresApproval: mutationTool,
        approved: !mutationTool,
      });

      switch (toolName) {
        case 'get_product_summary':
        case 'get_project_summary':
          return {
            success: true,
            data: {
              id: this.projectState.id,
              projectName: this.projectState.projectName,
              description: this.projectState.description,
              activeBoardId: this.projectState.activeBoardId || null,
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

        case 'get_requirements':
          return { success: true, data: { requirements: clone(this.projectState.requirements || []), count: (this.projectState.requirements || []).length } };

        case 'get_architecture':
          return {
            success: true,
            data: {
              nodes: clone(this.projectState.nodes || []),
              edges: clone(this.projectState.edges || []),
              architectureNodes: clone(this.projectState.architectureNodes || []),
              architectureConnections: clone(this.projectState.architectureConnections || [])
            }
          };

        case 'get_mechanical_layout':
          return {
            success: true,
            data: {
              mechanicalObjects: clone(this.projectState.mechanicalObjects || []),
              mechanicalBodies: clone(this.projectState.mechanicalBodies || []),
              mechanicalZones: clone(this.projectState.mechanicalZones || []),
              assemblyLayers: clone(this.projectState.assemblyLayers || [])
            }
          };

        case 'get_components':
          return { success: true, data: { boardComponents: clone(this.projectState.boardComponents || []), bom: clone(this.projectState.bom || []) } };

        case 'get_schematic':
        case 'get_schematic_netlist':
          return {
            success: true,
            data: {
              nets: clone(this.projectState.nets || []),
              schematicWires: clone(this.projectState.schematicWires || []),
              schematicSymbols: clone(this.projectState.schematicSymbols || []),
              padNetAssignments: clone(this.projectState.padNetAssignments || [])
            }
          };

        case 'get_pcb_status':
        case 'get_pcb_drc_issues': {
          const drcIssues = runBoardDRC(this.projectState);
          return {
            success: true,
            data: {
              activeBoardId: this.projectState.activeBoardId || null,
              tracesCount: (this.projectState.traces || []).length,
              viasCount: (this.projectState.vias || []).length,
              drcIssuesCount: drcIssues.length,
              drcIssues
            }
          };
        }

        case 'get_mechanical_interferences':
          return { success: true, data: checkMechanicalInterference(this.projectState) };

        case 'get_validation_status':
          return { success: true, data: { validationTests: clone(this.projectState.validationTests || []), validationRuns: clone(this.projectState.validationRuns || []) } };

        case 'get_firmware_evidence':
          return {
            success: true,
            data: {
              modules: clone(this.projectState.firmwareModules || []),
              states: clone(this.projectState.firmwareStates || []),
              transitions: clone(this.projectState.firmwareTransitions || []),
              configuration: clone(this.projectState.firmwareConfiguration || null),
              sourceFiles: clone(this.projectState.firmwareSourceFiles || []),
              buildRecords: clone(this.projectState.firmwareBuildRecords || []),
            }
          };

        case 'get_change_queue':
          return {
            success: true,
            data: {
              proposals: (this.projectState.mcpProposals || []).map((proposal) => ({
                ...clone(proposal),
                hostApproval: this.approvedProposals.get(proposal.id) || null,
              })),
              auditCount: (this.projectState.mcpAuditRecords || []).length,
            }
          };

        case 'draft_requirement':
        case 'propose_engineering_change': {
          const proposalId = `prop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
          const proposal: MCPProposal = {
            id: proposalId,
            proposalId,
            timestamp: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            proposedBy: stringValue(params.proposedBy) || 'MCP Agent',
            description: stringValue(params.description) || stringValue(params.title) || 'Proposed Engineering Change',
            domain: stringValue(params.domain) || (toolName === 'draft_requirement' ? 'Requirements' : 'Project Metadata'),
            toolName,
            args: clone(params),
            patch: toolName === 'propose_engineering_change' && params.patch && typeof params.patch === 'object' ? clone(params.patch) : undefined,
            diffSummary: stringValue(params.diffSummary) || `Proposed change: ${stringValue(params.title) || stringValue(params.description)}`,
            status: 'Pending'
          };

          this.projectState = { ...this.projectState, mcpProposals: [...(this.projectState.mcpProposals || []), proposal] };
          this.recordAudit(toolName, { proposalId }, 'PROPOSAL_CREATED', { proposalId, executedBy: proposal.proposedBy, approved: true });
          return { success: true, data: { proposalId, proposal: clone(proposal), requiresHostApprovalBeforeApply: true } };
        }

        case 'apply_draft':
        case 'apply_engineering_change': {
          const proposalId = stringValue(params.proposalId);
          const proposals = this.projectState.mcpProposals || [];
          const proposal = proposals.find((candidate) => candidate.id === proposalId || candidate.proposalId === proposalId);
          if (!proposal) return { success: false, error: `Proposal ${proposalId} not found` };
          if (proposal.status !== 'Pending') return { success: false, error: `Proposal ${proposalId} is already ${proposal.status}` };

          const approval = this.approvedProposals.get(proposal.id);
          if (!approval) {
            this.recordAudit(toolName, { proposalId: proposal.id }, 'BLOCKED_NO_HOST_APPROVAL', { proposalId: proposal.id, requiresApproval: true, approved: false });
            return { success: false, error: `Proposal ${proposal.id} requires host-side human approval before it can be applied.` };
          }

          let nextProject: Project = clone(this.projectState);
          if (proposal.toolName === 'draft_requirement') {
            const args = proposal.args || {};
            const title = stringValue(args.title);
            const description = stringValue(args.description);
            if (!title || !description) return { success: false, error: 'Requirement proposal is missing title or description.' };

            const requirement: ProductRequirement = {
              id: `req_mcp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              title,
              description,
              type: isRequirementType(args.type) ? args.type : 'Functional',
              priority: isRequirementPriority(args.priority) ? args.priority : 'Medium',
              status: 'Draft',
              source: `MCP proposal ${proposal.id} approved by ${approval.approvedBy}`,
              acceptanceCriteria: stringArray(args.acceptanceCriteria),
              linkedArchitectureNodeIds: [],
              linkedComponentIds: [],
              linkedFirmwareModuleIds: [],
              linkedTestIds: [],
              risks: [],
            };
            nextProject.requirements = [...(nextProject.requirements || []), requirement];
          } else {
            const patch = proposal.patch || {};
            const allowedKeys: Array<keyof Project> = ['description', 'productType', 'targetUse'];
            const patchKeys = Object.keys(patch) as Array<keyof Project>;
            const disallowed = patchKeys.filter((key) => !allowedKeys.includes(key));
            if (disallowed.length > 0) {
              return { success: false, error: `Structural MCP patch blocked (${disallowed.join(', ')}). Use a domain-specific proposal/action so canonical engineering relationships are preserved.` };
            }
            nextProject = { ...nextProject, ...patch };
          }

          nextProject.mcpProposals = proposals.map((candidate) => candidate.id === proposal.id ? { ...candidate, status: 'Applied' as const } : candidate);
          this.projectState = nextProject;
          this.approvedProposals.delete(proposal.id);
          this.recordAudit(toolName, { proposalId: proposal.id }, 'PROPOSAL_APPLIED', {
            proposalId: proposal.id,
            executedBy: approval.approvedBy,
            requiresApproval: true,
            approved: true,
          });
          return { success: true, data: { proposalId: proposal.id, status: 'Applied', approvedBy: approval.approvedBy, updatedProject: clone(this.projectState) } };
        }

        case 'reject_engineering_change': {
          const proposalId = stringValue(params.proposalId);
          const proposals = this.projectState.mcpProposals || [];
          const proposal = proposals.find((candidate) => candidate.id === proposalId || candidate.proposalId === proposalId);
          if (!proposal) return { success: false, error: `Proposal ${proposalId} not found` };
          this.projectState = {
            ...this.projectState,
            mcpProposals: proposals.map((candidate) => candidate.id === proposal.id ? { ...candidate, status: 'Rejected' as const } : candidate),
          };
          this.approvedProposals.delete(proposal.id);
          this.recordAudit(toolName, { proposalId: proposal.id }, 'PROPOSAL_REJECTED', { proposalId: proposal.id, executedBy: stringValue(params.rejectedBy) || 'MCP client' });
          return { success: true, data: { proposalId: proposal.id, status: 'Rejected' } };
        }

        case 'delete_component':
          this.recordAudit(toolName, { componentId: stringValue(params.componentId) }, 'BLOCKED_DIRECT_MUTATION', { requiresApproval: true, approved: false });
          return { success: false, error: 'Direct component deletion through MCP is disabled. Create a reviewed domain-specific proposal and execute deletion through the canonical product host action.' };

        default:
          return { success: false, error: `Unknown MCP tool: ${toolName}` };
      }
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  private recordAudit(
    tool: string,
    params: Record<string, any>,
    status: string,
    options: { proposalId?: string; executedBy?: string; requiresApproval?: boolean; approved?: boolean } = {},
  ): void {
    const requiresApproval = options.requiresApproval ?? false;
    const record: MCPAuditRecord = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      tool,
      params: clone(params),
      proposalId: options.proposalId,
      executedBy: options.executedBy,
      resultStatus: status,
      requiresApproval,
      approved: options.approved ?? !requiresApproval,
    };
    this.projectState = { ...this.projectState, mcpAuditRecords: [...(this.projectState.mcpAuditRecords || []), record] };
  }

  public getResource(uri: string): any {
    if (uri === 'hardware-studio://product/current' || uri === 'hardware-studio://summary') return this.callTool('get_product_summary').data;
    if (uri === 'hardware-studio://product/graph') {
      return {
        requirements: clone(this.projectState.requirements || []),
        architectureNodes: clone(this.projectState.architectureNodes || []),
        architectureConnections: clone(this.projectState.architectureConnections || []),
        components: clone(this.projectState.boardComponents || []),
        validationTests: clone(this.projectState.validationTests || []),
      };
    }
    if (uri === 'hardware-studio://requirements') return this.callTool('get_requirements').data;
    if (uri === 'hardware-studio://schematic' || uri === 'hardware-studio://schematic/netlist') return this.callTool('get_schematic_netlist').data;
    if (uri === 'hardware-studio://pcb' || uri === 'hardware-studio://pcb/drc') return this.callTool('get_pcb_drc_issues').data;
    if (uri === 'hardware-studio://mechanical' || uri === 'hardware-studio://mechanical/interferences') return this.callTool('get_mechanical_interferences').data;
    if (uri === 'hardware-studio://firmware') return this.callTool('get_firmware_evidence').data;
    if (uri === 'hardware-studio://validation') return this.callTool('get_validation_status').data;
    if (uri === 'hardware-studio://changes') return this.callTool('get_change_queue').data;
    if (uri === 'hardware-studio://revisions') return clone({ revisions: this.projectState.revisions || [], branches: this.projectState.branches || [] });
    if (uri === 'hardware-studio://releases') return clone({ releaseCandidates: this.projectState.releaseCandidates || [], releases: this.projectState.releases || [] });
    if (uri === 'hardware-studio://audit') return clone(this.projectState.mcpAuditRecords || []);
    return { error: 'Unknown URI' };
  }
}
