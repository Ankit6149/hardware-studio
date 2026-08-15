'use client';

import * as Dialog from '@radix-ui/react-dialog';
import React, { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import {
  ConfirmDecision,
  DecisionRequest,
  FeedbackTone,
  PromptDecision,
  ToastRequest,
  feedbackReducer,
  initialFeedbackState,
  validatePromptValue,
} from '../../lib/feedback/feedbackState';

type ConfirmOptions = Omit<ConfirmDecision, 'id' | 'kind'>;
type PromptOptions = Omit<PromptDecision, 'id' | 'kind'>;

interface FeedbackApi {
  notify: (request: ToastRequest) => string;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
  dismiss: (id: string) => void;
}

const FeedbackContext = createContext<FeedbackApi | null>(null);

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

function getFocusedElement(): HTMLElement | null {
  if (typeof document === 'undefined') return null;
  return document.activeElement instanceof HTMLElement ? document.activeElement : null;
}

const tonePresentation: Record<FeedbackTone, { icon: React.ReactNode; className: string; live: 'polite' | 'assertive' }> = {
  success: {
    icon: <CheckCircle2 className="h-4 w-4" aria-hidden="true" />,
    className: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    live: 'polite',
  },
  info: {
    icon: <Info className="h-4 w-4" aria-hidden="true" />,
    className: 'border-sky-200 bg-sky-50 text-sky-950',
    live: 'polite',
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
    className: 'border-amber-200 bg-amber-50 text-amber-950',
    live: 'assertive',
  },
  error: {
    icon: <AlertCircle className="h-4 w-4" aria-hidden="true" />,
    className: 'border-rose-200 bg-rose-50 text-rose-950',
    live: 'assertive',
  },
};

const ToastItem: React.FC<{
  toast: ToastRequest & { id: string };
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  const duration = toast.durationMs === undefined ? 5000 : toast.durationMs;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    if (duration <= 0 || remainingRef.current <= 0) return;
    startedAtRef.current = Date.now();
    timeoutRef.current = setTimeout(() => onDismiss(toast.id), remainingRef.current);
  }, [clearTimer, duration, onDismiss, toast.id]);

  React.useEffect(() => {
    startTimer();
    return clearTimer;
  }, [clearTimer, startTimer]);

  const pauseTimer = () => {
    if (!timeoutRef.current) return;
    remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAtRef.current));
    clearTimer();
  };

  const presentation = tonePresentation[toast.tone];

  return (
    <div
      role={toast.tone === 'error' || toast.tone === 'warning' ? 'alert' : 'status'}
      aria-live={presentation.live}
      tabIndex={0}
      onKeyDown={(event) => { if (event.key === 'Escape') onDismiss(toast.id); }}
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      className={`pointer-events-auto w-[min(420px,calc(100vw-2rem))] rounded-xl border p-3 shadow-lg ${presentation.className}`}
    >
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 shrink-0">{presentation.icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{toast.title}</p>
          {toast.detail && <p className="mt-1 text-xs leading-5 opacity-80">{toast.detail}</p>}
          {toast.actionLabel && toast.onAction && (
            <button
              type="button"
              onClick={() => {
                toast.onAction?.();
                onDismiss(toast.id);
              }}
              className="mt-2 rounded-md border border-current/20 bg-white/60 px-2.5 py-1 text-xs font-semibold hover:bg-white focus:outline-none focus:ring-2 focus:ring-current/30"
            >
              {toast.actionLabel}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="rounded-md p-1 opacity-60 transition hover:bg-white/70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current/30"
          aria-label={`Dismiss ${toast.title}`}
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};

const DecisionDialog: React.FC<{
  decision: DecisionRequest;
  returnFocusTarget: HTMLElement | null;
  onConfirm: (value?: string) => void;
  onCancel: () => void;
}> = ({ decision, returnFocusTarget, onConfirm, onCancel }) => {
  const promptDecision = decision.kind === 'prompt' ? decision : null;
  const [value, setValue] = useState(promptDecision?.defaultValue || '');
  const [hasInteracted, setHasInteracted] = useState(false);
  const promptError = promptDecision ? validatePromptValue(promptDecision, value) : null;
  const validationError = hasInteracted ? promptError : null;
  const submitDisabled = Boolean(promptDecision && promptError);

  const submit = () => {
    if (promptDecision) {
      if (promptError) {
        setHasInteracted(true);
        return;
      }
      onConfirm(value.trim());
      return;
    }
    onConfirm();
  };

  const destructive = decision.kind === 'confirm' && decision.variant === 'destructive';

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[71] w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl focus:outline-none"
          onEscapeKeyDown={(event) => {
            event.preventDefault();
            onCancel();
          }}
          onCloseAutoFocus={(event) => {
            if (!returnFocusTarget) return;
            event.preventDefault();
            returnFocusTarget.focus();
          }}
        >
          <div className="flex items-start gap-3">
            <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${destructive ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
              {destructive ? <AlertTriangle className="h-5 w-5" aria-hidden="true" /> : <Info className="h-5 w-5" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-base font-semibold text-slate-950">{decision.title}</Dialog.Title>
              <Dialog.Description className="mt-1.5 whitespace-pre-line text-sm leading-6 text-slate-600">
                {decision.description}
              </Dialog.Description>
            </div>
          </div>

          {promptDecision && (
            <div className="mt-4">
              <label htmlFor={`feedback-prompt-${decision.id}`} className="mb-1.5 block text-xs font-semibold text-slate-700">
                {promptDecision.label}
              </label>
              <input
                id={`feedback-prompt-${decision.id}`}
                autoFocus
                value={value}
                placeholder={promptDecision.placeholder}
                onBlur={() => setHasInteracted(true)}
                onChange={(event) => {
                  setValue(event.target.value);
                  setHasInteracted(true);
                }}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return;
                  event.preventDefault();
                  submit();
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                aria-invalid={Boolean(validationError)}
                aria-describedby={validationError ? `feedback-prompt-error-${decision.id}` : undefined}
              />
              {validationError && (
                <p id={`feedback-prompt-error-${decision.id}`} className="mt-1.5 text-xs font-medium text-rose-700">
                  {validationError}
                </p>
              )}
            </div>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              autoFocus={!promptDecision}
              onClick={onCancel}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
            >
              {decision.cancelLabel || 'Cancel'}
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitDisabled}
              aria-disabled={submitDisabled}
              className={`rounded-lg px-3.5 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 ${destructive ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500' : 'bg-slate-950 hover:bg-slate-800 focus:ring-slate-500'}`}
            >
              {decision.confirmLabel || (promptDecision ? 'Continue' : 'Confirm')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export const FeedbackProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(feedbackReducer, initialFeedbackState);
  const [focusTargets, setFocusTargets] = useState<Record<string, HTMLElement | null>>({});
  const resolvers = useRef(new Map<string, (value: boolean | string | null) => void>());

  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'dismiss-toast', id });
  }, []);

  const notify = useCallback((request: ToastRequest) => {
    const id = createId('toast');
    dispatch({ type: 'enqueue-toast', toast: { ...request, id } });
    return id;
  }, []);

  const confirm = useCallback((options: ConfirmOptions) => {
    const id = createId('confirm');
    const decision: ConfirmDecision = { ...options, id, kind: 'confirm' };
    const focusTarget = getFocusedElement();
    setFocusTargets((current) => ({ ...current, [id]: focusTarget }));
    dispatch({ type: 'enqueue-decision', decision });
    return new Promise<boolean>((resolve) => {
      resolvers.current.set(id, resolve as (value: boolean | string | null) => void);
    });
  }, []);

  const prompt = useCallback((options: PromptOptions) => {
    const id = createId('prompt');
    const decision: PromptDecision = { ...options, id, kind: 'prompt' };
    const focusTarget = getFocusedElement();
    setFocusTargets((current) => ({ ...current, [id]: focusTarget }));
    dispatch({ type: 'enqueue-decision', decision });
    return new Promise<string | null>((resolve) => {
      resolvers.current.set(id, resolve as (value: boolean | string | null) => void);
    });
  }, []);

  const completeDecision = useCallback((decision: DecisionRequest, result: boolean | string | null) => {
    const resolver = resolvers.current.get(decision.id);
    resolver?.(result);
    resolvers.current.delete(decision.id);
    setFocusTargets((current) => {
      const next = { ...current };
      delete next[decision.id];
      return next;
    });
    dispatch({ type: 'complete-decision', id: decision.id });
  }, []);

  const api = useMemo<FeedbackApi>(() => ({ notify, confirm, prompt, dismiss }), [confirm, dismiss, notify, prompt]);
  const activeDecision = state.decisions[0];
  const returnFocusTarget = activeDecision ? focusTargets[activeDecision.id] || null : null;

  return (
    <FeedbackContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed right-4 top-16 z-[80] flex flex-col gap-2" aria-label="Notifications">
        {state.toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
      {activeDecision && (
        <DecisionDialog
          key={activeDecision.id}
          decision={activeDecision}
          returnFocusTarget={returnFocusTarget}
          onConfirm={(value) => completeDecision(activeDecision, activeDecision.kind === 'confirm' ? true : value || '')}
          onCancel={() => completeDecision(activeDecision, activeDecision.kind === 'confirm' ? false : null)}
        />
      )}
    </FeedbackContext.Provider>
  );
};

export function useFeedback(): FeedbackApi {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within FeedbackProvider.');
  }
  return context;
}
