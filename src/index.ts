#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  McpError,
  ErrorCode,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// Constants
const SEECLICKFIX_API_BASE = "https://seeclickfix.com";
const USER_AGENT = "civic-mcp/0.1";

interface SeeClickFixFeature {
  description?: string;
  status?: string;
  address?: string;
  service_name?: string;
  updated_datetime?: string;
}

/**
 * Make a request to the See Click Fix Open311 API.
 */
async function makeSeeClickFixRequest(url: string): Promise<any[] | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    
    return response.data || [];
  } catch (error) {
    console.error('Error making SeeClickFix request:', error);
    return null;
  }
}

/**
 * Format a request into a readable string.
 */
function formatRequest(feature: SeeClickFixFeature): string {
  return `
        Description: ${feature.description || 'No description available'}
        Status: ${feature.status || 'No status provided'}
        Address: ${feature.address || 'No address provided'}
        Service: ${feature.service_name || 'No service provided'}
        Last Updated: ${feature.updated_datetime || 'No updates yet'}
        `;
}

// Create server instance
const server = new Server(
  {
    name: 'SeeClickFix',
    version: '0.1.0',
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_requests',
        description: 'Get requests near a point of interest',
        inputSchema: {
          type: 'object',
          properties: {
            latitude: {
              type: 'string',
              description: 'latitude of the coordinate pair for the point of interest',
            },
            longitude: {
              type: 'string',
              description: 'longitude of the coordinate pair for the point of interest',
            },
          },
          required: ['latitude', 'longitude'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'get_requests') {
      const { latitude, longitude } = args as {
        latitude: string;
        longitude: string;
      };

      if (!latitude || !longitude) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Both latitude and longitude are required'
        );
      }

      const url = `${SEECLICKFIX_API_BASE}/open311/v2/requests.json?lat=${latitude}&long=${longitude}`;
      const data = await makeSeeClickFixRequest(url);

      if (!data) {
        throw new McpError(
          ErrorCode.InternalError,
          'Failed to fetch requests from SeeClickFix API'
        );
      }

      const requests = data.map((feature: SeeClickFixFeature) => formatRequest(feature));
      const result = requests.join('\n---\n');

      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } else {
      throw new McpError(
        ErrorCode.MethodNotFound,
        `Unknown tool: ${name}`
      );
    }
  } catch (error) {
    if (error instanceof McpError) {
      throw error;
    }
    
    throw new McpError(
      ErrorCode.InternalError,
      `Tool execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
});

// Start the server
async function main() {
  console.log('Hello from See Click Fix!');
  
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Keep the process running
  process.on('SIGINT', async () => {
    await server.close();
    process.exit(0);
  });
}

// Initialize and run the server
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}