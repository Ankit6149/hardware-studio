import { Node, Edge } from '@xyflow/react';

export type NodeData = {
  name: string;
  category: string;
  status: 'MVP' | 'Later' | 'Future' | 'External' | 'Risk' | 'Complete';
  description: string;
  purpose: string;
  requirements: string;
  candidateComponents: string;
  risks: string;
  notes: string;
  testingNotes: string;
  views: string[]; // e.g. ["master", "electronics", "power", "firmware", "system-alpha", "internal", "outer"]
  positions?: Record<string, { x: number; y: number }>;
};


export type CustomNode = Node<NodeData>;

export type CustomEdge = Edge & {
  views?: string[];
};

export interface BOMItem {
  id: string;
  blockName: string;
  candidateComponent: string;
  stage: 'Prototype' | 'Production' | 'Future';
  voltage: string;
  interface: string;
  sizeNotes: string;
  costEstimate: string;
  supplier: string;
  status: 'Not Started' | 'Sourced' | 'Ordered' | 'Received' | 'Tested';
  risk: string;
  alternative: string;
}

export interface TestStage {
  id: string;
  name: string;
  goal: string;
  partsNeeded: string;
  steps: string;
  passCriteria: string;
  risks: string;
  status: 'Not Started' | 'In Progress' | 'Passed' | 'Failed' | 'Blocked';
  notes: string;
}

export interface Project {
  projectName: string;
  activeView: string;
  nodes: CustomNode[];
  edges: CustomEdge[];
  bom: BOMItem[];
  testing: TestStage[];
}

