import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import http from 'http';

const { createServer, isPathContained } = require('../../packages/local-bridge/bridgeServer');

describe('Slice 5 Local Bridge Security & Process Execution', () => {
  let server: http.Server;
  const testToken = 'secure-test-token-999';
  const mockSpawn = async (cmd: string, args: string[]) => {
    if (cmd === 'pio' && args[0] === '--version') {
      return { exitCode: 0, stdout: 'PlatformIO Core, version 6.1.15', stderr: '' };
    }
    if (cmd === 'pio' && args[0] === 'run' && args[1] === '-t' && args[2] === 'upload') {
      return { exitCode: 0, stdout: 'SUCCESS: Flashed target ESP32 via COM3', stderr: '' };
    }
    if (cmd === 'pio' && args[0] === 'run') {
      return { exitCode: 0, stdout: 'SUCCESS: Built firmware binary .pio/build/esp32/firmware.bin', stderr: '' };
    }
    return { exitCode: 1, stdout: '', stderr: 'Command failed' };
  };

  beforeEach((context) => {
    server = createServer(testToken, mockSpawn);
    return new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
  });

  afterEach(() => {
    return new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  const getPort = () => (server.address() as any).port;

  const request = (method: string, pathStr: string, headers: Record<string, string> = {}) => {
    return new Promise<{ status: number; body: any }>((resolve, reject) => {
      const req = http.request({
        hostname: '127.0.0.1',
        port: getPort(),
        path: pathStr,
        method,
        headers
      }, (res) => {
        let raw = '';
        res.on('data', chunk => { raw += chunk; });
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 500, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode || 500, body: raw });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });
  };

  it('should reject unauthorized requests missing X-Hardware-Studio-Token', async () => {
    const res = await request('GET', '/api/detect-platformio');
    expect(res.status).toBe(401);
    expect(res.body.error).toContain('Unauthorized');
  });

  it('should allow operational requests with valid token', async () => {
    const res = await request('GET', '/api/detect-platformio', {
      'x-hardware-studio-token': testToken
    });
    expect(res.status).toBe(200);
    expect(res.body.available).toBe(true);
    expect(res.body.version).toContain('PlatformIO Core');
  });

  it('should prevent path traversal outside workspace root', () => {
    expect(isPathContained('../../../etc/passwd')).toBe(false);
    expect(isPathContained('src/firmware')).toBe(true);
  });

  it('should reject high-risk upload without approval token, and enforce single-use approval token', async () => {
    // 1. Upload without approval token -> 403
    const noApprovalRes = await request('POST', '/api/upload', {
      'x-hardware-studio-token': testToken
    });
    expect(noApprovalRes.status).toBe(403);
    expect(noApprovalRes.body.error).toContain('Forbidden');

    // 2. Request short-lived approval token
    const reqApprovalRes = await request('POST', '/api/request-approval', {
      'x-hardware-studio-token': testToken
    });
    expect(reqApprovalRes.status).toBe(200);
    const approvalToken = reqApprovalRes.body.token;
    expect(approvalToken).toBeDefined();

    // 3. Upload with approval token -> 200 SUCCESS
    const uploadRes = await request('POST', '/api/upload', {
      'x-hardware-studio-token': testToken,
      'x-approval-token': approvalToken
    });
    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.status).toBe('Completed');
    expect(uploadRes.body.stdout).toContain('Flashed target');

    // 4. Reusing the SAME approval token -> 403 (single-use enforcement)
    const reuseRes = await request('POST', '/api/upload', {
      'x-hardware-studio-token': testToken,
      'x-approval-token': approvalToken
    });
    expect(reuseRes.status).toBe(403);
  });
});
