# Hardware Studio Native MCP Server Setup Guide

## Overview
Hardware Studio provides a native Model Context Protocol (MCP) server enabling external AI clients (Claude Desktop, Antigravity IDE, Cursor) to inspect, draft, and safely apply physical product engineering changes.

## Integration Architecture
The MCP server shares the exact same command/query layer as the Hardware Studio web app (`ProductGraphEngine`, `projectSerialization`, `releaseEngine`).

## Configuration Example (Claude Desktop / Antigravity `mcp_config.json`)

```json
{
  "mcpServers": {
    "hardware-studio": {
      "command": "node",
      "args": ["packages/mcp-server/mcpServer.js"],
      "env": {
        "HARDWARE_STUDIO_WORKSPACE": "./"
      }
    }
  }
}
```

## Security & Approval Model
1. Read tools are safe and immediate.
2. Draft tools create reversible proposal objects (`MCPProposal`).
3. High-impact operations (releasing, overwriting source files, building firmware) require explicit user sign-off.
4. Every operation is recorded in `MCPAuditRecord`.
