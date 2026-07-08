// ============================================================
// Blueprint Sheet Types — Hardware Studio Blueprint Generation System
// ============================================================

export type BlueprintSheetCategory =
  | "product"
  | "mechanical"
  | "assembly"
  | "electronics"
  | "schematic"
  | "pcb"
  | "firmware"
  | "testing"
  | "manufacturing"
  | "readiness";

export type BlueprintSheetStatus =
  | "Missing Data"
  | "Draft"
  | "Generated In App"
  | "Needs Review"
  | "Verified";

export type BlueprintPackStatusType =
  | "Not Generated"
  | "Generated"
  | "Stale"
  | "Needs Review"
  | "Verified";

// ---- Drawing Primitives ----

export type BlueprintDrawingObject = {
  id: string;
  type:
    | "block"
    | "zone"
    | "board"
    | "component"
    | "schematic-symbol"
    | "trace"
    | "via"
    | "pin"
    | "state"
    | "test-card"
    | "factory-file"
    | "warning"
    | "annotation";
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  layer?: string;
  sourceType?: string;
  sourceId?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export type BlueprintDrawingConnection = {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  type?: "signal" | "power" | "ground" | "mechanical" | "assembly" | "firmware" | "test";
  points?: { x: number; y: number }[];
};

export type BlueprintDimension = {
  id: string;
  label: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  unit?: "mm" | "mil" | "deg" | "count";
};

export type BlueprintCallout = {
  id: string;
  label: string;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  severity?: "info" | "warning" | "error" | "blocker";
};

export type BlueprintDrawing = {
  viewBox: string;
  grid?: boolean;
  objects: BlueprintDrawingObject[];
  connections: BlueprintDrawingConnection[];
  dimensions: BlueprintDimension[];
  callouts: BlueprintCallout[];
};

// ---- Tables ----

export type BlueprintTable = {
  id: string;
  title: string;
  columns: string[];
  rows: string[][];
};

// ---- Warnings ----

export type BlueprintWarning = {
  id: string;
  sheetId?: string;
  severity: "Info" | "Warning" | "Error" | "Blocker";
  title: string;
  message: string;
  sourceType?: string;
  sourceId?: string;
};

// ---- Source References ----

export type BlueprintSourceRef = {
  type: string;
  id: string;
  label?: string;
};

// ---- Sheet ----

export type BlueprintSheet = {
  id: string;
  sheetNo: string;
  title: string;
  category: BlueprintSheetCategory;
  status: BlueprintSheetStatus;
  sourceObjects: BlueprintSourceRef[];
  drawing: BlueprintDrawing;
  tables: BlueprintTable[];
  notes: string[];
  warnings: BlueprintWarning[];
  disclaimer: string;
};

// ---- Pack Summary ----

export type BlueprintPackSummary = {
  totalSheets: number;
  generatedSheets: number;
  missingDataSheets: number;
  warnings: number;
  errors: number;
  blockers: number;
};

// ---- Blueprint Pack ----

export type BlueprintPack = {
  id: string;
  projectName: string;
  templateName?: string;
  generatedAt: string;
  revision: string;
  status: "Draft" | "Generated In App" | "Needs Review" | "Verified";
  sheets: BlueprintSheet[];
  warnings: BlueprintWarning[];
  summary: BlueprintPackSummary;
};
