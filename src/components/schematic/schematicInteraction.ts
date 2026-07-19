// schematicInteraction.ts — Part of Phase 6 Schematic Editor Interaction State


export type SchematicTool =
  | 'select'
  | 'pan'
  | 'place-component'
  | 'wire'
  | 'junction'
  | 'label'
  | 'no-connect'
  | 'power'
  | 'ground';

export interface SchematicUIState {
  zoom: number;
  panX: number;
  panY: number;
  activeTool: SchematicTool;
  
  // Selection targets
  selectedComponentId: string | null;
  selectedSymbolId: string | null;
  selectedWireId: string | null;
  selectedNetName: string | null;

  // Active routing / wire placement
  isDrawingWire: boolean;
  wirePoints: { x: number; y: number }[];
  activeNetName: string;
  sourcePin: { componentId: string; pinNumber: string } | null;

  // Hover state
  hoveredPin: { componentId: string; pinNumber: string } | null;
  hoveredWirePoint: { x: number; y: number } | null;
}

export const initialSchematicUIState: SchematicUIState = {
  zoom: 1.0,
  panX: 50,
  panY: 50,
  activeTool: 'select',
  selectedComponentId: null,
  selectedSymbolId: null,
  selectedWireId: null,
  selectedNetName: null,
  isDrawingWire: false,
  wirePoints: [],
  activeNetName: 'GND',
  sourcePin: null,
  hoveredPin: null,
  hoveredWirePoint: null
};
