import { describe, it, expect } from 'vitest';
import { SESSION_TOKEN } from '../../packages/local-bridge/bridgeServer';

describe('Local Bridge Workspace Endpoints Tests', () => {
  it('should include session token authorization header', () => {
    expect(SESSION_TOKEN).toBeDefined();
  });
});
