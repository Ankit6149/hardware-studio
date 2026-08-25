import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../components/BoardStudio.tsx', import.meta.url), 'utf8');

describe('Board Studio feedback and identity safety', () => {
  it('routes destructive board deletion through the shared decision system before mutation', () => {
    expect(source).toContain("import { useFeedback } from './feedback/FeedbackProvider';");
    expect(source).toContain('const feedback = useFeedback();');
    expect(source).toContain('const approved = await feedback.confirm({');
    expect(source).toContain("variant: 'destructive'");
    expect(source).toContain("confirmLabel: 'Delete board'");
    expect(source).toContain('if (!approved) return;');
    expect(source).toContain('deleteBoard(board.id);');
  });

  it('reports board create and save outcomes through shared feedback', () => {
    expect(source).toContain("title: 'Board created'");
    expect(source).toContain("title: 'Board saved'");
    expect(source).toContain('feedback.notify({');
  });

  it('removes PCB placement without deleting the canonical project component', () => {
    expect(source).toContain('unplaceComponentFromBoard');
    expect(source).toContain('handleRemovePlacement(component.id, component.referenceDesignator)');
    expect(source).toContain('remains a project component and can be placed again');
    expect(source).not.toContain('deleteBoardComponent');
  });
});
