export const RECOVER_TO_DASHBOARD_KEY = 'hardware_studio_recover_to_dashboard';

export type StorageHealthStatus = 'idle' | 'saving' | 'saved' | 'failed' | 'unavailable' | 'memory-fallback';

export interface StorageHealth {
  status: StorageHealthStatus;
  lastSavedAt?: string;
  message: string;
  guidance?: string;
  errorCode?: string;
}

export interface StorageOperationResult<T> {
  ok: boolean;
  value: T;
  health: StorageHealth;
}

export function idleStorageHealth(): StorageHealth {
  return {
    status: 'idle',
    message: 'Local storage has not been checked yet.',
  };
}

export function savingStorageHealth(previous?: StorageHealth): StorageHealth {
  return {
    status: 'saving',
    message: 'Saving project to this browser…',
    lastSavedAt: previous?.lastSavedAt,
  };
}

export function savedStorageHealth(lastSavedAt = new Date().toISOString()): StorageHealth {
  return {
    status: 'saved',
    message: 'Project saved in this browser.',
    lastSavedAt,
  };
}

export function memoryFallbackStorageHealth(reason = 'Browser storage is unavailable. Changes are kept only in memory for this session.'): StorageHealth {
  return {
    status: 'memory-fallback',
    message: reason,
    guidance: 'Export a project backup before closing or refreshing this tab.',
    errorCode: 'MEMORY_FALLBACK',
  };
}

export function classifyStorageError(error: unknown): StorageHealth {
  const name = error instanceof DOMException || error instanceof Error ? error.name : 'StorageError';
  const message = error instanceof Error ? error.message : String(error);
  const normalized = `${name} ${message}`.toLowerCase();

  if (name === 'QuotaExceededError' || normalized.includes('quota')) {
    return {
      status: 'failed',
      message: 'The browser storage quota was exceeded. The latest change is only available in memory.',
      guidance: 'Export a backup, remove unneeded browser data, then retry saving.',
      errorCode: 'QUOTA_EXCEEDED',
    };
  }

  if (name === 'SecurityError' || normalized.includes('access') || normalized.includes('blocked')) {
    return {
      status: 'unavailable',
      message: 'Browser storage is blocked or unavailable for this site.',
      guidance: 'Allow site storage or use project export before leaving the page.',
      errorCode: 'STORAGE_BLOCKED',
    };
  }

  if (error instanceof SyntaxError || normalized.includes('json')) {
    return {
      status: 'failed',
      message: 'Saved project data could not be read safely.',
      guidance: 'The app opened the in-memory fallback. Import a known-good backup before overwriting stored data.',
      errorCode: 'MALFORMED_DATA',
    };
  }

  return {
    status: 'failed',
    message: 'The project could not be saved to browser storage.',
    guidance: 'Export a backup and retry. If the error continues, copy the support information from the recovery screen.',
    errorCode: 'STORAGE_WRITE_FAILED',
  };
}

export function storageHealthLabel(health: StorageHealth): string {
  switch (health.status) {
    case 'saving':
      return 'Saving';
    case 'saved':
      return 'Saved';
    case 'failed':
      return 'Save failed';
    case 'unavailable':
      return 'Storage unavailable';
    case 'memory-fallback':
      return 'Memory only';
    default:
      return 'Local';
  }
}

function redactSensitiveText(value: string): string {
  return value
    .replace(/(authorization|api[-_ ]?key|token|password|secret)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
    .replace(/bearer\s+[a-z0-9._~+/=-]+/gi, 'Bearer [REDACTED]')
    .slice(0, 4000);
}

export interface DiagnosticContext {
  route?: string;
  componentStack?: string;
  repeatedCrashCount?: number;
  userAgent?: string;
}

export function buildRedactedDiagnostics(error: unknown, context: DiagnosticContext = {}): string {
  const normalizedError = error instanceof Error
    ? {
        name: error.name,
        message: redactSensitiveText(error.message),
        stack: redactSensitiveText(error.stack || '').split('\n').slice(0, 12).join('\n'),
      }
    : {
        name: 'UnknownError',
        message: redactSensitiveText(String(error)),
        stack: '',
      };

  return JSON.stringify({
    app: 'Hardware Studio',
    generatedAt: new Date().toISOString(),
    error: normalizedError,
    route: context.route || 'unknown',
    componentStack: redactSensitiveText(context.componentStack || '').split('\n').slice(0, 20).join('\n'),
    repeatedCrashCount: context.repeatedCrashCount || 0,
    userAgent: redactSensitiveText(context.userAgent || 'unknown'),
    note: 'Project content, source files, component data, and credentials are intentionally excluded.',
  }, null, 2);
}
