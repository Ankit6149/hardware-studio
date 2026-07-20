import { ProductArchitectureNode, ProductArchitectureConnection, ProductRequirement } from '../../types';

export interface ArchitectureValidationIssue {
  severity: 'Error' | 'Warning' | 'Info';
  nodeId?: string;
  connectionId?: string;
  requirementId?: string;
  message: string;
}

/** Find architecture nodes with no connections at all */
export function findDisconnectedNodes(
  nodes: ProductArchitectureNode[],
  connections: ProductArchitectureConnection[]
): ProductArchitectureNode[] {
  const connectedIds = new Set<string>();
  for (const conn of connections) {
    connectedIds.add(conn.sourceNodeId);
    connectedIds.add(conn.targetNodeId);
  }
  return nodes.filter(n => !connectedIds.has(n.id));
}

/** Find requirements not linked to any architecture node */
export function findRequirementsWithoutLinks(
  requirements: ProductRequirement[],
  nodes: ProductArchitectureNode[]
): ProductRequirement[] {
  const linkedReqIds = new Set<string>();
  for (const node of nodes) {
    for (const reqId of node.linkedRequirementIds) {
      linkedReqIds.add(reqId);
    }
  }
  return requirements.filter(r => !linkedReqIds.has(r.id));
}

/** Find power-category nodes without any outgoing Power connection */
export function findPowerBlocksWithoutPowerConnection(
  nodes: ProductArchitectureNode[],
  connections: ProductArchitectureConnection[]
): ProductArchitectureNode[] {
  const powerNodes = nodes.filter(n => n.category === 'Power');
  return powerNodes.filter(pn => {
    return !connections.some(
      c => c.sourceNodeId === pn.id && c.type === 'Power'
    );
  });
}

/** Find processing nodes without any input connection */
export function findProcessingBlocksWithoutInput(
  nodes: ProductArchitectureNode[],
  connections: ProductArchitectureConnection[]
): ProductArchitectureNode[] {
  const procNodes = nodes.filter(n => n.category === 'Processing');
  return procNodes.filter(pn => {
    return !connections.some(
      c => c.targetNodeId === pn.id || (c.sourceNodeId === pn.id && c.direction === 'Bidirectional')
    );
  });
}

/** Full architecture graph validation */
export function validateArchitectureGraph(
  nodes: ProductArchitectureNode[],
  connections: ProductArchitectureConnection[],
  requirements: ProductRequirement[]
): ArchitectureValidationIssue[] {
  const issues: ArchitectureValidationIssue[] = [];

  // Disconnected nodes
  for (const node of findDisconnectedNodes(nodes, connections)) {
    issues.push({
      severity: 'Warning',
      nodeId: node.id,
      message: `Architecture block "${node.name}" has no connections`
    });
  }

  // Requirements without architecture links
  for (const req of findRequirementsWithoutLinks(requirements, nodes)) {
    issues.push({
      severity: 'Warning',
      requirementId: req.id,
      message: `Requirement "${req.title}" is not linked to any architecture block`
    });
  }

  // Power blocks without power connections
  for (const node of findPowerBlocksWithoutPowerConnection(nodes, connections)) {
    issues.push({
      severity: 'Error',
      nodeId: node.id,
      message: `Power block "${node.name}" has no outgoing Power connection`
    });
  }

  // Processing blocks without input
  for (const node of findProcessingBlocksWithoutInput(nodes, connections)) {
    issues.push({
      severity: 'Warning',
      nodeId: node.id,
      message: `Processing block "${node.name}" has no input connection`
    });
  }

  // Communication blocks without linked components
  const commNodes = nodes.filter(n => n.category === 'Communication');
  for (const node of commNodes) {
    if (node.linkedComponentIds.length === 0) {
      issues.push({
        severity: 'Warning',
        nodeId: node.id,
        message: `Communication block "${node.name}" has no linked hardware components`
      });
    }
  }

  return issues;
}
