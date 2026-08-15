import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('commercial-grade workbench UX contracts', () => {
  it('teaches the product hierarchy and editor workflows inside the application', () => {
    const coach = source('../components/editor/WorkspaceCoach.tsx');
    const appShell = source('../components/AppShell.tsx');

    expect(coach).toContain('Product → assemblies / subsystems → boards + mechanical parts → components → firmware → validation + release evidence');
    expect(coach).toContain("'schematic-editor'");
    expect(coach).toContain("'board-designer'");
    expect(coach).toContain("'mechanical-studio'");
    expect(coach).toContain("'source-skeleton'");
    expect(coach).toContain('How this workspace works');
    expect(appShell).toContain('<WorkspaceCoach viewId={activeView} />');
  });

  it('uses one desktop-grade editor chrome instead of card-like per-editor shells', () => {
    const shell = source('../components/editor/EngineeringEditorShell.tsx');

    expect(shell).toContain('data-editor-chrome="command-bar"');
    expect(shell).toContain('data-editor-chrome="status-bar"');
    expect(shell).toContain('bottom-0 top-0');
    expect(shell).toContain('shortcut?: string');
    expect(shell).not.toContain('rounded-lg');
  });

  it('provides an IDE-like firmware source workspace without mutating files on open', () => {
    const firmware = source('../components/firmware/FirmwareCodePreview.tsx');

    expect(firmware).not.toContain('useEffect');
    expect(firmware).toContain('Opening Source does not generate files');
    expect(firmware).toContain('Explorer');
    expect(firmware).toContain('lineNumbers');
    expect(firmware).toContain('Ctrl/Cmd+S');
    expect(firmware).toContain('Ln {cursor.line}, Col {cursor.column}');
    expect(firmware).toContain("if (event.key === 'Tab')");
    expect(firmware).toContain('Generated · not verification');
  });
});
