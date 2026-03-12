import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { TavilyService } from "../services/tavily.service.js";

export class MCPServer {
  constructor() {
    this.tavilyService = new TavilyService();
    this.server = new Server(
      { name: "mcp-web", version: "1.0.0" },
      { capabilities: { tools: {} } },
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "web_search",
          description: "Perform a web search to get real-time information and answers.",
          inputSchema: {
            type: "object",
            properties: {
              query: { type: "string", description: "The search query" },
              search_depth: {
                type: "string",
                enum: ["basic", "advanced"],
                default: "basic",
                description: "Depth of the search. Advanced includes more comprehensive crawling."
              },
              max_results: { type: "number", default: 5, description: "Maximum number of results to return" },
            },
            required: ["query"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "web_search":
          return await this.tavilyService.search(args);
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  getServer() {
    return this.server;
  }
}
