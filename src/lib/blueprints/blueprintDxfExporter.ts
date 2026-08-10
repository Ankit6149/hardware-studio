import { BlueprintDrawing } from '../blueprintSheetTypes';

/** Generate ASCII DXF R12 vector data from a BlueprintDrawing structure */
export function exportDrawingToDxf(drawing: BlueprintDrawing, title: string = 'Drawing Sheet'): string {
  const lines: string[] = [];

  // DXF Header
  lines.push('0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1009', '0', 'ENDSEC');

  // DXF Tables (Layers)
  lines.push('0', 'SECTION', '2', 'TABLES');
  lines.push('0', 'TABLE', '2', 'LAYER', '70', '1');
  lines.push('0', 'LAYER', '2', 'OUTLINE', '70', '0', '62', '7', '6', 'CONTINUOUS');
  lines.push('0', 'LAYER', '2', 'DIMENSION', '70', '0', '62', '5', '6', 'CONTINUOUS');
  lines.push('0', 'LAYER', '2', 'TEXT', '70', '0', '62', '3', '6', 'CONTINUOUS');
  lines.push('0', 'ENDTAB', '0', 'ENDSEC');

  // DXF Entities Section
  lines.push('0', 'SECTION', '2', 'ENTITIES');

  // Export Drawing Objects
  for (const obj of drawing.objects) {
    const x1 = obj.x;
    const y1 = obj.y;
    const x2 = obj.x + (obj.width || 50);
    const y2 = obj.y + (obj.height || 30);

    // 4 Lines for object bounding geometry
    lines.push('0', 'LINE', '8', 'OUTLINE', '10', String(x1), '20', String(y1), '11', String(x2), '21', String(y1));
    lines.push('0', 'LINE', '8', 'OUTLINE', '10', String(x2), '20', String(y1), '11', String(x2), '21', String(y2));
    lines.push('0', 'LINE', '8', 'OUTLINE', '10', String(x2), '20', String(y2), '11', String(x1), '21', String(y2));
    lines.push('0', 'LINE', '8', 'OUTLINE', '10', String(x1), '20', String(y2), '11', String(x1), '21', String(y1));

    // Label
    lines.push('0', 'TEXT', '8', 'TEXT', '10', String(x1 + 2), '20', String(y1 + 2), '40', '3.5', '1', obj.label || 'OBJECT');
  }

  // Export Dimensions
  for (const dim of drawing.dimensions) {
    const x1 = dim.from.x;
    const y1 = dim.from.y;
    const x2 = dim.to.x;
    const y2 = dim.to.y;
    const label = `${dim.label}: ${Math.round(Math.hypot(x2 - x1, y2 - y1))} ${dim.unit || 'mm'}`;

    lines.push('0', 'LINE', '8', 'DIMENSION', '10', String(x1), '20', String(y1), '11', String(x2), '21', String(y2));
    lines.push('0', 'TEXT', '8', 'DIMENSION', '10', String((x1 + x2) / 2), '20', String((y1 + y2) / 2 + 2), '40', '2.5', '1', label);
  }

  // End Entities & File EOF
  lines.push('0', 'ENDSEC', '0', 'EOF');

  return lines.join('\n');
}
