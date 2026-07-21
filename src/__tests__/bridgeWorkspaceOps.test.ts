import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from '../../packages/local-bridge/bridgeServer';
import http from 'http';

describe('Slice 8 Secure Local Bridge Workspace Operations Tests', () => {
  let server: http.Server;
  let port: number;

  const mockSpawn = async (cmd: string, args: string[]) => {
    return { exitCode: 0, stdout: 'SUCCESS: PlatformIO build completed', stderr: '' };
  };

  beforeAll(async () => {
    server = createServer('workspace-ops-token-888', mockSpawn);
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

  const makeRequest = (pathStr: string, headers: Record<string, string> = {}, method: string = 'GET') => {
    return new Promise<{ statusCode: number; body: any }>((resolve) => {
      const req = http.request(
        {
          hostname: '127.0.0.1',
          port,
          path: pathStr,
          method,
          headers: {
            'X-Hardware-Studio-Token': 'workspace-ops-token-888',
            ...headers
          }
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

  it('should validate valid workspace relative path', async () => {
    const res = await makeRequest('/api/workspace/validate-path?path=src/main.cpp');
    expect(res.statusCode).toBe(200);
    expect(res.body.valid).toBe(true);
  });

  it('should execute build and return structured operation result', async () => {
    const res = await makeRequest('/api/build?projectPath=.');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('Completed');
    expect(res.body.exitCode).toBe(0);
    expect(res.body.stdout).toContain('SUCCESS');
  });

  it('should require approval token for destructive workspace overwrite', async () => {
    const noApproval = await makeRequest('/api/workspace/overwrite');
    expect(noApproval.statusCode).toBe(403);

    // Request single-use approval token
    const tokenRes = await makeRequest('/api/request-approval', {}, 'POST');
    expect(tokenRes.statusCode).toBe(200);

    const withApproval = await makeRequest('/api/workspace/overwrite', { 'X-Approval-Token': tokenRes.body.token });
    expect(withApproval.statusCode).toBe(200);
    expect(withApproval.body.success).toBe(true);
  });
});
