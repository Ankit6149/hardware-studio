import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(process.cwd(), 'src/components/PropertiesPanel.tsx'),
  'utf8',
);

describe('properties inspector baseline', () => {
  it('does not occupy workspace width when there is no selection', () => {
    expect(source).toContain('if (!selectedNode) return null;');
    expect(source).not.toContain('No Block Selected');
  });

  it('uses shared feedback confirmation instead of browser-native blocking dialogs', () => {
    expect(source).toContain('useFeedback');
    expect(source).toContain('await confirm({');
    expect(source).not.toContain('window.confirm');
    expect(source).not.toContain('window.alert');
    expect(source).not.toContain('window.prompt');
  });

  it('preserves engineering, risk, representation, and connection editing in one contextual rail', () => {
    expect(source).toContain('Electrical');
    expect(source).toContain('Mechanical');
    expect(source).toContain('Firmware');
    expect(source).toContain('Risks & open decisions');
    expect(source).toContain('These are representations of the same project node, not separate copies.');
    expect(source).toContain('Inbound');
    expect(source).toContain('Outbound');
  });
});
