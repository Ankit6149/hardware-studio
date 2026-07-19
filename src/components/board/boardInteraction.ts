// boardInteraction.ts — board tools and view state types

export type BoardTool =
  | 'select'
  | 'pan'
  | 'place-component'
  | 'route'
  | 'via'
  | 'drill'
  | 'keepout'
  | 'measure';

export type BoardDesignerUIState = {
  activeBoardId: string | null;
  activeTool: BoardTool;
  activeLayerId: string;
  selectedComponentId: string | null;
  selectedTraceId: string | null;
  selectedViaId: string | null;
  selectedDrillHoleId: string | null;
  selectedKeepoutId: string | null;
  selectedNetName: string | null;
  zoom: number;
  panX: number;
  panY: number;
  gridSizeMm: number;
  snapToGrid: boolean;
  showGrid: boolean;
  showRatsnest: boolean;
  showCourtyards: boolean;
  showLabels: boolean;
  showDRC: boolean;

  // Intermediate states for canvas interaction
  mouseXMm: number;
  mouseYMm: number;
  routePreviewPoints: { x: number; y: number }[];
  isRouting: boolean;
  layerVisibility: Record<string, boolean>;
};

export const DEFAULT_VIEW_STATE: BoardDesignerUIState = {
  activeBoardId: 'board-main',
  activeTool: 'select',
  activeLayerId: 'top-copper',
  selectedComponentId: null,
  selectedTraceId: null,
  selectedViaId: null,
  selectedDrillHoleId: null,
  selectedKeepoutId: null,
  selectedNetName: null,
  zoom: 8, // pixels per mm
  panX: 40,
  panY: 40,
  gridSizeMm: 0.5,
  snapToGrid: true,
  showGrid: true,
  showRatsnest: true,
  showCourtyards: true,
  showLabels: true,
  showDRC: true,

  // Canvas helper values
  mouseXMm: 0,
  mouseYMm: 0,
  routePreviewPoints: [],
  isRouting: false,
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
