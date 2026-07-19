// boardTypes.ts — PCB Board Designer data model types

export type BoardOutline = {
  id: string;
  boardId: string;
  points: { x: number; y: number }[];
  closed: boolean;
  cornerRadiusMm?: number;
};

export type PadNetAssignment = {
  id: string;
  componentId: string;
  referenceDesignator: string;
  padName: string;
  netName: string;
};

export type Trace = {
  id: string;
  boardId: string;
  layerId: string;
  netName: string;
  points: { x: number; y: number }[];
  widthMm: number;
  viaIds?: string[];
  locked?: boolean;
  status: 'Draft' | 'Routed' | 'Needs Review' | 'Verified';
};

export type Via = {
  id: string;
  boardId: string;
  netName?: string;
  x: number;
  y: number;
  drillDiameterMm: number;
  outerDiameterMm: number;
  fromLayer: string;
  toLayer: string;
  locked?: boolean;
};

export type DrillHole = {
  id: string;
  boardId: string;
  x: number;
  y: number;
  diameterMm: number;
  plated: boolean;
  purpose: 'mounting' | 'tooling' | 'fixture' | 'mechanical' | 'other';
  notes?: string;
};

export type BoardKeepout = {
  id: string;
  boardId: string;
  shape: 'rect' | 'polygon';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  layerScope: 'all' | 'top' | 'bottom';
  reason: string;
  notes?: string;
};
