import type { Project, ProductArchitectureConnection, ProductArchitectureNode } from '../../types';

export type ArchitectureAuthoritySource = 'canonical' | 'legacy-compatibility' | 'empty';

export interface ArchitectureNodeProjection {
  id: string;
  name: string;
  category: string;
  description: string;
  status: string;
  x: number;
  y: number;
  width: number;
  height: number;
  source: Exclude<ArchitectureAuthoritySource, 'empty'>;
}

export interface ArchitectureConnectionProjection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  name?: string;
  type?: string;
  direction?: string;
  source: Exclude<ArchitectureAuthoritySource, 'empty'>;
}

export interface ArchitectureProjection {
  source: ArchitectureAuthoritySource;
  nodes: ArchitectureNodeProjection[];
  connections: ArchitectureConnectionProjection[];
}

function canonicalNode(node: ProductArchitectureNode): ArchitectureNodeProjection {
  return {
    id: node.id,
    name: node.name,
    category: node.category,
    description: node.description,
    status: node.status,
    x: node.x,
    y: node.y,
    width: node.width,
    height: node.height,
    source: 'canonical',
  };
}

function canonicalConnection(
  connection: ProductArchitectureConnection,
): ArchitectureConnectionProjection {
  return {
    id: connection.id,
    sourceNodeId: connection.sourceNodeId,
    targetNodeId: connection.targetNodeId,
    name: connection.name,
    type: connection.type,
    direction: connection.direction,
    source: 'canonical',
  };
}

export function resolveArchitectureProjection(project: Project): ArchitectureProjection {
  const canonicalNodes = project.architectureNodes || [];
  const canonicalConnections = project.architectureConnections || [];

  if (canonicalNodes.length > 0 || canonicalConnections.length > 0) {
    return {
      source: 'canonical',
      nodes: canonicalNodes.map(canonicalNode),
      connections: canonicalConnections.map(canonicalConnection),
    };
  }

  const legacyNodes = project.nodes || [];
  const legacyEdges = project.edges || [];

  if (legacyNodes.length === 0 && legacyEdges.length === 0) {
    return {
      source: 'empty',
      nodes: [],
      connections: [],
    };
  }

  return {
    source: 'legacy-compatibility',
    nodes: legacyNodes
      .filter((node) => node.type !== 'boundaryNode')
      .map((node) => ({
        id: node.id,
        name: node.data?.name || '',
        category: node.data?.category || 'Unresolved',
        description: node.data?.description || '',
        status: node.data?.status || 'Unresolved',
        x: Number.isFinite(node.position?.x) ? node.position.x : 0,
        y: Number.isFinite(node.position?.y) ? node.position.y : 0,
        width: typeof node.width === 'number' && Number.isFinite(node.width) ? node.width : 0,
        height: typeof node.height === 'number' && Number.isFinite(node.height) ? node.height : 0,
        source: 'legacy-compatibility' as const,
      })),
    connections: legacyEdges.map((edge, index) => ({
      id: edge.id || `legacy-edge-${index}`,
      sourceNodeId: edge.source,
      targetNodeId: edge.target,
      name: typeof edge.label === 'string' ? edge.label : undefined,
      source: 'legacy-compatibility' as const,
    })),
  };
}

export function architectureUsesLegacyCompatibility(project: Project): boolean {
  return resolveArchitectureProjection(project).source === 'legacy-compatibility';
}
