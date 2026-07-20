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
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Tools listing
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'get_product_summary',
          description: 'Retrieve high-level summary across all 24 project domain collections',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_requirements',
          description: 'Retrieve all product requirements and coverage status',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_architecture',
          description: 'Retrieve product architecture nodes and connections',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_mechanical_layout',
          description: 'Retrieve 2D and 3D mechanical enclosure objects and dimensions',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_components',
          description: 'Retrieve all component instances and library definitions',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_schematic',
          description: 'Retrieve schematic symbol placements and pin-anchored wires',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'get_pcb_status',
          description: 'Retrieve active PCB layout status, traces, vias, and DRC results',
          inputSchema: { type: 'object', properties: {} },
        },
        {
          name: 'draft_requirement',
          description: 'Create a reversible draft proposal to add or update a product requirement',
          inputSchema: {
            type: 'object',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              priority: { type: 'string', enum: ['Low', 'Medium', 'High', 'Critical'] },
            },
            required: ['title', 'description'],
          },
        },
        {
          name: 'apply_draft',
          description: 'Apply an approved draft proposal to the live project via the command bus',
          inputSchema: {
            type: 'object',
            properties: {
              proposalId: { type: 'string' },
            },
            required: ['proposalId'],
          },
        },
        {
          name: 'delete_component',
          description: 'High-impact operation to remove a component instance from the entire product (requires user approval)',
          inputSchema: {
            type: 'object',
            properties: {
              componentId: { type: 'string' },
              userApproved: { type: 'boolean' },
            },
            required: ['componentId'],
          },
        },
      ],
    };
  });

  // Resources listing
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: [
        { uri: 'hardware-studio://product/current', name: 'Current Product Document', mimeType: 'application/json' },
        { uri: 'hardware-studio://product/graph', name: 'Canonical Product Graph', mimeType: 'application/json' },
        { uri: 'hardware-studio://requirements', name: 'Product Requirements', mimeType: 'application/json' },
        { uri: 'hardware-studio://mechanical', name: 'Mechanical Layout & Bodies', mimeType: 'application/json' },
        { uri: 'hardware-studio://schematic', name: 'Schematic Connectivity', mimeType: 'application/json' },
        { uri: 'hardware-studio://pcb', name: 'PCB Layout & DRC', mimeType: 'application/json' },
        { uri: 'hardware-studio://firmware', name: 'Firmware Workspace', mimeType: 'application/json' },
        { uri: 'hardware-studio://validation', name: 'Validation Execution Runs', mimeType: 'application/json' },
        { uri: 'hardware-studio://revisions', name: 'Revisions & Branches', mimeType: 'application/json' },
        { uri: 'hardware-studio://releases', name: 'Release Candidates & Releases', mimeType: 'application/json' },
        { uri: 'hardware-studio://audit', name: 'MCP Audit Log', mimeType: 'application/json' },
      ],
    };
  });

  // Resource handler
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    const contents = mcpCore.getResource(uri);
    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(contents, null, 2),
        },
      ],
    };
  });

  // Tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const result = mcpCore.callTool(name, args as Record<string, unknown>);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  });

  return { server, mcpCore };
}

if (require.main === module) {
  const { server } = createStdioMCPServer();
  const transport = new StdioServerTransport();
  server.connect(transport).catch(err => {
    console.error('Failed to start stdio MCP server:', err);
  });
}
