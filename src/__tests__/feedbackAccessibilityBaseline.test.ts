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

  it('captures and restores focus for imperative confirm and prompt decisions', () => {
    expect(source).toContain('const focusTargets = useRef(new Map<string, HTMLElement | null>());');
    expect(source).toContain('focusTargets.current.set(id, getFocusedElement());');
    expect(source).toContain('onCloseAutoFocus={(event) => {');
    expect(source).toContain('returnFocusTarget.focus();');
  });

  it('keeps cancel as the default focus for confirmation decisions', () => {
    expect(source).toContain('autoFocus={!promptDecision}');
    expect(source).toContain("decision.cancelLabel || 'Cancel'");
  });
});
