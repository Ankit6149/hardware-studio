import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer, SESSION_TOKEN } from '../../packages/local-bridge/bridgeServer';
import http from 'http';

describe('Slice 8 Secure Local Bridge Authentication & Security Tests', () => {
  let server: http.Server;
  let port: number;

  beforeAll(async () => {
    server = createServer('secure-test-token-777');
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const addr = server.address() as any;
        port = addr.port;
        resolve();
      });
    });
  });

  afterAll(() => {
    server.close();
  });

  const makeRequest = (pathStr: string, headers: Record<string, string> = {}) => {
    return new Promise<{ statusCode: number; body: any }>((resolve) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: pathStr,
          method: 'GET',
          headers
        },
        (res) => {
          let data = '';
          res.on('data', (chunk) => (data += chunk));
          res.on('end', () => {
            try {
              resolve({ statusCode: res.statusCode || 500, body: JSON.parse(data) });
            } catch {
              resolve({ statusCode: res.statusCode || 500, body: data });
            }
          });
        }
      );
      req.end();
    });
  };

  it('should allow /api/health without token', async () => {
    const res = await makeRequest('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('should REJECT operational endpoints when X-Hardware-Studio-Token is missing', async () => {
    const res = await makeRequest('/api/detect-platformio');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('should REJECT operational endpoints when X-Hardware-Studio-Token is invalid', async () => {
    const res = await makeRequest('/api/detect-platformio', { 'X-Hardware-Studio-Token': 'wrong-token' });
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('should ACCEPT operational endpoints when X-Hardware-Studio-Token is valid', async () => {
    const res = await makeRequest('/api/detect-platformio', { 'X-Hardware-Studio-Token': 'secure-test-token-777' });
    expect(res.statusCode).toBe(200);
  });

  it('should REJECT path traversal outside workspace root', async () => {
    const res = await makeRequest('/api/workspace/validate-path?path=../../etc/passwd', { 'X-Hardware-Studio-Token': 'secure-test-token-777' });
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('Path traversal');
  });

  it('should REJECT high-risk upload without approval token', async () => {
    const res = await makeRequest('/api/upload', { 'X-Hardware-Studio-Token': 'secure-test-token-777' });
    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('Explicit user approval token required');
  });

  it('should ACCEPT high-risk upload WITH approval token', async () => {
    const res = await makeRequest('/api/upload', {
      'X-Hardware-Studio-Token': 'secure-test-token-777',
      'X-Approval-Token': 'approved-user-action'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Completed');
  });
});
