import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { CalendarService } from "../services/calendar.service.js";
import { TasksService } from "../services/tasks.service.js";

export class MCPServer {
  constructor(authManager) {
    this.authManager = authManager;
    this.server = new Server(
      { name: "google-services-mcp", version: "1.0.0" },
      { capabilities: { tools: {} } },
    );
    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        // --- Calendar Tools ---
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
              start: { type: "string", description: "ISO 8601 string" },
              end: { type: "string", description: "ISO 8601 string" },
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
              eventId: { type: "string" },
              summary: { type: "string" },
              start: { type: "string" },
              end: { type: "string" },
            },
            required: ["eventId"],
          },
        },
        // --- Tasks Tools ---
        {
          name: "list_task_lists",
          description: "List all Google Task lists",
          inputSchema: { type: "object", properties: {} },
        },
        {
          name: "list_tasks",
          description: "List tasks in a Google Task list",
          inputSchema: {
            type: "object",
            properties: {
              tasklist: { type: "string", default: "@default" },
              showCompleted: { type: "boolean", default: false },
            },
          },
        },
        {
          name: "create_task",
          description: "Create a new task in Google Tasks",
          inputSchema: {
            type: "object",
            properties: {
              title: { type: "string" },
              notes: { type: "string" },
              due: { type: "string" },
            },
            required: ["title"],
          },
        },
        {
          name: "update_task",
          description: "Update task status (e.g., mark as completed)",
          inputSchema: {
            type: "object",
            properties: {
              taskId: { type: "string" },
              status: { type: "string", enum: ["needsAction", "completed"] },
            },
            required: ["taskId"],
          },
        },
        {
          name: "delete_task",
          description: "Delete a task from Google Tasks",
          inputSchema: {
            type: "object",
            properties: {
              taskId: { type: "string" },
              tasklist: { type: "string", default: "@default" },
            },
            required: ["taskId"],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const hasAuth = await this.authManager.loadSavedCredentialsIfExist();
      if (!hasAuth) {
        return {
          content: [
            { type: "text", text: "Error: Google Authentication required." },
          ],
          isError: true,
        };
      }

      const authClient = this.authManager.getAuthClient();
      const calendarService = new CalendarService(authClient);
      const tasksService = new TasksService(authClient);

      switch (request.params.name) {
        // Calendar
        case "list_events":
          return await calendarService.listEvents(request.params.arguments);
        case "create_event":
          return await calendarService.createEvent(request.params.arguments);
        case "update_event":
          return await calendarService.updateEvent(request.params.arguments);
        // Tasks
        case "list_task_lists":
          return await tasksService.listTaskLists();
        case "list_tasks":
          return await tasksService.listTasks(request.params.arguments);
        case "create_task":
          return await tasksService.createTask(request.params.arguments);
        case "update_task":
          return await tasksService.updateTask(request.params.arguments);
        case "delete_task":
          return await tasksService.deleteTask(request.params.arguments);
        default:
          throw new Error(`Unknown tool: ${request.params.name}`);
      }
    });
  }

  getServer() {
    return this.server;
  }
}
