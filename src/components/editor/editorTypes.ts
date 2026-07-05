import { EditorMode } from '../../types';

export interface EditorUIState {
  activeMode: EditorMode;
  selectedObjectId: string | null;
  panX: number;
  panY: number;
  zoom: number;
  snapToGrid: boolean;
  showGrid: boolean;
  showLabels: boolean;
  showWarnings: boolean;
  visibleLayers: Record<string, boolean>;
}

export const defaultUIState = (): EditorUIState => ({
  activeMode: "product",
  selectedObjectId: null,
  panX: 0,
  panY: 0,
  zoom: 1.0,
  snapToGrid: true,
  showGrid: true,
  showLabels: true,
  showWarnings: true,
  visibleLayers: {
    "Architecture": true,
    "Enclosure": true,
    "Dimensions": true,
    "Assembly Steps": true,
    "Board outlines": true,
    "Drills": true,
    "Top SMT": true,
    "Bottom SMT": true,
    "PCB Outlines": true,
    "Circuit Modules": true,
    "Power Rails": true,
    "Signal Nets": true,
    "Load blocks": true,
    "MCU": true,
    "MCU Pinout": true,
    "Firmware State loops": true,
    "Timeline swimlanes": true,
    "Test Cards": true,
    "Readiness Gates": true,
    "Factory Release Pack": true,
    "Errors": true
  }
});
