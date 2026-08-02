import { describe, expect, it } from 'vitest';
import {
  buildRedactedDiagnostics,
  classifyStorageError,
  memoryFallbackStorageHealth,
  savedStorageHealth,
  storageHealthLabel,
} from '../lib/reliability';
import { AppErrorBoundary, triggerTestCrash } from '../components/reliability/AppErrorBoundary';

describe('storage health mapping', () => {
  it('maps quota, blocked access, malformed data, and memory fallback distinctly', () => {
    const quota = new DOMException('Quota exceeded', 'QuotaExceededError');
    const blocked = new DOMException('Access blocked', 'SecurityError');

    expect(classifyStorageError(quota)).toMatchObject({ status: 'failed', errorCode: 'QUOTA_EXCEEDED' });
    expect(classifyStorageError(blocked)).toMatchObject({ status: 'unavailable', errorCode: 'STORAGE_BLOCKED' });
    expect(classifyStorageError(new SyntaxError('Unexpected JSON'))).toMatchObject({ status: 'failed', errorCode: 'MALFORMED_DATA' });
    expect(memoryFallbackStorageHealth()).toMatchObject({ status: 'memory-fallback', errorCode: 'MEMORY_FALLBACK' });
    expect(storageHealthLabel(savedStorageHealth('2026-08-02T10:00:00.000Z'))).toBe('Saved');
  });

  it('redacts secrets and excludes project content from support diagnostics', () => {
    const error = new Error('Upload failed token=super-secret password=hunter2 Bearer abc.def.ghi');
    const diagnostics = buildRedactedDiagnostics(error, {
      route: '/studio',
      componentStack: 'Component token=another-secret',
      userAgent: 'Test Agent',
    });

    expect(diagnostics).toContain('[REDACTED]');
    expect(diagnostics).not.toContain('super-secret');
    expect(diagnostics).not.toContain('hunter2');
    expect(diagnostics).not.toContain('abc.def.ghi');
    expect(diagnostics).toContain('Project content, source files, component data, and credentials are intentionally excluded.');
  });
});

describe('application recovery fixture', () => {
  it('converts a deliberate render failure into boundary error state', () => {
    expect(() => triggerTestCrash('fixture crash')).toThrow('fixture crash');
    expect(AppErrorBoundary.getDerivedStateFromError(new Error('fixture crash'))).toMatchObject({
      error: expect.objectContaining({ message: 'fixture crash' }),
    });
  });
});
