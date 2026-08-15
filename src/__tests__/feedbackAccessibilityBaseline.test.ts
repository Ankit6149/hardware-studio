import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(process.cwd(), 'src/components/feedback/FeedbackProvider.tsx'),
  'utf8',
);

describe('shared feedback accessibility baseline', () => {
  it('prevents invalid prompt submission at the shared decision boundary', () => {
    expect(source).toContain('const promptError = promptDecision ? validatePromptValue(promptDecision, value) : null;');
    expect(source).toContain('const submitDisabled = Boolean(promptDecision && promptError);');
    expect(source).toContain('disabled={submitDisabled}');
    expect(source).toContain('aria-disabled={submitDisabled}');
  });

  it('captures focus as render state and restores it after imperative decisions', () => {
    expect(source).toContain('const [focusTargets, setFocusTargets] = useState<Record<string, HTMLElement | null>>({});');
    expect(source).toContain('const focusTarget = getFocusedElement();');
    expect(source).toContain('setFocusTargets((current) => ({ ...current, [id]: focusTarget }));');
    expect(source).toContain('onCloseAutoFocus={(event) => {');
    expect(source).toContain('returnFocusTarget.focus();');
    expect(source).not.toContain('focusTargets.current');
  });

  it('keeps cancel as the default focus for confirmation decisions', () => {
    expect(source).toContain('autoFocus={!promptDecision}');
    expect(source).toContain("decision.cancelLabel || 'Cancel'");
  });
});
