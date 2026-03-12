import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CalendarService } from "../services/calendar.service.js";

export class MCPServer {
  constructor(authManager) {
    this.authManager = authManager;
    this.server = new Server(
      {
        name: "google-calendar-mcp",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "list_events",
          description: "List upcoming events from Google Calendar",
          inputSchema: {
            type: "object",
            properties: {
              calendarId: { type: "string", default: "primary" },
              maxResults: { type: "number", default: 10 },
            },
          },
        },
        {
          name: "create_event",
          description: "Create a new event in Google Calendar",
          inputSchema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              location: { type: "string" },
              description: { type: "string" },
              start: { type: "string", description: "ISO 8601 date string" },
              end: { type: "string", description: "ISO 8601 date string" },
            },
            required: ["summary", "start", "end"],
          },
        },
        {
          name: "update_event",
          description: "Update an existing event in Google Calendar",
          inputSchema: {
            type: "object",
            properties: {
              eventId: {
                type: "string",
                description: "The ID of the event to update",
              },
              summary: { type: "string" },
              location: { type: "string" },
              description: { type: "string" },
              start: { type: "string", description: "ISO 8601 date string" },
              end: { type: "string", description: "ISO 8601 date string" },
            },
            required: ["eventId"],
          },
        },
        {
          name: "delete_event",
          description: "Delete an event from Google Calendar",
          inputSchema: {
            type: "object",
            properties: {
              eventId: {
                type: "string",
                description: "The ID of the event to delete",
              },
            },
            required: ["eventId"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const hasAuth = await this.authManager.loadSavedCredentialsIfExist();
      if (!hasAuth) {
        return {
          content: [
            {
              type: "text",
              text: "Error: Google Calendar not authenticated. Please visit /auth to authorize or copy token.json.",
            },
          ],
          isError: true,
        };
      }

      const calendarService = new CalendarService(
        this.authManager.getAuthClient(),
      );

      switch (request.params.name) {
        case "list_events":
          return await calendarService.listEvents(request.params.arguments);
        case "create_event":
          return await calendarService.createEvent(request.params.arguments);
        case "update_event":
          return await calendarService.updateEvent(request.params.arguments);
        case "delete_event":
          return await calendarService.deleteEvent(request.params.arguments);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  getServer() {
    return this.server;
  }
}
