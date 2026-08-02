export type FeedbackTone = 'success' | 'info' | 'warning' | 'error';

export interface ToastRequest {
  tone: FeedbackTone;
  title: string;
  detail?: string;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastRecord extends ToastRequest {
  id: string;
}

interface DecisionBase {
  id: string;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export interface ConfirmDecision extends DecisionBase {
  kind: 'confirm';
  variant?: 'default' | 'destructive';
}

export interface PromptDecision extends DecisionBase {
  kind: 'prompt';
  label: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
}

export type DecisionRequest = ConfirmDecision | PromptDecision;

export interface FeedbackState {
  toasts: ToastRecord[];
  decisions: DecisionRequest[];
}

export type FeedbackAction =
  | { type: 'enqueue-toast'; toast: ToastRecord }
  | { type: 'dismiss-toast'; id: string }
  | { type: 'enqueue-decision'; decision: DecisionRequest }
  | { type: 'complete-decision'; id: string };

export const initialFeedbackState: FeedbackState = {
  toasts: [],
  decisions: [],
};

export function feedbackReducer(state: FeedbackState, action: FeedbackAction): FeedbackState {
  switch (action.type) {
    case 'enqueue-toast':
      return { ...state, toasts: [...state.toasts, action.toast] };
    case 'dismiss-toast':
      return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.id) };
    case 'enqueue-decision':
      return { ...state, decisions: [...state.decisions, action.decision] };
    case 'complete-decision':
      return { ...state, decisions: state.decisions.filter((decision) => decision.id !== action.id) };
    default:
      return state;
  }
}

export function validatePromptValue(decision: PromptDecision, rawValue: string): string | null {
  const value = rawValue.trim();
  if (decision.required && value.length === 0) {
    return `${decision.label} is required.`;
  }
  if (decision.minLength && value.length < decision.minLength) {
    return `${decision.label} must be at least ${decision.minLength} characters.`;
  }
  if (decision.maxLength && value.length > decision.maxLength) {
    return `${decision.label} must be no more than ${decision.maxLength} characters.`;
  }
  return null;
}
