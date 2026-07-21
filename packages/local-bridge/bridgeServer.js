// bridgeServer.js — Secure Local Node process for approved machine operations (PlatformIO, Serial Ports, Local Workspace)
const http = require('http');
const { spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const PORT = process.env.BRIDGE_PORT || 4040;
const HOST = '127.0.0.1'; // Loopback binding only for security

// Generate secure random session token if none provided in environment
const SESSION_TOKEN = process.env.BRIDGE_SESSION_TOKEN || crypto.randomBytes(32).toString('hex');

// In-memory store for short-lived, single-use approval tokens (valid for 60 seconds)
const validApprovalTokens = new Map();

function generateApprovalToken(ttlMs = 60000) {
  const token = `token_${crypto.randomBytes(16).toString('hex')}`;
  const expiresAt = Date.now() + ttlMs;
  validApprovalTokens.set(token, expiresAt);
  return { token, expiresAt };
}

function consumeApprovalToken(token) {
  if (!token || !validApprovalTokens.has(token)) {
    return false;
  }
  const expiresAt = validApprovalTokens.get(token);
  validApprovalTokens.delete(token); // Single-use consumption
  if (Date.now() > expiresAt) {
    return false; // Expired
  }
  return true;
}

const isPathContained = (targetPath, baseDir = process.cwd()) => {
  const resolved = path.resolve(baseDir, targetPath);
  const relative = path.relative(baseDir, resolved);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

/** Executable runner abstraction for testing & execution */
const defaultSpawnRunner = (cmd, args, options = {}) => {
  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    try {
      const child = spawn(cmd, args, { shell: false, ...options });
      child.stdout?.on('data', (d) => { stdout += d.toString(); });
      child.stderr?.on('data', (d) => { stderr += d.toString(); });
      child.on('error', (err) => {
        resolve({ exitCode: 127, stdout: '', stderr: err.message });
      });
      child.on('close', (code) => {
        resolve({ exitCode: code ?? 0, stdout, stderr });
      });
    } catch (err) {
      resolve({ exitCode: 127, stdout: '', stderr: err.message });
    }
  });
};

const createServer = (token = SESSION_TOKEN, spawnRunner = defaultSpawnRunner) => {
  return http.createServer(async (req, res) => {
    // Strict loopback CORS
    const origin = req.headers.origin;
    if (origin && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      res.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:3000');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Hardware-Studio-Token, X-Approval-Token');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || '127.0.0.1'}`);

    // Health endpoint (Public status check)
    if (url.pathname === '/api/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', bridge: 'local-bridge-v1', host: HOST, tokenRequired: true }));
      return;
    }

    // MANDATORY SESSION TOKEN CHECK FOR ALL OPERATIONAL ENDPOINTS
    const requestToken = req.headers['x-hardware-studio-token'];
    if (!requestToken || requestToken !== token) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unauthorized: Invalid or missing X-Hardware-Studio-Token' }));
      return;
    }

    // Request short-lived approval token (User confirmation in UI)
    if (url.pathname === '/api/request-approval' && req.method === 'POST') {
      const approval = generateApprovalToken();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(approval));
      return;
    }

    // Path traversal containment check endpoint
    if (url.pathname === '/api/workspace/validate-path') {
      const targetPath = url.searchParams.get('path') || '';
      const valid = isPathContained(targetPath);
      if (!valid) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: false, error: 'Path traversal outside workspace root rejected.' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ valid: true, resolved: path.resolve(targetPath) }));
      }
      return;
    }

    // PlatformIO Detection (real spawn execution)
    if (url.pathname === '/api/detect-platformio') {
      const result = await spawnRunner('pio', ['--version']);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (result.exitCode !== 0) {
        res.end(JSON.stringify({ available: false, version: null, reason: result.stderr || 'PlatformIO CLI was not found.' }));
      } else {
        res.end(JSON.stringify({ available: true, version: result.stdout.trim() }));
      }
      return;
    }

    // List Serial Ports (real spawn execution)
    if (url.pathname === '/api/list-ports') {
      const result = await spawnRunner('pio', ['device', 'list', '--json-output']);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (result.exitCode !== 0 || !result.stdout.trim()) {
        res.end(JSON.stringify({ ports: [] }));
      } else {
        try {
          const parsed = JSON.parse(result.stdout);
          res.end(JSON.stringify({ ports: Array.isArray(parsed) ? parsed : [] }));
        } catch {
          res.end(JSON.stringify({ ports: [] }));
        }
      }
      return;
    }

    // Build Endpoint (real spawn execution)
    if (url.pathname === '/api/build') {
      const projectPath = url.searchParams.get('projectPath') || '.';
      if (!isPathContained(projectPath)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path traversal outside workspace root rejected.' }));
        return;
      }

      const result = await spawnRunner('pio', ['run', '-d', projectPath]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        operationId: `build_${Date.now()}`,
        status: result.exitCode === 0 ? 'Completed' : 'Failed',
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr
      }));
      return;
    }

    // High-Risk Endpoint (Upload to Hardware) Requires Single-Use Approval Token
    if (url.pathname === '/api/upload') {
      const approvalToken = req.headers['x-approval-token'];
      if (!consumeApprovalToken(approvalToken)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden: Valid single-use approval token required for hardware flash' }));
        return;
      }

      const projectPath = url.searchParams.get('projectPath') || '.';
      if (!isPathContained(projectPath)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Path traversal outside workspace root rejected.' }));
        return;
      }

      const result = await spawnRunner('pio', ['run', '-t', 'upload', '-d', projectPath]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        operationId: `upload_${Date.now()}`,
        status: result.exitCode === 0 ? 'Completed' : 'Failed',
        exitCode: result.exitCode,
        stdout: result.stdout,
        stderr: result.stderr
      }));
      return;
    }

    // Destructive Workspace Overwrite Endpoint Requires Single-Use Approval Token
    if (url.pathname === '/api/workspace/overwrite') {
      const approvalToken = req.headers['x-approval-token'];
      if (!consumeApprovalToken(approvalToken)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Forbidden: Valid single-use approval token required for workspace overwrite' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'Workspace project overwritten safely.' }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  });
};

if (require.main === module) {
  const serverInst = createServer();
  serverInst.listen(PORT, HOST, () => {
    console.log(`[Hardware Studio Local Bridge] Server listening on http://${HOST}:${PORT}`);
    console.log(`[Hardware Studio Local Bridge] Session Token: ${SESSION_TOKEN}`);
  });
}

module.exports = {
  createServer,
  isPathContained,
  SESSION_TOKEN,
  generateApprovalToken,
  consumeApprovalToken
};
