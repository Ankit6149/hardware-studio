import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('engineering truth UI boundaries', () => {
  it('does not expose legacy guessed-data generators from live board setup', () => {
    const board = source('../components/BoardStudio.tsx');

    expect(board).not.toContain('generateBoardPlanFromProduct');
    expect(board).not.toContain('generateBoardComponentsFromBOM');
    expect(board).not.toContain('Draft from architecture');
    expect(board).not.toContain('Sync from BOM');
    expect(board).toContain("useState<BoardItem['boardType']>('Unknown')");
    expect(board).toContain("useState<BoardItem['substrate']>('Unknown')");
    expect(board).toContain("useState<BoardItem['placement']>('Unknown')");
  });

  it('does not generate assumed power values from architecture', () => {
    const power = source('../components/PowerBudgetTable.tsx');

    expect(power).not.toContain('generatePowerFromBlueprint');
    expect(power).not.toContain('Sync Power Blocks');
    expect(power).toContain('batteryCapacityMah = 0');
    expect(power).toContain('activeCurrentMa: 0');
    expect(power).toContain('sleepCurrentUa: 0');
    expect(power).toContain('dutyCyclePercent: 0');
    expect(power).toContain('quantity: 0');
    expect(power).not.toContain('24-hour baseline standard');
    expect(power).not.toContain('pocket wearable lifetimes');
  });

  it('keeps new pin allocations unresolved until the user supplies facts', () => {
    const pinMap = source('../components/PinMapTable.tsx');
    const types = source('../types/index.ts');

    expect(pinMap).not.toContain('generatePinMapFromBlueprint');
    expect(pinMap).not.toContain('Generate from Blueprint');
    expect(pinMap).toContain('direction: "Unknown"');
    expect(pinMap).toContain('protocol: "Unknown"');
    expect(pinMap).toContain('voltage: ""');
    expect(types).toContain("direction: 'Unknown' | 'Input'");
    expect(types).toContain("protocol: 'Unknown' | 'GPIO'");
  });
});
