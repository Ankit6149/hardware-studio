import { describe, it, expect } from 'vitest';
import { createServer } from '../../packages/local-bridge/bridgeServer';

describe('Local PlatformIO Bridge Node Process Tests', () => {
  it('should initialize local loopback HTTP server instance', () => {
    const srv = createServer('test-token');
    expect(srv).toBeDefined();
    expect(typeof srv.listen).toBe('function');
  });
});
