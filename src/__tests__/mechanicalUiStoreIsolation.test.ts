import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const uiStore = readFileSync(new URL('../store/mechanicalWorkspaceUiStore.ts', import.meta.url), 'utf8');

describe('Mechanical UI-store isolation', () => {
  it('contains navigation chrome state but no engineering geometry', () => {
    expect(uiStore).toContain('drawerSection');
    expect(uiStore).toContain('inspectorOpen');
    expect(uiStore).toContain('problemsOpen');
    expect(uiStore).not.toContain('widthMm');
    expect(uiStore).not.toContain('heightMm');
    expect(uiStore).not.toContain('material');
  });
});
