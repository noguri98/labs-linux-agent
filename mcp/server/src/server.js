import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { dockerTools } from "./tools/docker-tools.js";

const server = new Server(
  {
    name: "mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Registry for tools and their handlers
const toolHandlers = new Map();

// Register all tools
const registerTools = (tools) => {
  for (const tool of tools) {
    toolHandlers.set(tool.name, tool.handler);
  }
};

registerTools(dockerTools);

/**
 * List available tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Array.from(toolHandlers.keys()).map((name) => {
      const tool = [...dockerTools].find((t) => t.name === name);
      return {
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      };
    }),
  };
});

/**
 * Handle tool calls.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const handler = toolHandlers.get(request.params.name);
  if (!handler) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }

  try {
    return await handler(request.params.arguments || {});
  } catch (error) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

export { server };
