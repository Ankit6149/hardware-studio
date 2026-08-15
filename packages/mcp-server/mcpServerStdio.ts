// mcpServerStdio.ts — Native Hardware Studio MCP Server using official @modelcontextprotocol/sdk with stdio transport
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { HardwareStudioMCPServer } from './mcpServer';

export function createStdioMCPServer() {
  const mcpCore = new HardwareStudioMCPServer();
  const server = new Server(
    {
      name: 'hardware-studio-mcp-server',
      version: '1.1.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'get_product_summary',
        description: 'Retrieve the current canonical product summary without inventing missing boards or hardware.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_requirements',
        description: 'Retrieve canonical product requirements.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_architecture',
        description: 'Retrieve product architecture nodes and connections.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_mechanical_layout',
        description: 'Retrieve mechanical enclosure, body, zone, and assembly evidence.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_components',
        description: 'Retrieve canonical component instances and BOM linkage.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_schematic',
        description: 'Retrieve schematic connectivity, nets, symbols, and pin-anchored wires.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_pcb_status',
        description: 'Retrieve active PCB identity, routing counts, and DRC evidence.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_firmware_evidence',
        description: 'Retrieve firmware modules, behavior, source files, mappings, and recorded build evidence.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_validation_status',
        description: 'Retrieve validation definitions and append-only run/retest evidence.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_change_queue',
        description: 'Retrieve reversible MCP proposals, host-approval state, and audit count.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'draft_requirement',
        description: 'Create a reversible requirement proposal. This does not mutate the live requirement graph.',
        inputSchema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            type: { type: 'string', enum: ['Functional', 'Electrical', 'Mechanical', 'Firmware', 'Safety', 'Manufacturing', 'Validation'] },
            priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
            acceptanceCriteria: { type: 'array', items: { type: 'string' } },
            proposedBy: { type: 'string' },
          },
          required: ['title', 'description'],
        },
      },
      {
        name: 'apply_draft',
        description: 'Apply a proposal only after the embedding Hardware Studio host has recorded a human approval. MCP arguments cannot self-authorize this operation.',
        inputSchema: {
          type: 'object',
          properties: { proposalId: { type: 'string' } },
          required: ['proposalId'],
        },
      },
      {
        name: 'reject_engineering_change',
        description: 'Reject a pending proposal without mutating engineering state.',
        inputSchema: {
          type: 'object',
          properties: {
            proposalId: { type: 'string' },
            rejectedBy: { type: 'string' },
          },
          required: ['proposalId'],
        },
      },
    ],
  }));

  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      { uri: 'hardware-studio://product/current', name: 'Current Product Summary', mimeType: 'application/json' },
      { uri: 'hardware-studio://product/graph', name: 'Canonical Product Graph', mimeType: 'application/json' },
      { uri: 'hardware-studio://requirements', name: 'Product Requirements', mimeType: 'application/json' },
      { uri: 'hardware-studio://mechanical', name: 'Mechanical Layout & Bodies', mimeType: 'application/json' },
      { uri: 'hardware-studio://schematic', name: 'Schematic Connectivity', mimeType: 'application/json' },
      { uri: 'hardware-studio://pcb', name: 'PCB Layout & DRC', mimeType: 'application/json' },
      { uri: 'hardware-studio://firmware', name: 'Firmware Source & Evidence', mimeType: 'application/json' },
      { uri: 'hardware-studio://validation', name: 'Validation Run & Retest Evidence', mimeType: 'application/json' },
      { uri: 'hardware-studio://changes', name: 'MCP Change Queue', mimeType: 'application/json' },
      { uri: 'hardware-studio://revisions', name: 'Revisions & Branches', mimeType: 'application/json' },
      { uri: 'hardware-studio://releases', name: 'Release Candidates & Releases', mimeType: 'application/json' },
      { uri: 'hardware-studio://audit', name: 'MCP Audit Log', mimeType: 'application/json' },
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    const contents = mcpCore.getResource(uri);
    return {
      contents: [{ uri, mimeType: 'application/json', text: JSON.stringify(contents, null, 2) }],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const result = mcpCore.callTool(name, args as Record<string, unknown>);
    return {
      content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      isError: !result.success,
    };
  });

  return { server, mcpCore };
}

if (require.main === module) {
  const { server } = createStdioMCPServer();
  const transport = new StdioServerTransport();
  server.connect(transport).catch((error) => {
    console.error('Failed to start stdio MCP server:', error);
  });
}
