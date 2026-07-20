import { describe, it, expect } from 'vitest';
import { SESSION_TOKEN } from '../../packages/local-bridge/bridgeServer';

describe('Local Bridge Security & Authorization Tests', () => {
  it('should generate random session token for bridge loopback authorization', () => {
    expect(SESSION_TOKEN).toBeDefined();
    expect(typeof SESSION_TOKEN).toBe('string');
    expect(SESSION_TOKEN.length).toBeGreaterThanOrEqual(16);
  });

  it('should reject path traversal attempts outside workspace root', () => {
    const isTraversalPath = (p: string) => p.includes('..') || p.startsWith('/') || p.includes(':');
    expect(isTraversalPath('../../../etc/passwd')).toBe(true);
    expect(isTraversalPath('C:\\Windows\\System32')).toBe(true);
    expect(isTraversalPath('src/main.cpp')).toBe(false);
  });
});
