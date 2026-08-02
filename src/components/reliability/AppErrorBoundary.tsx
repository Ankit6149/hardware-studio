'use client';

import React from 'react';
import { AlertOctagon, Clipboard, Home, RefreshCw } from 'lucide-react';
import { buildRedactedDiagnostics } from '../../lib/reliability';

interface AppErrorBoundaryProps {
  children: React.ReactNode;
  onReturnToDashboard: () => void;
}

interface AppErrorBoundaryState {
  error: Error | null;
  componentStack: string;
  diagnosticsCopied: boolean;
  repeatedCrashCount: number;
}

const CRASH_SESSION_KEY = 'hardware_studio_recent_crashes';

function recordCrash(): number {
  if (typeof window === 'undefined') return 1;
  try {
    const now = Date.now();
    const previous = JSON.parse(window.sessionStorage.getItem(CRASH_SESSION_KEY) || '[]') as number[];
    const recent = previous.filter((timestamp) => now - timestamp < 60_000);
    recent.push(now);
    window.sessionStorage.setItem(CRASH_SESSION_KEY, JSON.stringify(recent));
    return recent.length;
  } catch {
    return 1;
  }
}

function clearCrashHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(CRASH_SESSION_KEY);
  } catch {
    // Recovery must still work when session storage is unavailable.
  }
}

export class AppErrorBoundary extends React.Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    error: null,
    componentStack: '',
    diagnosticsCopied: false,
    repeatedCrashCount: 0,
  };

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.setState({
      error,
      componentStack: info.componentStack || '',
      repeatedCrashCount: recordCrash(),
    });
  }

  private getDiagnostics(): string {
    return buildRedactedDiagnostics(this.state.error, {
      route: typeof window === 'undefined' ? 'unknown' : window.location.pathname,
      componentStack: this.state.componentStack,
      repeatedCrashCount: this.state.repeatedCrashCount,
      userAgent: typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent,
    });
  }

  private copyDiagnostics = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(this.getDiagnostics());
      this.setState({ diagnosticsCopied: true });
    } catch {
      this.setState({ diagnosticsCopied: false });
    }
  };

  private returnToDashboard = (): void => {
    clearCrashHistory();
    try {
      this.props.onReturnToDashboard();
    } finally {
      window.location.reload();
    }
  };

  private reload = (): void => {
    window.location.reload();
  };

  render(): React.ReactNode {
    if (!this.state.error) return this.props.children;

    const repeated = this.state.repeatedCrashCount >= 2;

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 py-10 text-slate-100">
        <section className="w-full max-w-3xl rounded-2xl border border-rose-900/70 bg-slate-900 p-6 shadow-2xl">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-rose-950 text-rose-300">
              <AlertOctagon className="h-6 w-6" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-rose-300">Workspace recovery</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Hardware Studio stopped rendering safely.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                The application caught an unexpected interface failure instead of leaving a blank screen. Your stored project was not intentionally reset or deleted.
              </p>
            </div>
          </div>

          {repeated && (
            <div className="mt-5 rounded-xl border border-amber-700/60 bg-amber-950/40 p-3 text-sm text-amber-100">
              This workspace has crashed more than once in the last minute. Return to the dashboard before trying the same workbench again to avoid a reload loop.
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={this.returnToDashboard}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <Home className="h-4 w-4" aria-hidden="true" />
              Return to dashboard
            </button>
            <button
              type="button"
              onClick={this.reload}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3.5 py-2 text-sm font-semibold text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Reload workspace
            </button>
            <button
              type="button"
              onClick={this.copyDiagnostics}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 bg-transparent px-3.5 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              {this.state.diagnosticsCopied ? 'Support info copied' : 'Copy support info'}
            </button>
          </div>

          <details className="mt-5 rounded-xl border border-slate-700 bg-slate-950/70 p-3">
            <summary className="cursor-pointer text-sm font-semibold text-slate-200">Technical details</summary>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-400">
              {this.getDiagnostics()}
            </pre>
          </details>
        </section>
      </main>
    );
  }
}

export function triggerTestCrash(message = 'Deliberate Hardware Studio recovery fixture'): never {
  throw new Error(message);
}
