import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(process.cwd(), 'src/components/validation/ValidationStudio.tsx'),
  'utf8',
);

describe('validation destructive-action baseline', () => {
  it('routes full test deletion through the shared feedback decision system', () => {
    expect(source).toContain("import { useFeedback } from '../feedback/FeedbackProvider';");
    expect(source).toContain('const feedback = useFeedback();');
    expect(source).toContain('const deleteTest = async () =>');
    expect(source).toContain('const confirmed = await feedback.confirm({');
    expect(source).toContain("variant: 'destructive'");
    expect(source).toContain('if (!confirmed) return;');
    expect(source).toContain("store.executeProjectCommand('DEL_TEST'");
    expect(source).toContain('onClick={() => void deleteTest()}');
  });

  it('does not use browser-native blocking dialogs in Validation Studio', () => {
    expect(source).not.toContain('window.alert');
    expect(source).not.toContain('window.confirm');
    expect(source).not.toContain('window.prompt');
    expect(source).not.toMatch(/(^|[^.\w])alert\s*\(/m);
    expect(source).not.toMatch(/(^|[^.\w])confirm\s*\(/m);
    expect(source).not.toMatch(/(^|[^.\w])prompt\s*\(/m);
  });
});
