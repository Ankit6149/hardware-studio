// Board Designer interaction types — tool enums, view state, selection targets

export type BoardTool =
  | 'select'
  | 'move'
  | 'place-component'
  | 'route-trace'
  | 'add-via'
  | 'add-drill'
  | 'add-keepout'
  | 'measure';

export interface BoardViewState {
  zoom: number;
  panX: number;
  panY: number;
  gridSizeMm: number;
  snapEnabled: boolean;
  activeLayerId: string | null;
  activeTool: BoardTool;
  selectedObjectId: string | null;
  selectedObjectType: BoardSelectionType | null;
  selectedNetName: string | null;
  mouseXMm: number;
  mouseYMm: number;
  routePreviewPoints: { x: number; y: number }[];
  isRouting: boolean;
  showRatsnest: boolean;
  showDrcMarkers: boolean;
  layerVisibility: Record<string, boolean>;
}

export type BoardSelectionType =
  | 'component'
  | 'trace'
  | 'via'
  | 'drill'
  | 'keepout'
  | 'outline-vertex'
  | 'board';

export const DEFAULT_VIEW_STATE: BoardViewState = {
  zoom: 8, // pixels per mm
  panX: 40,
  panY: 40,
  gridSizeMm: 0.5,
  snapEnabled: true,
  activeLayerId: null,
  activeTool: 'select',
  selectedObjectId: null,
  selectedObjectType: null,
  selectedNetName: null,
  mouseXMm: 0,
  mouseYMm: 0,
  routePreviewPoints: [],
  isRouting: false,
  showRatsnest: true,
  showDrcMarkers: true,
  layerVisibility: {
    'top-copper': true,
    'bottom-copper': true,
    'silkscreen': true,
    'mask': true,
    'paste': false,
    'drill': true,
    'keepouts': true,
    'ratsnest': true,
    'drc': true,
  },
};

export const GRID_PRESETS = [0.25, 0.5, 1.0, 2.54] as const;
