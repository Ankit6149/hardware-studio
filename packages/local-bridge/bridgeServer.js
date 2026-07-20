// bridgeServer.js — Secure Local Node process for approved machine operations (PlatformIO, Serial Ports)
const http = require('http');
const { exec, spawn } = require('child_process');
const crypto = require('crypto');
const path = require('path');

const PORT = process.env.BRIDGE_PORT || 4040;
const HOST = '127.0.0.1'; // Loopback binding only for security
const SESSION_TOKEN = process.env.BRIDGE_SESSION_TOKEN || crypto.randomBytes(16).toString('hex');

const server = http.createServer((req, res) => {
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

  // Health endpoint
  if (url.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', bridge: 'local-bridge-v1', host: HOST, tokenRequired: true }));
    return;
  }

  // Check security token for all operational endpoints if token provided or env set
  const requestToken = req.headers['x-hardware-studio-token'];
  if (process.env.REQUIRE_BRIDGE_TOKEN === 'true' && requestToken !== SESSION_TOKEN) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Unauthorized: Invalid or missing X-Hardware-Studio-Token' }));
    return;
  }

  if (url.pathname === '/api/detect-platformio') {
    exec('pio --version', (err, stdout) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (err) {
        res.end(JSON.stringify({ available: false, version: null, reason: 'PlatformIO CLI was not found.' }));
      } else {
        res.end(JSON.stringify({ available: true, version: stdout.trim() }));
      }
    });
    return;
  }

  if (url.pathname === '/api/list-ports') {
    exec('pio device list --json-output', (err, stdout) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (err || !stdout.trim()) {
        res.end(JSON.stringify({ ports: [] }));
      } else {
        try {
          const parsed = JSON.parse(stdout);
          res.end(JSON.stringify({ ports: Array.isArray(parsed) ? parsed : [] }));
        } catch {
          res.end(JSON.stringify({ ports: [] }));
        }
      }
    });
    return;
  }

  if (url.pathname === '/api/build') {
    exec('pio --version', (err) => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      if (err) {
        res.end(JSON.stringify({
          available: false,
          success: false,
          reason: 'PlatformIO CLI was not found.',
          stdout: '',
          stderr: 'Error: pio CLI is not installed or available on PATH.'
        }));
        return;
      }

      // Safe spawn execution
      const projectPath = url.searchParams.get('projectPath') || process.cwd();
      const envName = url.searchParams.get('env') || 'default';
      
      // Prevent path traversal outside cwd
      const resolved = path.resolve(projectPath);
      if (!resolved.startsWith(process.cwd())) {
        res.end(JSON.stringify({
          available: true,
          success: false,
          reason: 'Forbidden: Path traversal outside workspace root rejected.',
          stdout: '',
          stderr: 'Path traversal rejected.'
        }));
        return;
      }

      const pioProcess = spawn('pio', ['run', '-e', envName], { cwd: resolved });
      let stdout = '';
      let stderr = '';

      pioProcess.stdout?.on('data', (d) => { stdout += d.toString(); });
      pioProcess.stderr?.on('data', (d) => { stderr += d.toString(); });

      pioProcess.on('close', (code) => {
        res.end(JSON.stringify({
          available: true,
          success: code === 0,
          exitCode: code,
          stdout,
          stderr,
          environment: envName,
          timestamp: new Date().toISOString()
        }));
      });

      pioProcess.on('error', (procErr) => {
        res.end(JSON.stringify({
          available: true,
          success: false,
          exitCode: -1,
          stdout,
          stderr: procErr.message,
          environment: envName,
          timestamp: new Date().toISOString()
        }));
      });
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

if (require.main === module) {
  server.listen(PORT, HOST, () => {
    console.log(`[local-bridge] Running on http://${HOST}:${PORT}`);
  });
}

module.exports = { server, SESSION_TOKEN };
