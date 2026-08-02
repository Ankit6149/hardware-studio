import { describe, expect, it } from 'vitest';
import {
  feedbackReducer,
  initialFeedbackState,
  validatePromptValue,
  type PromptDecision,
} from '../lib/feedback/feedbackState';

describe('feedback state', () => {
  it('queues and dismisses toasts deterministically', () => {
    const withToast = feedbackReducer(initialFeedbackState, {
      type: 'enqueue-toast',
      toast: { id: 'toast-1', tone: 'success', title: 'Saved' },
    });

    expect(withToast.toasts.map((toast) => toast.id)).toEqual(['toast-1']);
    expect(feedbackReducer(withToast, { type: 'dismiss-toast', id: 'toast-1' }).toasts).toEqual([]);
  });

  it('preserves decision order and completes only the selected request', () => {
    const first = feedbackReducer(initialFeedbackState, {
      type: 'enqueue-decision',
      decision: { id: 'confirm-1', kind: 'confirm', title: 'Delete?', description: 'Delete item' },
    });
    const second = feedbackReducer(first, {
      type: 'enqueue-decision',
      decision: {
        id: 'prompt-1',
        kind: 'prompt',
        title: 'Create board',
        description: 'Name board',
        label: 'Board name',
      },
    });

    expect(second.decisions.map((decision) => decision.id)).toEqual(['confirm-1', 'prompt-1']);
    expect(feedbackReducer(second, { type: 'complete-decision', id: 'confirm-1' }).decisions.map((decision) => decision.id)).toEqual(['prompt-1']);
  });

  it('validates required prompt values and length boundaries', () => {
    const decision: PromptDecision = {
      id: 'prompt-1',
      kind: 'prompt',
      title: 'Create board',
      description: 'Name board',
      label: 'Board name',
      required: true,
      minLength: 3,
      maxLength: 8,
    };

    expect(validatePromptValue(decision, '   ')).toBe('Board name is required.');
    expect(validatePromptValue(decision, 'ab')).toContain('at least 3');
    expect(validatePromptValue(decision, '123456789')).toContain('no more than 8');
    expect(validatePromptValue(decision, 'Main PCB')).toBeNull();
  });
});
