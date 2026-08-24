import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

function source(relativePath: string): string {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

describe('commercial-grade workbench UX contracts', () => {
  it('keeps product guidance in the owning workspace instead of a permanent global coach', () => {
    const appShell = source('../components/AppShell.tsx');
    const electronics = source('../components/studio/ElectronicsWorkspace.tsx');
    const dashboard = source('../components/ProjectDashboard.tsx');

    expect(appShell).not.toContain('WorkspaceCoach');
    expect(electronics).toContain('Continue this decision');
    expect(electronics).toContain('Recommended next');
    expect(dashboard).toContain('One product. One identity. One path forward.');
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
