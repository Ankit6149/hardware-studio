import { describe, it, expect } from 'vitest';
import server from '../../packages/local-bridge/bridgeServer';

describe('Local PlatformIO Bridge Node Process Tests', () => {
  it('should initialize local loopback HTTP server instance', () => {
    expect(server).toBeDefined();
    expect(typeof server.listen).toBe('function');
  });
});
